'use server';

import { actionClient } from '@/lib/safe-action';
import { z } from 'zod';
import { getDb } from '@/db';
import { guestUsage } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { headers } from 'next/headers';
import { consumeCredits } from '@/credits/credits';
import { getSession } from '@/lib/server';

const generateSchema = z.object({
  gradeLevel: z.string().min(1),
  pronouns: z.string().min(1),
  strength: z.string().min(1),
  weakness: z.string().optional(),
  // Legacy/Optional fields for backward compatibility or future use
  studentName: z.string().optional(),
  framework: z.string().optional(),
  tone: z.string().optional(),
});

// Type definitions for Replicate API
interface ReplicatePrediction {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  output?: string[];
  error?: string;
  urls?: {
    get?: string;
  };
}

export const generateCommentAction = actionClient
  .schema(generateSchema)
  .action(async ({ parsedInput }) => {
    const { gradeLevel, pronouns, strength, weakness, studentName, framework, tone } = parsedInput;
    const session = await getSession();
    const user = session?.user;

    // 1. Check Usage Limits / Credits
    if (user) {
      try {
        await consumeCredits({
          userId: user.id,
          amount: 1,
          description: `Generate comment for ${studentName || 'student'}`,
        });
      } catch (error) {
        return {
          success: false,
          error: 'Insufficient credits. Please upgrade your plan.',
        };
      }
    } else {
      // Guest User - Check IP Limit
      const headersList = await headers();
      const ip = headersList.get('x-forwarded-for') || 'unknown';
      
      const db = await getDb();
      const usage = await db
        .select()
        .from(guestUsage)
        .where(eq(guestUsage.ipAddress, ip))
        .limit(1);

      const currentCount = usage[0]?.count || 0;
      const FREE_LIMIT = 3;

      if (currentCount >= FREE_LIMIT) {
        return {
          success: false,
          error: 'Free limit reached. Please sign up to continue.',
          isLimitReached: true, // Flag for frontend to show upgrade modal
        };
      }

      // Increment usage
      if (usage.length > 0) {
        await db
          .update(guestUsage)
          .set({ 
            count: currentCount + 1,
            lastUsedAt: new Date() 
          })
          .where(eq(guestUsage.ipAddress, ip));
      } else {
        await db.insert(guestUsage).values({
          ipAddress: ip,
          count: 1,
        });
      }
    }

    // 2. Generate Comment with Gemini 3 Pro (Replicate)
    try {
      // Framework Logic (Default to General if not provided)
      const selectedFramework = framework || 'General';
      
      // Build comprehensive system instruction
      let systemInstruction = `You are the 'Kriterix Engine', a PhD-level educational consultant and expert report card comment writer with deep pedagogical expertise.

Your core principles:
- Asset-based language that celebrates student strengths
- Growth-mindset framing for areas of improvement
- Specific, actionable, and personalized feedback
- Age-appropriate and context-sensitive communication
- Professional tone that builds student confidence`;

      // Framework-specific guidance
      if (selectedFramework.includes('IB') || selectedFramework.includes('International Baccalaureate')) {
        systemInstruction += `\n\nFramework Focus: International Baccalaureate (IB)
- Integrate IB Learner Profile attributes (Inquirers, Knowledgeable, Thinkers, Communicators, Principled, Open-minded, Caring, Risk-takers, Balanced, Reflective)
- Reference subject-specific criteria where relevant
- Emphasize conceptual understanding and international-mindedness`;
      } else if (selectedFramework.includes('SPED') || selectedFramework.includes('IEP')) {
        systemInstruction += `\n\nFramework Focus: Special Education (SPED/IEP)
- Use exclusively asset-based, strength-first language
- Focus on measurable progress toward IEP goals
- Celebrate accommodations and modifications as tools for success
- Avoid deficit language entirely`;
      } else if (selectedFramework.includes('ESL') || selectedFramework.includes('ELL')) {
        systemInstruction += `\n\nFramework Focus: ESL/ELL
- Use clear, accessible English (avoid idioms and complex syntax)
- Highlight language acquisition milestones specifically
- Frame challenges as natural parts of language learning
- Celebrate bilingualism as an asset`;
      } else {
        systemInstruction += `\n\nFramework Focus: General K-12 Education
- Follow best practices in formative assessment and feedback
- Balance celebration of achievements with constructive growth areas
- Use grade-appropriate language and examples`;
      }

      // Tone specification
      const selectedTone = tone || 'Professional';
      systemInstruction += `\n\nTone: ${selectedTone} - Strike the perfect balance between warmth and professionalism.`;

      // User prompt
      const userPrompt = `Write a high-quality report card comment for a student based on the following information.

Student Context:
- Grade Level: ${gradeLevel}
- Pronouns: ${pronouns}
${studentName ? `- Student Name: ${studentName}` : ''}

Areas of Strength:
${strength}

${weakness ? `Areas for Growth:\n${weakness}` : ''}

Output Requirements:
1. Length: 3-5 sentences (approximately 60-80 words)
2. Perspective: Third-person using the provided pronouns
3. Structure: Begin with strengths, then address growth areas constructively
4. Quality: Specific, actionable, and personalized (not generic)
5. Grade Appropriateness: Language must be suitable for ${gradeLevel} context

Write ONLY the polished comment. Do not include any meta-commentary, explanations, or formatting markers.`;

      // Call Replicate API with Gemini 3 Pro
      const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
      
      if (!REPLICATE_API_TOKEN) {
        throw new Error('REPLICATE_API_TOKEN is not configured');
      }

      // Create prediction
      const createResponse = await fetch('https://api.replicate.com/v1/models/google/gemini-3-pro/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json',
          'Prefer': 'wait', // Wait for completion
        },
        body: JSON.stringify({
          input: {
            prompt: userPrompt,
            system_instruction: systemInstruction,
            thinking_level: "high", // UltraThink mode for maximum reasoning
            temperature: 1.0,
            top_p: 0.95,
            max_output_tokens: 2048,
          }
        })
      });

      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        console.error('Replicate API Error:', errorText);
        throw new Error(`Replicate API failed: ${createResponse.status}`);
      }

      const prediction = await createResponse.json() as ReplicatePrediction;
      
      // Handle different prediction states
      if (prediction.status === 'failed') {
        throw new Error('Prediction failed');
      }

      // If prediction is not complete, poll for completion
      let finalPrediction: ReplicatePrediction = prediction;
      if (prediction.status !== 'succeeded') {
        const pollUrl = prediction.urls?.get || `https://api.replicate.com/v1/predictions/${prediction.id}`;
        
        // Poll up to 30 times (30 seconds total)
        for (let i = 0; i < 30; i++) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const pollResponse = await fetch(pollUrl, {
            headers: {
              'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
            }
          });
          
          finalPrediction = await pollResponse.json() as ReplicatePrediction;
          
          if (finalPrediction.status === 'succeeded' || finalPrediction.status === 'failed') {
            break;
          }
        }
      }

      if (finalPrediction.status !== 'succeeded') {
        throw new Error('Prediction timed out or failed');
      }

      // Extract and concatenate output
      const outputArray = finalPrediction.output;
      if (!Array.isArray(outputArray) || outputArray.length === 0) {
        throw new Error('Invalid output format from API');
      }

      const generatedComment = outputArray.join('');

      return {
        success: true,
        comment: generatedComment.trim(),
      };

    } catch (error) {
      console.error('AI Generation Error:', error);
      return {
        success: false,
        error: 'Failed to generate comment. Please try again.',
      };
    }
  });

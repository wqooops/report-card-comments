'use server';

import { actionClient } from '@/lib/safe-action';
import { z } from 'zod';
import { getDb } from '@/db';
import { students, reports } from '@/db/schema';
import { consumeCredits } from '@/credits/credits';
import { getSession } from '@/lib/server';
import { randomUUID } from 'crypto';

interface ReplicatePrediction {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  output?: string[];
  error?: string;
  urls?: {
    get?: string;
  };
}

const batchItemSchema = z.object({
  gradeLevel: z.string().min(1),
  pronouns: z.string().min(1),
  strength: z.string().min(1),
  weakness: z.string().optional(),
});

export const processBatchItemAction = actionClient
  .schema(batchItemSchema)
  .action(async ({ parsedInput }) => {
    const { gradeLevel, pronouns, strength, weakness } = parsedInput;
    const session = await getSession();
    const user = session?.user;

    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    // 1. Check & Consume Credits
    try {
      await consumeCredits({
        userId: user.id,
        amount: 10,
        description: `Batch generation for student with pronouns ${pronouns}`,
      });
    } catch (error) {
      return { success: false, error: 'Insufficient credits' };
    }

    // 2. Generate Comment using Replicate Gemini 3 Pro
    let comment = '';
    try {
      // Build system instruction
      let systemInstruction = `You are the 'Kriterix Engine', a PhD-level educational consultant and expert report card comment writer with deep pedagogical expertise.

Your core principles:
- Asset-based language that celebrates student strengths
- Growth-mindset framing for areas of improvement
- Specific, actionable, and personalized feedback
- Age-appropriate and context-sensitive communication
- Professional tone that builds student confidence

Framework Focus: General K-12 Education
- Follow best practices in formative assessment and feedback
- Balance celebration of achievements with constructive growth areas
- Use grade-appropriate language and examples

Tone: Professional - Strike the perfect balance between warmth and professionalism.`;

      const userPrompt = `Write a high-quality report card comment for a student based on the following information.

Student Context:
- Grade Level: ${gradeLevel}
- Pronouns: ${pronouns}

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

      // Call Replicate API
      const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
      
      if (!REPLICATE_API_TOKEN) {
        throw new Error('REPLICATE_API_TOKEN is not configured');
      }

      const createResponse = await fetch('https://api.replicate.com/v1/models/google/gemini-3-pro/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json',
          'Prefer': 'wait',
        },
        body: JSON.stringify({
          input: {
            prompt: userPrompt,
            system_instruction: systemInstruction,
            thinking_level: "high",
            temperature: 1.0,
            top_p: 0.95,
            max_output_tokens: 2048,
          }
        })
      });

      if (!createResponse.ok) {
        throw new Error(`Replicate API failed: ${createResponse.status}`);
      }

      const prediction = await createResponse.json() as ReplicatePrediction;
      
      // Handle polling if needed
      let finalPrediction: ReplicatePrediction = prediction;
      if (prediction.status !== 'succeeded') {
        const pollUrl = prediction.urls?.get || `https://api.replicate.com/v1/predictions/${prediction.id}`;
        
        for (let i = 0; i < 30; i++) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const pollResponse = await fetch(pollUrl, {
            headers: { 'Authorization': `Bearer ${REPLICATE_API_TOKEN}` }
          });
          
          finalPrediction = await pollResponse.json() as ReplicatePrediction;
          
          if (finalPrediction.status === 'succeeded' || finalPrediction.status === 'failed') {
            break;
          }
        }
      }

      if (finalPrediction.status !== 'succeeded') {
        console.error('Prediction failed:', finalPrediction);
        throw new Error(`Prediction failed: ${finalPrediction.error || finalPrediction.status}`);
      }

      // Extract and validate output
      const outputArray = finalPrediction.output;
      console.log('Replicate output:', outputArray, 'Type:', typeof outputArray, 'IsArray:', Array.isArray(outputArray));
      
      if (!outputArray) {
        throw new Error('No output returned from API');
      }
      
      // Handle both array and string outputs with proper type checking
      if (Array.isArray(outputArray)) {
        if (outputArray.length === 0) {
          throw new Error('Empty output array from API');
        }
        comment = outputArray.join('').trim();
      } else if (typeof outputArray === 'string') {
        comment = (outputArray as string).trim();
      } else {
        throw new Error(`Unexpected output type: ${typeof outputArray}`);
      }
      
      if (!comment) {
        throw new Error('Generated comment is empty');
      }
    } catch (error) {
      console.error('AI Error:', error);
      return { success: false, error: 'AI Generation Failed' };
    }

    // 3. Save to DB (get fresh connection after AI generation)
    try {
      console.log('[Batch] Getting fresh DB connection for save...');
      const dbForSave = await getDb();
      const studentId = randomUUID();
      
      // Save Student
      await dbForSave.insert(students).values({
        id: studentId,
        userId: user.id,
        name: `Student (${pronouns})`, // Use pronouns as identifier since no name in CSV
        grade: gradeLevel,
        attributes: JSON.stringify({ pronouns, strength, weakness }),
      });

      // Save Report
      await dbForSave.insert(reports).values({
        id: randomUUID(),
        studentId,
        content: comment,
      });

      console.log('[Batch] ✅ DB save successful');
      return { success: true, comment };
    } catch (error) {
      console.error('DB Error:', error);
      // Gracefully degrade: user still gets comment even if DB save fails
      return { success: true, comment }; // Changed to success: true
    }
  });

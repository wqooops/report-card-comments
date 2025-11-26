import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { headers } from 'next/headers';

interface GenerateCommentRequest {
  studentName: string; // Mapped from 'name' in frontend if needed, or kept as studentName
  name?: string; // Supporting both for compatibility or transition
  framework: string;
  strength: string;
  weakness?: string; // New field
  areaForImprovement?: string; // Alias for weakness
  tone?: string; // New field
}

// Simple in-memory rate limit store
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS_PER_WINDOW = 10; // 10 requests per hour per IP

function getRateLimit(ip: string) {
  const now = Date.now();
  const record = rateLimitMap.get(ip) || { count: 0, lastReset: now };

  if (now - record.lastReset > RATE_LIMIT_WINDOW) {
    record.count = 0;
    record.lastReset = now;
  }

  return record;
}

export async function POST(req: Request) {
  try {
    // 1. Rate Limiting (Disabled for testing/MVP as per request)
    // const headersList = await headers();
    // const ip = headersList.get('x-forwarded-for') || 'unknown';
    // const rateLimit = getRateLimit(ip);

    // if (rateLimit.count >= MAX_REQUESTS_PER_WINDOW) {
    //   return Response.json(
    //     { error: 'Rate limit exceeded. Please try again later.' },
    //     { status: 429 }
    //   );
    // }

    // rateLimit.count++;
    // rateLimitMap.set(ip, rateLimit);

    // 2. Input Validation & Parsing
    const body = (await req.json()) as GenerateCommentRequest;
    const studentName = body.name || body.studentName;
    const { framework, strength, tone } = body;
    const weakness = body.weakness || body.areaForImprovement;

    if (!studentName || !framework || !strength) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 3. Kriterix Logic & System Prompt
    let systemInstruction = "You are the 'Kriterix Engine', an expert educational consultant and elite report card comment writer.";
    
    // Framework Logic
    if (framework.includes('IB') || framework.includes('International Baccalaureate')) {
      systemInstruction += " You specialize in International Baccalaureate (IB) terminology. You MUST inject IB Learner Profile attributes (e.g., inquirer, knowledgeable, thinker, communicator, principled, open-minded, caring, risk-taker, balanced, reflective) where appropriate.";
    } else if (framework.includes('SPED') || framework.includes('IEP')) {
      systemInstruction += " You specialize in Special Education (SPED) reporting. You MUST use 'Asset-Based' positive language. Focus strictly on progress towards goals, accommodations, and specific observable behaviors. Avoid deficit-based language.";
    } else if (framework.includes('ESL') || framework.includes('ELL')) {
      systemInstruction += " You specialize in ESL/ELL reports. Use simple, clear, and accessible English. Focus on language acquisition stages (listening, speaking, reading, writing).";
    } else {
      systemInstruction += " Write professional, constructive, and encouraging report card comments suitable for K-12 education.";
    }

    // Tone Logic
    if (tone) {
      systemInstruction += ` Adopt a ${tone} tone.`;
    } else {
      systemInstruction += " Maintain a professional, objective, yet encouraging tone.";
    }

    const prompt = `
      Write a report card comment for a student named "${studentName}".
      
      Key Strengths/Achievements: ${strength}
      ${weakness ? `Areas for Improvement/Weaknesses: ${weakness}` : ''}
      
      Requirements:
      - Length: Approximately 3-5 sentences (around 60-80 words).
      - Perspective: Third person (e.g., "${studentName} has shown...").
      - Framework Compliance: Strict adherence to ${framework} standards as defined in system instructions.
      - Quality: High-quality, polished prose. Avoid generic filler.
    `;

    const { text } = await generateText({
      model: google('gemini-1.5-flash'),
      system: systemInstruction,
      prompt: prompt,
      temperature: 0.7,
    });

    return Response.json({ comment: text });
  } catch (error) {
    console.error('Error generating comment:', error);
    return Response.json({ error: 'Failed to generate comment' }, { status: 500 });
  }
}

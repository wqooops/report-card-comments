import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

interface GenerateCommentRequest {
  studentName: string;
  framework: string;
  strength: string;
  areaForImprovement?: string;
}

export async function POST(req: Request) {
  try {
    const { studentName, framework, strength, areaForImprovement } = (await req.json()) as GenerateCommentRequest;

    let systemInstruction = "You are an expert educational consultant and teacher's aide.";
  
    switch (framework) {
      case 'IB (MYP/DP)':
        systemInstruction += " You specialize in International Baccalaureate (IB) terminology. Use terms like 'inquirer', 'communicator', 'principled', 'open-minded', 'risk-taker', 'balanced', 'reflective'. Focus on the learner profile attributes.";
        break;
      case 'SPED / IEP':
        systemInstruction += " You specialize in Special Education (SPED) and IEP reporting. Use asset-based language. Focus on progress towards goals, accommodations, and specific observable behaviors. Be supportive and factual.";
        break;
      case 'ESL / ELL':
        systemInstruction += " You specialize in ESL/ELL reports. Use simple, clear English. Focus on language acquisition stages (listening, speaking, reading, writing).";
        break;
      default:
        systemInstruction += " Write professional, constructive, and encouraging report card comments suitable for K-12 education.";
    }

    const prompt = `
      Write a report card comment for a student named "${studentName}".
      
      Key Strengths/Achievements: ${strength}
      ${areaForImprovement ? `Areas for Improvement/Next Steps: ${areaForImprovement}` : ''}
      
      Requirements:
      - Tone: Professional, encouraging, and objective.
      - Length: Approximately 3-5 sentences (around 60-80 words).
      - Perspective: Third person (e.g., "${studentName} has shown...").
      - Framework Compliance: Strict adherence to ${framework} standards.
    `;

    const { text } = await generateText({
      model: google('gemini-1.5-flash'), // Using 1.5-flash as 2.5 might not be available in this SDK version yet, or safe default
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

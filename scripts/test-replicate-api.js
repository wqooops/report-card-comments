#!/usr/bin/env node

/**
 * Test script for Replicate Gemini 3 Pro integration
 * Tests the API directly before testing through the Next.js action
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

if (!REPLICATE_API_TOKEN) {
  console.error('❌ REPLICATE_API_TOKEN not found in environment');
  process.exit(1);
}

async function testReplicateAPI() {
  console.log('🧪 Testing Replicate Gemini 3 Pro API...\n');

  const systemInstruction = `You are the 'Kriterix Engine', a PhD-level educational consultant and expert report card comment writer with deep pedagogical expertise.

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
- Grade Level: 8th grade
- Pronouns: he

Areas of Strength:
Homework completion, good friend, punctual

Areas for Growth:
Distracted easily, struggles with independent work

Output Requirements:
1. Length: 3-5 sentences (approximately 60-80 words)
2. Perspective: Third-person using the provided pronouns
3. Structure: Begin with strengths, then address growth areas constructively
4. Quality: Specific, actionable, and personalized (not generic)
5. Grade Appropriateness: Language must be suitable for 8th grade context

Write ONLY the polished comment. Do not include any meta-commentary, explanations, or formatting markers.`;

  try {
    console.log('📤 Sending request to Replicate API...');
    
    const startTime = Date.now();
    
    const response = await fetch('https://api.replicate.com/v1/models/google/gemini-3-pro/predictions', {
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

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', errorText);
      throw new Error(`API failed: ${response.status}`);
    }

    const prediction = await response.json();
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log(`✅ Request successful (${elapsed}s)`);
    console.log('\n📊 Prediction Details:');
    console.log(`   ID: ${prediction.id}`);
    console.log(`   Status: ${prediction.status}`);
    
    // Handle polling if needed
    let finalPrediction = prediction;
    if (prediction.status !== 'succeeded') {
      console.log('\n⏳ Polling for completion...');
      
      const pollUrl = prediction.urls?.get || `https://api.replicate.com/v1/predictions/${prediction.id}`;
      
      for (let i = 0; i < 30; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const pollResponse = await fetch(pollUrl, {
          headers: {
            'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
          }
        });
        
        finalPrediction = await pollResponse.json();
        
        process.stdout.write('.');
        
        if (finalPrediction.status === 'succeeded' || finalPrediction.status === 'failed') {
          console.log('');
          break;
        }
      }
    }

    if (finalPrediction.status === 'succeeded') {
      const totalElapsed = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`✅ Generation complete (total: ${totalElapsed}s)\n`);
      
      const outputArray = finalPrediction.output;
      const generatedComment = outputArray.join('');
      
      console.log('📝 Generated Comment:');
      console.log('─'.repeat(60));
      console.log(generatedComment);
      console.log('─'.repeat(60));
      console.log(`\n📏 Length: ${generatedComment.split(' ').length} words`);
      console.log('✅ Test passed!\n');
    } else {
      console.error('❌ Generation failed:', finalPrediction.error || finalPrediction.status);
      throw new Error('Generation failed');
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run test
testReplicateAPI();

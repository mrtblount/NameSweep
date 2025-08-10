// Quick test script to verify OpenAI connection
// Run with: node test-openai.js

const OpenAI = require('openai');
require('dotenv').config({ path: '.env.local' });

async function testOpenAI() {
  console.log('Testing OpenAI connection...\n');
  
  // Check if API key exists
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY not found in environment variables');
    console.log('Please add it to .env.local file');
    return;
  }

  console.log('✅ API Key found:', process.env.OPENAI_API_KEY.substring(0, 7) + '...');
  
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    console.log('\nTesting simple completion...');
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { 
          role: 'user', 
          content: 'Generate 3 creative brand names for a coffee shop. Return as JSON array with just names.' 
        }
      ],
      temperature: 0.7,
      max_tokens: 100,
    });

    console.log('✅ OpenAI Response received!');
    console.log('Response:', completion.choices[0].message.content);
    
    console.log('\n=== OpenAI Integration Status ===');
    console.log('✅ Connection: Working');
    console.log('✅ Model: gpt-4o-mini');
    console.log('✅ Ready for name generation');
    
  } catch (error) {
    console.error('\n❌ OpenAI Error:', error.message);
    
    if (error.message.includes('401')) {
      console.log('Issue: Invalid API key');
      console.log('Solution: Check your API key in .env.local');
    } else if (error.message.includes('429')) {
      console.log('Issue: Rate limit or quota exceeded');
      console.log('Solution: Check your OpenAI account credits');
    } else if (error.message.includes('insufficient_quota')) {
      console.log('Issue: No credits in OpenAI account');
      console.log('Solution: Add credits at platform.openai.com');
    }
  }
}

testOpenAI();
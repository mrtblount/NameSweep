#!/usr/bin/env node

// Direct test of GoDaddy API
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const GODADDY_API_BASE = 'https://api.godaddy.com/v1';

async function testGoDaddy() {
  const apiKey = process.env.GODADDY_API_KEY;
  const apiSecret = process.env.GODADDY_API_SECRET;
  
  console.log('Testing GoDaddy API with real credentials...');
  console.log('API Key exists:', !!apiKey);
  console.log('API Secret exists:', !!apiSecret);
  
  const testDomains = [
    'tonyblount.com',  // You own this - should be taken
    'tonyblount.co',   // Should be available
    'openai.com',      // Definitely taken
    'asdfjkl789xyz.com' // Should be available
  ];
  
  for (const domain of testDomains) {
    console.log(`\n========== Testing: ${domain} ==========`);
    
    try {
      const url = `${GODADDY_API_BASE}/domains/available?domain=${domain}&checkType=FULL`;
      console.log('URL:', url);
      console.log('Auth header:', `sso-key ${apiKey?.substring(0,10)}...:***`);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `sso-key ${apiKey}:${apiSecret}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      const text = await response.text();
      console.log('Raw response:', text);
      
      if (response.ok) {
        try {
          const data = JSON.parse(text);
          console.log('✅ Parsed data:', JSON.stringify(data, null, 2));
        } catch (e) {
          console.log('❌ Failed to parse JSON:', e.message);
        }
      }
    } catch (error) {
      console.error('❌ Error:', error);
    }
  }
}

testGoDaddy().catch(console.error);
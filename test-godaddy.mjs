// Test script for GoDaddy API
import 'dotenv/config';

const GODADDY_API_BASE = 'https://api.godaddy.com/v1';

async function testGoDaddyAPI() {
  const apiKey = process.env.GODADDY_API_KEY;
  const apiSecret = process.env.GODADDY_API_SECRET;
  
  console.log('Testing GoDaddy API...');
  console.log('API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT SET');
  console.log('API Secret:', apiSecret ? 'SET' : 'NOT SET');
  
  if (!apiKey || !apiSecret) {
    console.error('❌ GoDaddy API credentials not found in .env.local');
    return;
  }
  
  // Test with a known domain
  const testDomains = ['google.com', 'asdfjkl123xyz.com', 'workbrew.com'];
  
  for (const domain of testDomains) {
    try {
      console.log(`\nTesting domain: ${domain}`);
      
      const response = await fetch(
        `${GODADDY_API_BASE}/domains/available?domain=${domain}&checkType=FULL`,
        {
          headers: {
            'Authorization': `sso-key ${apiKey}:${apiSecret}`,
            'Accept': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ API Error (${response.status}):`, errorText);
        continue;
      }
      
      const data = await response.json();
      console.log(`✅ Response:`, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(`❌ Error checking ${domain}:`, error);
    }
  }
}

testGoDaddyAPI();
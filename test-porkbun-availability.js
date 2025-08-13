require('dotenv').config({ path: '.env.local' });

async function testPorkbunEndpoint(endpoint, data = {}) {
  const apiKey = process.env.PORKBUN_API_KEY;
  const apiSecret = process.env.PORKBUN_API_SECRET;
  
  console.log(`\nTesting: ${endpoint}`);
  
  try {
    const response = await fetch(`https://api.porkbun.com/api/json/v3${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apikey: apiKey,
        secretapikey: apiSecret,
        ...data
      })
    });
    
    console.log(`Status: ${response.status}`);
    const responseText = await response.text();
    
    if (responseText) {
      try {
        const json = JSON.parse(responseText);
        console.log('Response:', JSON.stringify(json, null, 2));
        return json;
      } catch {
        console.log('Response (raw):', responseText.substring(0, 200));
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function run() {
  console.log('='.repeat(50));
  console.log('Testing Porkbun API for domain availability checking');
  console.log('='.repeat(50));
  
  // Test different potential endpoints
  const testDomain = 'testdomaincheck123.com';
  
  // Try domain check endpoint (this didn't work before)
  await testPorkbunEndpoint('/domain/check', { domain: testDomain });
  
  // Try domain availability endpoint
  await testPorkbunEndpoint('/domain/availability', { domain: testDomain });
  
  // Try domain search
  await testPorkbunEndpoint('/domain/search', { query: 'testdomaincheck123' });
  
  // Try pricing/check
  await testPorkbunEndpoint('/pricing/check', { domain: testDomain });
  
  // Check if we can get pricing for a specific domain
  await testPorkbunEndpoint('/pricing/get', { domain: testDomain });
  
  console.log('\n' + '='.repeat(50));
  console.log('Testing complete');
}

run();
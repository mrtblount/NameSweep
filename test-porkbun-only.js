require('dotenv').config({ path: '.env.local' });

async function testPorkbunOnly(domain) {
  const apiKey = process.env.PORKBUN_API_KEY;
  const apiSecret = process.env.PORKBUN_API_SECRET;
  
  console.log(`\n🔍 Testing Porkbun API for: ${domain}`);
  console.log(`API Key starts with: ${apiKey ? apiKey.substring(0, 10) + '...' : 'NOT SET'}`);
  console.log(`API Secret is ${apiSecret ? 'SET' : 'NOT SET'}\n`);
  
  if (!apiKey || !apiSecret) {
    console.error('❌ Porkbun API credentials missing!');
    return;
  }
  
  // Test different possible endpoints
  const endpoints = [
    'https://porkbun.com/api/json/v3/domain/check',
    'https://api.porkbun.com/api/json/v3/domain/check',
    'https://api-ipv4.porkbun.com/api/json/v3/domain/check'
  ];
  
  for (const endpoint of endpoints) {
    console.log(`\nTrying endpoint: ${endpoint}`);
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apikey: apiKey,
          secretapikey: apiSecret,
          domain: domain
        })
      });
      
      console.log(`Response Status: ${response.status}`);
      console.log(`Response Headers:`, response.headers.get('content-type'));
      
      const responseText = await response.text();
      
      // Check if it's HTML (error) or JSON (success)
      if (responseText.trim().startsWith('<')) {
        console.log('❌ Got HTML response (API endpoint not working)');
        console.log('First 200 chars:', responseText.substring(0, 200));
      } else {
        try {
          const data = JSON.parse(responseText);
          console.log('✅ Got JSON response!');
          console.log(JSON.stringify(data, null, 2));
          
          if (data.status === 'SUCCESS') {
            console.log(`\n✅ API WORKING! Domain check result:`);
            console.log(`Domain: ${domain}`);
            console.log(`Available: ${data.available}`);
            if (data.pricing) {
              console.log(`Price: $${data.pricing.registration}`);
            }
            return; // Found working endpoint
          } else {
            console.log(`❌ API Error: ${data.message}`);
          }
        } catch (e) {
          console.log('❌ Failed to parse JSON:', e.message);
          console.log('Response:', responseText);
        }
      }
    } catch (error) {
      console.error('❌ Request failed:', error.message);
    }
  }
}

// Test with different domains
async function runTests() {
  // Test a domain that should be available
  await testPorkbunOnly('asdfjkl789xyz123test.com');
  
  // Test a domain that should be taken
  await testPorkbunOnly('google.com');
}

runTests();
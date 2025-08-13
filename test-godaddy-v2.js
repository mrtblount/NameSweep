require('dotenv').config({ path: '.env.local' });

async function testGoDaddyV2(domain) {
  const apiKey = process.env.GODADDY_API_KEY;
  const apiSecret = process.env.GODADDY_API_SECRET;
  
  console.log(`\n🔍 Testing GoDaddy API v2 for: ${domain}`);
  
  // Try the v2 endpoint
  const url = `https://api.godaddy.com/v2/domains/${domain}/available`;
  console.log(`Calling: ${url}\n`);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `sso-key ${apiKey}:${apiSecret}`,
        'Accept': 'application/json'
      }
    });
    
    console.log(`Response Status: ${response.status}`);
    const responseText = await response.text();
    console.log(`Response: ${responseText}\n`);
    
  } catch (error) {
    console.error('Request failed:', error);
  }
}

// Also try the suggestions endpoint
async function testGoDaddySuggestions(keyword) {
  const apiKey = process.env.GODADDY_API_KEY;
  const apiSecret = process.env.GODADDY_API_SECRET;
  
  console.log(`\n🔍 Testing GoDaddy Suggestions API for: ${keyword}`);
  
  const url = `https://api.godaddy.com/v1/domains/suggest?query=${keyword}&limit=5`;
  console.log(`Calling: ${url}\n`);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `sso-key ${apiKey}:${apiSecret}`,
        'Accept': 'application/json'
      }
    });
    
    console.log(`Response Status: ${response.status}`);
    const responseText = await response.text();
    console.log(`Response: ${responseText}\n`);
    
  } catch (error) {
    console.error('Request failed:', error);
  }
}

async function runTests() {
  // Test v2 endpoint
  await testGoDaddyV2('testdomain123xyz.com');
  
  // Test suggestions endpoint
  await testGoDaddySuggestions('testdomain');
}

runTests();

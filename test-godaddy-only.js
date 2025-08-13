require('dotenv').config({ path: '.env.local' });

async function testGoDaddyOnly(domain) {
  const apiKey = process.env.GODADDY_API_KEY;
  const apiSecret = process.env.GODADDY_API_SECRET;
  
  console.log(`\n🔍 Testing GoDaddy API for: ${domain}`);
  console.log(`API Key starts with: ${apiKey ? apiKey.substring(0, 10) + '...' : 'NOT SET'}`);
  console.log(`API Secret is ${apiSecret ? 'SET' : 'NOT SET'}\n`);
  
  if (!apiKey || !apiSecret) {
    console.error('❌ GoDaddy API credentials missing!');
    return;
  }
  
  try {
    const url = `https://api.godaddy.com/v1/domains/available?domain=${domain}&checkType=FULL`;
    console.log(`Calling: ${url}\n`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `sso-key ${apiKey}:${apiSecret}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Response Status: ${response.status}`);
    
    const responseText = await response.text();
    console.log(`\nRaw Response:\n${responseText}\n`);
    
    if (response.ok) {
      const data = JSON.parse(responseText);
      console.log('✅ SUCCESS! Domain check result:');
      console.log(JSON.stringify(data, null, 2));
      
      if (data.available === true) {
        console.log(`\n✅ ${domain} is AVAILABLE for registration`);
      } else {
        console.log(`\n❌ ${domain} is TAKEN`);
      }
    } else {
      console.error(`\n❌ API Error ${response.status}:`);
      console.error(responseText);
    }
  } catch (error) {
    console.error('\n❌ Request failed:', error);
  }
}

// Test with different domains
async function runTests() {
  // Test a domain that should be available
  await testGoDaddyOnly('asdfjkl789xyz123test.com');
  
  // Test a domain that should be taken
  await testGoDaddyOnly('google.com');
  
  // Test another taken domain
  await testGoDaddyOnly('tonyblount.com');
}

runTests();
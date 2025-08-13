require('dotenv').config({ path: '.env.local' });

async function testPorkbunPricing(domain) {
  const apiKey = process.env.PORKBUN_API_KEY;
  const apiSecret = process.env.PORKBUN_API_SECRET;
  
  console.log(`\nTesting Porkbun Pricing API for: ${domain}\n`);
  
  // Try the pricing endpoint which also shows availability
  const endpoint = 'https://api.porkbun.com/api/json/v3/pricing/get';
  
  console.log(`Endpoint: ${endpoint}`);
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apikey: apiKey,
        secretapikey: apiSecret
      })
    });
    
    console.log(`Response Status: ${response.status}`);
    const responseText = await response.text();
    
    if (response.status === 200) {
      const data = JSON.parse(responseText);
      if (data.status === 'SUCCESS') {
        console.log('✅ Got pricing data\!');
        // Check if .com pricing exists
        if (data.pricing && data.pricing.com) {
          console.log('Price for .com domains:', data.pricing.com);
        }
      }
    } else {
      console.log('Response:', responseText);
    }
  } catch (error) {
    console.error('Request failed:', error);
  }
}

// Try domain/getInfo endpoint
async function testPorkbunDomainInfo(domain) {
  const apiKey = process.env.PORKBUN_API_KEY;
  const apiSecret = process.env.PORKBUN_API_SECRET;
  
  console.log(`\nTesting Porkbun domain/listAll endpoint...\n`);
  
  const endpoint = 'https://api.porkbun.com/api/json/v3/domain/listAll';
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apikey: apiKey,
        secretapikey: apiSecret
      })
    });
    
    console.log(`Response Status: ${response.status}`);
    const responseText = await response.text();
    
    if (response.status === 200) {
      const data = JSON.parse(responseText);
      if (data.status === 'SUCCESS') {
        console.log('✅ Can access domain management API');
        console.log('Your domains:', data.domains ? data.domains.length : 0);
      }
    } else {
      console.log('Response:', responseText);
    }
  } catch (error) {
    console.error('Request failed:', error);
  }
}

async function run() {
  await testPorkbunPricing();
  await testPorkbunDomainInfo();
}

run();

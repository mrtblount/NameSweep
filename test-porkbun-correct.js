require('dotenv').config({ path: '.env.local' });

async function testPorkbunCorrect(domain) {
  const apiKey = process.env.PORKBUN_API_KEY;
  const apiSecret = process.env.PORKBUN_API_SECRET;
  
  console.log(`\n🔍 Testing Porkbun API (correct format) for: ${domain}`);
  
  // According to Porkbun docs, the correct endpoint is:
  const endpoint = 'https://api.porkbun.com/api/json/v3/domain/check';
  
  console.log(`Using endpoint: ${endpoint}`);
  console.log(`API Key: ${apiKey}`);
  console.log(`API Secret: ${apiSecret ? 'SET' : 'NOT SET'}\n`);
  
  try {
    const body = {
      apikey: apiKey,
      secretapikey: apiSecret,
      domain: domain
    };
    
    console.log('Request body:', JSON.stringify(body, null, 2));
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });
    
    console.log(`Response Status: ${response.status}`);
    const responseText = await response.text();
    console.log(`Response: ${responseText}\n`);
    
    // Try to parse as JSON if possible
    try {
      const data = JSON.parse(responseText);
      if (data.status === 'SUCCESS') {
        console.log('✅ SUCCESS!');
        console.log(`Domain ${domain} is ${data.available}`);
      }
    } catch (e) {
      // Not JSON
    }
    
  } catch (error) {
    console.error('Request failed:', error);
  }
}

// First, let's test if the API key format is correct
console.log('Checking API key format...');
const key = process.env.PORKBUN_API_KEY;
const secret = process.env.PORKBUN_API_SECRET;

if (key && key.startsWith('pk_')) {
  console.log('✅ API key format looks correct (starts with pk_)');
} else if (key && key.startsWith('pk1_')) {
  console.log('⚠️  API key starts with pk1_ - this might be an older format');
} else {
  console.log('❌ API key format may be incorrect');
}

if (secret && secret.startsWith('sk_')) {
  console.log('✅ API secret format looks correct (starts with sk_)');
} else if (secret && secret.startsWith('sk1_')) {
  console.log('⚠️  API secret starts with sk1_ - this might be an older format');
} else {
  console.log('❌ API secret format may be incorrect');
}

// Run test
testPorkbunCorrect('testdomain123xyz.com');
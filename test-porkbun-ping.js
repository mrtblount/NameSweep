require('dotenv').config({ path: '.env.local' });

async function testPorkbunPing() {
  const apiKey = process.env.PORKBUN_API_KEY;
  const apiSecret = process.env.PORKBUN_API_SECRET;
  
  console.log('Testing Porkbun API Ping endpoint...\n');
  
  // Try the ping endpoint to test if credentials work at all
  const pingEndpoint = 'https://api.porkbun.com/api/json/v3/ping';
  
  console.log(`Endpoint: ${pingEndpoint}`);
  
  try {
    const response = await fetch(pingEndpoint, {
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
    console.log(`Response: ${responseText}\n`);
    
    if (response.status === 200) {
      try {
        const data = JSON.parse(responseText);
        if (data.status === 'SUCCESS') {
          console.log('✅ API credentials are VALID\!');
          console.log('Your IP:', data.yourIp);
        } else {
          console.log('❌ API returned error:', data.message);
        }
      } catch (e) {
        console.log('Could not parse response as JSON');
      }
    }
  } catch (error) {
    console.error('Request failed:', error);
  }
}

testPorkbunPing();

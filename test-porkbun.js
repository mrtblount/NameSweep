// Test Porkbun API connection
require('dotenv').config({ path: '.env.local' });

const PORKBUN_API_BASE = 'https://api.porkbun.com/api/json/v3';

async function testPorkbun() {
  const apiKey = process.env.PORKBUN_API_KEY;
  const apiSecret = process.env.PORKBUN_API_SECRET;
  
  console.log('Testing Porkbun API...');
  console.log('API Key exists:', !!apiKey);
  console.log('API Secret exists:', !!apiSecret);
  
  if (!apiKey || !apiSecret) {
    console.error('❌ Porkbun credentials not found in environment');
    return;
  }
  
  try {
    // First test ping endpoint to verify credentials
    console.log('\nTesting ping endpoint first...');
    const pingResponse = await fetch(`${PORKBUN_API_BASE}/ping`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apikey: apiKey,
        secretapikey: apiSecret
      }),
    });
    
    const pingData = await pingResponse.json();
    console.log('Ping response:', pingData);
    
    if (pingData.status !== 'SUCCESS') {
      console.error('❌ Authentication failed:', pingData.message);
      return;
    }
    
    // Now test domain pricing (check endpoint might not exist)
    console.log('\nTesting domain pricing...');
    const response = await fetch(`${PORKBUN_API_BASE}/domain/pricing/get`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apikey: apiKey,
        secretapikey: apiSecret
      }),
    });
    
    const data = await response.json();
    console.log('\n✅ Porkbun API Response:', JSON.stringify(data, null, 2));
    
    if (data.status === 'SUCCESS') {
      console.log('\n✅ Porkbun API is working correctly!');
      console.log('Domain availability:', data.available);
      if (data.pricing) {
        console.log('Pricing:', data.pricing);
      }
    } else {
      console.log('\n❌ Porkbun API error:', data.message);
    }
  } catch (error) {
    console.error('\n❌ Failed to connect to Porkbun:', error.message);
  }
}

testPorkbun();
require('dotenv').config({ path: '.env.local' });

async function testWhoisXMLAPI(domain) {
  const apiKey = process.env.WHOISXML_API_KEY;
  
  if (!apiKey) {
    console.error('❌ WHOISXML_API_KEY not found in .env.local');
    return;
  }
  
  console.log('Testing WhoisXMLAPI Domain Availability Check');
  console.log('='.repeat(50));
  console.log(`API Key: ${apiKey.substring(0, 10)}...`);
  console.log(`Domain: ${domain}`);
  console.log('');
  
  const url = `https://domain-availability.whoisxmlapi.com/api/v1?apiKey=${apiKey}&domainName=${domain}&outputFormat=JSON`;
  
  console.log('Making request to WhoisXMLAPI...');
  
  try {
    const response = await fetch(url);
    
    console.log(`Response Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      
      if (response.status === 401) {
        console.error('❌ Invalid API key');
      } else if (response.status === 402) {
        console.error('❌ API quota exceeded');
      }
      return;
    }
    
    const data = await response.json();
    console.log('\n✅ Success! Response:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.DomainInfo) {
      const availability = data.DomainInfo.domainAvailability;
      console.log('\n' + '='.repeat(50));
      console.log(`Domain: ${data.DomainInfo.domainName}`);
      console.log(`Status: ${availability}`);
      
      if (availability === 'AVAILABLE') {
        console.log('✅ Domain is AVAILABLE for registration!');
      } else if (availability === 'UNAVAILABLE') {
        console.log('❌ Domain is TAKEN');
      } else {
        console.log('❓ Unable to determine availability');
      }
    }
    
  } catch (error) {
    console.error('Request failed:', error);
  }
}

async function runTests() {
  // Test with a domain that should be taken
  await testWhoisXMLAPI('google.com');
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test with a domain that should be available
  await testWhoisXMLAPI('thisisareallylongdomainnamethatdoesnotexist123456.com');
}

runTests();
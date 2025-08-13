require('dotenv').config({ path: '.env.local' });

async function testWhoisAPI(domain) {
  const apiKey = process.env.WHOISXML_API_KEY;
  
  console.log('Testing WHOIS API (454 requests available)');
  console.log('='.repeat(50));
  console.log(`Domain: ${domain}\n`);
  
  // Test WHOIS API
  const whoisUrl = `https://www.whoisxmlapi.com/whoisserver/WhoisService?apiKey=${apiKey}&domainName=${domain}&outputFormat=JSON`;
  
  try {
    const response = await fetch(whoisUrl);
    
    if (!response.ok) {
      console.error(`WHOIS API Error: ${response.status}`);
      return;
    }
    
    const data = await response.json();
    console.log('WHOIS Response:');
    
    // Extract key information
    if (data.WhoisRecord) {
      const record = data.WhoisRecord;
      console.log(`- Domain: ${record.domainName}`);
      console.log(`- Created: ${record.createdDate || 'N/A'}`);
      console.log(`- Updated: ${record.updatedDate || 'N/A'}`);
      console.log(`- Expires: ${record.expiresDate || 'N/A'}`);
      console.log(`- Status: ${record.status || 'N/A'}`);
      console.log(`- Registrar: ${record.registrarName || 'N/A'}`);
      
      // Check if domain is available based on WHOIS
      if (record.dataError === 'MISSING_WHOIS_DATA' || !record.domainName) {
        console.log('\n✅ Domain appears to be AVAILABLE (no WHOIS data)');
      } else {
        console.log('\n❌ Domain is TAKEN (has WHOIS data)');
      }
    }
    
  } catch (error) {
    console.error('Request failed:', error);
  }
}

async function testDomainResearch(domain) {
  const apiKey = process.env.WHOISXML_API_KEY;
  
  console.log('\n' + '='.repeat(50));
  console.log('Testing Domain Research Suite (500 requests available)');
  console.log('='.repeat(50));
  
  // This might be a different endpoint - let's try to find it
  const urls = [
    `https://domain-research.whoisxmlapi.com/api/v2?apiKey=${apiKey}&domain=${domain}`,
    `https://www.whoisxmlapi.com/domainResearch/api/v1?apiKey=${apiKey}&domain=${domain}`,
  ];
  
  for (const url of urls) {
    console.log(`\nTrying: ${url.split('?')[0]}`);
    try {
      const response = await fetch(url);
      console.log(`Status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Response:', JSON.stringify(data, null, 2).substring(0, 500));
        break;
      }
    } catch (error) {
      console.log('Failed:', error.message);
    }
  }
}

async function run() {
  // Test WHOIS API with a taken domain
  await testWhoisAPI('google.com');
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test with an available domain
  await testWhoisAPI('thisisareallylongdomainnamethatdoesnotexist789.com');
  
  // Test Domain Research Suite
  await testDomainResearch('google.com');
}

run();
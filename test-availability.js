// Test the new availability checking
const { checkSocialsSmartly } = require('./lib/helpers/socials-smart-check');
const { checkMultipleDomainsViaDNS } = require('./lib/helpers/domains-dns-check');

async function testAvailability() {
  console.log('Testing availability checking...\n');
  
  // Test with a name that should have some available and some taken
  const testName = 'techstartup789xyz'; // Likely available
  const testNameTaken = 'google'; // Definitely taken
  
  console.log(`Testing available name: "${testName}"`);
  console.log('=====================================\n');
  
  // Test domains
  console.log('Checking domains...');
  const domains = await checkMultipleDomainsViaDNS(testName, ['.com', '.co', '.io', '.net']);
  console.log('Domain results:', JSON.stringify(domains, null, 2));
  
  // Test socials
  console.log('\nChecking social media...');
  const socials = await checkSocialsSmartly(testName);
  console.log('Social results:', JSON.stringify(socials, null, 2));
  
  console.log('\n\nTesting taken name: "google"');
  console.log('=====================================\n');
  
  // Test with taken name
  const domainsTaken = await checkMultipleDomainsViaDNS(testNameTaken, ['.com']);
  console.log('Domain results:', JSON.stringify(domainsTaken, null, 2));
  
  const socialsTaken = await checkSocialsSmartly(testNameTaken);
  console.log('\nSocial results:', JSON.stringify(socialsTaken, null, 2));
}

// Run the test
testAvailability().catch(console.error);
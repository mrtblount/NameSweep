// Test the API check endpoint
const baseUrl = 'http://localhost:3000';

async function testCheck(name) {
  console.log(`\nTesting name: "${name}"`);
  console.log('='.repeat(50));
  
  try {
    const response = await fetch(`${baseUrl}/api/check?name=${encodeURIComponent(name)}`);
    const data = await response.json();
    
    console.log('\nDomains:');
    Object.entries(data.domains).forEach(([tld, status]) => {
      console.log(`  ${tld}: ${status}`);
    });
    
    console.log('\nSocial Media:');
    Object.entries(data.socials).forEach(([platform, info]) => {
      if (info && info.status) {
        console.log(`  ${platform}: ${info.status} (${info.available ? 'available' : 'taken'})`);
      }
    });
    
    console.log('\nTrademark:', data.tm?.status || 'N/A');
    console.log('Premium domains:', data.premium ? 'Yes' : 'No');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function runTests() {
  console.log('Starting availability tests...\n');
  
  // Test likely available name
  await testCheck('techstartup789xyz');
  
  // Test definitely taken name
  await testCheck('google');
  
  // Test another likely available
  await testCheck('mynewbrand2025xyz');
}

// Start a local server first with: npm run dev
console.log('Make sure the dev server is running (npm run dev)');
console.log('Testing in 2 seconds...\n');

setTimeout(runTests, 2000);
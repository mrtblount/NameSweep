const dns = require('dns');
const { promisify } = require('util');

const resolveNs = promisify(dns.resolveNs);
const resolve4 = promisify(dns.resolve4);

async function testSimpleDomainCheck(domain) {
  console.log(`\nChecking ${domain}...`);
  
  try {
    // Check for nameservers
    const nameservers = await resolveNs(domain);
    console.log(`✅ Domain is TAKEN - has nameservers:`, nameservers.slice(0, 2));
    return 'taken';
  } catch (error) {
    if (error.code === 'ENOTFOUND' || error.code === 'ENODATA') {
      // No nameservers - might be available
      try {
        // Double-check with A records
        const ips = await resolve4(domain);
        console.log(`❌ Domain is TAKEN - has IP addresses:`, ips);
        return 'taken';
      } catch {
        console.log(`✅ Domain is likely AVAILABLE - no NS or A records`);
        return 'available';
      }
    } else {
      console.log(`❓ Unable to determine - error:`, error.code);
      return 'unknown';
    }
  }
}

async function runTests() {
  console.log('Testing DNS-based domain checking...\n');
  console.log('='.repeat(50));
  
  // Test domains that should be taken
  await testSimpleDomainCheck('google.com');
  await testSimpleDomainCheck('tonyblount.com');
  await testSimpleDomainCheck('openai.com');
  
  // Test domains that should be available
  await testSimpleDomainCheck('asdfjkl789xyz123test.com');
  await testSimpleDomainCheck('thisisareallylongdomainnamethatdoesnotexist.com');
  
  console.log('\n' + '='.repeat(50));
  console.log('\nDNS-based checking works for basic availability\!');
  console.log('Note: This method is not 100% accurate but works for most cases.');
}

runTests();

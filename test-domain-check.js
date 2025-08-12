// Test the new domain checking system
const { checkDomainAvailability } = require('./lib/services/porkbun');

// Test domains with expected results
const testDomains = [
  { domain: 'workbrew.com', expected: '❌ live site' },
  { domain: 'workbrew.co', expected: '❌ parked' },
  { domain: 'workbrew.io', expected: '❌ parked' },
  { domain: 'workbrew.net', expected: '❌ parked' },
  { domain: 'tonyblount.com', expected: '❌ live site' },
  { domain: 'tonyblount.co', expected: '✅ available' },
  { domain: 'tonyblount.io', expected: '✅ available' },
  { domain: 'tonyblount.net', expected: '✅ available' },
  { domain: 'asdfjkl789xyz.com', expected: '✅ available' }
];

async function runTests() {
  console.log('Testing domain availability checker...\n');
  console.log('Domain'.padEnd(20) + 'Result'.padEnd(20) + 'Expected'.padEnd(20) + 'Status');
  console.log('-'.repeat(70));
  
  let passed = 0;
  let failed = 0;
  
  for (const test of testDomains) {
    try {
      const result = await checkDomainAvailability(test.domain);
      const resultStr = `${result.status} ${result.displayText || ''}`.trim();
      const isCorrect = resultStr === test.expected;
      
      console.log(
        test.domain.padEnd(20) + 
        resultStr.padEnd(20) + 
        test.expected.padEnd(20) + 
        (isCorrect ? '✅ PASS' : '❌ FAIL')
      );
      
      if (isCorrect) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.log(
        test.domain.padEnd(20) + 
        'ERROR'.padEnd(20) + 
        test.expected.padEnd(20) + 
        '❌ ERROR'
      );
      console.error(`  Error: ${error.message}`);
      failed++;
    }
  }
  
  console.log('\n' + '-'.repeat(70));
  console.log(`Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('\n✅ All tests passed!');
  } else {
    console.log('\n❌ Some tests failed. Please check the implementation.');
  }
}

// Run the tests
runTests().catch(console.error);
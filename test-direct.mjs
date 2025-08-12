// Direct test of domain checking methods
import { checkDomainAvailability } from './lib/services/porkbun.js';

console.log('Testing domain availability directly...\n');

const testDomains = [
  'workbrew.com',
  'workbrew.co', 
  'workbrew.io',
  'workbrew.net',
  'tonyblount.com',
  'tonyblount.co',
  'tonyblount.io', 
  'tonyblount.net',
  'asdfjkl789xyz.com'
];

for (const domain of testDomains) {
  console.log(`\nChecking ${domain}...`);
  try {
    const result = await checkDomainAvailability(domain);
    console.log(`Result: ${result.status} ${result.displayText || ''}`);
    console.log(`Mock: ${result.mock}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}
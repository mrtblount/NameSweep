#!/usr/bin/env node

/**
 * Test script for domain availability checking
 * This tests that we NEVER lie about domain availability
 */

import 'dotenv/config';
import { checkDomainAvailability } from './lib/services/porkbun.js';

const testDomains = [
  // Known taken domains (should show as taken with live sites)
  'popeyes.com',
  'mcdonalds.com',
  'google.com',
  'facebook.com',
  
  // Likely available (random string)
  'asdfjkl789xyz123.com',
  
  // Edge cases
  'workbrew.com',
  'tonyblount.com',
  'tonyblount.co'
];

async function runTests() {
  console.log('🧪 Testing Domain Availability Checker - STRICT MODE\n');
  console.log('Rule: NEVER lie about availability. If unsure, say "unable to verify"\n');
  console.log('='.repeat(70));
  
  for (const domain of testDomains) {
    console.log(`\nTesting: ${domain}`);
    console.log('-'.repeat(40));
    
    try {
      const result = await checkDomainAvailability(domain);
      
      console.log('Status:', result.status);
      console.log('Display:', result.displayText);
      console.log('Available:', result.available);
      console.log('Live Site:', result.liveSite || false);
      console.log('Mock Data:', result.mock || false);
      
      // Validate the result
      if (result.status === '✅' && domain.includes('popeyes')) {
        console.error('❌ ERROR: Popeyes should NEVER show as available!');
      }
      if (result.status === '✅' && domain.includes('mcdonalds')) {
        console.error('❌ ERROR: McDonalds should NEVER show as available!');
      }
      if (result.status === '✅' && domain.includes('google')) {
        console.error('❌ ERROR: Google should NEVER show as available!');
      }
      
    } catch (error) {
      console.error('Test failed:', error.message);
    }
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('✅ Tests complete\n');
}

runTests().catch(console.error);
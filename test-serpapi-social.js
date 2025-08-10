// Test SerpAPI social checking
require('dotenv').config({ path: '.env.local' });

async function testSerpAPISocial() {
  const apiKey = process.env.SERPAPI_KEY;
  
  console.log('Testing SerpAPI Social Checking...');
  console.log('API Key exists:', !!apiKey);
  
  if (!apiKey) {
    console.error('❌ SerpAPI key not found in environment');
    return;
  }
  
  // Test with "bobsfurniture" like the user mentioned
  const testName = 'bobsfurniture';
  console.log(`\nTesting social handles for: "${testName}"`);
  console.log('='.repeat(50));
  
  try {
    // Test X/Twitter
    const xQuery = `site:x.com/${testName} OR site:twitter.com/${testName} "@${testName}"`;
    console.log('\nSearching X/Twitter...');
    console.log('Query:', xQuery);
    
    const xResponse = await fetch(`https://serpapi.com/search?q=${encodeURIComponent(xQuery)}&api_key=${apiKey}&engine=google&num=5`);
    const xData = await xResponse.json();
    
    if (xData.organic_results && xData.organic_results.length > 0) {
      console.log('X/Twitter results found:');
      xData.organic_results.slice(0, 3).forEach(result => {
        console.log(`  - ${result.title}`);
        console.log(`    ${result.link}`);
      });
    } else {
      console.log('No X/Twitter results - likely available');
    }
    
    // Test Instagram
    const igQuery = `site:instagram.com/${testName} "${testName}"`;
    console.log('\nSearching Instagram...');
    console.log('Query:', igQuery);
    
    const igResponse = await fetch(`https://serpapi.com/search?q=${encodeURIComponent(igQuery)}&api_key=${apiKey}&engine=google&num=5`);
    const igData = await igResponse.json();
    
    if (igData.organic_results && igData.organic_results.length > 0) {
      console.log('Instagram results found:');
      igData.organic_results.slice(0, 3).forEach(result => {
        console.log(`  - ${result.title}`);
        console.log(`    ${result.link}`);
      });
    } else {
      console.log('No Instagram results - likely available');
    }
    
    // Test TikTok
    const ttQuery = `site:tiktok.com/@${testName} OR "@${testName}" tiktok`;
    console.log('\nSearching TikTok...');
    console.log('Query:', ttQuery);
    
    const ttResponse = await fetch(`https://serpapi.com/search?q=${encodeURIComponent(ttQuery)}&api_key=${apiKey}&engine=google&num=5`);
    const ttData = await ttResponse.json();
    
    if (ttData.organic_results && ttData.organic_results.length > 0) {
      console.log('TikTok results found:');
      ttData.organic_results.slice(0, 3).forEach(result => {
        console.log(`  - ${result.title}`);
        console.log(`    ${result.link}`);
      });
    } else {
      console.log('No TikTok results - likely available');
    }
    
    console.log('\n✅ SerpAPI social checking is working!');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

testSerpAPISocial();
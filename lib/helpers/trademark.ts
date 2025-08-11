import { searchUSPTO } from '@/lib/services/serpapi';

export async function checkTrademark(name: string) {
  try {
    // Clean the name for better search results
    const cleanName = name.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
    
    // Use SerpAPI if available
    if (process.env.SERPAPI_KEY) {
      const result = await searchUSPTO(cleanName);
      return {
        status: result.status,
        serial: result.serial || null,
        classes: result.classes
      };
    }
    
    // Fallback: Check multiple sources
    // Note: Direct web scraping often gets blocked, so this is a basic fallback
    // For production, you should use the USPTO API or a trademark service
    console.log(`Trademark check for "${cleanName}" - SerpAPI not configured, using fallback`);
    
    // Known major trademarks (basic check for common brands)
    const majorBrands = [
      'apple', 'google', 'microsoft', 'amazon', 'facebook', 'meta',
      'twitter', 'x', 'tesla', 'netflix', 'spotify', 'adobe',
      'oracle', 'ibm', 'intel', 'nvidia', 'samsung', 'sony',
      'nike', 'adidas', 'coca cola', 'pepsi', 'mcdonalds', 'starbucks',
      'walmart', 'target', 'disney', 'uber', 'airbnb', 'paypal'
    ];
    
    // Check if it's a known major brand
    if (majorBrands.some(brand => cleanName.includes(brand))) {
      return { 
        status: "live", 
        serial: null,
        note: "Known major brand - trademark likely exists"
      };
    }
    
    // For unknown brands, we can't reliably determine without API access
    return { 
      status: "none", 
      serial: null,
      note: "Unable to verify - consider manual USPTO search"
    };
  } catch (error) {
    console.error("Trademark search error:", error);
    return { 
      status: "none", 
      serial: null,
      error: "Search failed"
    };
  }
}
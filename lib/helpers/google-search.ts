interface GoogleSearchResult {
  title: string;
  link: string;
  snippet: string;
  displayLink: string;
}

export async function searchGoogle(query: string): Promise<GoogleSearchResult[]> {
  try {
    // Option 1: Google Custom Search JSON API (Recommended - requires API key)
    if (process.env.GOOGLE_SEARCH_API_KEY && process.env.GOOGLE_CSE_ID) {
      const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
      const cx = process.env.GOOGLE_CSE_ID; // Custom Search Engine ID
      
      const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&key=${apiKey}&cx=${cx}&num=10`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Google API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      return (data.items || []).slice(0, 10).map((item: any) => ({
        title: item.title || "",
        link: item.link || "",
        snippet: item.snippet || "",
        displayLink: item.displayLink || item.link?.replace(/^https?:\/\//, '').split('/')[0] || ""
      }));
    }
    
    // Option 2: SerpAPI (Alternative - requires different API key)
    if (process.env.SERPAPI_KEY) {
      const url = `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&api_key=${process.env.SERPAPI_KEY}&num=10`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`SerpAPI error: ${response.status}`);
      }
      
      const data = await response.json();
      
      return (data.organic_results || []).slice(0, 10).map((item: any) => ({
        title: item.title || "",
        link: item.link || "",
        snippet: item.snippet || "",
        displayLink: item.displayed_link || item.link?.replace(/^https?:\/\//, '').split('/')[0] || ""
      }));
    }
    
    // Option 3: Fallback - Mock data for demo
    console.log("No Google API configured, returning mock results");
    return generateMockResults(query);
    
  } catch (error) {
    console.error("Google search error:", error);
    return generateMockResults(query);
  }
}

function generateMockResults(query: string): GoogleSearchResult[] {
  // Generate realistic mock results based on the query
  const commonDomains = [
    { domain: "wikipedia.org", da: "high" },
    { domain: "amazon.com", da: "high" },
    { domain: "youtube.com", da: "high" },
    { domain: "facebook.com", da: "high" },
    { domain: "twitter.com", da: "high" },
    { domain: "linkedin.com", da: "high" },
    { domain: "medium.com", da: "high" },
    { domain: "reddit.com", da: "high" },
    { domain: "github.com", da: "high" },
    { domain: "stackoverflow.com", da: "high" }
  ];
  
  const results: GoogleSearchResult[] = [];
  
  // Always include a Wikipedia result if it's a common word
  if (query.length > 3) {
    results.push({
      title: `${query.charAt(0).toUpperCase() + query.slice(1)} - Wikipedia`,
      link: `https://en.wikipedia.org/wiki/${query}`,
      snippet: `${query} may refer to several things. This disambiguation page lists articles associated with the title ${query}.`,
      displayLink: "en.wikipedia.org"
    });
  }
  
  // Add some variety
  const templates = [
    {
      title: `${query} | Definition & Meaning`,
      link: `https://www.dictionary.com/browse/${query}`,
      snippet: `The meaning of ${query} is... See the full definition and examples.`,
      displayLink: "dictionary.com"
    },
    {
      title: `Best ${query} Products - Shop Now`,
      link: `https://www.amazon.com/s?k=${query}`,
      snippet: `Find the best ${query} products. Free shipping on qualified orders. Shop our selection...`,
      displayLink: "amazon.com"
    },
    {
      title: `${query} News and Updates`,
      link: `https://www.techcrunch.com/tag/${query}`,
      snippet: `Latest news about ${query}. Stay updated with the most recent developments...`,
      displayLink: "techcrunch.com"
    },
    {
      title: `How to ${query} - Complete Guide`,
      link: `https://www.wikihow.com/${query}`,
      snippet: `Learn how to ${query} with our step-by-step guide. Easy instructions and tips...`,
      displayLink: "wikihow.com"
    },
    {
      title: `${query} Reviews & Ratings`,
      link: `https://www.trustpilot.com/review/${query}.com`,
      snippet: `Read customer reviews of ${query}. See what others are saying about their experience...`,
      displayLink: "trustpilot.com"
    }
  ];
  
  // Randomly select 2-3 more results
  const selectedTemplates = templates
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.min(3, Math.floor(Math.random() * 3) + 2));
  
  results.push(...selectedTemplates);
  
  return results.slice(0, 5);
}
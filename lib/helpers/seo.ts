import OpenAI from "openai";
import { searchGoogle } from "./google-search";

// Domain authority mapping based on common high-authority sites
const HIGH_DA_DOMAINS = [
  'google.com', 'youtube.com', 'facebook.com', 'wikipedia.org', 'twitter.com', 
  'amazon.com', 'linkedin.com', 'instagram.com', 'apple.com', 'microsoft.com',
  'github.com', 'reddit.com', 'netflix.com', 'stackoverflow.com', 'medium.com',
  'nytimes.com', 'cnn.com', 'bbc.com', 'forbes.com', 'bloomberg.com'
];

const MEDIUM_DA_DOMAINS = [
  'shopify.com', 'wordpress.com', 'etsy.com', 'yelp.com', 'tripadvisor.com',
  'quora.com', 'pinterest.com', 'tumblr.com', 'soundcloud.com', 'vimeo.com',
  'behance.net', 'dribbble.com', 'producthunt.com', 'techcrunch.com'
];

function estimateDomainAuthority(domain: string): "high" | "med" | "low" {
  const cleanDomain = domain.toLowerCase().replace('www.', '');
  
  if (HIGH_DA_DOMAINS.some(d => cleanDomain.includes(d))) return "high";
  if (MEDIUM_DA_DOMAINS.some(d => cleanDomain.includes(d))) return "med";
  
  // Check for government and educational sites
  if (cleanDomain.endsWith('.gov') || cleanDomain.endsWith('.edu')) return "high";
  if (cleanDomain.endsWith('.org')) return "med";
  
  return "low";
}

export async function seoSummary(name: string) {
  try {
    // First, get real Google search results
    const googleResults = await searchGoogle(name);
    
    if (googleResults.length === 0) {
      return [
        { title: "No search results found", root: "-", da: "low" },
        { title: "-", root: "-", da: "low" },
        { title: "-", root: "-", da: "low" }
      ];
    }
    
    // If we have OpenAI API, use o3-mini to analyze the results
    if (process.env.OPENAI_API_KEY) {
      const openai = new OpenAI({ 
        apiKey: process.env.OPENAI_API_KEY 
      });
      
      // Prepare the search results for analysis
      const resultsText = googleResults.slice(0, 5).map((r, i) => 
        `${i + 1}. ${r.title} - ${r.displayLink}\nSnippet: ${r.snippet}`
      ).join('\n\n');
      
      const prompt = `Analyze these actual Google search results for "${name}" and identify the TOP 3 most relevant competing results that would matter for someone trying to build a brand with this name.

Actual Google Results:
${resultsText}

Based on these real results, select and format the 3 most important ones for brand competition analysis.
Consider: direct competitors, Wikipedia entries, major brands, trademark holders.

Format your response EXACTLY as 3 lines:
[Page Title] – [root-domain] – [da: high|med|low]

Return ONLY the 3 lines, no other text.`;
      
      const chat = await openai.chat.completions.create({
        model: "o3-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 150,
        temperature: 0.3
      });
      
      const response = chat.choices[0].message.content?.trim() || "";
      const lines = response.split('\n').filter(line => line.trim());
      
      const results = lines.slice(0, 3).map(line => {
        const parts = line.split(' – ');
        if (parts.length >= 3) {
          const daMatch = parts[2]?.match(/da:\s*(high|med|low)/i);
          return {
            title: parts[0]?.trim() || "Unknown",
            root: parts[1]?.trim() || "unknown.com",
            da: (daMatch?.[1]?.toLowerCase() || "low") as "high" | "med" | "low"
          };
        }
        // Fallback parsing
        return {
          title: line.substring(0, 50),
          root: "unknown.com", 
          da: "low" as const
        };
      });
      
      // If we didn't get 3 results from o3-mini, fill in with actual Google results
      while (results.length < 3 && googleResults.length > results.length) {
        const googleResult = googleResults[results.length];
        results.push({
          title: googleResult.title.substring(0, 60),
          root: googleResult.displayLink,
          da: estimateDomainAuthority(googleResult.displayLink)
        });
      }
      
      return results;
    }
    
    // Fallback: Use raw Google results without o3-mini analysis
    return googleResults.slice(0, 3).map(r => ({
      title: r.title.substring(0, 60),
      root: r.displayLink,
      da: estimateDomainAuthority(r.displayLink)
    }));
    
  } catch (error) {
    console.error("SEO summary error:", error);
    return [
      { title: "SEO analysis unavailable", root: "-", da: "low" },
      { title: "-", root: "-", da: "low" },
      { title: "-", root: "-", da: "low" }
    ];
  }
}
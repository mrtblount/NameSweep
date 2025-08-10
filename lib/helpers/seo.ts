import { searchSERP } from '@/lib/services/serpapi';

export async function seoSummary(name: string) {
  try {
    // Use SerpAPI if available
    if (process.env.SERPAPI_KEY) {
      const results = await searchSERP(name);
      
      if (results.length === 0) {
        return [
          { title: "No search results found", root: "-", da: "low" },
          { title: "-", root: "-", da: "low" },
          { title: "-", root: "-", da: "low" }
        ];
      }
      
      // Ensure we always return exactly 3 results
      const formattedResults = results.map(r => ({
        title: r.title.substring(0, 60),
        root: r.domain,
        da: r.authority
      }));
      
      // Pad with empty results if needed
      while (formattedResults.length < 3) {
        formattedResults.push({ title: "-", root: "-", da: "low" as const });
      }
      
      return formattedResults.slice(0, 3);
    }
    
    // Fallback if no API configured
    return [
      { title: "SEO analysis unavailable", root: "-", da: "low" },
      { title: "-", root: "-", da: "low" },
      { title: "-", root: "-", da: "low" }
    ];
    
  } catch (error) {
    console.error("SEO summary error:", error);
    return [
      { title: "SEO analysis unavailable", root: "-", da: "low" },
      { title: "-", root: "-", da: "low" },
      { title: "-", root: "-", da: "low" }
    ];
  }
}
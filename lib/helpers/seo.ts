import OpenAI from "openai";

export async function seoSummary(name: string) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return [
        { title: "SEO analysis requires API key", root: "-", da: "low" },
        { title: "-", root: "-", da: "low" },
        { title: "-", root: "-", da: "low" }
      ];
    }
    
    const openai = new OpenAI({ 
      apiKey: process.env.OPENAI_API_KEY 
    });
    
    const prompt = `You are analyzing potential SEO competition for the brand name "${name}". 
Based on typical search results patterns, generate 3 realistic hypothetical search results that would likely appear for this term.

Format your response EXACTLY as 3 lines:
[Page Title] – [root-domain.com] – [da: high|med|low]

Consider:
- Common businesses or entities with similar names
- Wikipedia entries if it's a common word
- Major e-commerce sites if it's a product-like name
- Domain authority (da) based on site popularity

Example for "Apple":
Apple Inc. - Official Site – apple.com – da: high
Apple - Wikipedia – wikipedia.org – da: high  
Apple Products - Best Buy – bestbuy.com – da: high

Now generate 3 results for "${name}". Return ONLY 3 lines, no other text.`;
    
    const chat = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 150,
      temperature: 0.7
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
      return {
        title: line.substring(0, 50),
        root: "unknown.com", 
        da: "low" as const
      };
    });
    
    while (results.length < 3) {
      results.push({
        title: "-",
        root: "-",
        da: "low"
      });
    }
    
    return results;
  } catch (error) {
    console.error("SEO summary error:", error);
    return [
      { title: "No competing results found", root: "-", da: "low" },
      { title: "-", root: "-", da: "low" },
      { title: "-", root: "-", da: "low" }
    ];
  }
}
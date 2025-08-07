import OpenAI from "openai";

interface AvailabilityContext {
  domains: Record<string, string>;
  socials: {
    x: { status: string };
    instagram: { status: string };
    youtube: { status: string };
  };
  tm: { status: string };
  premium: boolean;
}

export async function generateRecommendations(
  name: string,
  availability: AvailabilityContext
): Promise<{ names: string[], analysis: string }> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return {
        names: [],
        analysis: "Recommendations require OpenAI API key"
      };
    }

    const openai = new OpenAI({ 
      apiKey: process.env.OPENAI_API_KEY 
    });

    // Build context about what's available/taken
    const domainStatus = Object.entries(availability.domains)
      .map(([tld, status]) => `${tld}: ${status}`)
      .join(", ");
    
    const socialStatus = `X: ${availability.socials.x.status}, Instagram: ${availability.socials.instagram.status}, YouTube: ${availability.socials.youtube.status}`;
    
    const tmStatus = availability.tm.status === "live" ? "has active trademark" : 
                      availability.tm.status === "dead" ? "has dead trademark" : 
                      "no trademark found";

    const prompt = `You are a brand naming expert. The user searched for "${name}".

Current availability:
- Domains: ${domainStatus}
- Social Media: ${socialStatus}
- Trademark: ${tmStatus}
- Premium domain warning: ${availability.premium ? "Yes" : "No"}

Based on this availability, provide:
1. A brief recommendation (1-2 sentences max)
2. Exactly 5 alternative brand names that are variations or related concepts

Rules for alternatives:
- Keep them related to the original concept
- Make them brandable and memorable
- Vary the approaches (add suffix, prefix, synonym, creative spelling, compound)
- Keep them short (under 15 characters)
- Avoid generic terms

Format your response EXACTLY as:
RECOMMENDATION: [Your 1-2 sentence recommendation]
ALTERNATIVES: name1, name2, name3, name4, name5

Example:
RECOMMENDATION: The .com domain is taken but other TLDs are available. Consider these creative alternatives that may have better availability.
ALTERNATIVES: ${name}Hub, ${name}Labs, Get${name}, ${name}ify, ${name}Co`;

    const chat = await openai.chat.completions.create({
      model: "o3-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 200,
      temperature: 0.8
    });

    const response = chat.choices[0].message.content?.trim() || "";
    
    // Parse the response
    const recMatch = response.match(/RECOMMENDATION:\s*([^\n]+)/);
    const altMatch = response.match(/ALTERNATIVES:\s*(.+)/);
    
    const recommendation = recMatch?.[1]?.trim() || generateDefaultRecommendation(availability);
    const alternativesStr = altMatch?.[1]?.trim() || "";
    
    // Parse alternatives
    const alternatives = alternativesStr
      .split(/[,;]/)
      .map(n => n.trim())
      .filter(n => n && n.length > 0 && n.length < 20)
      .slice(0, 5);
    
    // If we don't have 5 alternatives, generate some defaults
    while (alternatives.length < 5) {
      const suffixes = ['Hub', 'Labs', 'Co', 'ify', 'ly', 'io', 'HQ', 'Plus', 'Pro'];
      const prefixes = ['Get', 'Try', 'Use', 'My', 'The'];
      
      if (alternatives.length % 2 === 0) {
        alternatives.push(`${name}${suffixes[alternatives.length]}`);
      } else {
        alternatives.push(`${prefixes[alternatives.length]}${name}`);
      }
    }

    return {
      names: alternatives,
      analysis: recommendation
    };
  } catch (error) {
    console.error("Recommendations error:", error);
    return {
      names: generateDefaultAlternatives(name),
      analysis: generateDefaultRecommendation(availability)
    };
  }
}

function generateDefaultRecommendation(availability: AvailabilityContext): string {
  if (availability.domains[".com"] === "✅" && availability.tm.status === "none") {
    return "Excellent choice! The .com domain is available and no conflicting trademarks found.";
  } else if (availability.domains[".com"] === "⚠️") {
    return "The .com domain is premium (expensive). Consider alternative TLDs or variations.";
  } else if (availability.tm.status === "live") {
    return "Warning: Active trademark exists. Consider a different name to avoid legal issues.";
  } else {
    return "Mixed availability. Review the results and consider alternative options below.";
  }
}

function generateDefaultAlternatives(name: string): string[] {
  return [
    `${name}Hub`,
    `${name}Labs`,
    `Get${name}`,
    `${name}Co`,
    `${name}Pro`
  ];
}
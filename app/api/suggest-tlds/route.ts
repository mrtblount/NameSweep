import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { checkDomainAvailability } from "@/lib/services/porkbun";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// List of all available TLDs to choose from
const AVAILABLE_TLDS = [
  '.org', '.ai', '.app', '.dev', '.gg', '.me', '.xyz', '.store', '.shop', '.online',
  '.tech', '.digital', '.cloud', '.software', '.solutions', '.services', '.consulting',
  '.agency', '.studio', '.design', '.art', '.creative', '.media', '.marketing',
  '.finance', '.capital', '.ventures', '.fund', '.investments', '.money',
  '.health', '.fitness', '.life', '.bio', '.care', '.clinic',
  '.education', '.academy', '.school', '.training', '.coach', '.guru',
  '.games', '.play', '.fun', '.party', '.social', '.community',
  '.travel', '.tours', '.vacation', '.hotel', '.flights',
  '.food', '.restaurant', '.cafe', '.kitchen', '.recipes',
  '.fashion', '.style', '.boutique', '.clothing', '.jewelry',
  '.realty', '.properties', '.homes', '.estate', '.land',
  '.legal', '.law', '.attorney', '.tax', '.accountant',
  '.blog', '.news', '.press', '.report', '.reviews',
  '.tools', '.systems', '.network', '.host', '.codes',
  '.biz', '.pro', '.work', '.jobs', '.careers',
  '.global', '.world', '.earth', '.space', '.zone',
  '.team', '.company', '.business', '.enterprises', '.holdings',
  '.ltd', '.llc', '.inc', '.corp', '.group',
  '.info', '.site', '.website', '.page', '.link',
  '.tv', '.fm', '.live', '.stream', '.video'
];

export async function POST(req: NextRequest) {
  try {
    const { domainName, currentResults } = await req.json();
    
    if (!domainName) {
      return NextResponse.json({ error: "Domain name required" }, { status: 400 });
    }

    // Get the TLDs we already checked
    const alreadyChecked = Object.keys(currentResults || {});
    
    // Use OpenAI to determine the business category and suggest relevant TLDs
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a domain name expert. Based on the domain name provided, determine what category of business or purpose it likely represents, then suggest the 10 most relevant TLD extensions that would be perfect for this domain.

Available TLDs to choose from:
${AVAILABLE_TLDS.join(', ')}

Already checked (don't suggest these): ${alreadyChecked.join(', ')}

Rules:
1. Analyze the domain name to understand the business category
2. Select exactly 10 TLDs that best match the category
3. Prioritize TLDs that are memorable and relevant
4. Consider industry-specific TLDs when appropriate
5. Mix popular and niche TLDs for variety

Return ONLY a JSON object with this exact format:
{
  "category": "brief description of what this domain is likely for",
  "suggestedTlds": [".tld1", ".tld2", ".tld3", ".tld4", ".tld5", ".tld6", ".tld7", ".tld8", ".tld9", ".tld10"]
}`
        },
        {
          role: "user",
          content: `Domain name: ${domainName}`
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const aiResponse = completion.choices[0].message.content;
    
    let suggestions;
    try {
      suggestions = JSON.parse(aiResponse || '{}');
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResponse);
      // Fallback to some default TLDs if AI fails
      suggestions = {
        category: "general purpose",
        suggestedTlds: ['.org', '.ai', '.app', '.dev', '.tech', '.digital', '.online', '.pro', '.biz', '.xyz']
      };
    }

    // Now check availability for each suggested TLD
    const tldResults: Record<string, any> = {};
    
    // Check all TLDs in parallel for speed
    const checkPromises = suggestions.suggestedTlds.map(async (tld: string) => {
      try {
        const domain = `${domainName}${tld}`;
        const result = await checkDomainAvailability(domain);
        
        return {
          tld,
          result: {
            status: result.status,
            displayText: result.displayText || (result.available ? 'available' : 'taken'),
            url: result.liveUrl
          }
        };
      } catch (error) {
        console.error(`Failed to check ${domainName}${tld}:`, error);
        return {
          tld,
          result: {
            status: '❓',
            displayText: 'unable to verify'
          }
        };
      }
    });

    const results = await Promise.all(checkPromises);
    
    // Convert array results back to object format
    results.forEach(({ tld, result }) => {
      tldResults[tld] = result;
    });

    return NextResponse.json({
      category: suggestions.category,
      suggestedTlds: tldResults
    });

  } catch (error) {
    console.error('TLD suggestion error:', error);
    return NextResponse.json(
      { error: "Failed to suggest TLDs" },
      { status: 500 }
    );
  }
}
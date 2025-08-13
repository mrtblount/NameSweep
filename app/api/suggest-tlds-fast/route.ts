import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Pre-selected TLDs by category for instant suggestions
const CATEGORY_TLDS = {
  tech: ['.tech', '.dev', '.app', '.digital', '.cloud', '.software', '.ai', '.solutions', '.systems', '.codes'],
  business: ['.biz', '.company', '.ventures', '.capital', '.consulting', '.agency', '.pro', '.services', '.solutions', '.enterprises'],
  creative: ['.studio', '.design', '.art', '.creative', '.media', '.digital', '.agency', '.marketing', '.productions', '.works'],
  health: ['.health', '.fitness', '.life', '.care', '.clinic', '.bio', '.medical', '.wellness', '.healthcare', '.pharmacy'],
  education: ['.education', '.academy', '.school', '.training', '.coach', '.guru', '.institute', '.university', '.courses', '.learning'],
  finance: ['.finance', '.capital', '.fund', '.investments', '.money', '.cash', '.credit', '.loans', '.trading', '.markets'],
  food: ['.food', '.restaurant', '.cafe', '.kitchen', '.recipes', '.eat', '.dining', '.menu', '.delivery', '.catering'],
  retail: ['.store', '.shop', '.shopping', '.boutique', '.market', '.deals', '.sale', '.buy', '.fashion', '.style'],
  social: ['.social', '.community', '.network', '.chat', '.forum', '.club', '.group', '.team', '.connect', '.meet'],
  gaming: ['.games', '.play', '.fun', '.game', '.gaming', '.esports', '.quest', '.arcade', '.zone', '.world'],
  travel: ['.travel', '.tours', '.vacation', '.flights', '.hotel', '.voyage', '.trip', '.journey', '.adventures', '.destinations'],
  general: ['.online', '.site', '.website', '.world', '.global', '.info', '.org', '.xyz', '.me', '.link']
};

// Quick category detection based on keywords
function quickCategorize(domainName: string): string {
  const lower = domainName.toLowerCase();
  
  if (/tech|code|dev|soft|app|digital|cyber|data|cloud/.test(lower)) return 'tech';
  if (/fit|health|med|care|well|gym|diet|nutrition/.test(lower)) return 'health';
  if (/edu|learn|teach|school|academy|train|course/.test(lower)) return 'education';
  if (/money|finance|invest|capital|fund|bank|trade|crypto/.test(lower)) return 'finance';
  if (/food|eat|restaurant|cafe|kitchen|cook|recipe|dining/.test(lower)) return 'food';
  if (/shop|store|buy|sell|market|retail|fashion|style/.test(lower)) return 'retail';
  if (/social|community|connect|chat|meet|network|friend/.test(lower)) return 'social';
  if (/game|play|fun|sport|esport|arcade|quest/.test(lower)) return 'gaming';
  if (/travel|tour|trip|vacation|hotel|flight|adventure/.test(lower)) return 'travel';
  if (/art|design|creative|studio|media|photo|video|music/.test(lower)) return 'creative';
  if (/business|consult|agency|service|solution|venture|company/.test(lower)) return 'business';
  
  return 'general';
}

// Ultra-fast domain checking with minimal overhead
async function checkDomainsFast(domainName: string, tlds: string[]): Promise<Record<string, any>> {
  const apiKey = process.env.WHOISXML_API_KEY;
  
  if (!apiKey) {
    throw new Error('WhoisXMLAPI key not configured');
  }

  // Create batch of fetch promises for Domain Availability API only (faster than WHOIS)
  const checkPromises = tlds.map(async (tld) => {
    const domain = `${domainName}${tld}`;
    
    try {
      // Direct API call without the overhead of the full checkWhoisXMLAPI function
      const response = await Promise.race([
        fetch(`https://domain-availability.whoisxmlapi.com/api/v1?apiKey=${apiKey}&domainName=${domain}&outputFormat=JSON`, {
          signal: AbortSignal.timeout(500) // 500ms timeout per domain
        }),
        new Promise<Response>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 500))
      ]);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const availability = data.DomainInfo?.domainAvailability;
      
      return {
        tld,
        result: {
          status: availability === 'AVAILABLE' ? '✅' : '❌',
          displayText: availability === 'AVAILABLE' ? 'available' : 'taken'
        }
      };
    } catch (error) {
      // Quick fallback - assume taken if we can't check
      return {
        tld,
        result: {
          status: '❓',
          displayText: 'unable to check'
        }
      };
    }
  });

  // Execute all checks in parallel
  const results = await Promise.allSettled(checkPromises);
  
  const tldResults: Record<string, any> = {};
  results.forEach((result) => {
    if (result.status === 'fulfilled' && result.value) {
      const { tld, result: domainResult } = result.value;
      tldResults[tld] = domainResult;
    }
  });
  
  return tldResults;
}

export async function POST(req: NextRequest) {
  try {
    const { domainName, currentResults } = await req.json();
    
    if (!domainName) {
      return NextResponse.json({ error: "Domain name required" }, { status: 400 });
    }

    // Get already checked TLDs
    const alreadyChecked = Object.keys(currentResults || {});
    
    // Quick categorization for instant TLD suggestions
    const category = quickCategorize(domainName);
    const suggestedTlds = CATEGORY_TLDS[category as keyof typeof CATEGORY_TLDS] || CATEGORY_TLDS.general;
    
    // Filter out already checked TLDs - limit to 8 for speed
    const tldsToCheck = suggestedTlds.filter(tld => !alreadyChecked.includes(tld)).slice(0, 8);
    
    // Start checking domains immediately (don't wait for AI)
    const domainCheckPromise = checkDomainsFast(domainName, tldsToCheck);
    
    // Start AI categorization in parallel (but don't wait for it)
    const aiPromise = openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Briefly categorize this domain name in 10 words or less. Just return the category description, nothing else.`
        },
        {
          role: "user",
          content: domainName
        }
      ],
      temperature: 0.3,
      max_tokens: 50,
    }).catch(() => ({ choices: [{ message: { content: `${category} domain` } }] }));

    // Wait for domain checks (should be fast with parallel execution)
    const tldResults = await domainCheckPromise;
    
    // Get AI category if available (but don't wait long)
    const aiResponse = await Promise.race([
      aiPromise,
      new Promise<any>(resolve => setTimeout(() => resolve({ choices: [{ message: { content: `${category} domain` } }] }), 500))
    ]);
    
    const aiCategory = (aiResponse as any)?.choices?.[0]?.message?.content || `${category} domain`;

    return NextResponse.json({
      category: aiCategory,
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
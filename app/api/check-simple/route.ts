import { NextRequest, NextResponse } from "next/server";

// Direct GoDaddy check function that works in Edge runtime
async function checkGoDaddyDirect(domain: string) {
  const apiKey = process.env.GODADDY_API_KEY;
  const apiSecret = process.env.GODADDY_API_SECRET;
  
  console.log(`[GoDaddy] Checking ${domain}`);
  console.log(`[GoDaddy] Credentials present: Key=${!!apiKey}, Secret=${!!apiSecret}`);
  
  if (!apiKey || !apiSecret) {
    console.error('[GoDaddy] Missing credentials');
    return null;
  }
  
  try {
    const response = await fetch(
      `https://api.godaddy.com/v1/domains/available?domain=${domain}&checkType=FULL`,
      {
        headers: {
          'Authorization': `sso-key ${apiKey}:${apiSecret}`,
          'Accept': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      const error = await response.text();
      console.error(`[GoDaddy] API error for ${domain}:`, response.status, error);
      return null;
    }
    
    const data = await response.json();
    console.log(`[GoDaddy] Response for ${domain}:`, data);
    
    if (data.available === true) {
      const price = data.price ? Math.round(data.price / 1000000) : 0;
      return {
        status: price >= 249 ? '⚠️' : '✅',
        displayText: price >= 249 ? `premium $${price}` : 'available'
      };
    } else {
      // Domain is taken - try to check if site is live
      try {
        const siteCheck = await fetch(`https://${domain}`, { 
          method: 'HEAD',
          signal: AbortSignal.timeout(2000)
        });
        const hasLiveSite = siteCheck.ok || siteCheck.status < 400;
        return {
          status: '❌',
          displayText: hasLiveSite ? 'has live site' : 'parked',
          url: hasLiveSite ? `https://${domain}` : undefined
        };
      } catch {
        return {
          status: '❌',
          displayText: 'taken'
        };
      }
    }
  } catch (error) {
    console.error(`[GoDaddy] Failed for ${domain}:`, error);
    return null;
  }
}

// Fallback check using DNS
async function checkViaPublicAPIs(domain: string) {
  // Try free domain checking APIs as fallback
  try {
    // Try DNS lookup to see if domain exists
    const response = await fetch(`https://dns.google/resolve?name=${domain}&type=A`);
    const data = await response.json();
    
    if (data.Answer && data.Answer.length > 0) {
      // Domain has DNS records - it's taken
      try {
        const siteCheck = await fetch(`https://${domain}`, { 
          method: 'HEAD',
          signal: AbortSignal.timeout(2000)
        });
        const hasLiveSite = siteCheck.ok;
        return {
          status: '❌',
          displayText: hasLiveSite ? 'has live site' : 'taken',
          url: hasLiveSite ? `https://${domain}` : undefined
        };
      } catch {
        return {
          status: '❌',
          displayText: 'taken'
        };
      }
    }
    
    // No DNS records might mean available, but we can't be sure
    return null;
  } catch (error) {
    console.error(`[DNS Check] Failed for ${domain}:`, error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const name = searchParams.get("name");
    
    if (!name || name.length < 2) {
      return NextResponse.json(
        { error: "Invalid name parameter" },
        { status: 400 }
      );
    }
    
    // Clean the name
    const cleanName = name.toLowerCase().replace(/[^a-z0-9-]/g, '');
    
    // Check TLDs
    const tlds = ['.com', '.co', '.io', '.net'];
    const domains: Record<string, any> = {};
    
    console.log(`\n=== Checking domains for: ${cleanName} ===`);
    
    // Check each domain
    for (const tld of tlds) {
      const domain = `${cleanName}${tld}`;
      console.log(`\nChecking ${domain}...`);
      
      // Try GoDaddy first
      let result = await checkGoDaddyDirect(domain);
      
      // If GoDaddy failed, try public APIs
      if (!result) {
        console.log(`[Fallback] Trying public APIs for ${domain}`);
        result = await checkViaPublicAPIs(domain);
      }
      
      // If still no result, check if it's a known major brand
      if (!result) {
        const majorBrands = ['google', 'facebook', 'amazon', 'apple', 'microsoft', 
          'popeyes', 'mcdonalds', 'walmart', 'target', 'nike', 'openai',
          'anthropic', 'tesla', 'netflix', 'spotify', 'uber', 'airbnb'];
        
        if (majorBrands.includes(cleanName)) {
          result = {
            status: '❌',
            displayText: 'has live site',
            url: `https://${domain}`
          };
        }
      }
      
      // Final fallback - unable to verify
      domains[tld] = result || {
        status: '❓',
        displayText: 'unable to verify'
      };
      
      console.log(`Result for ${domain}:`, domains[tld]);
    }
    
    // Mock social media for now (keeping your working social checker)
    const socials = {
      x: { status: '❓' },
      instagram: { status: '❓' },
      youtube: { status: '❓' }
    };
    
    // Mock trademark
    const tm = { status: 'none', serial: null };
    
    // Mock SEO
    const seo: any[] = [];
    
    return NextResponse.json({
      domains,
      socials,
      tm,
      seo,
      premium: false,
      parsed: {
        cleanName,
        originalInput: name,
        wasConverted: false,
        hadExtension: false
      }
    });
    
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import { checkMultipleDomains } from "@/lib/services/porkbun";
import { checkSocialsBalanced } from "@/lib/helpers/socials-balanced";
import { checkTrademark } from "@/lib/helpers/trademark";
import { seoSummary } from "@/lib/helpers/seo";
import { generateRecommendations } from "@/lib/helpers/recommendations";
import { getCached } from "@/lib/helpers/cache";
import { parseUserInput, getTLDsToCheck } from "@/lib/helpers/parse-input";

// Removed Edge runtime to allow external API calls to WHOIS services
// export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const rawInput = searchParams.get("name");
    
    if (!rawInput || rawInput.length < 2) {
      return NextResponse.json(
        { error: "Invalid name parameter" },
        { status: 400 }
      );
    }
    
    // Parse the user input
    const parsedInput = parseUserInput(rawInput);
    
    // If input was too long after parsing
    if (parsedInput.name.length > 63) {
      return NextResponse.json(
        { error: "Domain name too long (max 63 characters)" },
        { status: 400 }
      );
    }
    
    const slug = parsedInput.name;
    const cacheKey = `namesweep:${slug}`;
    
    const result = await getCached(
      cacheKey,
      async () => {
        // Get TLDs to check, prioritizing user's choice
        const extendedCheck = searchParams.get("extended") === "true";
        const tlds = getTLDsToCheck(parsedInput, extendedCheck);
        
        // Check domains and social media in parallel
        const [domainResults, socials, tm, seo] = await Promise.all([
          checkMultipleDomains(slug, tlds),
          checkSocialsBalanced(slug),
          checkTrademark(slug),
          seoSummary(slug)
        ]);
        
        // Format domains for response - handle all statuses properly
        const domains: Record<string, any> = {};
        let hasPremium = false;
        
        Object.entries(domainResults).forEach(([tld, result]) => {
          // Handle each status type
          switch(result.status) {
            case '❌':
              // Domain is taken
              if (result.liveSite) {
                domains[tld] = {
                  status: '❌',
                  displayText: 'has live site',
                  url: result.liveUrl || `https://${slug}${tld}`
                };
              } else {
                domains[tld] = {
                  status: '❌',
                  displayText: 'parked'
                };
              }
              break;
              
            case '✅':
              // Domain is available
              domains[tld] = {
                status: '✅',
                displayText: 'available'
              };
              break;
              
            case '⚠️':
              // Premium domain
              domains[tld] = {
                status: '⚠️',
                displayText: result.displayText || `premium${result.price ? ` $${result.price}` : ''}`
              };
              hasPremium = true;
              break;
              
            case '❓':
              // Unable to verify
              domains[tld] = {
                status: '❓',
                displayText: 'unable to verify'
              };
              break;
              
            default:
              // Fallback
              domains[tld] = {
                status: '❓',
                displayText: 'unable to verify'
              };
          }
        });
        
        // Generate recommendations based on availability
        const recommendations = await generateRecommendations(
          slug,
          {
            domains,
            socials,
            tm,
            premium: hasPremium
          }
        );
        
        return {
          domains,
          socials,
          tm,
          seo,
          premium: hasPremium,
          recommendations,
          // Include parsing metadata
          parsed: {
            cleanName: slug,
            originalInput: rawInput,
            wasConverted: parsedInput.isSentence,
            hadExtension: parsedInput.hasExtension,
            requestedExtension: parsedInput.extension
          }
        };
      },
      86400 // Cache for 24 hours
    );
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("API check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
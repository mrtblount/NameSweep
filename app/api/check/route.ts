import { NextRequest, NextResponse } from "next/server";
import { checkMultipleDomains } from "@/lib/services/domain-checker";
import { checkSocialsBalanced } from "@/lib/helpers/socials-balanced";
import { checkTrademark } from "@/lib/helpers/trademark";
import { seoSummary } from "@/lib/helpers/seo";
import { generateRecommendations } from "@/lib/helpers/recommendations";
import { getCached } from "@/lib/helpers/cache";
import { parseUserInput, getTLDsToCheck } from "@/lib/helpers/parse-input";

export const runtime = "edge";

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
          checkMultipleDomains(slug, tlds), // Now uses accurate DNS checking
          checkSocialsBalanced(slug),
          checkTrademark(slug),
          seoSummary(slug)
        ]);
        
        // Format domains for response - extract just the status string
        const domains: Record<string, string> = {};
        let hasPremium = false;
        
        Object.entries(domainResults).forEach(([tld, result]) => {
          // Extract the status string and add display text if needed
          if (result.status === '✅') {
            domains[tld] = '✅';
          } else if (result.status === '⚠️') {
            domains[tld] = '⚠️';
            hasPremium = true;
          } else if (result.status === '❌') {
            // Include whether it's live or parked
            if (result.liveSite) {
              domains[tld] = '❌ live';
            } else {
              domains[tld] = '❌ parked';
            }
          } else {
            domains[tld] = result.status || '❓';
          }
          
          if (result.premium) hasPremium = true;
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
      86400
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
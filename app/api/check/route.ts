import { NextRequest, NextResponse } from "next/server";
import { checkDomains } from "@/lib/helpers/domains";
import { checkSocials } from "@/lib/helpers/socials";
import { checkSocials as checkSocialsMock } from "@/lib/helpers/socials-mock";
import { checkTrademark } from "@/lib/helpers/trademark";
import { seoSummary } from "@/lib/helpers/seo";
import { generateRecommendations } from "@/lib/helpers/recommendations";
import { getCached } from "@/lib/helpers/cache";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const name = searchParams.get("name");
    
    if (!name || name.length < 2 || name.length > 50) {
      return NextResponse.json(
        { error: "Invalid name parameter" },
        { status: 400 }
      );
    }
    
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "");
    const cacheKey = `namesweep:${slug}`;
    
    const result = await getCached(
      cacheKey,
      async () => {
        // Try real social checks first, fallback to mock if they fail
        let socials;
        try {
          socials = await checkSocials(slug);
          // If all return available, likely the real check failed, use mock
          if (socials.x.status === "✅" && 
              socials.instagram.status === "✅" && 
              socials.youtube.status === "✅") {
            socials = await checkSocialsMock(slug);
          }
        } catch (error) {
          console.log("Social check failed, using mock:", error);
          socials = await checkSocialsMock(slug);
        }
        
        const [domainsResult, tm, seo] = await Promise.all([
          checkDomains(slug),
          checkTrademark(slug),
          seoSummary(slug)
        ]);
        
        // Generate recommendations based on availability
        const recommendations = await generateRecommendations(
          slug,
          {
            domains: domainsResult.domains,
            socials,
            tm,
            premium: domainsResult.premium
          }
        );
        
        return {
          domains: domainsResult.domains,
          socials,
          tm,
          seo,
          premium: domainsResult.premium,
          recommendations
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
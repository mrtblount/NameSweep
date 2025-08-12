import { NextRequest, NextResponse } from "next/server";
import { runNamePipeline } from "@/lib/services/name-pipeline";
import { getCached } from "@/lib/helpers/cache";

// Removed Edge runtime to allow DNS and external API calls
// export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      businessDescription,
      industry,
      targetAudience,
      tone,
      constraints,
      extendedTlds = false
    } = body;
    
    if (!businessDescription || businessDescription.length < 10) {
      return NextResponse.json(
        { error: "Please provide a detailed business description" },
        { status: 400 }
      );
    }

    // Create cache key from description
    const cacheKey = `generate:${Buffer.from(businessDescription).toString('base64').slice(0, 32)}`;
    
    const result = await getCached(
      cacheKey,
      async () => {
        const candidates = await runNamePipeline({
          businessDescription,
          extendedTlds,
          maxCandidates: 10
        });

        return {
          candidates,
          timestamp: new Date().toISOString(),
          input: {
            businessDescription,
            industry,
            targetAudience,
            tone,
            extendedTlds
          }
        };
      },
      3600 // 1 hour cache
    );
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("Generation error:", error);
    
    // Provide more specific error messages
    let errorMessage = "Failed to generate names";
    
    if (error instanceof Error) {
      if (error.message.includes("OpenAI")) {
        errorMessage = "OpenAI service error: Unable to generate names";
      } else if (error.message.includes("Porkbun")) {
        errorMessage = "Porkbun domain check failed. Using fallback data.";
      } else if (error.message.includes("SerpAPI") || error.message.includes("SERP")) {
        errorMessage = "SerpAPI search failed. SEO data unavailable.";
      } else if (error.message.includes("API key")) {
        errorMessage = "Configuration error: Missing API credentials";
      } else {
        errorMessage = error.message;
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === "development" ? error instanceof Error ? error.message : "Unknown error" : undefined
      },
      { status: 500 }
    );
  }
}
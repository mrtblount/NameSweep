import { NextRequest, NextResponse } from "next/server";
import { runNamePipeline } from "@/lib/services/name-pipeline";
import { getCached } from "@/lib/helpers/cache";

export const runtime = "edge";

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
    return NextResponse.json(
      { error: "Failed to generate names" },
      { status: 500 }
    );
  }
}
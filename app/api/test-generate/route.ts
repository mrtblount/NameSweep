import { NextRequest, NextResponse } from "next/server";
import { generateNames } from "@/lib/services/openai-generator";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    console.log("Test generate endpoint called");
    console.log("OPENAI_API_KEY exists:", !!process.env.OPENAI_API_KEY);
    
    // Test OpenAI directly
    const testNames = await generateNames({
      businessDescription: "AI-powered project management tool for remote teams"
    });
    
    console.log("Generated names:", testNames);
    
    return NextResponse.json({
      success: true,
      apiKeyExists: !!process.env.OPENAI_API_KEY,
      apiKeyPrefix: process.env.OPENAI_API_KEY?.substring(0, 10) + "...",
      generatedCount: testNames.length,
      samples: testNames.slice(0, 3),
      fullResponse: testNames
    });
  } catch (error: any) {
    console.error("Test generation error:", error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
      apiKeyExists: !!process.env.OPENAI_API_KEY
    });
  }
}
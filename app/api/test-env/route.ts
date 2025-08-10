import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  return NextResponse.json({
    hasOpenAIKey: !!process.env.OPENAI_API_KEY,
    keyPrefix: process.env.OPENAI_API_KEY?.substring(0, 10),
    hasPorkbunKey: !!process.env.PORKBUN_API_KEY,
    hasSerpAPIKey: !!process.env.SERPAPI_KEY,
    nodeEnv: process.env.NODE_ENV,
    allEnvKeys: Object.keys(process.env).filter(k => !k.includes('SECRET') && !k.includes('KEY'))
  });
}
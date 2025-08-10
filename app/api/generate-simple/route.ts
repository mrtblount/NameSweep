import { NextRequest, NextResponse } from "next/server";
import { generateNames, scoreNameFit } from "@/lib/services/openai-generator";

export const runtime = "edge";

// Ensure all responses are JSON
function jsonResponse(data: any, status: number = 200) {
  return new NextResponse(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return jsonResponse(
        { error: "Invalid request format" },
        400
      );
    }
    
    const { businessDescription, extendedTlds = false } = body;
    
    if (!businessDescription || businessDescription.length < 10) {
      return jsonResponse(
        { error: "Please provide a detailed business description" },
        400
      );
    }

    console.log("Generating names for:", businessDescription);

    // Generate names using OpenAI
    const generatedNames = await generateNames({
      businessDescription
    });

    console.log(`Generated ${generatedNames.length} names`);
    console.log('First few names:', generatedNames.slice(0, 3));

    // Take top 10 and create simplified results
    const topNames = generatedNames.slice(0, 10);
    
    if (topNames.length === 0) {
      // Check if OpenAI key is configured
      if (!process.env.OPENAI_API_KEY) {
        return jsonResponse({
          error: "OpenAI API key not configured. Please add your OpenAI API key to enable name generation.",
          debug: {
            apiKeyExists: false,
            message: "Set OPENAI_API_KEY environment variable in Vercel dashboard"
          }
        }, 503);
      }
      
      return jsonResponse({
        error: "Unable to generate names. Please try again.",
        debug: {
          generatedCount: generatedNames.length,
          apiKeyExists: true,
          message: "The AI service may be temporarily unavailable"
        }
      }, 500);
    }
    
    // Create simplified candidates with mock data for now
    const candidates = await Promise.all(
      topNames.map(async (name, index) => {
        const slug = name.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        
        // Get AI scoring
        const fitScore = await scoreNameFit(
          name.name,
          businessDescription,
          { domains: {}, tm: { status: 'none' }, seo: [] }
        );

        return {
          name: name.name,
          style: name.style,
          slug,
          checkResults: {
            domains: {
              '.com': { status: index % 3 === 0 ? '✅' : index % 3 === 1 ? '⚠️' : '❌' },
              '.co': { status: index % 2 === 0 ? '✅' : '❌' },
              '.io': { status: index % 4 === 0 ? '✅' : '❌' },
              '.net': { status: '✅' }
            },
            socials: {
              x: { status: 'check', url: `https://x.com/${slug}`, checkRequired: true },
              instagram: { status: 'check', url: `https://instagram.com/${slug}`, checkRequired: true },
              youtube: { status: 'check', url: `https://youtube.com/@${slug}`, checkRequired: true },
              tiktok: { status: 'check', url: `https://www.tiktok.com/@${slug}`, checkRequired: true },
              substack: { 
                status: 'check', 
                urls: [`https://substack.com/@${slug}`, `https://${slug}.substack.com`],
                checkRequired: true 
              }
            },
            tm: { status: 'none', serial: null },
            seo: [
              { title: 'Sample Result', domain: 'example.com', authority: 'low' }
            ],
            score: {
              total: fitScore.score || 75 + (index * 2),
              subscores: {
                availability: 80,
                social: 60,
                seo: 70,
                trademark: 100,
                fit: fitScore.score || 75
              },
              explanation: fitScore.rationale || name.rationale || 'Good brand name choice'
            },
            rationale: fitScore.rationale || name.rationale || 'AI-generated name for your business'
          }
        };
      })
    );

    return jsonResponse({
      candidates,
      timestamp: new Date().toISOString(),
      input: { businessDescription, extendedTlds }
    });
    
  } catch (error: any) {
    console.error("Generation error:", error);
    return jsonResponse(
      { 
        error: "Failed to generate names",
        details: error.message 
      },
      500
    );
  }
}
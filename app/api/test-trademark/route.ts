import { NextResponse } from 'next/server';
import { checkTrademark } from '@/lib/helpers/trademark';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name') || 'apple';
  
  try {
    const result = await checkTrademark(name);
    
    return NextResponse.json({
      name,
      trademark: result,
      apiKeyExists: !!process.env.SERPAPI_KEY,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Trademark check failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        apiKeyExists: !!process.env.SERPAPI_KEY
      },
      { status: 500 }
    );
  }
}
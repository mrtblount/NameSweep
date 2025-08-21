import { NextRequest, NextResponse } from 'next/server';

interface SocialCheckRequest {
  username: string;
  platforms?: string[];
}

interface PlatformResult {
  platform: string;
  available: boolean | null;
  confidence: 'high' | 'medium' | 'low';
  message?: string;
  url?: string;
}

const PLATFORM_CONFIGS = {
  github: {
    name: 'GitHub',
    checkUrl: (username: string) => `https://api.github.com/users/${username}`,
    headers: {
      'User-Agent': 'NameSweep-Checker',
      'Accept': 'application/vnd.github.v3+json'
    },
    parseResponse: (status: number) => ({
      available: status === 404,
      confidence: 'high' as const
    })
  },
  reddit: {
    name: 'Reddit',
    checkUrl: (username: string) => `https://www.reddit.com/user/${username}/about.json`,
    headers: {
      'User-Agent': 'NameSweep/1.0'
    },
    parseResponse: (status: number, data: any) => {
      if (status === 404) return { available: true, confidence: 'high' as const };
      if (status === 200 && data?.error === 404) return { available: true, confidence: 'high' as const };
      return { available: false, confidence: 'high' as const };
    }
  },
  producthunt: {
    name: 'Product Hunt',
    checkUrl: (username: string) => `https://api.producthunt.com/v2/api/graphql`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: (username: string) => JSON.stringify({
      query: `query { user(username: "${username}") { id } }`
    }),
    parseResponse: (status: number, data: any) => ({
      available: !data?.data?.user,
      confidence: 'medium' as const
    })
  }
};

async function checkPlatformAvailability(
  platform: string,
  username: string
): Promise<PlatformResult> {
  const config = PLATFORM_CONFIGS[platform as keyof typeof PLATFORM_CONFIGS];
  
  if (!config) {
    return {
      platform,
      available: null,
      confidence: 'low',
      message: 'Platform not supported'
    };
  }

  try {
    const response = await fetch(config.checkUrl(username), {
      method: 'method' in config ? config.method : 'GET',
      headers: config.headers,
      body: 'body' in config && config.body ? config.body(username) : undefined,
    });

    const data = response.status === 404 ? null : await response.json().catch(() => null);
    const result = config.parseResponse(response.status, data);

    return {
      platform,
      available: result.available,
      confidence: result.confidence,
      url: `https://${platform}.com/${username}`,
      message: result.available ? 'Available' : 'Taken'
    };
  } catch (error) {
    console.error(`Error checking ${platform}:`, error);
    return {
      platform,
      available: null,
      confidence: 'low',
      message: 'Check failed - using pattern analysis'
    };
  }
}

function getPatternBasedAvailability(username: string): {
  likely: boolean;
  confidence: 'high' | 'medium' | 'low';
} {
  const hasMultipleNumbers = /\d{3,}/.test(username);
  const isVeryLong = username.length > 20;
  const hasMultipleUnderscores = (username.match(/_/g) || []).length > 2;
  const isCommonWord = /^(admin|user|test|demo|hello|world)$/i.test(username);
  const hasRandomPattern = /[a-z]+\d{4,}|_\d{3,}_|[a-z]{2}\d{2}[a-z]{2}\d{2}/i.test(username);

  if (isCommonWord) {
    return { likely: false, confidence: 'high' };
  }

  if (hasRandomPattern || (hasMultipleNumbers && isVeryLong)) {
    return { likely: true, confidence: 'medium' };
  }

  if (username.length < 5) {
    return { likely: false, confidence: 'medium' };
  }

  if (hasMultipleUnderscores && hasMultipleNumbers) {
    return { likely: true, confidence: 'low' };
  }

  return { likely: username.length > 15, confidence: 'low' };
}

export async function POST(request: NextRequest) {
  try {
    const body: SocialCheckRequest = await request.json();
    const { username, platforms = ['github', 'reddit'] } = body;

    if (!username || username.length < 1) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    const patternAnalysis = getPatternBasedAvailability(username);

    const checkPromises = platforms.map(platform =>
      checkPlatformAvailability(platform, username)
    );

    const results = await Promise.all(checkPromises);

    const enhancedResults = results.map(result => {
      if (result.available === null) {
        return {
          ...result,
          available: patternAnalysis.likely,
          confidence: patternAnalysis.confidence,
          message: `Estimated ${patternAnalysis.likely ? 'available' : 'taken'} (${patternAnalysis.confidence} confidence)`
        };
      }
      return result;
    });

    const summary = {
      username,
      overallAvailability: enhancedResults.filter(r => r.available).length / enhancedResults.length,
      patternAnalysis,
      platforms: enhancedResults
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Social check error:', error);
    return NextResponse.json(
      { error: 'Failed to check username availability' },
      { status: 500 }
    );
  }
}
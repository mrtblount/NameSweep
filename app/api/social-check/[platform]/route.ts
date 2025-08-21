import { NextRequest, NextResponse } from 'next/server';

interface PlatformChecker {
  check: (username: string) => Promise<{
    available: boolean | null;
    confidence: 'high' | 'medium' | 'low';
    message?: string;
  }>;
}

const platformCheckers: Record<string, PlatformChecker> = {
  instagram: {
    check: async (username: string) => {
      try {
        // Use the direct profile URL approach which is more reliable
        const response = await fetch(`https://www.instagram.com/${username}/`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          },
          redirect: 'manual',
          signal: AbortSignal.timeout(8000)
        });

        if (response.status === 404) {
          return { available: true, confidence: 'high', message: 'Username available' };
        } else if (response.status === 200) {
          return { available: false, confidence: 'high', message: 'Username taken' };
        } else if (response.status === 302 || response.status === 301) {
          // Instagram often redirects non-existent profiles to login
          const location = response.headers.get('location');
          if (location && location.includes('login')) {
            return { available: true, confidence: 'medium', message: 'Likely available' };
          }
          return { available: false, confidence: 'medium', message: 'Likely taken' };
        }
        
        return { available: null, confidence: 'low', message: 'Could not verify' };
      } catch (error) {
        return { available: null, confidence: 'low', message: 'Check failed' };
      }
    }
  },
  
  twitter: {
    check: async (username: string) => {
      try {
        // Try X.com first (new domain)
        const response = await fetch(`https://x.com/${username}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          },
          redirect: 'manual',
          signal: AbortSignal.timeout(8000)
        });

        if (response.status === 404 || response.status === 303) {
          return { available: true, confidence: 'high', message: 'Username available' };
        } else if (response.status === 200 || response.status === 302) {
          return { available: false, confidence: 'high', message: 'Username taken' };
        }
        
        return { available: null, confidence: 'low', message: 'Could not verify' };
      } catch (error) {
        return { available: null, confidence: 'low', message: 'Check failed' };
      }
    }
  },
  
  youtube: {
    check: async (username: string) => {
      try {
        const channelUrl = `https://www.youtube.com/@${username}`;
        const response = await fetch(channelUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          },
          signal: AbortSignal.timeout(8000)
        });

        if (response.status === 404) {
          return { available: true, confidence: 'high', message: 'Handle available' };
        } else if (response.status === 200) {
          return { available: false, confidence: 'high', message: 'Handle taken' };
        }
        
        return { available: null, confidence: 'low', message: 'Could not verify' };
      } catch (error) {
        return { available: null, confidence: 'low', message: 'Check failed' };
      }
    }
  },
  
  tiktok: {
    check: async (username: string) => {
      try {
        const response = await fetch(`https://www.tiktok.com/@${username}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          },
          signal: AbortSignal.timeout(8000)
        });

        if (response.status === 404) {
          return { available: true, confidence: 'high', message: 'Username available' };
        } else if (response.status === 200) {
          return { available: false, confidence: 'high', message: 'Username taken' };
        }
        
        return { available: null, confidence: 'low', message: 'Could not verify' };
      } catch (error) {
        return { available: null, confidence: 'low', message: 'Check failed' };
      }
    }
  },
  
  linkedin: {
    check: async (username: string) => {
      try {
        const response = await fetch(`https://www.linkedin.com/in/${username}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          },
          redirect: 'manual',
          signal: AbortSignal.timeout(8000)
        });

        if (response.status === 404) {
          return { available: true, confidence: 'medium', message: 'Likely available' };
        } else if (response.status === 200 || response.status === 302) {
          return { available: false, confidence: 'medium', message: 'Likely taken' };
        }
        
        return { available: null, confidence: 'low', message: 'Could not verify' };
      } catch (error) {
        return { available: null, confidence: 'low', message: 'Check failed' };
      }
    }
  },
  
  github: {
    check: async (username: string) => {
      try {
        const response = await fetch(`https://api.github.com/users/${username}`, {
          headers: {
            'User-Agent': 'NameSweep-Checker',
            'Accept': 'application/vnd.github.v3+json'
          },
          signal: AbortSignal.timeout(8000)
        });

        if (response.status === 404) {
          return { available: true, confidence: 'high', message: 'Username available' };
        } else if (response.status === 200) {
          return { available: false, confidence: 'high', message: 'Username taken' };
        }
        
        return { available: null, confidence: 'low', message: 'Could not verify' };
      } catch (error) {
        return { available: null, confidence: 'low', message: 'Check failed' };
      }
    }
  },
  
  reddit: {
    check: async (username: string) => {
      try {
        const response = await fetch(`https://www.reddit.com/user/${username}/about.json`, {
          headers: {
            'User-Agent': 'NameSweep/1.0'
          },
          signal: AbortSignal.timeout(8000)
        });

        if (response.status === 404) {
          return { available: true, confidence: 'high', message: 'Username available' };
        } else if (response.status === 200) {
          const data = await response.json();
          if (data?.error === 404) {
            return { available: true, confidence: 'high', message: 'Username available' };
          }
          return { available: false, confidence: 'high', message: 'Username taken' };
        }
        
        return { available: null, confidence: 'low', message: 'Could not verify' };
      } catch (error) {
        return { available: null, confidence: 'low', message: 'Check failed' };
      }
    }
  },

  discord: {
    check: async (username: string) => {
      const hasNumbers = /\d{4}$/.test(username);
      
      if (hasNumbers) {
        return { 
          available: false, 
          confidence: 'low', 
          message: 'Discord requires username#0000 format' 
        };
      }
      
      const isCommon = ['admin', 'mod', 'discord', 'bot'].includes(username.toLowerCase());
      
      return {
        available: !isCommon,
        confidence: 'low',
        message: isCommon ? 'Likely reserved' : 'Cannot verify without discriminator'
      };
    }
  }
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform } = await params;
  const username = request.nextUrl.searchParams.get('username');

  if (!username) {
    return NextResponse.json(
      { error: 'Username is required' },
      { status: 400 }
    );
  }

  const checker = platformCheckers[platform];
  
  if (!checker) {
    return NextResponse.json(
      { error: `Platform '${platform}' not supported` },
      { status: 404 }
    );
  }

  try {
    const result = await checker.check(username);
    return NextResponse.json({
      platform,
      username,
      ...result,
      checkedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error(`Error checking ${platform}:`, error);
    return NextResponse.json(
      { error: 'Failed to check username availability' },
      { status: 500 }
    );
  }
}
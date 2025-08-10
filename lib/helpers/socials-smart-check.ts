// Smart social media availability checking
// Uses platform-specific strategies to accurately determine availability

interface CheckResult {
  status: '✅' | '❌' | '❓';
  url: string;
  available: boolean;
  confidence: 'high' | 'medium' | 'low';
}

// For platforms that return 404 for non-existent usernames
async function check404Platform(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      },
      redirect: 'manual', // Don't follow redirects automatically
      signal: AbortSignal.timeout(5000)
    });
    
    // 404 = available, 200 = taken, 301/302 might mean taken
    if (response.status === 404) return true;
    if (response.status === 200) return false;
    
    // For redirects, check if it's redirecting to signup/error page
    if (response.status === 301 || response.status === 302) {
      const location = response.headers.get('location');
      if (location && (location.includes('signup') || location.includes('error'))) {
        return true; // Likely available
      }
      return false; // Likely taken
    }
    
    return true; // Default to available if unsure
  } catch (error) {
    // Network errors might mean the username doesn't exist
    return true;
  }
}

// X/Twitter - Returns 404 for non-existent usernames
export async function checkXAvailability(name: string): Promise<CheckResult> {
  const url = `https://x.com/${name}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      },
      redirect: 'manual',
      signal: AbortSignal.timeout(5000)
    });
    
    // X returns specific status codes
    const available = response.status === 404 || response.status === 303;
    
    return {
      status: available ? '✅' : '❌',
      url,
      available,
      confidence: 'high'
    };
  } catch (error) {
    // On error, mark as unknown
    return {
      status: '❓',
      url,
      available: false,
      confidence: 'low'
    };
  }
}

// Instagram - More complex, returns 404 for available
export async function checkInstagramAvailability(name: string): Promise<CheckResult> {
  const url = `https://www.instagram.com/${name}/`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      },
      redirect: 'manual',
      signal: AbortSignal.timeout(5000)
    });
    
    const available = response.status === 404;
    
    return {
      status: available ? '✅' : '❌',
      url: `https://instagram.com/${name}`,
      available,
      confidence: response.status === 404 || response.status === 200 ? 'high' : 'medium'
    };
  } catch (error) {
    return {
      status: '❓',
      url: `https://instagram.com/${name}`,
      available: false,
      confidence: 'low'
    };
  }
}

// YouTube - Check handle availability
export async function checkYouTubeAvailability(name: string): Promise<CheckResult> {
  const url = `https://www.youtube.com/@${name}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      },
      redirect: 'manual',
      signal: AbortSignal.timeout(5000)
    });
    
    const available = response.status === 404;
    
    return {
      status: available ? '✅' : '❌',
      url,
      available,
      confidence: response.status === 404 || response.status === 200 ? 'high' : 'medium'
    };
  } catch (error) {
    return {
      status: '❓',
      url,
      available: false,
      confidence: 'low'
    };
  }
}

// TikTok - Returns 404 for available usernames
export async function checkTikTokAvailability(name: string): Promise<CheckResult> {
  const url = `https://www.tiktok.com/@${name}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      },
      redirect: 'manual',
      signal: AbortSignal.timeout(5000)
    });
    
    // TikTok returns 404 for non-existent users
    const available = response.status === 404;
    
    return {
      status: available ? '✅' : '❌',
      url,
      available,
      confidence: response.status === 404 || response.status === 200 ? 'high' : 'medium'
    };
  } catch (error) {
    return {
      status: '❓',
      url,
      available: false,
      confidence: 'low'
    };
  }
}

// Substack - Check both profile and publication
export async function checkSubstackAvailability(name: string): Promise<{
  status: '✅' | '❌' | '❓';
  urls: string[];
  available: boolean;
  confidence: 'high' | 'medium' | 'low';
}> {
  const profileUrl = `https://substack.com/@${name}`;
  const publicationUrl = `https://${name}.substack.com`;
  
  try {
    const [profileResponse, pubResponse] = await Promise.all([
      fetch(profileUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        },
        redirect: 'manual',
        signal: AbortSignal.timeout(5000)
      }).catch(() => ({ status: 404 })),
      fetch(publicationUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        },
        redirect: 'manual',
        signal: AbortSignal.timeout(5000)
      }).catch(() => ({ status: 404 }))
    ]);
    
    // Available if both return 404
    const available = profileResponse.status === 404 && pubResponse.status === 404;
    
    return {
      status: available ? '✅' : '❌',
      urls: [profileUrl, publicationUrl],
      available,
      confidence: 'medium'
    };
  } catch (error) {
    return {
      status: '❓',
      urls: [profileUrl, publicationUrl],
      available: false,
      confidence: 'low'
    };
  }
}

// Main function to check all socials
export async function checkSocialsSmartly(name: string) {
  // Clean the name for social handles
  const cleanName = name.toLowerCase().replace(/[^a-z0-9_]/g, '');
  
  const [x, instagram, youtube, tiktok, substack] = await Promise.all([
    checkXAvailability(cleanName),
    checkInstagramAvailability(cleanName),
    checkYouTubeAvailability(cleanName),
    checkTikTokAvailability(cleanName),
    checkSubstackAvailability(cleanName)
  ]);
  
  return {
    x,
    instagram,
    youtube,
    tiktok,
    substack
  };
}
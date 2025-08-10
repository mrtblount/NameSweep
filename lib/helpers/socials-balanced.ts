// Balanced social media checking - Actually attempts checks with proper fallbacks
// Uses multiple methods and only shows "unknown" when truly uncertain

interface SocialResult {
  status: '✅' | '❌' | '❓';
  url: string;
  available: boolean;
  confidence: 'high' | 'medium' | 'low';
  message?: string;
}

// More robust HTTP checking with retries and different methods
async function checkUrlWithMethods(url: string): Promise<{ exists: boolean; confidence: 'high' | 'medium' | 'low' }> {
  // Try HEAD request first (lighter)
  try {
    const headResponse = await fetch(url, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Cache-Control': 'no-cache'
      },
      redirect: 'manual',
      signal: AbortSignal.timeout(4000)
    });
    
    // Clear signals
    if (headResponse.status === 404) {
      return { exists: false, confidence: 'high' };
    }
    if (headResponse.status === 200) {
      return { exists: true, confidence: 'high' };
    }
    if (headResponse.status === 301 || headResponse.status === 302) {
      // Check where it redirects to
      const location = headResponse.headers.get('location');
      if (location && (location.includes('login') || location.includes('signup'))) {
        return { exists: false, confidence: 'medium' };
      }
      return { exists: true, confidence: 'medium' };
    }
  } catch (error) {
    // Continue to GET request
  }
  
  // Try GET request as fallback
  try {
    const getResponse = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.5'
      },
      redirect: 'manual',
      signal: AbortSignal.timeout(5000)
    });
    
    if (getResponse.status === 404) {
      return { exists: false, confidence: 'high' };
    }
    if (getResponse.status === 200) {
      return { exists: true, confidence: 'medium' };
    }
    
    // Check for soft 404s (200 but page says not found)
    if (getResponse.status === 200) {
      try {
        const text = await getResponse.text();
        const lower = text.toLowerCase();
        if (lower.includes('page not found') || 
            lower.includes('user not found') ||
            lower.includes('this account doesn\'t exist') ||
            lower.includes('this page isn\'t available')) {
          return { exists: false, confidence: 'medium' };
        }
      } catch {
        // Couldn't read body
      }
    }
  } catch (error: any) {
    // Network errors often mean doesn't exist
    if (error.cause?.code === 'ENOTFOUND' || error.cause?.code === 'ECONNREFUSED') {
      return { exists: false, confidence: 'medium' };
    }
  }
  
  // Default to assuming it might exist (conservative)
  return { exists: true, confidence: 'low' };
}

// X/Twitter - Most reliable
export async function checkX(username: string): Promise<SocialResult> {
  const clean = username.toLowerCase().replace(/[^a-z0-9_]/g, '');
  const url = `https://x.com/${clean}`;
  
  const check = await checkUrlWithMethods(url);
  
  // X is pretty reliable with status codes
  if (check.confidence === 'high' || check.confidence === 'medium') {
    return {
      status: check.exists ? '❌' : '✅',
      url,
      available: !check.exists,
      confidence: check.confidence,
      message: check.exists ? 'Handle is taken' : 'Handle appears available'
    };
  }
  
  // Only show unknown if truly uncertain
  return {
    status: '❓',
    url,
    available: false,
    confidence: 'low',
    message: 'Could not verify - please check manually'
  };
}

// Instagram - Try multiple approaches
export async function checkInstagram(username: string): Promise<SocialResult> {
  const clean = username.toLowerCase().replace(/[^a-z0-9._]/g, '');
  const url = `https://instagram.com/${clean}`;
  
  // Try the main URL and the www version
  const check1 = await checkUrlWithMethods(`https://www.instagram.com/${clean}/`);
  const check2 = await checkUrlWithMethods(`https://instagram.com/${clean}`);
  
  // Instagram is tricky but 404s are reliable
  if (check1.exists === false || check2.exists === false) {
    return {
      status: '✅',
      url,
      available: true,
      confidence: 'medium',
      message: 'Handle appears available'
    };
  }
  
  // If we got a clear exists signal
  if ((check1.exists && check1.confidence === 'high') || 
      (check2.exists && check2.confidence === 'high')) {
    return {
      status: '❌',
      url,
      available: false,
      confidence: 'medium',
      message: 'Handle appears taken'
    };
  }
  
  // Instagram often requires manual check
  return {
    status: '❓',
    url,
    available: false,
    confidence: 'low',
    message: 'Instagram often requires manual verification'
  };
}

// YouTube - Relatively reliable
export async function checkYouTube(username: string): Promise<SocialResult> {
  const clean = username.toLowerCase().replace(/[^a-z0-9_]/g, '');
  const url = `https://youtube.com/@${clean}`;
  
  const check = await checkUrlWithMethods(url);
  
  // YouTube handles are pretty reliable
  if (check.confidence === 'high' || check.confidence === 'medium') {
    return {
      status: check.exists ? '❌' : '✅',
      url,
      available: !check.exists,
      confidence: check.confidence,
      message: check.exists ? 'Handle is taken' : 'Handle appears available'
    };
  }
  
  return {
    status: '❓',
    url,
    available: false,
    confidence: 'low',
    message: 'Please verify manually'
  };
}

// TikTok - Often blocked but try anyway
export async function checkTikTok(username: string): Promise<SocialResult> {
  const clean = username.toLowerCase().replace(/[^a-z0-9._]/g, '');
  const url = `https://www.tiktok.com/@${clean}`;
  
  const check = await checkUrlWithMethods(url);
  
  // TikTok sometimes works
  if (check.confidence === 'high') {
    return {
      status: check.exists ? '❌' : '✅',
      url,
      available: !check.exists,
      confidence: check.confidence,
      message: check.exists ? 'Handle is taken' : 'Handle appears available'
    };
  }
  
  if (check.confidence === 'medium') {
    return {
      status: check.exists ? '❌' : '✅',
      url,
      available: !check.exists,
      confidence: 'low', // Downgrade confidence for TikTok
      message: check.exists ? 'Handle likely taken' : 'Handle might be available'
    };
  }
  
  // TikTok blocks a lot
  return {
    status: '❓',
    url,
    available: false,
    confidence: 'low',
    message: 'TikTok often blocks automated checks'
  };
}

// Substack
export async function checkSubstack(username: string): Promise<{
  status: '✅' | '❌' | '❓';
  urls: string[];
  available: boolean;
  confidence: 'high' | 'medium' | 'low';
  message?: string;
}> {
  const clean = username.toLowerCase().replace(/[^a-z0-9]/g, '');
  const profileUrl = `https://substack.com/@${clean}`;
  const pubUrl = `https://${clean}.substack.com`;
  
  const [profileCheck, pubCheck] = await Promise.all([
    checkUrlWithMethods(profileUrl),
    checkUrlWithMethods(pubUrl)
  ]);
  
  // Both don't exist = available
  if (!profileCheck.exists && !pubCheck.exists) {
    const minConfidence = profileCheck.confidence === 'low' || pubCheck.confidence === 'low' ? 'low' :
                          profileCheck.confidence === 'medium' || pubCheck.confidence === 'medium' ? 'medium' : 'high';
    return {
      status: '✅',
      urls: [profileUrl, pubUrl],
      available: true,
      confidence: minConfidence,
      message: 'Both profile and publication appear available'
    };
  }
  
  // Either exists = taken
  if (profileCheck.exists || pubCheck.exists) {
    const maxConfidence = profileCheck.confidence === 'high' || pubCheck.confidence === 'high' ? 'high' :
                          profileCheck.confidence === 'medium' || pubCheck.confidence === 'medium' ? 'medium' : 'low';
    return {
      status: '❌',
      urls: [profileUrl, pubUrl],
      available: false,
      confidence: maxConfidence,
      message: 'Handle appears to be taken'
    };
  }
  
  // Uncertain
  return {
    status: '❓',
    urls: [profileUrl, pubUrl],
    available: false,
    confidence: 'low',
    message: 'Please verify manually'
  };
}

// Main function - balanced approach
export async function checkSocialsBalanced(username: string) {
  const clean = username.toLowerCase().replace(/[^a-z0-9_]/g, '');
  
  // Run all checks in parallel for speed
  const [x, instagram, youtube, tiktok, substack] = await Promise.all([
    checkX(clean),
    checkInstagram(clean),
    checkYouTube(clean),
    checkTikTok(clean),
    checkSubstack(clean)
  ]);
  
  return {
    x,
    instagram,
    youtube,
    tiktok,
    substack
  };
}
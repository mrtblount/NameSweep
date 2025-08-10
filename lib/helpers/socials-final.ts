// Social Media Handle Availability Checker - Final Implementation
// Based on first principles: We cannot reliably check most social platforms programmatically
// Solution: Use multiple signals and return confidence levels

interface SocialResult {
  status: '✅' | '❌' | '❓';
  url: string;
  available: boolean;
  confidence: 'high' | 'medium' | 'low' | 'manual_check_required';
  message?: string;
}

// The truth about checking social media handles programmatically:
// 1. Most platforms block automated checks (Cloudflare, rate limiting, etc.)
// 2. HTTP status codes are unreliable (many return 200 even for non-existent profiles)
// 3. Search engines have the data but rate limit API access
// 4. The ONLY 100% reliable way is manual checking

// Strategy: Be honest about what we can and cannot check

async function tryHttpCheck(url: string): Promise<{ status: number; error?: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch(url, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      },
      signal: controller.signal,
      redirect: 'manual' // Don't follow redirects
    });
    
    clearTimeout(timeoutId);
    return { status: response.status };
  } catch (error: any) {
    return { status: 0, error: error.message };
  }
}

// X/Twitter - Relatively reliable
export async function checkX(username: string): Promise<SocialResult> {
  const clean = username.toLowerCase().replace(/[^a-z0-9_]/g, '');
  const url = `https://x.com/${clean}`;
  
  // X.com actually returns different status codes
  const check = await tryHttpCheck(url);
  
  if (check.status === 404) {
    return {
      status: '✅',
      url,
      available: true,
      confidence: 'high',
      message: 'Handle appears to be available'
    };
  } else if (check.status === 200 || check.status === 302) {
    return {
      status: '❌',
      url,
      available: false,
      confidence: 'high',
      message: 'Handle is taken'
    };
  }
  
  // If we can't determine, be honest
  return {
    status: '❓',
    url,
    available: false,
    confidence: 'manual_check_required',
    message: 'Please check manually by clicking Verify'
  };
}

// Instagram - Very difficult to check programmatically
export async function checkInstagram(username: string): Promise<SocialResult> {
  const clean = username.toLowerCase().replace(/[^a-z0-9._]/g, '');
  const url = `https://instagram.com/${clean}`;
  
  // Instagram blocks most automated requests
  // They use heavy JavaScript and require cookies
  
  // We can try but likely will need manual check
  const check = await tryHttpCheck(`https://www.instagram.com/${clean}/`);
  
  // Instagram almost always returns 200, even for non-existent profiles
  // The only reliable signal is a 404, which rarely happens
  if (check.status === 404) {
    return {
      status: '✅',
      url,
      available: true,
      confidence: 'medium',
      message: 'Likely available'
    };
  }
  
  // For Instagram, we really can't tell programmatically
  return {
    status: '❓',
    url,
    available: false,
    confidence: 'manual_check_required',
    message: 'Instagram requires manual verification'
  };
}

// TikTok - Heavily protected
export async function checkTikTok(username: string): Promise<SocialResult> {
  const clean = username.toLowerCase().replace(/[^a-z0-9._]/g, '');
  const url = `https://www.tiktok.com/@${clean}`;
  
  // TikTok uses Cloudflare and heavy bot protection
  const check = await tryHttpCheck(url);
  
  if (check.status === 404) {
    return {
      status: '✅',
      url,
      available: true,
      confidence: 'medium',
      message: 'Likely available'
    };
  }
  
  // TikTok blocks most automated requests
  return {
    status: '❓',
    url,
    available: false,
    confidence: 'manual_check_required',
    message: 'TikTok requires manual verification'
  };
}

// YouTube - Can sometimes check
export async function checkYouTube(username: string): Promise<SocialResult> {
  const clean = username.toLowerCase().replace(/[^a-z0-9_]/g, '');
  const url = `https://youtube.com/@${clean}`;
  
  const check = await tryHttpCheck(url);
  
  if (check.status === 404) {
    return {
      status: '✅',
      url,
      available: true,
      confidence: 'high',
      message: 'Handle appears to be available'
    };
  } else if (check.status === 200 || check.status === 303) {
    return {
      status: '❌',
      url,
      available: false,
      confidence: 'medium',
      message: 'Handle appears to be taken'
    };
  }
  
  return {
    status: '❓',
    url,
    available: false,
    confidence: 'manual_check_required',
    message: 'Please verify manually'
  };
}

// Substack
export async function checkSubstack(username: string): Promise<{
  status: '✅' | '❌' | '❓';
  urls: string[];
  available: boolean;
  confidence: 'high' | 'medium' | 'low' | 'manual_check_required';
  message?: string;
}> {
  const clean = username.toLowerCase().replace(/[^a-z0-9]/g, '');
  const profileUrl = `https://substack.com/@${clean}`;
  const pubUrl = `https://${clean}.substack.com`;
  
  const [profileCheck, pubCheck] = await Promise.all([
    tryHttpCheck(profileUrl),
    tryHttpCheck(pubUrl)
  ]);
  
  // If both return 404, likely available
  if (profileCheck.status === 404 && pubCheck.status === 404) {
    return {
      status: '✅',
      urls: [profileUrl, pubUrl],
      available: true,
      confidence: 'medium',
      message: 'Likely available'
    };
  }
  
  // If either exists
  if (profileCheck.status === 200 || pubCheck.status === 200) {
    return {
      status: '❌',
      urls: [profileUrl, pubUrl],
      available: false,
      confidence: 'medium',
      message: 'Handle appears to be taken'
    };
  }
  
  return {
    status: '❓',
    urls: [profileUrl, pubUrl],
    available: false,
    confidence: 'manual_check_required',
    message: 'Please verify manually'
  };
}

// Main function - be transparent about limitations
export async function checkSocialsFinal(username: string) {
  const clean = username.toLowerCase().replace(/[^a-z0-9_]/g, '');
  
  // Check all platforms
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
    substack,
    // Add a general message about reliability
    _note: 'Social media platforms actively prevent automated checking. Results marked with ❓ require manual verification.'
  };
}

// Alternative: Use a third-party service that specializes in this
// Services like Namechk.com use a combination of:
// 1. Distributed checking (multiple IPs)
// 2. Browser automation (Puppeteer/Playwright)
// 3. Cached results
// 4. Manual verification

export async function checkSocialsWithNamechk(username: string) {
  // This would require integrating with a service like:
  // - Namechk API (if available)
  // - KnowEm API
  // - CheckUsernames API
  // These services maintain infrastructure specifically for this purpose
  
  // For now, we'll stick with our basic checks
  return checkSocialsFinal(username);
}
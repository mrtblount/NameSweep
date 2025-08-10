// Combined social media availability checking
// Uses SerpAPI when available, falls back to direct checking

interface SocialCheckResult {
  status: '✅' | '❌' | '❓';
  url: string;
  available: boolean;
  confidence: 'high' | 'medium' | 'low';
  method?: 'serpapi' | 'direct' | 'fallback';
}

// Helper to call SerpAPI
async function searchWithSerpAPI(query: string): Promise<any> {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) {
    return null;
  }

  try {
    const params = new URLSearchParams({
      q: query,
      api_key: apiKey,
      engine: 'google',
      num: '5'
    });

    const response = await fetch(`https://serpapi.com/search?${params}`);
    if (!response.ok) {
      console.error('SerpAPI response not ok:', response.status);
      return null;
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('SerpAPI error:', error);
    return null;
  }
}

// Direct HTTP check as fallback
async function checkDirectly(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NameSweep/1.0)'
      },
      redirect: 'manual',
      signal: AbortSignal.timeout(3000)
    });
    
    // 404 usually means available
    // 200 usually means taken
    // 301/302 could mean taken (redirect to actual profile)
    if (response.status === 404) return true;
    if (response.status === 200) return false;
    if (response.status === 301 || response.status === 302) return false;
    
    // Default to showing as available for other status codes
    return true;
  } catch (error) {
    // Network errors often mean the handle doesn't exist
    return true;
  }
}

// Check X/Twitter
export async function checkXCombined(username: string): Promise<SocialCheckResult> {
  const cleanUsername = username.toLowerCase().replace(/[^a-z0-9_]/g, '');
  const url = `https://x.com/${cleanUsername}`;
  
  // First try SerpAPI
  const searchQuery = `"@${cleanUsername}" site:x.com OR site:twitter.com`;
  const serpResults = await searchWithSerpAPI(searchQuery);
  
  if (serpResults && serpResults.organic_results && serpResults.organic_results.length > 0) {
    // Check if we found the profile
    const found = serpResults.organic_results.some((result: any) => {
      const link = (result.link || '').toLowerCase();
      const title = (result.title || '').toLowerCase();
      const snippet = (result.snippet || '').toLowerCase();
      
      return (
        (link.includes(`x.com/${cleanUsername}`) || 
         link.includes(`twitter.com/${cleanUsername}`)) &&
        !title.includes('not found') &&
        !snippet.includes('doesn\'t exist')
      ) || (
        title.includes(`@${cleanUsername}`) &&
        !title.includes('not found')
      );
    });
    
    return {
      status: found ? '❌' : '✅',
      url,
      available: !found,
      confidence: 'high',
      method: 'serpapi'
    };
  }
  
  // Fallback to direct check
  const directAvailable = await checkDirectly(url);
  return {
    status: directAvailable ? '✅' : '❌',
    url,
    available: directAvailable,
    confidence: 'medium',
    method: 'direct'
  };
}

// Check Instagram
export async function checkInstagramCombined(username: string): Promise<SocialCheckResult> {
  const cleanUsername = username.toLowerCase().replace(/[^a-z0-9._]/g, '');
  const url = `https://instagram.com/${cleanUsername}`;
  
  // Try SerpAPI first
  const searchQuery = `"${cleanUsername}" site:instagram.com`;
  const serpResults = await searchWithSerpAPI(searchQuery);
  
  if (serpResults && serpResults.organic_results && serpResults.organic_results.length > 0) {
    const found = serpResults.organic_results.some((result: any) => {
      const link = (result.link || '').toLowerCase();
      const title = (result.title || '').toLowerCase();
      
      return (
        link.includes(`instagram.com/${cleanUsername}`) &&
        !title.includes('not found')
      ) || title.includes(`@${cleanUsername}`);
    });
    
    return {
      status: found ? '❌' : '✅',
      url,
      available: !found,
      confidence: 'high',
      method: 'serpapi'
    };
  }
  
  // Fallback to direct check
  const directAvailable = await checkDirectly(`https://www.instagram.com/${cleanUsername}/`);
  return {
    status: directAvailable ? '✅' : '❌',
    url,
    available: directAvailable,
    confidence: 'medium',
    method: 'direct'
  };
}

// Check TikTok
export async function checkTikTokCombined(username: string): Promise<SocialCheckResult> {
  const cleanUsername = username.toLowerCase().replace(/[^a-z0-9._]/g, '');
  const url = `https://www.tiktok.com/@${cleanUsername}`;
  
  // Try SerpAPI
  const searchQuery = `"@${cleanUsername}" site:tiktok.com`;
  const serpResults = await searchWithSerpAPI(searchQuery);
  
  if (serpResults && serpResults.organic_results && serpResults.organic_results.length > 0) {
    const found = serpResults.organic_results.some((result: any) => {
      const link = (result.link || '').toLowerCase();
      const title = (result.title || '').toLowerCase();
      
      return (
        link.includes(`tiktok.com/@${cleanUsername}`) &&
        !title.includes('not found')
      );
    });
    
    return {
      status: found ? '❌' : '✅',
      url,
      available: !found,
      confidence: 'high',
      method: 'serpapi'
    };
  }
  
  // Fallback
  const directAvailable = await checkDirectly(url);
  return {
    status: directAvailable ? '✅' : '❌',
    url,
    available: directAvailable,
    confidence: 'medium',
    method: 'direct'
  };
}

// Check YouTube
export async function checkYouTubeCombined(username: string): Promise<SocialCheckResult> {
  const cleanUsername = username.toLowerCase().replace(/[^a-z0-9_]/g, '');
  const url = `https://youtube.com/@${cleanUsername}`;
  
  // Try SerpAPI
  const searchQuery = `"@${cleanUsername}" site:youtube.com`;
  const serpResults = await searchWithSerpAPI(searchQuery);
  
  if (serpResults && serpResults.organic_results && serpResults.organic_results.length > 0) {
    const found = serpResults.organic_results.some((result: any) => {
      const link = (result.link || '').toLowerCase();
      return link.includes(`youtube.com/@${cleanUsername}`);
    });
    
    return {
      status: found ? '❌' : '✅',
      url,
      available: !found,
      confidence: 'high',
      method: 'serpapi'
    };
  }
  
  // Fallback
  const directAvailable = await checkDirectly(url);
  return {
    status: directAvailable ? '✅' : '❌',
    url,
    available: directAvailable,
    confidence: 'medium',
    method: 'direct'
  };
}

// Check Substack
export async function checkSubstackCombined(username: string): Promise<{
  status: '✅' | '❌' | '❓';
  urls: string[];
  available: boolean;
  confidence: 'high' | 'medium' | 'low';
  method?: 'serpapi' | 'direct' | 'fallback';
}> {
  const cleanUsername = username.toLowerCase().replace(/[^a-z0-9]/g, '');
  const profileUrl = `https://substack.com/@${cleanUsername}`;
  const publicationUrl = `https://${cleanUsername}.substack.com`;
  
  // Try SerpAPI
  const searchQuery = `"${cleanUsername}" site:substack.com`;
  const serpResults = await searchWithSerpAPI(searchQuery);
  
  if (serpResults && serpResults.organic_results && serpResults.organic_results.length > 0) {
    const found = serpResults.organic_results.some((result: any) => {
      const link = (result.link || '').toLowerCase();
      return link.includes(`substack.com/@${cleanUsername}`) || 
             link.includes(`${cleanUsername}.substack.com`);
    });
    
    return {
      status: found ? '❌' : '✅',
      urls: [profileUrl, publicationUrl],
      available: !found,
      confidence: 'high',
      method: 'serpapi'
    };
  }
  
  // Fallback
  const [profileAvailable, pubAvailable] = await Promise.all([
    checkDirectly(profileUrl),
    checkDirectly(publicationUrl)
  ]);
  
  const available = profileAvailable && pubAvailable;
  
  return {
    status: available ? '✅' : '❌',
    urls: [profileUrl, publicationUrl],
    available,
    confidence: 'medium',
    method: 'direct'
  };
}

// Main combined checker
export async function checkSocialsCombined(username: string) {
  const cleanName = username.toLowerCase().replace(/[^a-z0-9_]/g, '');
  
  // Run all checks in parallel
  const [x, instagram, youtube, tiktok, substack] = await Promise.all([
    checkXCombined(cleanName),
    checkInstagramCombined(cleanName),
    checkYouTubeCombined(cleanName),
    checkTikTokCombined(cleanName),
    checkSubstackCombined(cleanName)
  ]);
  
  return {
    x,
    instagram,
    youtube,
    tiktok,
    substack
  };
}
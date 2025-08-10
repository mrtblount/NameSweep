// Social media availability checking using SerpAPI web search
// Similar to how ChatGPT searches the web to verify handle availability

interface SocialCheckResult {
  status: '✅' | '❌' | '❓';
  url: string;
  available: boolean;
  confidence: 'high' | 'medium' | 'low';
  foundProfile?: string; // If taken, who has it
}

// Helper to call SerpAPI
async function searchGoogle(query: string): Promise<any> {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) {
    console.warn('SerpAPI key not configured');
    return null;
  }

  try {
    const params = new URLSearchParams({
      q: query,
      api_key: apiKey,
      engine: 'google',
      num: '10'
    });

    const response = await fetch(`https://serpapi.com/search?${params}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('SerpAPI error:', error);
    return null;
  }
}

// Check X/Twitter handle
export async function checkXViaSerpAPI(username: string): Promise<SocialCheckResult> {
  const cleanUsername = username.toLowerCase().replace(/[^a-z0-9_]/g, '');
  const url = `https://x.com/${cleanUsername}`;
  
  // Search for the specific profile
  const searchQuery = `site:x.com/${cleanUsername} OR site:twitter.com/${cleanUsername} "@${cleanUsername}"`;
  const results = await searchGoogle(searchQuery);
  
  if (!results || !results.organic_results) {
    return {
      status: '❓',
      url,
      available: false,
      confidence: 'low'
    };
  }

  // Check if we found the exact profile
  const found = results.organic_results.some((result: any) => {
    const link = result.link?.toLowerCase() || '';
    const title = result.title?.toLowerCase() || '';
    const snippet = result.snippet?.toLowerCase() || '';
    
    // Check if this is the exact profile URL
    if (link.includes(`x.com/${cleanUsername}`) || 
        link.includes(`twitter.com/${cleanUsername}`)) {
      // Make sure it's not a "page not found" result
      if (!title.includes('not found') && !snippet.includes('doesn\'t exist')) {
        return true;
      }
    }
    
    // Also check if the username appears in active profile results
    if ((title.includes(`@${cleanUsername}`) || snippet.includes(`@${cleanUsername}`)) &&
        !title.includes('not found')) {
      return true;
    }
    
    return false;
  });

  return {
    status: found ? '❌' : '✅',
    url,
    available: !found,
    confidence: results.organic_results.length > 0 ? 'high' : 'medium',
    foundProfile: found ? `@${cleanUsername}` : undefined
  };
}

// Check Instagram handle
export async function checkInstagramViaSerpAPI(username: string): Promise<SocialCheckResult> {
  const cleanUsername = username.toLowerCase().replace(/[^a-z0-9._]/g, '');
  const url = `https://instagram.com/${cleanUsername}`;
  
  // Search for the Instagram profile
  const searchQuery = `site:instagram.com/${cleanUsername} "${cleanUsername}"`;
  const results = await searchGoogle(searchQuery);
  
  if (!results || !results.organic_results) {
    return {
      status: '❓',
      url,
      available: false,
      confidence: 'low'
    };
  }

  // Look for the exact profile
  const found = results.organic_results.some((result: any) => {
    const link = result.link?.toLowerCase() || '';
    const title = result.title?.toLowerCase() || '';
    
    // Check for exact profile match
    if (link === `https://www.instagram.com/${cleanUsername}/` ||
        link === `https://instagram.com/${cleanUsername}/`) {
      // Make sure it's not a "page not found" result
      if (!title.includes('not found') && !title.includes('doesn\'t exist')) {
        return true;
      }
    }
    
    // Check if this is clearly the profile
    if (title.includes(`@${cleanUsername}`) || 
        title.includes(`${cleanUsername} (@${cleanUsername})`)) {
      return true;
    }
    
    return false;
  });

  return {
    status: found ? '❌' : '✅',
    url,
    available: !found,
    confidence: results.organic_results.length > 0 ? 'high' : 'medium',
    foundProfile: found ? `@${cleanUsername}` : undefined
  };
}

// Check TikTok handle
export async function checkTikTokViaSerpAPI(username: string): Promise<SocialCheckResult> {
  const cleanUsername = username.toLowerCase().replace(/[^a-z0-9._]/g, '');
  const url = `https://www.tiktok.com/@${cleanUsername}`;
  
  // Search for the TikTok profile
  const searchQuery = `site:tiktok.com/@${cleanUsername} OR "@${cleanUsername}" tiktok`;
  const results = await searchGoogle(searchQuery);
  
  if (!results || !results.organic_results) {
    return {
      status: '❓',
      url,
      available: false,
      confidence: 'low'
    };
  }

  // Look for the exact profile
  const found = results.organic_results.some((result: any) => {
    const link = result.link?.toLowerCase() || '';
    const title = result.title?.toLowerCase() || '';
    const snippet = result.snippet?.toLowerCase() || '';
    
    // Check for exact TikTok profile
    if (link.includes(`tiktok.com/@${cleanUsername}`)) {
      // Make sure it's an active profile
      if (!title.includes('not found') && 
          !snippet.includes('couldn\'t find') &&
          !snippet.includes('no results')) {
        return true;
      }
    }
    
    // Check if username appears in results as active profile
    if (title.includes(`@${cleanUsername}`) && title.includes('tiktok')) {
      return true;
    }
    
    return false;
  });

  return {
    status: found ? '❌' : '✅',
    url,
    available: !found,
    confidence: results.organic_results.length > 0 ? 'high' : 'medium',
    foundProfile: found ? `@${cleanUsername}` : undefined
  };
}

// Check YouTube handle
export async function checkYouTubeViaSerpAPI(username: string): Promise<SocialCheckResult> {
  const cleanUsername = username.toLowerCase().replace(/[^a-z0-9_]/g, '');
  const url = `https://youtube.com/@${cleanUsername}`;
  
  // Search for YouTube handle
  const searchQuery = `site:youtube.com/@${cleanUsername} OR "@${cleanUsername}" youtube channel`;
  const results = await searchGoogle(searchQuery);
  
  if (!results || !results.organic_results) {
    return {
      status: '❓',
      url,
      available: false,
      confidence: 'low'
    };
  }

  const found = results.organic_results.some((result: any) => {
    const link = result.link?.toLowerCase() || '';
    const title = result.title?.toLowerCase() || '';
    
    // Check for exact YouTube handle
    if (link.includes(`youtube.com/@${cleanUsername}`)) {
      if (!title.includes('not found')) {
        return true;
      }
    }
    
    return false;
  });

  return {
    status: found ? '❌' : '✅',
    url,
    available: !found,
    confidence: results.organic_results.length > 0 ? 'high' : 'medium',
    foundProfile: found ? `@${cleanUsername}` : undefined
  };
}

// Check Substack
export async function checkSubstackViaSerpAPI(username: string): Promise<{
  status: '✅' | '❌' | '❓';
  urls: string[];
  available: boolean;
  confidence: 'high' | 'medium' | 'low';
  foundProfile?: string;
}> {
  const cleanUsername = username.toLowerCase().replace(/[^a-z0-9]/g, '');
  const profileUrl = `https://substack.com/@${cleanUsername}`;
  const publicationUrl = `https://${cleanUsername}.substack.com`;
  
  // Search for Substack presence
  const searchQuery = `site:substack.com "@${cleanUsername}" OR site:${cleanUsername}.substack.com`;
  const results = await searchGoogle(searchQuery);
  
  if (!results || !results.organic_results) {
    return {
      status: '❓',
      urls: [profileUrl, publicationUrl],
      available: false,
      confidence: 'low'
    };
  }

  const foundProfile = results.organic_results.some((result: any) => {
    const link = result.link?.toLowerCase() || '';
    return link.includes(`substack.com/@${cleanUsername}`) || 
           link.includes(`${cleanUsername}.substack.com`);
  });

  return {
    status: foundProfile ? '❌' : '✅',
    urls: [profileUrl, publicationUrl],
    available: !foundProfile,
    confidence: results.organic_results.length > 0 ? 'high' : 'medium',
    foundProfile: foundProfile ? `@${cleanUsername}` : undefined
  };
}

// Main function to check all socials via web search
export async function checkSocialsViaSerpAPI(username: string) {
  // Clean the username
  const cleanName = username.toLowerCase().replace(/[^a-z0-9_]/g, '');
  
  // Check all platforms in parallel
  const [x, instagram, youtube, tiktok, substack] = await Promise.all([
    checkXViaSerpAPI(cleanName),
    checkInstagramViaSerpAPI(cleanName),
    checkYouTubeViaSerpAPI(cleanName),
    checkTikTokViaSerpAPI(cleanName),
    checkSubstackViaSerpAPI(cleanName)
  ]);
  
  return {
    x,
    instagram,
    youtube,
    tiktok,
    substack
  };
}
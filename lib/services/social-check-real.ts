// Check social media availability using HTTP status codes like namechk does
export interface SocialCheckResult {
  available: boolean;
  platform: string;
  url: string;
  status?: number;
}

// Check a single URL and return availability based on status code
async function checkURL(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'manual', // Don't follow redirects
      signal: AbortSignal.timeout(3000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DomainChecker/1.0)'
      }
    });
    
    // 404 = available, anything else = taken
    return response.status === 404;
  } catch (error) {
    // Network error often means available
    console.log(`Error checking ${url}:`, error);
    return true;
  }
}

// Check social media availability by actual HTTP requests
export async function checkSocialAvailability(username: string): Promise<Record<string, boolean>> {
  const checks = {
    x: await checkURL(`https://x.com/${username}`),
    instagram: await checkURL(`https://instagram.com/${username}`),
    youtube: await checkURL(`https://youtube.com/@${username}`),
    tiktok: await checkURL(`https://www.tiktok.com/@${username}`),
    github: await checkURL(`https://github.com/${username}`)
  };
  
  return checks;
}

// Check multiple social platforms in parallel
export async function checkAllSocials(username: string): Promise<SocialCheckResult[]> {
  const platforms = [
    { name: 'x', url: `https://x.com/${username}` },
    { name: 'instagram', url: `https://instagram.com/${username}` },
    { name: 'youtube', url: `https://youtube.com/@${username}` },
    { name: 'tiktok', url: `https://www.tiktok.com/@${username}` },
    { name: 'github', url: `https://github.com/${username}` },
    { name: 'linkedin', url: `https://linkedin.com/in/${username}` },
    { name: 'facebook', url: `https://facebook.com/${username}` },
    { name: 'reddit', url: `https://reddit.com/user/${username}` },
    { name: 'pinterest', url: `https://pinterest.com/${username}` },
    { name: 'twitch', url: `https://twitch.tv/${username}` }
  ];
  
  const results = await Promise.allSettled(
    platforms.map(async (platform) => {
      try {
        const response = await fetch(platform.url, {
          method: 'HEAD',
          redirect: 'manual',
          signal: AbortSignal.timeout(3000),
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; DomainChecker/1.0)'
          }
        });
        
        return {
          available: response.status === 404,
          platform: platform.name,
          url: platform.url,
          status: response.status
        };
      } catch (error) {
        // On error, assume available (to be safe)
        return {
          available: true,
          platform: platform.name,
          url: platform.url,
          status: -1
        };
      }
    })
  );
  
  return results
    .filter((result): result is PromiseFulfilledResult<SocialCheckResult> => 
      result.status === 'fulfilled'
    )
    .map(result => result.value);
}

// Get social availability status with icons
export function getSocialStatus(results: Record<string, boolean>): Record<string, string> {
  const status: Record<string, string> = {};
  
  for (const [platform, available] of Object.entries(results)) {
    status[platform] = available ? '' : 'L';
  }
  
  return status;
}
// Actual social media availability checking
// Uses various methods to check if handles are available

async function checkUrlAvailability(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NameSweep/1.0)'
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(5000)
    });
    
    // If we get a 404, the handle is likely available
    return response.status === 404;
  } catch (error) {
    // Network error or timeout might mean available
    return true;
  }
}

export async function checkXAvailability(name: string) {
  const available = await checkUrlAvailability(`https://x.com/${name}`);
  return { 
    status: available ? "✅" : "❌",
    url: `https://x.com/${name}`,
    available
  };
}

export async function checkInstagramAvailability(name: string) {
  const available = await checkUrlAvailability(`https://instagram.com/${name}`);
  return { 
    status: available ? "✅" : "❌",
    url: `https://instagram.com/${name}`,
    available
  };
}

export async function checkYouTubeAvailability(name: string) {
  const available = await checkUrlAvailability(`https://youtube.com/@${name}`);
  return { 
    status: available ? "✅" : "❌",
    url: `https://youtube.com/@${name}`,
    available
  };
}

export async function checkTikTokAvailability(name: string) {
  const available = await checkUrlAvailability(`https://www.tiktok.com/@${name}`);
  return { 
    status: available ? "✅" : "❌",
    url: `https://www.tiktok.com/@${name}`,
    available
  };
}

export async function checkSubstackAvailability(name: string) {
  const [profile, blog] = await Promise.all([
    checkUrlAvailability(`https://substack.com/@${name}`),
    checkUrlAvailability(`https://${name}.substack.com`)
  ]);
  
  const available = profile || blog;
  return { 
    status: available ? "✅" : "❌",
    urls: [
      `https://substack.com/@${name}`,
      `https://${name}.substack.com`
    ],
    available
  };
}

export async function checkSocialsAvailability(name: string) {
  const [x, instagram, youtube, tiktok, substack] = await Promise.all([
    checkXAvailability(name),
    checkInstagramAvailability(name),
    checkYouTubeAvailability(name),
    checkTikTokAvailability(name),
    checkSubstackAvailability(name)
  ]);
  
  return {
    x,
    instagram,
    youtube,
    tiktok,
    substack
  };
}
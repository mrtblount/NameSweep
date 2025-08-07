export async function checkX(name: string) {
  try {
    const res = await fetch(`https://x.com/${name}`, { 
      method: "GET",
      signal: AbortSignal.timeout(5000),
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      },
      redirect: "manual"
    });
    
    if (res.status === 200 || res.status === 301 || res.status === 302) {
      return { status: "❌", url: `https://x.com/${name}` };
    }
    
    return { status: "✅" };
  } catch (error) {
    console.log(`X check error for ${name}:`, error);
    return { status: "✅" };
  }
}

export async function checkInstagram(name: string) {
  try {
    const res = await fetch(`https://www.instagram.com/${name}/`, { 
      method: "GET",
      signal: AbortSignal.timeout(5000),
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      },
      redirect: "manual"
    });
    
    if (res.status === 200 || res.status === 301 || res.status === 302) {
      return { status: "❌", url: `https://instagram.com/${name}` };
    }
    
    return { status: "✅" };
  } catch (error) {
    console.log(`Instagram check error for ${name}:`, error);
    return { status: "✅" };
  }
}

export async function checkYouTube(name: string) {
  try {
    const channelRes = await fetch(`https://www.youtube.com/@${name}`, { 
      method: "GET",
      signal: AbortSignal.timeout(5000),
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      },
      redirect: "manual"
    });
    
    const userRes = await fetch(`https://www.youtube.com/c/${name}`, { 
      method: "GET",
      signal: AbortSignal.timeout(5000),
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      },
      redirect: "manual"
    });
    
    if (channelRes.status === 200 || channelRes.status === 301 || channelRes.status === 302 ||
        userRes.status === 200 || userRes.status === 301 || userRes.status === 302) {
      return { status: "❌", url: `https://youtube.com/@${name}` };
    }
    
    return { status: "✅" };
  } catch (error) {
    console.log(`YouTube check error for ${name}:`, error);
    return { status: "✅" };
  }
}

export async function checkSocials(name: string) {
  const [x, instagram, youtube] = await Promise.all([
    checkX(name),
    checkInstagram(name),
    checkYouTube(name)
  ]);
  
  return {
    x,
    instagram,
    youtube
  };
}
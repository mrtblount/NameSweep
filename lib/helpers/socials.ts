// User-initiated social media checking
// Returns URLs for user to check manually to comply with ToS

export async function checkX(name: string) {
  return { 
    status: "check", 
    url: `https://x.com/${name}`,
    checkRequired: true 
  };
}

export async function checkInstagram(name: string) {
  return { 
    status: "check", 
    url: `https://instagram.com/${name}`,
    checkRequired: true 
  };
}

export async function checkYouTube(name: string) {
  return { 
    status: "check", 
    url: `https://youtube.com/@${name}`,
    checkRequired: true 
  };
}

export async function checkTikTok(name: string) {
  return { 
    status: "check", 
    url: `https://www.tiktok.com/@${name}`,
    checkRequired: true 
  };
}

export async function checkSubstack(name: string) {
  return { 
    status: "check", 
    urls: [
      `https://substack.com/@${name}`,
      `https://${name}.substack.com`
    ],
    checkRequired: true 
  };
}

export async function checkSocials(name: string) {
  const [x, instagram, youtube, tiktok, substack] = await Promise.all([
    checkX(name),
    checkInstagram(name),
    checkYouTube(name),
    checkTikTok(name),
    checkSubstack(name)
  ]);
  
  return {
    x,
    instagram,
    youtube,
    tiktok,
    substack
  };
}
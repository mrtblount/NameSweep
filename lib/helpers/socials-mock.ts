// Common taken usernames on major platforms
const COMMON_TAKEN = [
  'admin', 'test', 'user', 'demo', 'app', 'api', 'help', 'support', 
  'info', 'news', 'blog', 'about', 'contact', 'home', 'login', 'signup',
  'google', 'apple', 'microsoft', 'amazon', 'facebook', 'twitter', 'instagram',
  'youtube', 'netflix', 'spotify', 'uber', 'airbnb', 'tesla', 'nike', 'adidas'
];

export async function checkX(name: string) {
  const normalized = name.toLowerCase();
  
  // Simulate checking - common names are likely taken
  if (COMMON_TAKEN.includes(normalized) || normalized.length <= 3) {
    return { status: "❌", url: `https://x.com/${name}` };
  }
  
  // Random availability for demo purposes (70% available)
  const hash = normalized.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const isAvailable = (hash % 10) > 2;
  
  return isAvailable 
    ? { status: "✅" }
    : { status: "❌", url: `https://x.com/${name}` };
}

export async function checkInstagram(name: string) {
  const normalized = name.toLowerCase();
  
  if (COMMON_TAKEN.includes(normalized) || normalized.length <= 3) {
    return { status: "❌", url: `https://instagram.com/${name}` };
  }
  
  const hash = normalized.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const isAvailable = (hash % 10) > 3;
  
  return isAvailable 
    ? { status: "✅" }
    : { status: "❌", url: `https://instagram.com/${name}` };
}

export async function checkYouTube(name: string) {
  const normalized = name.toLowerCase();
  
  if (COMMON_TAKEN.includes(normalized) || normalized.length <= 3) {
    return { status: "❌", url: `https://youtube.com/@${name}` };
  }
  
  const hash = normalized.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const isAvailable = (hash % 10) > 2;
  
  return isAvailable 
    ? { status: "✅" }
    : { status: "❌", url: `https://youtube.com/@${name}` };
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
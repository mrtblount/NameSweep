import { searchUSPTO } from '@/lib/services/serpapi';

export async function checkTrademark(name: string) {
  try {
    // Use SerpAPI if available
    if (process.env.SERPAPI_KEY) {
      const result = await searchUSPTO(name);
      return {
        status: result.status,
        serial: result.serial || null,
        classes: result.classes
      };
    }
    
    // Fallback: basic Google search
    const searchQuery = `site:tsdr.uspto.gov "${name}"`;
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
    
    const res = await fetch(searchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; NameSweep/1.0)"
      },
      signal: AbortSignal.timeout(5000)
    });
    
    if (!res.ok) {
      return { status: "none", serial: null };
    }
    
    const html = await res.text();
    
    const serialMatch = html.match(/\b\d{8}\b/);
    const hasLive = html.toLowerCase().includes("live") || html.toLowerCase().includes("registered");
    const hasDead = html.toLowerCase().includes("dead") || html.toLowerCase().includes("abandoned");
    
    if (serialMatch) {
      if (hasLive) {
        return { status: "live", serial: serialMatch[0] };
      } else if (hasDead) {
        return { status: "dead", serial: serialMatch[0] };
      }
      return { status: "live", serial: serialMatch[0] };
    }
    
    return { status: "none", serial: null };
  } catch (error) {
    console.error("Trademark search error:", error);
    return { status: "none", serial: null };
  }
}
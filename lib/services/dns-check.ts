export async function checkDNSResolution(domain: string): Promise<boolean> {
  try {
    // Remove any protocol if present
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '');
    
    // Try to resolve DNS using Cloudflare's DNS over HTTPS
    const response = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${cleanDomain}&type=A`,
      {
        headers: { 
          'Accept': 'application/dns-json'
        },
        signal: AbortSignal.timeout(3000) // 3 second timeout
      }
    );
    
    if (!response.ok) {
      return false;
    }
    
    const data = await response.json();
    
    // Check if there are any A records (IP addresses)
    // Status 0 = NOERROR (found), Status 3 = NXDOMAIN (not found)
    return data.Status === 0 && data.Answer && data.Answer.length > 0;
  } catch (error) {
    console.warn(`DNS resolution check failed for ${domain}:`, error);
    // If DNS check fails, assume no resolution
    return false;
  }
}

export async function checkLiveSite(domain: string): Promise<boolean> {
  try {
    // First check DNS
    const hasDNS = await checkDNSResolution(domain);
    if (!hasDNS) return false;
    
    // Try to fetch the domain with a HEAD request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    try {
      const response = await fetch(`https://${domain}`, {
        method: 'HEAD',
        signal: controller.signal,
        redirect: 'follow'
      });
      
      clearTimeout(timeoutId);
      
      // Consider it live if we get any response (even 4xx/5xx)
      return response.ok || response.status < 600;
    } catch (fetchError) {
      // Try HTTP as fallback
      try {
        const httpResponse = await fetch(`http://${domain}`, {
          method: 'HEAD',
          signal: controller.signal,
          redirect: 'follow'
        });
        
        clearTimeout(timeoutId);
        return httpResponse.ok || httpResponse.status < 600;
      } catch {
        clearTimeout(timeoutId);
        return false;
      }
    }
  } catch (error) {
    console.warn(`Live site check failed for ${domain}:`, error);
    return false;
  }
}
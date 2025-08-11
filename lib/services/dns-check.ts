export async function checkDNSResolution(domain: string): Promise<boolean> {
  try {
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '');
    
    // Try multiple DNS record types
    const checks = await Promise.all([
      // Check A records (IPv4)
      fetch(`https://cloudflare-dns.com/dns-query?name=${cleanDomain}&type=A`, {
        headers: { 'Accept': 'application/dns-json' },
        signal: AbortSignal.timeout(3000)
      }),
      // Check AAAA records (IPv6)
      fetch(`https://cloudflare-dns.com/dns-query?name=${cleanDomain}&type=AAAA`, {
        headers: { 'Accept': 'application/dns-json' },
        signal: AbortSignal.timeout(3000)
      }),
      // Check CNAME records
      fetch(`https://cloudflare-dns.com/dns-query?name=${cleanDomain}&type=CNAME`, {
        headers: { 'Accept': 'application/dns-json' },
        signal: AbortSignal.timeout(3000)
      })
    ]);
    
    for (const response of checks) {
      if (response.ok) {
        const data = await response.json();
        // Status codes:
        // 0 = NOERROR (found records)
        // 2 = SERVFAIL (domain exists but no records - parked)
        // 3 = NXDOMAIN (domain doesn't exist - available)
        
        // Has DNS records if status is 0 (NOERROR) and has answers
        if (data.Status === 0 && data.Answer && data.Answer.length > 0) {
          console.log(`DNS found for ${domain}: ${data.Answer[0].type} record`);
          return true;
        }
        
        // Status 2 means domain exists but has no DNS records (parked)
        if (data.Status === 2) {
          console.log(`Domain ${domain} exists but has no DNS records (parked)`);
          // Continue checking other record types
        }
      }
    }
    
    console.log(`No DNS records found for ${domain}`);
    return false;
  } catch (error) {
    console.warn(`DNS check failed for ${domain}:`, error);
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
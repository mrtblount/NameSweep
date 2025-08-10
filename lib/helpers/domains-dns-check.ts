// DNS-based domain availability checking
// More accurate than HTTP requests

export interface DomainResult {
  status: '✅' | '⚠️' | '❌';
  available: boolean;
  premium: boolean;
  price?: number;
}

// Use DNS over HTTPS to check domain availability
async function checkDomainViaDNS(domain: string): Promise<boolean> {
  try {
    // Use Cloudflare's DNS over HTTPS
    const response = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${domain}&type=A`,
      {
        headers: {
          'Accept': 'application/dns-json'
        },
        signal: AbortSignal.timeout(3000)
      }
    );
    
    const data = await response.json();
    
    // If no Answer field or empty Answer array, domain is likely available
    if (!data.Answer || data.Answer.length === 0) {
      return true;
    }
    
    // If NXDOMAIN status, domain doesn't exist (available)
    if (data.Status === 3) {
      return true;
    }
    
    // Domain has DNS records, so it's taken
    return false;
  } catch (error) {
    // On error, try alternative check
    return await checkDomainViaHTTP(domain);
  }
}

// Fallback HTTP check
async function checkDomainViaHTTP(domain: string): Promise<boolean> {
  try {
    const response = await fetch(`https://${domain}`, {
      method: 'HEAD',
      redirect: 'manual',
      signal: AbortSignal.timeout(3000)
    });
    
    // If we get any response, domain is probably taken
    // Most available domains won't resolve at all
    return false;
  } catch (error: any) {
    // Network errors often mean domain doesn't exist
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return true;
    }
    // Timeout might mean it exists but is slow
    if (error.name === 'AbortError') {
      return false;
    }
    // Default to available for other errors
    return true;
  }
}

// Check a single domain with TLD
export async function checkSingleDomain(name: string, tld: string): Promise<DomainResult> {
  const fullDomain = `${name}${tld.startsWith('.') ? tld : '.' + tld}`;
  
  try {
    // First try Porkbun if available
    if (process.env.PORKBUN_API_KEY && process.env.PORKBUN_API_SECRET) {
      // Try Porkbun API (if we fix the endpoint issue)
      // For now, skip to DNS check
    }
    
    // Use DNS checking
    const available = await checkDomainViaDNS(fullDomain);
    
    // Don't mark as premium just based on TLD
    // Premium should only be marked if the domain registrar indicates a premium price
    // For now, we'll only mark as premium if explicitly known
    const isPremium = false; // Will be set by Porkbun API when available
    
    return {
      status: available ? '✅' : '❌',
      available,
      premium: isPremium,
      price: undefined
    };
  } catch (error) {
    console.error(`Error checking domain ${fullDomain}:`, error);
    return {
      status: '❌',
      available: false,
      premium: false
    };
  }
}

// Check multiple domains
export async function checkMultipleDomainsViaDNS(
  name: string,
  tlds: string[] = ['.com', '.co', '.io', '.net']
): Promise<Record<string, DomainResult>> {
  const results: Record<string, DomainResult> = {};
  
  // Check all TLDs in parallel
  const checks = await Promise.allSettled(
    tlds.map(tld => checkSingleDomain(name, tld))
  );
  
  checks.forEach((result, index) => {
    const tld = tlds[index];
    if (result.status === 'fulfilled') {
      results[tld] = result.value;
    } else {
      results[tld] = {
        status: '❌',
        available: false,
        premium: false
      };
    }
  });
  
  return results;
}
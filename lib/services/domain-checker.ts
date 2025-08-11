// Accurate domain availability checking using DNS and registration status

export interface DomainCheckResult {
  available: boolean;
  premium: boolean;
  price?: number;
  status: '✅' | '⚠️' | '❌' | '❓';
  liveSite?: boolean;
  displayText?: string;
  method?: string;
}

// Check DNS to determine if domain exists
async function checkDomainExists(domain: string): Promise<{ exists: boolean; hasRecords: boolean }> {
  try {
    // Check multiple record types
    const types = ['A', 'AAAA', 'CNAME', 'NS'];
    
    for (const type of types) {
      const response = await fetch(
        `https://cloudflare-dns.com/dns-query?name=${domain}&type=${type}`,
        {
          headers: { 'Accept': 'application/dns-json' },
          signal: AbortSignal.timeout(3000)
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        
        // Status codes:
        // 0 = NOERROR (domain exists and has records)
        // 2 = SERVFAIL (domain might exist but query failed)
        // 3 = NXDOMAIN (domain does not exist - available!)
        
        if (data.Status === 3) {
          // NXDOMAIN - domain doesn't exist, it's available!
          return { exists: false, hasRecords: false };
        }
        
        if (data.Status === 0) {
          // Domain exists
          const hasRecords = data.Answer && data.Answer.length > 0;
          
          // For NS records, check if they're just registry defaults
          if (type === 'NS' && hasRecords) {
            // Domain is registered (has NS records)
            return { exists: true, hasRecords: true };
          }
          
          if (hasRecords) {
            return { exists: true, hasRecords: true };
          }
        }
      }
    }
    
    // If we get here, domain likely exists but has no A/AAAA/CNAME records (parked)
    return { exists: true, hasRecords: false };
  } catch (error) {
    console.error(`DNS check error for ${domain}:`, error);
    // On error, assume domain exists to be safe
    return { exists: true, hasRecords: false };
  }
}

export async function checkDomainAvailability(domain: string): Promise<DomainCheckResult> {
  console.log(`Checking domain availability for: ${domain}`);
  
  const { exists, hasRecords } = await checkDomainExists(domain);
  
  if (!exists) {
    // Domain doesn't exist - it's available!
    return {
      available: true,
      premium: false,
      status: '✅',
      displayText: 'available',
      method: 'DNS-NXDOMAIN'
    };
  }
  
  // Domain exists - it's taken
  if (hasRecords) {
    // Has DNS records - likely has a live site
    return {
      available: false,
      premium: false,
      status: '❌',
      liveSite: true,
      displayText: 'live site',
      method: 'DNS-RECORDS'
    };
  } else {
    // No DNS records - domain is parked
    return {
      available: false,
      premium: false,
      status: '❌',
      liveSite: false,
      displayText: 'parked',
      method: 'DNS-PARKED'
    };
  }
}

export async function checkMultipleDomains(
  baseName: string,
  tlds: string[]
): Promise<Record<string, DomainCheckResult>> {
  const results: Record<string, DomainCheckResult> = {};
  
  // Check domains in parallel
  const checks = await Promise.allSettled(
    tlds.map(tld => checkDomainAvailability(`${baseName}${tld}`))
  );
  
  checks.forEach((result, index) => {
    const tld = tlds[index];
    if (result.status === 'fulfilled') {
      results[tld] = result.value;
    } else {
      // On error, mark as unknown
      results[tld] = {
        available: false,
        premium: false,
        status: '❓',
        displayText: 'check failed',
        method: 'ERROR'
      };
    }
  });
  
  return results;
}
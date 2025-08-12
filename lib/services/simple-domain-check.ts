/**
 * Simple domain availability checker
 * Since GoDaddy requires special permissions and Porkbun doesn't have availability API,
 * we'll use a DNS-based approach for basic checking
 */

// Only import dns in Node.js environment, not in Edge runtime
let resolveDns: any;
let resolveNs: any;

if (typeof process !== 'undefined' && process.versions && process.versions.node) {
  const dns = require('dns');
  const { promisify } = require('util');
  resolveDns = promisify(dns.resolve4);
  resolveNs = promisify(dns.resolveNs);
}

export interface SimpleDomainResult {
  available: boolean;
  status: '✅' | '❌' | '❓';
  displayText: string;
  method: string;
}

/**
 * Check if a domain is registered by looking for nameservers
 * This is not 100% accurate but works for most cases
 */
export async function checkDomainSimple(domain: string): Promise<SimpleDomainResult> {
  console.log(`[SimpleDomainCheck] Checking ${domain}`);
  
  // If DNS is not available (Edge runtime), return unable to verify
  if (!resolveNs || !resolveDns) {
    console.log(`[SimpleDomainCheck] DNS not available in Edge runtime`);
    return {
      available: false,
      status: '❓',
      displayText: 'unable to verify (Edge runtime)',
      method: 'ERROR'
    };
  }
  
  try {
    // Check for nameservers - registered domains have them
    const nameservers = await resolveNs(domain);
    console.log(`[SimpleDomainCheck] ${domain} has nameservers:`, nameservers);
    
    // If we found nameservers, domain is taken
    return {
      available: false,
      status: '❌',
      displayText: 'taken (has nameservers)',
      method: 'DNS_NS'
    };
  } catch (error: any) {
    // NXDOMAIN means domain doesn't exist (likely available)
    if (error.code === 'ENOTFOUND' || error.code === 'ENODATA') {
      console.log(`[SimpleDomainCheck] ${domain} has no nameservers (likely available)`);
      
      // Double-check with A records for popular domains
      try {
        await resolveDns(domain);
        // Has A records but no NS? Weird but taken
        return {
          available: false,
          status: '❌',
          displayText: 'taken',
          method: 'DNS_A'
        };
      } catch {
        // No NS and no A records - probably available
        return {
          available: true,
          status: '✅',
          displayText: 'likely available',
          method: 'DNS_CHECK'
        };
      }
    }
    
    // Other errors - can't determine
    console.error(`[SimpleDomainCheck] Error checking ${domain}:`, error.message);
    return {
      available: false,
      status: '❓',
      displayText: 'unable to verify',
      method: 'ERROR'
    };
  }
}

/**
 * Check if domain has a live website
 */
export async function checkWebsiteExists(domain: string): Promise<boolean> {
  try {
    const response = await fetch(`https://${domain}`, {
      method: 'HEAD',
      signal: AbortSignal.timeout(3000),
      redirect: 'follow'
    });
    return response.ok;
  } catch {
    try {
      // Try with www
      const response = await fetch(`https://www.${domain}`, {
        method: 'HEAD',
        signal: AbortSignal.timeout(3000),
        redirect: 'follow'
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}
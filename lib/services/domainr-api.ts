import { DomainCheckResult } from './domain-types';

interface DomainrStatusResponse {
  status: Array<{
    domain: string;
    zone?: string;
    status: string;
    summary?: string;
  }>;
}

/**
 * Check domain availability using Domainr API via RapidAPI
 * https://rapidapi.com/domainr/api/domainr
 */
export async function checkDomainrStatus(domain: string): Promise<DomainCheckResult | null> {
  const apiKey = process.env.RAPIDAPI_DOMAINR_KEY;
  
  if (!apiKey) {
    console.error('[Domainr] Missing RapidAPI key');
    return null;
  }
  
  console.log(`[Domainr] Checking availability for: ${domain}`);
  
  try {
    const response = await fetch(
      `https://domainr.p.rapidapi.com/v2/status?domain=${encodeURIComponent(domain)}`,
      {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': 'domainr.p.rapidapi.com'
        }
      }
    );
    
    if (!response.ok) {
      console.error(`[Domainr] HTTP error for ${domain}: ${response.status}`);
      return null;
    }
    
    const data: DomainrStatusResponse = await response.json();
    console.log(`[Domainr] Response for ${domain}:`, data);
    
    if (!data.status || data.status.length === 0) {
      console.error(`[Domainr] No status data for ${domain}`);
      return null;
    }
    
    const domainStatus = data.status[0];
    const statusString = domainStatus.status || '';
    const summary = domainStatus.summary || '';
    
    // Domainr status codes:
    // - "active" or "inactive" = taken
    // - "undelegated" = available
    // - "unregistered" = available
    // - "priced" = premium domain
    // - "marketed" = aftermarket/for sale
    // - "pending" = pending delete
    // - "disallowed" = cannot be registered
    
    // Check if domain is available
    if (statusString.includes('undelegated') || statusString.includes('unregistered')) {
      return {
        available: true,
        premium: false,
        status: '✅',
        displayText: 'available',
        mock: false
      };
    }
    
    // Check if it's a premium domain
    if (statusString.includes('priced')) {
      // Try to extract price from summary if available
      const priceMatch = summary.match(/\$?([\d,]+)/);
      const price = priceMatch ? parseInt(priceMatch[1].replace(',', '')) : undefined;
      
      return {
        available: true,
        premium: true,
        price,
        status: '⚠️',
        displayText: price ? `premium $${price}` : 'premium',
        mock: false
      };
    }
    
    // Check if it's for sale in aftermarket
    if (statusString.includes('marketed')) {
      return {
        available: false,
        premium: false,
        status: '⚠️',
        displayText: 'for sale',
        mock: false
      };
    }
    
    // Check if domain cannot be registered
    if (statusString.includes('disallowed')) {
      return {
        available: false,
        premium: false,
        status: '❌',
        displayText: 'restricted',
        mock: false
      };
    }
    
    // Domain is taken (active, inactive, or other status)
    if (statusString.includes('active') || statusString.includes('inactive')) {
      // Try to check if site is live
      try {
        const { checkIfSiteIsLive } = await import('./whois-check');
        const siteCheck = await checkIfSiteIsLive(domain);
        return {
          available: false,
          premium: false,
          status: '❌',
          liveSite: siteCheck.isLive,
          liveUrl: siteCheck.workingUrl,
          displayText: siteCheck.isLive ? 'has live site' : 'parked',
          mock: false
        };
      } catch {
        return {
          available: false,
          premium: false,
          status: '❌',
          displayText: 'taken',
          mock: false
        };
      }
    }
    
    // Unknown status - treat as taken
    console.warn(`[Domainr] Unknown status for ${domain}: ${statusString}`);
    return {
      available: false,
      premium: false,
      status: '❌',
      displayText: 'taken',
      mock: false
    };
    
  } catch (error) {
    console.error(`[Domainr] Request failed for ${domain}:`, error);
    return null;
  }
}

/**
 * Check multiple domains in parallel using Domainr API
 * No rate limiting issues like Porkbun!
 */
export async function checkDomainrBatch(
  baseName: string,
  tlds: string[]
): Promise<Record<string, DomainCheckResult>> {
  const results: Record<string, DomainCheckResult> = {};
  
  // Check all domains in parallel - Domainr can handle it
  const checks = await Promise.allSettled(
    tlds.map(async (tld) => {
      const domain = `${baseName}${tld}`;
      const result = await checkDomainrStatus(domain);
      return { tld, result };
    })
  );
  
  checks.forEach((check) => {
    if (check.status === 'fulfilled') {
      const { tld, result } = check.value;
      if (result) {
        results[tld] = result;
      } else {
        // If Domainr check failed, return unable to verify
        results[tld] = {
          available: false,
          premium: false,
          status: '❓',
          displayText: 'unable to verify',
          mock: true
        };
      }
    }
  });
  
  return results;
}
// CRITICAL: This service MUST return real domain availability data
// It should NEVER lie or return fake data

import { checkDNSResolution } from './dns-check';

const GODADDY_API_BASE = 'https://api.godaddy.com/v1';

interface GoDaddyAvailableResponse {
  available: boolean;
  domain: string;
  price?: number;
  currency?: string;
  definitive?: boolean;
  message?: string;
  code?: string;
}

export interface DomainCheckResult {
  available: boolean;
  premium: boolean;
  price?: number;
  status: '✅' | '⚠️' | '❌' | '❓';
  liveSite?: boolean;
  displayText?: string;
  mock?: boolean;
}

/**
 * Check domain availability using GoDaddy API
 * CRITICAL: This must return accurate data - never guess or lie about availability
 */
export async function checkGoDaddyAvailability(domain: string): Promise<DomainCheckResult> {
  const apiKey = process.env.GODADDY_API_KEY;
  const apiSecret = process.env.GODADDY_API_SECRET;
  
  // Log environment variable status for debugging
  console.log(`[GoDaddy] Checking ${domain}`);
  console.log(`[GoDaddy] ENV status: KEY=${apiKey?.substring(0,5)}..., SECRET=${apiSecret ? 'SET' : 'NOT SET'}`);
  
  if (!apiKey || !apiSecret) {
    console.error('[GoDaddy] CRITICAL: API credentials missing!');
    console.error('[GoDaddy] Make sure GODADDY_API_KEY and GODADDY_API_SECRET are set in Vercel Environment Variables');
    throw new Error('GoDaddy API credentials not configured');
  }

  try {
    const url = `${GODADDY_API_BASE}/domains/available?domain=${domain}&checkType=FULL`;
    console.log(`[GoDaddy] Calling: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `sso-key ${apiKey}:${apiSecret}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    console.log(`[GoDaddy] Response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[GoDaddy] API error (${response.status}):`, errorText);
      
      if (response.status === 401 || response.status === 403) {
        console.error('[GoDaddy] Authentication failed - check if API keys are correct');
        console.error('[GoDaddy] Make sure you are using PRODUCTION keys, not OTE');
      }
      
      throw new Error(`GoDaddy API error: ${response.status}`);
    }

    const data: GoDaddyAvailableResponse = await response.json();
    console.log(`[GoDaddy] Success! Response:`, data);
    
    // If domain is AVAILABLE
    if (data.available === true) {
      const price = data.price ? Math.round(data.price / 1000000) : 0; // Convert from micros
      const isPremium = price >= 249;
      
      console.log(`[GoDaddy] ${domain} is AVAILABLE. Price: $${price}`);
      
      return {
        available: true,
        premium: isPremium,
        price,
        status: isPremium ? '⚠️' : '✅',
        displayText: isPremium ? `premium $${price}` : 'available',
        mock: false
      };
    } 
    
    // Domain is TAKEN
    console.log(`[GoDaddy] ${domain} is TAKEN. Checking for live site...`);
    
    let hasLiveSite = false;
    
    // Try to access the site
    try {
      const siteResponse = await fetch(`https://${domain}`, {
        method: 'HEAD',
        signal: AbortSignal.timeout(3000),
        redirect: 'follow'
      });
      
      hasLiveSite = siteResponse.ok || (siteResponse.status >= 300 && siteResponse.status < 400);
      console.log(`[GoDaddy] Site check: ${hasLiveSite ? 'LIVE' : 'NO SITE'}`);
    } catch (error) {
      console.log(`[GoDaddy] Site check failed:`, error);
      // Try DNS as fallback
      try {
        hasLiveSite = await checkDNSResolution(domain);
        console.log(`[GoDaddy] DNS check: ${hasLiveSite ? 'HAS DNS' : 'NO DNS'}`);
      } catch {
        hasLiveSite = false;
      }
    }
    
    return {
      available: false,
      premium: false,
      status: '❌',
      liveSite: hasLiveSite,
      displayText: hasLiveSite ? 'has live site' : 'parked',
      mock: false
    };
    
  } catch (error) {
    console.error(`[GoDaddy] FAILED for ${domain}:`, error);
    throw error;
  }
}

// For bulk checking
export async function checkMultipleDomainsGoDaddy(
  baseName: string,
  tlds: string[]
): Promise<Record<string, DomainCheckResult>> {
  const results: Record<string, DomainCheckResult> = {};
  
  // Check all domains in parallel
  const checks = await Promise.allSettled(
    tlds.map(tld => checkGoDaddyAvailability(`${baseName}${tld}`))
  );

  checks.forEach((result, index) => {
    const tld = tlds[index];
    if (result.status === 'fulfilled') {
      results[tld] = result.value;
    } else {
      console.error(`[GoDaddy] Failed for ${baseName}${tld}:`, result.reason);
      // Don't guess - return unable to verify
      results[tld] = {
        available: false,
        premium: false,
        status: '❓',
        displayText: 'unable to verify',
        mock: true
      };
    }
  });

  return results;
}
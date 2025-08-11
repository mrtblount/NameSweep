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

export async function checkGoDaddyAvailability(domain: string): Promise<DomainCheckResult> {
  const apiKey = process.env.GODADDY_API_KEY;
  const apiSecret = process.env.GODADDY_API_SECRET;
  
  if (!apiKey || !apiSecret) {
    console.warn('GoDaddy API credentials not configured');
    throw new Error('GoDaddy API credentials not configured');
  }

  try {
    console.log(`Checking GoDaddy availability for: ${domain}`);
    
    const response = await fetch(
      `${GODADDY_API_BASE}/domains/available?domain=${domain}&checkType=FULL`,
      {
        headers: {
          'Authorization': `sso-key ${apiKey}:${apiSecret}`,
          'Accept': 'application/json'
        },
        signal: AbortSignal.timeout(5000) // 5 second timeout
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`GoDaddy API error (${response.status}):`, errorText);
      throw new Error(`GoDaddy API error: ${response.status}`);
    }

    const data: GoDaddyAvailableResponse = await response.json();
    console.log(`GoDaddy response for ${domain}:`, data);
    
    if (data.available) {
      const price = data.price || 0;
      const isPremium = price >= 249;
      
      return {
        available: true,
        premium: isPremium,
        price,
        status: isPremium ? '⚠️' : '✅',
        displayText: isPremium ? `premium $${price}` : 'available',
        mock: false
      };
    } else {
      // Domain is taken - check if has live site
      const hasLiveSite = await checkDNSResolution(domain);
      
      return {
        available: false,
        premium: false,
        status: '❌',
        liveSite: hasLiveSite,
        displayText: hasLiveSite ? 'live site' : 'parked',
        mock: false
      };
    }
  } catch (error) {
    console.error(`GoDaddy check failed for ${domain}:`, error);
    throw error;
  }
}

export async function checkMultipleDomainsGoDaddy(
  baseName: string,
  tlds: string[]
): Promise<Record<string, DomainCheckResult>> {
  const results: Record<string, DomainCheckResult> = {};
  
  const checks = await Promise.allSettled(
    tlds.map(tld => checkGoDaddyAvailability(`${baseName}${tld}`))
  );

  checks.forEach((result, index) => {
    const tld = tlds[index];
    if (result.status === 'fulfilled') {
      results[tld] = result.value;
    } else {
      console.warn(`GoDaddy check failed for ${baseName}${tld}:`, result.reason);
      results[tld] = {
        available: false,
        premium: false,
        status: '❓',
        displayText: 'check failed',
        mock: true
      };
    }
  });

  return results;
}
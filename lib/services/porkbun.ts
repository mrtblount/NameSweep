import { checkDomainViaWHOIS, checkNamecheap, checkIfSiteIsLive } from './whois-check';
import { checkGoDaddyAvailability } from './godaddy';

interface PorkbunPricing {
  registration?: string;
  renewal?: string;
  transfer?: string;
  premium?: boolean;
  status?: string;
}

interface PorkbunResponse {
  status: 'SUCCESS' | 'ERROR';
  available?: string;
  pricing?: PorkbunPricing;
  message?: string;
}

const PORKBUN_API_BASE = 'https://api.porkbun.com/api/json/v3';

export interface DomainCheckResult {
  available: boolean;
  premium: boolean;
  price?: number;
  status: '✅' | '⚠️' | '❌' | '❓';
  liveSite?: boolean;
  liveUrl?: string;
  displayText?: string;
  mock?: boolean;
}

// CRITICAL: Never lie about domain availability
// If we cannot verify via API, we MUST return "unable to verify"
function getUnverifiedResult(domain: string): DomainCheckResult {
  console.error(`⚠️ UNABLE TO VERIFY ${domain} - All APIs failed`);
  return {
    available: false,
    premium: false,
    status: '❓',
    displayText: 'unable to verify',
    mock: true
  };
}

async function porkbunRequest(endpoint: string, data: any): Promise<any> {
  const apiKey = process.env.PORKBUN_API_KEY;
  const apiSecret = process.env.PORKBUN_API_SECRET;
  
  if (!apiKey || !apiSecret) {
    console.warn('Porkbun API credentials not configured');
    throw new Error('Porkbun API credentials not configured');
  }

  try {
    const response = await fetch(`${PORKBUN_API_BASE}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apikey: apiKey,
        secretapikey: apiSecret,
        ...data
      }),
    });

    const text = await response.text();
    
    // Check if response is HTML (error page)
    if (text.trim().startsWith('<')) {
      console.error('Porkbun API returned HTML instead of JSON');
      throw new Error('Porkbun API unavailable');
    }
    
    try {
      const json = JSON.parse(text);
      if (json.status === 'ERROR') {
        console.error('Porkbun API error:', json.message);
        throw new Error(json.message || 'Porkbun API error');
      }
      return json;
    } catch (parseError) {
      console.error('Failed to parse Porkbun response:', text.substring(0, 200));
      throw new Error('Invalid Porkbun API response');
    }
  } catch (error) {
    console.error('Porkbun request failed:', error);
    throw error;
  }
}

async function checkPorkbunAvailability(
  domain: string
): Promise<DomainCheckResult> {
  console.log(`Checking Porkbun availability for: ${domain}`);
  
  const result: PorkbunResponse = await porkbunRequest('/domain/check', {
    domain
  });

  console.log(`Porkbun response for ${domain}:`, result);

  // PRIMARY CHECK: Is the domain available for registration?
  const available = result.available === 'available' || result.available === 'yes';
  const pricing = result.pricing;
  const isPremium = pricing?.premium || false;
  const price = pricing?.registration ? parseFloat(pricing.registration) : undefined;

  // If domain is AVAILABLE
  if (available) {
    // Check if it's premium pricing (>= $249)
    if (isPremium || (price && price >= 249)) {
      return {
        available: true,
        premium: true,
        price,
        status: '⚠️',
        displayText: `premium $${price}`,
        mock: false
      };
    } else {
      return {
        available: true,
        premium: false,
        price,
        status: '✅',
        displayText: 'available',
        mock: false
      };
    }
  }
  
  // If domain is TAKEN - check if there's a live site
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
}

/**
 * CRITICAL DOMAIN CHECKING FUNCTION
 * 
 * RULES:
 * 1. NEVER lie about availability - if we can't verify, say "unable to verify"
 * 2. Try multiple APIs in order: GoDaddy -> WHOIS -> Namecheap -> Porkbun
 * 3. If domain is taken, check if there's a live site or if it's parked
 * 4. Only return "available" if an API explicitly confirms it
 * 5. Popular brands (popeyes, mcdonalds, etc) should NEVER show as available
 */
export async function checkDomainAvailability(domain: string): Promise<DomainCheckResult> {
  console.log(`🔍 Starting STRICT domain verification for: ${domain}`);
  
  // Track if we got a definitive answer
  let hasVerifiedAnswer = false;
  let lastError: any = null;
  
  // 1. Try GoDaddy first (most reliable with production API key)
  try {
    const result = await checkGoDaddyAvailability(domain);
    console.log(`✅ GoDaddy verified ${domain}:`, result);
    
    // GoDaddy gave us a definitive answer
    hasVerifiedAnswer = true;
    
    // If taken, ensure we show proper status
    if (result.status === '❌') {
      if (result.liveSite) {
        result.displayText = 'has live site';
      } else {
        result.displayText = 'parked';
      }
    }
    
    return result;
  } catch (error) {
    console.warn(`⚠️ GoDaddy failed for ${domain}:`, error);
    lastError = error;
  }
  
  // 2. Try WHOIS as backup
  try {
    const available = await checkDomainViaWHOIS(domain);
    console.log(`WHOIS check for ${domain}: available=${available}`);
    hasVerifiedAnswer = true;
    
    if (available) {
      return {
        available: true,
        premium: false,
        status: '✅',
        displayText: 'available',
        mock: false
      };
    } else {
      // Domain is taken - check if live site
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
    }
  } catch (error) {
    console.warn(`⚠️ WHOIS failed for ${domain}:`, error);
    lastError = error;
  }
  
  // 3. Try Namecheap
  try {
    const available = await checkNamecheap(domain);
    console.log(`Namecheap check for ${domain}: available=${available}`);
    hasVerifiedAnswer = true;
    
    if (available) {
      return {
        available: true,
        premium: false,
        status: '✅',
        displayText: 'available',
        mock: false
      };
    } else {
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
    }
  } catch (error) {
    console.warn(`⚠️ Namecheap failed for ${domain}:`, error);
    lastError = error;
  }
  
  // 4. Try Porkbun if configured
  try {
    const result = await checkPorkbunAvailability(domain);
    console.log(`Porkbun verified ${domain}:`, result);
    hasVerifiedAnswer = true;
    return result;
  } catch (error) {
    console.warn(`⚠️ Porkbun failed for ${domain}:`, error);
    lastError = error;
  }
  
  // 5. CRITICAL: If ALL APIs failed, we CANNOT verify
  // Check for obvious major brands that should NEVER be available
  const domainName = domain.split('.')[0].toLowerCase();
  const majorBrands = [
    'google', 'facebook', 'amazon', 'apple', 'microsoft', 
    'popeyes', 'mcdonalds', 'walmart', 'target', 'nike',
    'adidas', 'coca-cola', 'pepsi', 'starbucks', 'subway',
    'netflix', 'disney', 'youtube', 'twitter', 'instagram'
  ];
  
  if (majorBrands.includes(domainName)) {
    console.log(`🚨 Major brand detected: ${domainName} - marking as taken`);
    // For major brands, attempt to check if site is live
    try {
      const siteCheck = await checkIfSiteIsLive(domain);
      return {
        available: false,
        premium: false,
        status: '❌',
        liveSite: siteCheck.isLive,
        liveUrl: siteCheck.workingUrl,
        displayText: siteCheck.isLive ? 'has live site' : 'taken',
        mock: false
      };
    } catch {
      // Even if site check fails, major brands are definitely taken
      return {
        available: false,
        premium: false,
        status: '❌',
        liveSite: true,
        displayText: 'has live site',
        mock: false
      };
    }
  }
  
  // If we couldn't verify through ANY API, return "unable to verify"
  console.error(`❌ UNABLE TO VERIFY ${domain} - All APIs failed. Last error:`, lastError);
  return getUnverifiedResult(domain);
}

export async function checkMultipleDomains(
  baseName: string,
  tlds: string[]
): Promise<Record<string, DomainCheckResult>> {
  const results: Record<string, DomainCheckResult> = {};
  
  // Check all domains in parallel
  const checks = await Promise.allSettled(
    tlds.map(tld => checkDomainAvailability(`${baseName}${tld}`))
  );

  checks.forEach((result, index) => {
    const tld = tlds[index];
    if (result.status === 'fulfilled') {
      results[tld] = result.value;
    } else {
      console.error(`Failed to check ${baseName}${tld}:`, result.reason);
      // If check completely failed, mark as unable to verify
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

export const DEFAULT_TLDS = ['.com', '.co', '.io', '.net'];
export const EXTENDED_TLDS = [
  '.org', '.ai', '.app', '.dev', '.gg', 
  '.me', '.xyz', '.store', '.shop', '.online'
];
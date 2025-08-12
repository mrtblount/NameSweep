import { checkIfSiteIsLive } from './whois-check';
import { checkDomainSimple, checkWebsiteExists } from './simple-domain-check';
import { checkWhoisXMLAPI, checkWhoisXMLAPIFast } from './whoisxmlapi';

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

// Note: Porkbun API credentials in .env.local are valid but cannot be used for domain availability
// The API only supports domain management operations, not availability checking

/**
 * SIMPLIFIED DOMAIN CHECKING FUNCTION
 * 
 * Using only WhoisXMLAPI for accurate domain availability checking
 * Falls back to DNS-based checking if WhoisXMLAPI fails
 */
export async function checkDomainAvailability(domain: string): Promise<DomainCheckResult> {
  console.log(`🔍 Checking domain availability for: ${domain}`);
  
  // 1. Primary: Use WhoisXMLAPI (most reliable)
  try {
    const result = await checkWhoisXMLAPI(domain);
    console.log(`✅ WhoisXMLAPI verified ${domain}:`, result);
    return result;
  } catch (error) {
    console.warn(`⚠️ WhoisXMLAPI failed for ${domain}:`, error);
  }
  
  // 2. Fallback: Check for obvious major brands
  const domainName = domain.split('.')[0].toLowerCase();
  const majorBrands = [
    'google', 'facebook', 'amazon', 'apple', 'microsoft', 
    'popeyes', 'mcdonalds', 'walmart', 'target', 'nike',
    'adidas', 'coca-cola', 'pepsi', 'starbucks', 'subway',
    'netflix', 'disney', 'youtube', 'twitter', 'instagram'
  ];
  
  if (majorBrands.includes(domainName)) {
    console.log(`🚨 Major brand detected: ${domainName} - marking as taken`);
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
  
  // 3. Last resort: DNS-based checking
  console.log(`🔍 Falling back to DNS-based check for ${domain}`);
  try {
    const dnsResult = await checkDomainSimple(domain);
    console.log(`DNS check result for ${domain}:`, dnsResult);
    
    if (dnsResult.available) {
      return {
        available: true,
        premium: false,
        status: '✅',
        displayText: 'likely available',
        mock: false
      };
    } else if (dnsResult.status === '❌') {
      const hasLiveSite = await checkWebsiteExists(domain);
      return {
        available: false,
        premium: false,
        status: '❌',
        liveSite: hasLiveSite,
        displayText: hasLiveSite ? 'has live site' : 'taken',
        mock: false
      };
    }
  } catch (dnsError) {
    console.error(`DNS check also failed for ${domain}:`, dnsError);
  }
  
  // If all methods fail, return "unable to verify"
  console.error(`❌ Unable to verify ${domain} - WhoisXMLAPI and DNS both failed`);
  return getUnverifiedResult(domain);
}

// Fast version for when speed is critical (no live site checking)
export async function checkMultipleDomainsFast(
  baseName: string,
  tlds: string[]
): Promise<Record<string, DomainCheckResult>> {
  const results: Record<string, DomainCheckResult> = {};
  
  // Check all domains in parallel with fast API
  const checks = await Promise.allSettled(
    tlds.map(async (tld) => {
      try {
        const result = await checkWhoisXMLAPIFast(`${baseName}${tld}`);
        return { tld, result };
      } catch (error) {
        return {
          tld,
          result: {
            available: false,
            premium: false,
            status: '❓',
            displayText: 'unable to verify',
            mock: true
          }
        };
      }
    })
  );

  checks.forEach((result) => {
    if (result.status === 'fulfilled') {
      const { tld, result: domainResult } = result.value;
      results[tld] = domainResult;
    }
  });

  return results;
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
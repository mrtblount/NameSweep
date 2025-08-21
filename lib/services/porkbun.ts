import { checkIfSiteIsLive } from './whois-check';
import { checkDomainrStatus, checkDomainrBatch } from './domainr-api';

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
  console.error(`⚠️ UNABLE TO VERIFY ${domain} - API failed`);
  return {
    available: false,
    premium: false,
    status: '❓',
    displayText: 'unable to verify',
    mock: true
  };
}

/**
 * SIMPLIFIED DOMAIN CHECKING FUNCTION
 * 
 * Using Domainr API for accurate domain availability checking
 * Falls back to known brands check if API fails
 */
export async function checkDomainAvailability(domain: string): Promise<DomainCheckResult> {
  console.log(`🔍 Checking domain availability for: ${domain}`);
  
  // 1. Primary: Use Domainr API
  try {
    const domainrResult = await checkDomainrStatus(domain);
    if (domainrResult) {
      console.log(`✅ Domainr verified ${domain}:`, domainrResult);
      return domainrResult;
    }
  } catch (error) {
    console.warn(`⚠️ Domainr API failed for ${domain}:`, error);
  }
  
  // 2. Fallback: Check for obvious major brands
  const domainName = domain.split('.')[0].toLowerCase();
  const majorBrands = [
    'google', 'facebook', 'amazon', 'apple', 'microsoft', 
    'openai', 'anthropic', 'tesla', 'netflix', 'spotify',
    'uber', 'airbnb', 'twitter', 'x', 'meta', 'instagram',
    'youtube', 'tiktok', 'snapchat', 'linkedin', 'reddit',
    'mcdonalds', 'walmart', 'target', 'nike', 'adidas',
    'coca-cola', 'pepsi', 'starbucks', 'disney', 'paypal'
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
  
  // If Domainr fails and it's not a major brand, return "unable to verify"
  console.error(`❌ Unable to verify ${domain} - Domainr API failed`);
  return getUnverifiedResult(domain);
}

// Fast version uses Domainr's batch checking (no rate limiting!)
export async function checkMultipleDomainsFast(
  baseName: string,
  tlds: string[]
): Promise<Record<string, DomainCheckResult>> {
  return checkDomainrBatch(baseName, tlds);
}

export async function checkMultipleDomains(
  baseName: string,
  tlds: string[]
): Promise<Record<string, DomainCheckResult>> {
  // Use Domainr's batch checking for both regular and fast checks
  return checkDomainrBatch(baseName, tlds);
}

export const DEFAULT_TLDS = ['.com', '.co', '.io', '.net'];
export const EXTENDED_TLDS = [
  '.org', '.ai', '.app', '.dev', '.gg', 
  '.me', '.xyz', '.store', '.shop', '.online'
];
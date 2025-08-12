/**
 * WhoisXMLAPI Domain Availability Checker
 * Docs: https://domain-availability.whoisxmlapi.com/api/documentation
 * Free tier: 100 requests for Domain Availability API
 * WHOIS API: 454 requests available
 * Rate limit: 30 requests per second
 */

import { DomainCheckResult } from './porkbun';
import { checkIfSiteIsLive } from './whois-check';

interface WhoisXMLAPIResponse {
  DomainInfo: {
    domainAvailability: 'AVAILABLE' | 'UNAVAILABLE' | 'UNKNOWN';
    domainName: string;
  };
}

interface WhoisRecord {
  domainName?: string;
  createdDate?: string;
  updatedDate?: string;
  expiresDate?: string;
  status?: string;
  registrarName?: string;
  dataError?: string;
}

interface WhoisAPIResponse {
  WhoisRecord?: WhoisRecord;
}

const WHOISXML_API_BASE = 'https://domain-availability.whoisxmlapi.com/api/v1';
const WHOIS_API_BASE = 'https://www.whoisxmlapi.com/whoisserver/WhoisService';

/**
 * Try to get WHOIS data for more detailed domain information
 * This uses a separate quota (454 requests) from the Domain Availability API
 */
async function getWhoisData(domain: string): Promise<WhoisRecord | null> {
  const apiKey = process.env.WHOISXML_API_KEY;
  
  if (!apiKey) {
    return null;
  }

  try {
    const url = new URL(WHOIS_API_BASE);
    url.searchParams.append('apiKey', apiKey);
    url.searchParams.append('domainName', domain);
    url.searchParams.append('outputFormat', 'JSON');

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn(`[WhoisAPI] Failed to get WHOIS data for ${domain}: ${response.status}`);
      return null;
    }

    const data: WhoisAPIResponse = await response.json();
    return data.WhoisRecord || null;
  } catch (error) {
    console.warn(`[WhoisAPI] Error getting WHOIS data for ${domain}:`, error);
    return null;
  }
}

// Fast version without WHOIS fallback - for speed-critical operations
export async function checkWhoisXMLAPIFast(domain: string): Promise<DomainCheckResult> {
  const apiKey = process.env.WHOISXML_API_KEY;
  
  if (!apiKey) {
    throw new Error('WhoisXMLAPI key not configured');
  }

  try {
    const response = await fetch(
      `https://domain-availability.whoisxmlapi.com/api/v1?apiKey=${apiKey}&domainName=${domain}&outputFormat=JSON`,
      { signal: AbortSignal.timeout(2000) } // 2 second timeout for better reliability
    );

    if (!response.ok) {
      throw new Error(`WhoisXMLAPI error: ${response.status}`);
    }

    const data: WhoisXMLAPIResponse = await response.json();
    const availability = data.DomainInfo?.domainAvailability;

    if (availability === 'AVAILABLE') {
      return {
        available: true,
        premium: false,
        status: '✅',
        displayText: 'available',
        mock: false
      };
    } else {
      return {
        available: false,
        premium: false,
        status: '❌',
        displayText: 'taken',
        liveSite: false,
        mock: false
      };
    }
  } catch (error) {
    throw error;
  }
}

export async function checkWhoisXMLAPI(domain: string): Promise<DomainCheckResult> {
  const apiKey = process.env.WHOISXML_API_KEY;
  
  if (!apiKey) {
    console.warn('WhoisXMLAPI key not configured');
    throw new Error('WhoisXMLAPI key not configured');
  }

  console.log(`[WhoisXMLAPI] Checking availability for: ${domain}`);

  // First, try to get WHOIS data for better accuracy (uses separate quota)
  const whoisData = await getWhoisData(domain);
  if (whoisData) {
    console.log(`[WhoisXMLAPI] Got WHOIS data for ${domain}`);
    
    // If WHOIS data exists and has a domain name, it's taken
    if (whoisData.domainName && !whoisData.dataError) {
      const siteCheck = await checkIfSiteIsLive(domain);
      
      // Add expiry date info if available
      let displayText = siteCheck.isLive ? 'has live site' : 'parked';
      if (whoisData.expiresDate) {
        const expiryDate = new Date(whoisData.expiresDate);
        const daysUntilExpiry = Math.floor((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        if (daysUntilExpiry < 90 && daysUntilExpiry > 0) {
          displayText += ` (expires soon)`;
        }
      }
      
      return {
        available: false,
        premium: false,
        status: '❌',
        liveSite: siteCheck.isLive,
        liveUrl: siteCheck.workingUrl,
        displayText,
        mock: false
      };
    }
    
    // If WHOIS has data error or no domain name, it's likely available
    if (whoisData.dataError === 'MISSING_WHOIS_DATA' || !whoisData.domainName) {
      return {
        available: true,
        premium: false,
        status: '✅',
        displayText: 'available',
        mock: false
      };
    }
  }

  // Fall back to Domain Availability API if WHOIS didn't work
  try {
    const url = new URL(WHOISXML_API_BASE);
    url.searchParams.append('apiKey', apiKey);
    url.searchParams.append('domainName', domain);
    url.searchParams.append('outputFormat', 'JSON');

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid WhoisXMLAPI key');
      }
      if (response.status === 402) {
        throw new Error('WhoisXMLAPI quota exceeded');
      }
      throw new Error(`WhoisXMLAPI error: ${response.status}`);
    }

    const data: WhoisXMLAPIResponse = await response.json();
    console.log(`[WhoisXMLAPI] Domain Availability Response for ${domain}:`, data);

    const availability = data.DomainInfo?.domainAvailability;

    if (availability === 'AVAILABLE') {
      return {
        available: true,
        premium: false,
        status: '✅',
        displayText: 'available',
        mock: false
      };
    } else if (availability === 'UNAVAILABLE') {
      // Domain is taken - check if there's a live site
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
    } else {
      // UNKNOWN status
      console.warn(`[WhoisXMLAPI] Unknown availability status for ${domain}`);
      throw new Error('Unable to determine availability');
    }
  } catch (error) {
    console.error(`[WhoisXMLAPI] Error checking ${domain}:`, error);
    throw error;
  }
}
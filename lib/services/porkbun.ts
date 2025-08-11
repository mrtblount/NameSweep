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
  mock?: boolean;
}

// Mock data for when API is unavailable
function getMockDomainResult(domain: string): DomainCheckResult {
  const tld = domain.substring(domain.lastIndexOf('.'));
  const name = domain.substring(0, domain.lastIndexOf('.'));
  
  // Simulate some domains being taken
  const commonNames = ['google', 'facebook', 'amazon', 'apple', 'microsoft', 'test', 'example'];
  const isCommon = commonNames.some(common => name.toLowerCase().includes(common));
  
  // .com domains are more likely to be taken
  const comTakenChance = isCommon ? 0.95 : 0.3;
  const otherTakenChance = isCommon ? 0.7 : 0.1;
  
  const takenChance = tld === '.com' ? comTakenChance : otherTakenChance;
  const available = Math.random() > takenChance;
  
  // Premium domains
  const isPremium = available && Math.random() < 0.1;
  const price = isPremium ? Math.floor(Math.random() * 2000) + 500 : undefined;
  
  let status: '✅' | '⚠️' | '❌' | '❓' = '❌';
  if (available && !isPremium) {
    status = '✅';
  } else if (available && isPremium) {
    status = '⚠️';
  }
  
  return {
    available,
    premium: isPremium,
    price,
    status,
    mock: true
  };
}

async function porkbunRequest(endpoint: string, data: any): Promise<any> {
  const apiKey = process.env.PORKBUN_API_KEY;
  const apiSecret = process.env.PORKBUN_API_SECRET;
  
  if (!apiKey || !apiSecret) {
    console.warn('Porkbun API credentials not configured, using mock data');
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

export async function checkDomainAvailability(
  domain: string
): Promise<DomainCheckResult> {
  try {
    const result: PorkbunResponse = await porkbunRequest('/domain/check', {
      domain
    });

    const available = result.available === 'available';
    const pricing = result.pricing;
    const isPremium = pricing?.premium || false;
    const price = pricing?.registration ? parseFloat(pricing.registration) : undefined;

    let status: '✅' | '⚠️' | '❌' | '❓' = '❌';
    if (available && !isPremium) {
      status = '✅';
    } else if (available && isPremium) {
      status = '⚠️';
    }

    return {
      available,
      premium: isPremium,
      price,
      status,
      mock: false
    };
  } catch (error) {
    console.warn(`Domain check failed for ${domain}, using mock data:`, error);
    // Return mock data when API fails
    return getMockDomainResult(domain);
  }
}

export async function checkMultipleDomains(
  baseName: string,
  tlds: string[]
): Promise<Record<string, DomainCheckResult>> {
  const results: Record<string, DomainCheckResult> = {};
  
  const checks = await Promise.allSettled(
    tlds.map(tld => checkDomainAvailability(`${baseName}${tld}`))
  );

  checks.forEach((result, index) => {
    const tld = tlds[index];
    if (result.status === 'fulfilled') {
      results[tld] = result.value;
    } else {
      results[tld] = {
        available: false,
        premium: false,
        status: '❓',
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
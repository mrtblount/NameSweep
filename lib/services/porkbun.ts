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

const PORKBUN_API_BASE = 'https://porkbun.com/api/json/v3';

export interface DomainCheckResult {
  available: boolean;
  premium: boolean;
  price?: number;
  status: '✅' | '⚠️' | '❌';
}

async function porkbunRequest(endpoint: string, data: any): Promise<any> {
  const apiKey = process.env.PORKBUN_API_KEY;
  const apiSecret = process.env.PORKBUN_API_SECRET;
  
  if (!apiKey || !apiSecret) {
    throw new Error('Porkbun API credentials not configured');
  }

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

  if (!response.ok) {
    throw new Error(`Porkbun API error: ${response.statusText}`);
  }

  return response.json();
}

export async function checkDomainAvailability(
  domain: string
): Promise<DomainCheckResult> {
  try {
    const result: PorkbunResponse = await porkbunRequest('/domain/check', {
      domain
    });

    if (result.status === 'ERROR') {
      console.error('Porkbun error:', result.message);
      return {
        available: false,
        premium: false,
        status: '❌'
      };
    }

    const available = result.available === 'available';
    const pricing = result.pricing;
    const isPremium = pricing?.premium || false;
    const price = pricing?.registration ? parseFloat(pricing.registration) : undefined;

    let status: '✅' | '⚠️' | '❌' = '❌';
    if (available && !isPremium) {
      status = '✅';
    } else if (available && isPremium) {
      status = '⚠️';
    }

    return {
      available,
      premium: isPremium,
      price,
      status
    };
  } catch (error) {
    console.error('Domain check error:', error);
    return {
      available: false,
      premium: false,
      status: '❌'
    };
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
        status: '❌'
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
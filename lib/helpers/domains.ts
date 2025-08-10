import { checkDomainAvailability, checkMultipleDomains, DEFAULT_TLDS, EXTENDED_TLDS } from '@/lib/services/porkbun';

export async function checkDomain(name: string, tld: string) {
  try {
    // Use Porkbun API if available
    if (process.env.PORKBUN_API_KEY && process.env.PORKBUN_API_SECRET) {
      const result = await checkDomainAvailability(`${name}.${tld}`);
      return {
        status: result.status,
        premium: result.premium,
        price: result.price
      };
    }

    // Fallback to basic DNS check
    const url = `https://${name}.${tld}`;
    const dns = await fetch(url, { 
      method: "HEAD",
      signal: AbortSignal.timeout(3000)
    }).catch(() => null);
    
    if (dns && dns.status < 400) {
      return { status: "❌" };
    }

    return { status: "✅" };
  } catch (error) {
    console.error(`Error checking domain ${name}.${tld}:`, error);
    return { status: "❌" };
  }
}

export async function checkDomains(name: string, extendedCheck = false) {
  const tlds = extendedCheck 
    ? [...DEFAULT_TLDS, ...EXTENDED_TLDS]
    : DEFAULT_TLDS;

  // Use Porkbun batch check if available
  if (process.env.PORKBUN_API_KEY && process.env.PORKBUN_API_SECRET) {
    const results = await checkMultipleDomains(name, tlds);
    
    const domains: Record<string, string> = {};
    let hasPremium = false;
    
    Object.entries(results).forEach(([tld, result]) => {
      domains[tld] = result.status;
      if (result.premium) hasPremium = true;
    });
    
    return { domains, premium: hasPremium };
  }

  // Fallback to individual checks
  const results: Record<string, string> = {};
  let hasPremium = false;
  
  const checks = await Promise.all(
    tlds.map(async (tld) => {
      const result = await checkDomain(name, tld.replace('.', ''));
      if ((result as any).premium) {
        hasPremium = true;
      }
      return { tld, status: result.status };
    })
  );
  
  checks.forEach(({ tld, status }) => {
    results[tld] = status;
  });
  
  return { domains: results, premium: hasPremium };
}
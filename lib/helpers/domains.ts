export async function checkDomain(name: string, tld: string) {
  try {
    const url = `https://${name}.${tld}`;
    const dns = await fetch(url, { 
      method: "HEAD",
      signal: AbortSignal.timeout(3000)
    }).catch(() => null);
    
    if (dns && dns.status < 400) {
      return { status: "❌" };
    }

    if (!process.env.GODADDY_API_KEY) {
      const fallbackCheck = await fetch(url, { 
        method: "HEAD",
        signal: AbortSignal.timeout(3000)
      }).catch(() => null);
      return fallbackCheck && fallbackCheck.status < 400 
        ? { status: "❌" } 
        : { status: "✅" };
    }

    const res = await fetch(
      `https://api.godaddy.com/v1/domains/available?domain=${name}.${tld}`,
      { 
        headers: { 
          Authorization: `sso-key ${process.env.GODADDY_API_KEY}`,
          Accept: "application/json"
        },
        signal: AbortSignal.timeout(5000)
      }
    );
    
    if (!res.ok) {
      throw new Error(`GoDaddy API error: ${res.status}`);
    }
    
    const data = await res.json();
    
    if (!data.available) {
      return { status: "❌" };
    }
    
    if (data.premium || (data.price && data.price >= 25000)) {
      return { status: "⚠️", premium: true };
    }
    
    return { status: "✅" };
  } catch (error) {
    console.error(`Error checking domain ${name}.${tld}:`, error);
    return { status: "❌" };
  }
}

export async function checkDomains(name: string) {
  const tlds = ["com", "co", "io", "net"];
  const results: Record<string, string> = {};
  let hasPremium = false;
  
  const checks = await Promise.all(
    tlds.map(async (tld) => {
      const result = await checkDomain(name, tld);
      if ((result as any).premium) {
        hasPremium = true;
      }
      return { tld: `.${tld}`, status: result.status };
    })
  );
  
  checks.forEach(({ tld, status }) => {
    results[tld] = status;
  });
  
  return { domains: results, premium: hasPremium };
}
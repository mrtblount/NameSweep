// FREE WHOIS API that actually works
export async function checkDomainViaWHOIS(domain) {
    try {
        // Use free WHOIS API
        const response = await fetch(`https://api.domainsdb.info/v1/domains/search?domain=${domain}&zone=com,net,io,co`, { signal: AbortSignal.timeout(5000) });
        if (!response.ok) {
            // Fallback to another free API
            const backupResponse = await fetch(`https://api.iplocation.net/whois/${domain}`, { signal: AbortSignal.timeout(5000) });
            const text = await backupResponse.text();
            // If WHOIS returns "No match" or similar, domain is available
            return text.includes("No match") || text.includes("NOT FOUND");
        }
        const data = await response.json();
        // If no domains found in response, it's available
        return !data.domains || data.domains.length === 0;
    }
    catch (error) {
        console.error(`WHOIS check failed for ${domain}:`, error);
        return false; // Assume taken on error
    }
}
// Alternative using RapidAPI (requires free key)
export async function checkViaRapidAPI(domain) {
    try {
        const response = await fetch(`https://domain-availability.whoisxmlapi.com/api/v1?apiKey=at_FREE_KEY&domainName=${domain}`);
        const data = await response.json();
        return data.DomainInfo?.domainAvailability === "AVAILABLE";
    }
    catch (error) {
        console.error(`RapidAPI check failed for ${domain}:`, error);
        return false;
    }
}
// Check Namecheap if API keys are provided
export async function checkNamecheap(domain) {
    const NAMECHEAP_API = 'https://api.namecheap.com/xml.response';
    // Check if we have API credentials
    if (!process.env.NAMECHEAP_API_USER || !process.env.NAMECHEAP_API_KEY) {
        return false;
    }
    try {
        const params = new URLSearchParams({
            ApiUser: process.env.NAMECHEAP_API_USER,
            ApiKey: process.env.NAMECHEAP_API_KEY,
            UserName: process.env.NAMECHEAP_API_USER,
            Command: 'namecheap.domains.check',
            ClientIp: '127.0.0.1',
            DomainList: domain
        });
        const response = await fetch(`${NAMECHEAP_API}?${params}`);
        const text = await response.text();
        // Parse XML response
        return text.includes('Available="true"');
    }
    catch (error) {
        console.error(`Namecheap check failed for ${domain}:`, error);
        return false;
    }
}
// Check if a taken domain has a live site
export async function checkIfSiteIsLive(domain) {
    try {
        const response = await fetch(`https://${domain}`, {
            method: 'HEAD',
            signal: AbortSignal.timeout(3000)
        });
        return response.ok;
    }
    catch {
        return false; // No live site
    }
}

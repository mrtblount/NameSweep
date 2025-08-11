interface SerpApiResult {
  organic_results?: Array<{
    title: string;
    link: string;
    snippet?: string;
    domain?: string;
  }>;
  error?: string;
}

const SERPAPI_BASE = 'https://serpapi.com/search.json';

export interface SerpResult {
  title: string;
  domain: string;
  authority: 'high' | 'med' | 'low';
  snippet?: string;
}

export interface USPTOResult {
  status: 'live' | 'dead' | 'none';
  serial?: string;
  classes?: string[];
}

async function serpApiRequest(params: Record<string, string>): Promise<SerpApiResult> {
  const apiKey = process.env.SERPAPI_KEY;
  
  if (!apiKey) {
    throw new Error('SerpAPI key not configured');
  }

  const url = new URL(SERPAPI_BASE);
  url.searchParams.set('api_key', apiKey);
  url.searchParams.set('engine', 'google');
  
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const response = await fetch(url.toString());
  
  if (!response.ok) {
    throw new Error(`SerpAPI error: ${response.statusText}`);
  }

  return response.json();
}

export async function searchSERP(query: string): Promise<SerpResult[]> {
  try {
    const result = await serpApiRequest({
      q: query,
      num: '3',
      gl: 'us',
      hl: 'en'
    });

    if (!result.organic_results || result.organic_results.length === 0) {
      return [];
    }

    return result.organic_results.slice(0, 3).map(item => {
      const domain = new URL(item.link).hostname.replace('www.', '');
      const authority = determineAuthority(domain, item.title);
      
      return {
        title: item.title,
        domain,
        authority,
        snippet: item.snippet
      };
    });
  } catch (error) {
    console.error('SERP search error:', error);
    return [];
  }
}

export async function searchUSPTO(brandName: string): Promise<USPTOResult> {
  try {
    // Search multiple USPTO domains and general trademark databases
    const query = `"${brandName}" trademark (site:uspto.gov OR site:tmsearch.uspto.gov OR site:tsdr.uspto.gov OR "word mark" OR "trademark")`;
    const result = await serpApiRequest({
      q: query,
      num: '10',  // Get more results to find relevant ones
      gl: 'us',
      hl: 'en'
    });

    if (!result.organic_results || result.organic_results.length === 0) {
      return { status: 'none' };
    }

    // Check through all results for trademark information
    let status: 'live' | 'dead' | 'none' = 'none';
    let serial: string | undefined;
    let foundTrademark = false;
    
    for (const item of result.organic_results) {
      const title = item.title.toLowerCase();
      const snippet = item.snippet?.toLowerCase() || '';
      const link = item.link.toLowerCase();
      
      // Check if this is a USPTO result or contains trademark info
      const isUSPTO = link.includes('uspto.gov');
      const hasTrademarkInfo = 
        title.includes('trademark') || 
        snippet.includes('trademark') ||
        title.includes('word mark') ||
        snippet.includes('word mark') ||
        snippet.includes('registration');
      
      if (isUSPTO || hasTrademarkInfo) {
        foundTrademark = true;
        
        // Check status
        if (title.includes('live') || snippet.includes('live') || 
            snippet.includes('registered') || snippet.includes('registration')) {
          status = 'live';
        } else if (title.includes('dead') || snippet.includes('dead') || 
                   snippet.includes('cancelled') || snippet.includes('abandoned') ||
                   snippet.includes('expired')) {
          if (status !== 'live') { // Don't override live status
            status = 'dead';
          }
        }
        
        // Extract serial number
        if (!serial) {
          const serialMatch = link.match(/serialnumber=(\d+)/i) || 
                             title.match(/(\d{8})/) ||
                             snippet.match(/serial\s*(?:no|number)?\.?\s*(\d{8})/i) ||
                             snippet.match(/registration\s*(?:no|number)?\.?\s*(\d{7,8})/i);
          if (serialMatch) {
            serial = serialMatch[1];
          }
        }
        
        // If we found a live trademark, we can stop searching
        if (status === 'live' && serial) {
          break;
        }
      }
    }
    
    // If we found trademark mentions but no clear status, assume it exists (live)
    if (foundTrademark && status === 'none') {
      status = 'live';
    }

    return {
      status,
      serial,
      classes: undefined
    };
  } catch (error) {
    console.error('USPTO search error:', error);
    return { status: 'none' };
  }
}

function determineAuthority(domain: string, title: string): 'high' | 'med' | 'low' {
  const highAuthorityDomains = [
    'wikipedia.org', 'amazon.com', 'apple.com', 'google.com',
    'microsoft.com', 'facebook.com', 'twitter.com', 'linkedin.com',
    'youtube.com', 'instagram.com', 'reddit.com', 'github.com',
    'stackoverflow.com', 'medium.com', 'forbes.com', 'nytimes.com',
    'cnn.com', 'bbc.com', 'wsj.com', 'bloomberg.com'
  ];
  
  const medAuthorityPatterns = [
    '.gov', '.edu', '.org', 
    'techcrunch', 'verge', 'wired', 'arstechnica',
    'shopify', 'wordpress', 'squarespace'
  ];

  if (highAuthorityDomains.some(d => domain.includes(d))) {
    return 'high';
  }
  
  if (medAuthorityPatterns.some(p => domain.includes(p))) {
    return 'med';
  }
  
  return 'low';
}
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
    const query = `site:tsdr.uspto.gov "${brandName}"`;
    const result = await serpApiRequest({
      q: query,
      num: '3',
      gl: 'us',
      hl: 'en'
    });

    if (!result.organic_results || result.organic_results.length === 0) {
      return { status: 'none' };
    }

    const firstResult = result.organic_results[0];
    const title = firstResult.title.toLowerCase();
    const snippet = firstResult.snippet?.toLowerCase() || '';
    
    let status: 'live' | 'dead' | 'none' = 'none';
    let serial: string | undefined;
    
    if (title.includes('live') || snippet.includes('live')) {
      status = 'live';
    } else if (title.includes('dead') || snippet.includes('cancelled') || snippet.includes('abandoned')) {
      status = 'dead';
    }
    
    const serialMatch = firstResult.link.match(/serialnumber=(\d+)/i) || 
                       firstResult.title.match(/(\d{8})/);
    if (serialMatch) {
      serial = serialMatch[1];
    }
    
    const classes: string[] = [];
    const classMatch = snippet.match(/class(?:es)?\s*([\d,\s]+)/i);
    if (classMatch) {
      classes.push(...classMatch[1].split(/[,\s]+/).filter(c => c));
    }

    return {
      status,
      serial,
      classes: classes.length > 0 ? classes : undefined
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
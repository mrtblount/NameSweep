// Parse user input to extract domain name and extension
// Handle both single words, domains with extensions, and sentences

export interface ParsedInput {
  name: string;           // The clean domain name
  originalInput: string;  // What the user typed
  hasExtension: boolean;  // Whether user included an extension
  extension?: string;     // The extension if provided (e.g., '.com')
  isSentence: boolean;    // Whether input looks like a sentence
}

export function parseUserInput(input: string): ParsedInput {
  if (!input) {
    return {
      name: '',
      originalInput: '',
      hasExtension: false,
      isSentence: false
    };
  }

  const trimmed = input.trim().toLowerCase();
  
  // Check if it looks like a sentence (has spaces and more than 2 words)
  const words = trimmed.split(/\s+/);
  const isSentence = words.length > 2;
  
  // Common domain extensions to check for
  const commonExtensions = [
    '.com', '.net', '.org', '.io', '.co', '.ai', '.app', '.dev', 
    '.me', '.xyz', '.store', '.shop', '.online', '.tech', '.site',
    '.website', '.biz', '.info', '.us', '.uk', '.ca', '.au'
  ];
  
  // Check if input contains a domain extension
  let hasExtension = false;
  let extension: string | undefined;
  let nameWithoutExtension = trimmed;
  
  for (const ext of commonExtensions) {
    if (trimmed.endsWith(ext)) {
      hasExtension = true;
      extension = ext;
      nameWithoutExtension = trimmed.slice(0, -ext.length);
      break;
    }
  }
  
  // If it's a sentence, convert to domain-friendly format
  let cleanName: string;
  if (isSentence && !hasExtension) {
    // Remove common words and join
    const stopWords = ['a', 'an', 'the', 'for', 'to', 'of', 'in', 'on', 'at', 'by', 'be', 'is', 'are', 'was', 'were'];
    const filteredWords = words.filter(word => !stopWords.includes(word));
    cleanName = filteredWords.join('');
  } else {
    // Just clean the name part
    cleanName = nameWithoutExtension;
  }
  
  // Remove any remaining special characters
  cleanName = cleanName.replace(/[^a-z0-9]/g, '');
  
  return {
    name: cleanName,
    originalInput: input,
    hasExtension,
    extension,
    isSentence
  };
}

// Get the list of TLDs to check, prioritizing user's choice
export function getTLDsToCheck(parsedInput: ParsedInput, includeExtended: boolean = false): string[] {
  const defaultTLDs = ['.com', '.co', '.io', '.net'];
  const extendedTLDs = ['.org', '.ai', '.app', '.dev', '.gg', '.me', '.xyz', '.store', '.shop', '.online'];
  
  let tlds: string[];
  
  if (parsedInput.hasExtension && parsedInput.extension) {
    // User specified an extension - prioritize it
    const baseList = includeExtended ? [...defaultTLDs, ...extendedTLDs] : defaultTLDs;
    
    // Remove the user's extension from the list if it exists
    const filteredList = baseList.filter(tld => tld !== parsedInput.extension);
    
    // Put user's extension first
    tlds = [parsedInput.extension, ...filteredList];
  } else {
    // No extension specified, use default order
    tlds = includeExtended ? [...defaultTLDs, ...extendedTLDs] : defaultTLDs;
  }
  
  return tlds;
}

// Format the display name for UI
export function formatDisplayName(parsedInput: ParsedInput): string {
  if (parsedInput.isSentence && parsedInput.originalInput.includes(' ')) {
    // Show what we converted it to
    return `"${parsedInput.name}" (from: "${parsedInput.originalInput}")`;
  }
  return parsedInput.name;
}
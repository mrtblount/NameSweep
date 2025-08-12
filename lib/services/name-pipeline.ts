import { generateNames, scoreNameFit, GeneratedName } from './openai-generator';
import { checkDomainAvailability, checkMultipleDomains, checkMultipleDomainsFast, DEFAULT_TLDS, EXTENDED_TLDS } from './porkbun';
import { searchSERP, searchUSPTO } from './serpapi';
import { calculateBrandFitScore, getConfigurableWeights } from './scoring';

export interface NameCandidate extends GeneratedName {
  slug: string;
  passedStage1: boolean;
  checkResults?: {
    domains: Record<string, any>;
    socials: any;
    tm: any;
    seo: any;
    score?: any;
  };
}

export interface PipelineOptions {
  businessDescription: string;
  extendedTlds?: boolean;
  maxCandidates?: number;
  premiumThreshold?: number;
}

interface FilterOptions {
  minLength?: number;
  maxLength?: number;
  forbiddenSubstrings?: string[];
  requirePronounceable?: boolean;
}

const DEFAULT_FILTERS: FilterOptions = {
  minLength: 3,
  maxLength: 15,
  forbiddenSubstrings: ['xxx', 'porn', 'sex', 'fuck', 'shit', 'damn', 'hell'],
  requirePronounceable: true
};

function applyFilters(names: GeneratedName[], filters: FilterOptions = DEFAULT_FILTERS): GeneratedName[] {
  return names.filter(name => {
    const n = name.name.toLowerCase();
    
    // Length check
    if (filters.minLength && n.length < filters.minLength) return false;
    if (filters.maxLength && n.length > filters.maxLength) return false;
    
    // Forbidden substrings
    if (filters.forbiddenSubstrings?.some(sub => n.includes(sub))) return false;
    
    // Basic pronounceability check (has vowels)
    if (filters.requirePronounceable && !/[aeiou]/i.test(n)) return false;
    
    return true;
  });
}

async function checkSocialsUserInitiated(slug: string) {
  // Return URLs for user-initiated checks
  return {
    x: { 
      status: 'check', 
      url: `https://x.com/${slug}`,
      checkRequired: true 
    },
    instagram: { 
      status: 'check', 
      url: `https://instagram.com/${slug}`,
      checkRequired: true 
    },
    youtube: { 
      status: 'check', 
      url: `https://youtube.com/@${slug}`,
      checkRequired: true 
    },
    tiktok: { 
      status: 'check', 
      url: `https://www.tiktok.com/@${slug}`,
      checkRequired: true 
    },
    substack: { 
      status: 'check', 
      urls: [
        `https://substack.com/@${slug}`,
        `https://${slug}.substack.com`
      ],
      checkRequired: true 
    }
  };
}

export async function runNamePipeline(options: PipelineOptions) {
  const {
    businessDescription,
    extendedTlds = false,
    maxCandidates = 10,
    premiumThreshold = 249
  } = options;

  // Stage 1: Generate and coarse filter
  console.log('Stage 1: Generating names...');
  
  const generatedNames = await generateNames({
    businessDescription,
    preferredTlds: DEFAULT_TLDS
  });

  const filteredNames = applyFilters(generatedNames);
  console.log(`Generated ${filteredNames.length} valid names`);

  // Skip domain checking in Stage 1 for speed - just prepare candidates
  const stage1Candidates = filteredNames.slice(0, 10).map(name => ({
    ...name,
    slug: name.name.toLowerCase().replace(/[^a-z0-9]/g, ''),
    passedStage1: true
  }));

  // Use all 10 candidates for Stage 2
  const stage2Candidates = stage1Candidates;

  console.log(`Stage 1 complete: ${stage2Candidates.length} candidates for deep checks`);

  // Stage 2: Deep checks
  console.log('Stage 2: Running deep checks...');
  
  const tlds = extendedTlds 
    ? [...DEFAULT_TLDS, ...EXTENDED_TLDS]
    : DEFAULT_TLDS;

  const deepCheckedCandidates = await Promise.all(
    stage2Candidates.map(async (candidate) => {
      try {
        // Parallel checks with individual error handling - use FAST version for speed
        const [domains, tm, seo, socials] = await Promise.all([
          checkMultipleDomainsFast(candidate.slug, tlds).catch(err => {
            console.warn(`Domain check failed for ${candidate.slug}:`, err);
            // Return mock data if real check fails
            return tlds.reduce((acc, tld) => {
              acc[tld] = { status: '❓', available: false, error: 'Check failed' };
              return acc;
            }, {} as Record<string, any>);
          }),
          searchUSPTO(candidate.name).catch(err => {
            console.warn(`USPTO check failed for ${candidate.name}:`, err);
            return { status: 'none' }; // Default to no trademark
          }),
          searchSERP(candidate.name).catch(err => {
            console.warn(`SEO check failed for ${candidate.name}:`, err);
            return []; // Empty SEO results if SerpAPI fails
          }),
          checkSocialsUserInitiated(candidate.slug)
        ]);

        // Calculate fit score
        const fitScore = await scoreNameFit(
          candidate.name,
          businessDescription,
          { domains, tm, seo }
        );

        // Calculate BrandFit score
        const weights = getConfigurableWeights();
        const seoForScoring = seo.map(s => ({ da: s.authority }));
        const brandScore = calculateBrandFitScore(
          { domains, socials, tm, seo: seoForScoring },
          fitScore.score,
          weights
        );

        return {
          ...candidate,
          checkResults: {
            domains,
            socials,
            tm,
            seo,
            score: brandScore,
            rationale: fitScore.rationale
          }
        };
      } catch (error) {
        console.error(`Deep check failed for ${candidate.name}:`, error);
        return candidate;
      }
    })
  );

  // Sort by BrandFit score and return top N
  const rankedCandidates = deepCheckedCandidates
    .filter(c => c.checkResults?.score)
    .sort((a, b) => (b.checkResults?.score?.total || 0) - (a.checkResults?.score?.total || 0))
    .slice(0, maxCandidates);

  console.log(`Pipeline complete: ${rankedCandidates.length} final candidates`);
  
  return rankedCandidates;
}
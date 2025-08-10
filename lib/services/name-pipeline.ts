import { generateNames, scoreNameFit, GeneratedName } from './openai-generator';
import { checkDomainAvailability, checkMultipleDomains, DEFAULT_TLDS, EXTENDED_TLDS } from './porkbun';
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

  // Quick domain check (.com only for speed)
  const stage1Candidates: NameCandidate[] = [];
  
  for (const name of filteredNames.slice(0, 30)) {
    const slug = name.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const comCheck = await checkDomainAvailability(`${slug}.com`);
    
    // Keep if .com is available OR we'll check alternates later
    const passedStage1 = comCheck.available || 
                        (comCheck.premium && comCheck.price !== undefined && comCheck.price < premiumThreshold);
    
    stage1Candidates.push({
      ...name,
      slug,
      passedStage1: passedStage1 || false
    });
  }

  // Keep top 15 candidates that passed stage 1
  const stage2Candidates = stage1Candidates
    .filter(c => c.passedStage1)
    .slice(0, 15);

  console.log(`Stage 1 complete: ${stage2Candidates.length} candidates for deep checks`);

  // Stage 2: Deep checks
  console.log('Stage 2: Running deep checks...');
  
  const tlds = extendedTlds 
    ? [...DEFAULT_TLDS, ...EXTENDED_TLDS]
    : DEFAULT_TLDS;

  const deepCheckedCandidates = await Promise.all(
    stage2Candidates.map(async (candidate) => {
      try {
        // Parallel checks
        const [domains, tm, seo, socials] = await Promise.all([
          checkMultipleDomains(candidate.slug, tlds),
          searchUSPTO(candidate.name),
          searchSERP(candidate.name),
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
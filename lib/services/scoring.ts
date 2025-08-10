export interface ScoringWeights {
  availability: number;  // Default: 40
  social: number;       // Default: 15
  seo: number;         // Default: 25
  trademark: number;    // Default: 15
  fit: number;         // Default: 5
}

export interface BrandFitScore {
  total: number;
  subscores: {
    availability: number;
    social: number;
    seo: number;
    trademark: number;
    fit: number;
  };
  explanation: string;
}

const DEFAULT_WEIGHTS: ScoringWeights = {
  availability: 40,
  social: 15,
  seo: 25,
  trademark: 15,
  fit: 5
};

export function calculateBrandFitScore(
  checkResults: {
    domains: Record<string, any>;
    socials: {
      x: { status: string };
      instagram: { status: string };
      youtube: { status: string };
      tiktok?: { status: string };
      substack?: { status: string };
    };
    tm: { status: string };
    seo: Array<{ da: string }>;
    premium?: boolean;
  },
  fitScore?: number,
  weights: ScoringWeights = DEFAULT_WEIGHTS
): BrandFitScore {
  const subscores = {
    availability: 0,
    social: 0,
    seo: 0,
    trademark: 0,
    fit: fitScore || 50
  };

  // Domain availability scoring (40% default)
  let domainScore = 0;
  const domainEntries = Object.entries(checkResults.domains);
  
  domainEntries.forEach(([tld, result]) => {
    const status = result.status || result;
    if (tld === '.com') {
      if (status === '✅') domainScore += 50;
      else if (status === '⚠️') domainScore += 20;
    } else {
      if (status === '✅') domainScore += 12.5;
      else if (status === '⚠️') domainScore += 5;
    }
  });
  
  subscores.availability = Math.min(100, domainScore);

  // Social media scoring (15% default)
  let socialScore = 0;
  const socialPlatforms = [
    checkResults.socials.x,
    checkResults.socials.instagram,
    checkResults.socials.youtube,
    checkResults.socials.tiktok,
    checkResults.socials.substack
  ].filter(Boolean);
  
  const socialWeight = socialPlatforms.length > 0 ? 100 / socialPlatforms.length : 0;
  socialPlatforms.forEach(platform => {
    if (platform && (platform.status === '✅' || platform.status === 'free')) {
      socialScore += socialWeight;
    }
  });
  
  subscores.social = socialScore;

  // SEO collision scoring (25% default)
  let seoScore = 100;
  checkResults.seo.forEach(result => {
    if (result.da === 'high') seoScore -= 30;
    else if (result.da === 'med') seoScore -= 15;
    else if (result.da === 'low') seoScore -= 5;
  });
  
  subscores.seo = Math.max(0, seoScore);

  // Trademark scoring (15% default)
  if (checkResults.tm.status === 'none') {
    subscores.trademark = 100;
  } else if (checkResults.tm.status === 'dead') {
    subscores.trademark = 70;
  } else if (checkResults.tm.status === 'live') {
    subscores.trademark = 0;
  }

  // Calculate weighted total
  const total = Object.entries(weights).reduce((sum, [key, weight]) => {
    const score = subscores[key as keyof typeof subscores];
    return sum + (score * weight / 100);
  }, 0);

  // Generate explanation
  let explanation = '';
  if (total >= 80) {
    explanation = 'Excellent choice with strong availability across all channels.';
  } else if (total >= 60) {
    explanation = 'Good option with some availability challenges to consider.';
  } else if (total >= 40) {
    explanation = 'Mixed availability. Consider alternatives or variations.';
  } else {
    explanation = 'Limited availability. Strong recommendation to explore other options.';
  }

  return {
    total: Math.round(total),
    subscores,
    explanation
  };
}

export function getConfigurableWeights(): ScoringWeights {
  return {
    availability: parseInt(process.env.SCORE_WEIGHT_AVAILABILITY || '40'),
    social: parseInt(process.env.SCORE_WEIGHT_SOCIAL || '15'),
    seo: parseInt(process.env.SCORE_WEIGHT_SEO || '25'),
    trademark: parseInt(process.env.SCORE_WEIGHT_TRADEMARK || '15'),
    fit: parseInt(process.env.SCORE_WEIGHT_FIT || '5')
  };
}
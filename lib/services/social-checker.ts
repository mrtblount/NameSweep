interface SocialPlatform {
  name: string;
  icon: string;
  color: string;
  baseUrl: string;
  usernameFormat?: RegExp;
  minLength?: number;
  maxLength?: number;
}

export interface SocialCheckResult {
  platform: string;
  available: boolean | null;
  confidence: 'high' | 'medium' | 'low';
  message: string;
  url: string;
  cached?: boolean;
  estimatedOnly?: boolean;
}

export const SOCIAL_PLATFORMS: Record<string, SocialPlatform> = {
  instagram: {
    name: 'Instagram',
    icon: '📷',
    color: '#E4405F',
    baseUrl: 'https://instagram.com/',
    usernameFormat: /^[a-zA-Z0-9_.]{1,30}$/,
    minLength: 1,
    maxLength: 30
  },
  twitter: {
    name: 'X (Twitter)',
    icon: '𝕏',
    color: '#000000',
    baseUrl: 'https://x.com/',
    usernameFormat: /^[a-zA-Z0-9_]{1,15}$/,
    minLength: 1,
    maxLength: 15
  },
  youtube: {
    name: 'YouTube',
    icon: '📺',
    color: '#FF0000',
    baseUrl: 'https://youtube.com/@',
    usernameFormat: /^[a-zA-Z0-9_-]{3,30}$/,
    minLength: 3,
    maxLength: 30
  },
  tiktok: {
    name: 'TikTok',
    icon: '🎵',
    color: '#000000',
    baseUrl: 'https://tiktok.com/@',
    usernameFormat: /^[a-zA-Z0-9_.]{2,24}$/,
    minLength: 2,
    maxLength: 24
  },
  github: {
    name: 'GitHub',
    icon: '💻',
    color: '#333333',
    baseUrl: 'https://github.com/',
    usernameFormat: /^[a-zA-Z0-9-]{1,39}$/,
    minLength: 1,
    maxLength: 39
  },
  linkedin: {
    name: 'LinkedIn',
    icon: '💼',
    color: '#0A66C2',
    baseUrl: 'https://linkedin.com/in/',
    usernameFormat: /^[a-zA-Z0-9-]{3,100}$/,
    minLength: 3,
    maxLength: 100
  },
  reddit: {
    name: 'Reddit',
    icon: '🤖',
    color: '#FF4500',
    baseUrl: 'https://reddit.com/u/',
    usernameFormat: /^[a-zA-Z0-9_-]{3,20}$/,
    minLength: 3,
    maxLength: 20
  },
  discord: {
    name: 'Discord',
    icon: '🎮',
    color: '#5865F2',
    baseUrl: 'https://discord.com/',
    usernameFormat: /^[a-zA-Z0-9_]{2,32}$/,
    minLength: 2,
    maxLength: 32
  }
};

class SocialUsernameChecker {
  private cache: Map<string, { result: SocialCheckResult; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 60 * 60 * 1000; // 1 hour
  private readonly BATCH_SIZE = 3;
  private pendingChecks: Map<string, Promise<SocialCheckResult>> = new Map();

  private validateUsername(username: string, platform: SocialPlatform): {
    valid: boolean;
    reason?: string;
  } {
    if (!username) {
      return { valid: false, reason: 'Username cannot be empty' };
    }

    if (platform.minLength && username.length < platform.minLength) {
      return { valid: false, reason: `Too short (min ${platform.minLength} chars)` };
    }

    if (platform.maxLength && username.length > platform.maxLength) {
      return { valid: false, reason: `Too long (max ${platform.maxLength} chars)` };
    }

    if (platform.usernameFormat && !platform.usernameFormat.test(username)) {
      return { valid: false, reason: 'Invalid characters or format' };
    }

    return { valid: true };
  }

  private estimateAvailability(username: string): {
    likely: boolean;
    confidence: 'high' | 'medium' | 'low';
    reason: string;
  } {
    // Common patterns that suggest availability
    const hasMultipleNumbers = /\d{4,}/.test(username);
    const hasRandomSuffix = /[_-]\d{3,}$/.test(username);
    const isVeryLong = username.length > 20;
    const hasMultipleSpecialChars = (username.match(/[._-]/g) || []).length > 2;
    
    // Common patterns that suggest unavailability
    const isCommonWord = /^(admin|root|user|test|demo|hello|world|info|support|help)$/i.test(username);
    const isSingleLetter = /^[a-z]$/i.test(username);
    const isShortCommon = username.length <= 4 && /^[a-z]+$/i.test(username);
    const isBrandName = /^(google|apple|microsoft|amazon|facebook|meta|twitter|instagram|youtube|tiktok|netflix|spotify|uber|airbnb)$/i.test(username);

    // Definitely taken
    if (isCommonWord || isSingleLetter || isBrandName) {
      return {
        likely: false,
        confidence: 'high',
        reason: 'Common/reserved username'
      };
    }

    // Very likely taken
    if (isShortCommon) {
      return {
        likely: false,
        confidence: 'high',
        reason: 'Short common word'
      };
    }

    // Likely available
    if (hasRandomSuffix || (hasMultipleNumbers && isVeryLong)) {
      return {
        likely: true,
        confidence: 'medium',
        reason: 'Complex pattern suggests availability'
      };
    }

    // Possibly available
    if (username.length > 15 || hasMultipleSpecialChars) {
      return {
        likely: true,
        confidence: 'low',
        reason: 'Length/complexity suggests possible availability'
      };
    }

    // Default: uncertain
    return {
      likely: username.length > 10,
      confidence: 'low',
      reason: 'Pattern analysis inconclusive'
    };
  }

  private getCacheKey(platform: string, username: string): string {
    return `${platform}:${username.toLowerCase()}`;
  }

  private getFromCache(platform: string, username: string): SocialCheckResult | null {
    const key = this.getCacheKey(platform, username);
    const cached = this.cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return { ...cached.result, cached: true };
    }
    
    return null;
  }

  private setCache(platform: string, username: string, result: SocialCheckResult): void {
    const key = this.getCacheKey(platform, username);
    this.cache.set(key, {
      result,
      timestamp: Date.now()
    });
  }

  async checkSingle(platformKey: string, username: string): Promise<SocialCheckResult> {
    const platform = SOCIAL_PLATFORMS[platformKey];
    
    if (!platform) {
      return {
        platform: platformKey,
        available: null,
        confidence: 'low',
        message: 'Unknown platform',
        url: ''
      };
    }

    // Validate username format
    const validation = this.validateUsername(username, platform);
    if (!validation.valid) {
      return {
        platform: platformKey,
        available: null,
        confidence: 'high',
        message: validation.reason || 'Invalid username',
        url: platform.baseUrl + username
      };
    }

    // Check cache
    const cached = this.getFromCache(platformKey, username);
    if (cached) {
      return cached;
    }

    // Check if already pending
    const pendingKey = this.getCacheKey(platformKey, username);
    if (this.pendingChecks.has(pendingKey)) {
      return this.pendingChecks.get(pendingKey)!;
    }

    // Create promise for this check
    const checkPromise = this.performCheck(platformKey, username, platform);
    this.pendingChecks.set(pendingKey, checkPromise);

    try {
      const result = await checkPromise;
      this.setCache(platformKey, username, result);
      return result;
    } finally {
      this.pendingChecks.delete(pendingKey);
    }
  }

  private async performCheck(
    platformKey: string,
    username: string,
    platform: SocialPlatform
  ): Promise<SocialCheckResult> {
    try {
      // Try real API check first
      const response = await fetch(`/api/social-check/${platformKey}?username=${encodeURIComponent(username)}`, {
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });

      if (response.ok) {
        const data = await response.json();
        return {
          platform: platformKey,
          available: data.available,
          confidence: data.confidence,
          message: data.message || (data.available ? 'Available' : 'Taken'),
          url: platform.baseUrl + username
        };
      }
    } catch (error) {
      console.warn(`API check failed for ${platformKey}, using estimation`);
    }

    // Fallback to pattern-based estimation
    const estimation = this.estimateAvailability(username);
    return {
      platform: platformKey,
      available: estimation.likely,
      confidence: estimation.confidence,
      message: estimation.reason,
      url: platform.baseUrl + username,
      estimatedOnly: true
    };
  }

  async checkMultiple(
    username: string,
    platforms: string[] = Object.keys(SOCIAL_PLATFORMS)
  ): Promise<SocialCheckResult[]> {
    // First, return instant estimates for UI feedback
    const estimates = platforms.map(platform => {
      const cached = this.getFromCache(platform, username);
      if (cached) return cached;

      const platformConfig = SOCIAL_PLATFORMS[platform];
      const validation = this.validateUsername(username, platformConfig);
      
      if (!validation.valid) {
        return {
          platform,
          available: null,
          confidence: 'high' as const,
          message: validation.reason || 'Invalid username',
          url: platformConfig.baseUrl + username
        };
      }

      const estimation = this.estimateAvailability(username);
      return {
        platform,
        available: estimation.likely,
        confidence: estimation.confidence,
        message: estimation.reason,
        url: platformConfig.baseUrl + username,
        estimatedOnly: true
      };
    });

    // Then perform real checks in batches
    const results: SocialCheckResult[] = [];
    for (let i = 0; i < platforms.length; i += this.BATCH_SIZE) {
      const batch = platforms.slice(i, i + this.BATCH_SIZE);
      const batchResults = await Promise.all(
        batch.map(platform => this.checkSingle(platform, username))
      );
      results.push(...batchResults);
    }

    return results;
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheSize(): number {
    return this.cache.size;
  }
}

// Export singleton instance
export const socialChecker = new SocialUsernameChecker();

// Export convenience functions
export async function checkSocialUsername(
  username: string,
  platforms?: string[]
): Promise<SocialCheckResult[]> {
  return socialChecker.checkMultiple(username, platforms);
}

export async function checkSinglePlatform(
  platform: string,
  username: string
): Promise<SocialCheckResult> {
  return socialChecker.checkSingle(platform, username);
}
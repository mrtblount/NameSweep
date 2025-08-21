'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  HelpCircle, 
  Loader2,
  ExternalLink,
  Instagram,
  Twitter,
  Youtube,
  Music2,
  Github,
  Linkedin,
  Hash,
  Globe
} from 'lucide-react';
import { 
  checkSocialUsername, 
  SOCIAL_PLATFORMS, 
  type SocialCheckResult 
} from '@/lib/services/social-checker';

interface SocialAvailabilityProps {
  username: string;
  platforms?: string[];
  autoCheck?: boolean;
  onResults?: (results: SocialCheckResult[]) => void;
}

// Map platform names to Lucide icons
const PLATFORM_ICONS: Record<string, any> = {
  instagram: Instagram,
  twitter: Twitter,
  youtube: Youtube,
  tiktok: Music2,
  github: Github,
  linkedin: Linkedin,
  reddit: Hash,
  default: Globe
};

export function SocialAvailability({
  username,
  platforms = Object.keys(SOCIAL_PLATFORMS),
  autoCheck = true,
  onResults
}: SocialAvailabilityProps) {
  const [results, setResults] = useState<SocialCheckResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkedUsername, setCheckedUsername] = useState('');

  const checkAvailability = useCallback(async () => {
    if (!username || username.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    setCheckedUsername(username);

    try {
      // Get instant estimates first
      const estimates = platforms.map(platform => ({
        platform,
        available: null,
        confidence: 'low' as const,
        message: 'Checking...',
        url: SOCIAL_PLATFORMS[platform].baseUrl + username,
        estimatedOnly: true
      }));
      
      setResults(estimates);

      // Then get real results
      const realResults = await checkSocialUsername(username, platforms);
      setResults(realResults);
      
      if (onResults) {
        onResults(realResults);
      }
    } catch (error) {
      console.error('Social check error:', error);
    } finally {
      setLoading(false);
    }
  }, [username, platforms, onResults]);

  useEffect(() => {
    if (autoCheck && username && username !== checkedUsername) {
      const timer = setTimeout(() => {
        checkAvailability();
      }, 500); // Debounce

      return () => clearTimeout(timer);
    }
  }, [username, autoCheck, checkedUsername, checkAvailability]);

  const getStatusIcon = (result: SocialCheckResult) => {
    if (result.message === 'Checking...') {
      return <Loader2 className="w-5 h-5 animate-spin" />;
    }
    
    if (result.available === null) {
      return <HelpCircle className="w-5 h-5" />;
    }
    
    if (result.available) {
      return result.confidence === 'high' 
        ? <CheckCircle className="w-5 h-5" />
        : <AlertCircle className="w-5 h-5" />;
    }
    
    return result.confidence === 'high' 
      ? <XCircle className="w-5 h-5" />
      : <AlertCircle className="w-5 h-5" />;
  };

  const getStatusColor = (result: SocialCheckResult) => {
    if (result.message === 'Checking...') {
      return 'text-muted-foreground';
    }
    
    if (result.available === null) {
      return 'text-muted-foreground';
    }
    
    if (result.available) {
      return result.confidence === 'high' ? 'text-green-600' : 'text-yellow-600';
    }
    
    return result.confidence === 'high' ? 'text-red-600' : 'text-orange-600';
  };

  const getConfidenceBadge = (confidence: string) => {
    const badges = {
      high: 'Verified',
      medium: 'Likely',
      low: 'Estimated'
    };
    return badges[confidence as keyof typeof badges] || confidence;
  };

  const getPlatformIcon = (platformName: string) => {
    const IconComponent = PLATFORM_ICONS[platformName] || PLATFORM_ICONS.default;
    return <IconComponent className="w-5 h-5" />;
  };

  if (!username) {
    return (
      <div className="text-muted-foreground text-sm">
        Enter a username to check social media availability
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" />
          Social Media Availability
        </h3>
        {!autoCheck && (
          <button
            onClick={checkAvailability}
            disabled={loading}
            className="btn-primary btn-sm"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : (
              'Check Availability'
            )}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {results.map((result) => {
          const platform = SOCIAL_PLATFORMS[result.platform];
          const statusColor = getStatusColor(result);
          
          return (
            <div
              key={result.platform}
              className="flex items-center justify-between p-3 rounded-lg border bg-card"
            >
              <div className="flex items-center space-x-3">
                <span className="text-muted-foreground">
                  {getPlatformIcon(result.platform)}
                </span>
                <div>
                  <div className="font-medium">{platform.name}</div>
                  <div className={`text-sm ${statusColor}`}>
                    {result.message}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={statusColor}>
                  {getStatusIcon(result)}
                </span>
                {result.confidence && result.message !== 'Checking...' && (
                  <span className="text-xs px-2 py-1 bg-muted rounded text-muted-foreground">
                    {getConfidenceBadge(result.confidence)}
                  </span>
                )}
                {result.url && (
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline btn-sm text-xs"
                  >
                    Verify
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {results.length > 0 && (
        <div className="mt-4 p-3 rounded-lg bg-muted/50 border">
          <div className="text-sm space-y-1">
            <div className="font-medium">Availability Summary:</div>
            <div className="flex flex-wrap gap-3 mt-2 text-xs">
              <span className="inline-flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-600" />
                <span className="text-foreground">Available (verified)</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-yellow-600" />
                <span className="text-foreground">Likely available</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <XCircle className="w-3 h-3 text-red-600" />
                <span className="text-foreground">Taken (verified)</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-orange-600" />
                <span className="text-foreground">Likely taken</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <HelpCircle className="w-3 h-3 text-muted-foreground" />
                <span className="text-foreground">Cannot verify</span>
              </span>
            </div>
            {results.some(r => r.cached) && (
              <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Some results from cache (1 hour)
              </div>
            )}
            {results.some(r => r.estimatedOnly) && (
              <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Some results are estimates based on pattern analysis
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
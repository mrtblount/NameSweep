"use client";

import { useState } from "react";
import { Send, Sparkles, Loader2, ToggleLeft, ToggleRight, Download, GitCompare, RefreshCw, ChevronDown, ChevronUp, ExternalLink, Star, Shield, TrendingUp, AlertCircle, MessageSquare, Users } from "lucide-react";

interface GeneratedCandidate {
  name: string;
  style: string;
  slug: string;
  checkResults: {
    domains: Record<string, any>;
    socials: any;
    tm: any;
    seo: any;
    score: {
      total: number;
      subscores: Record<string, number>;
      explanation: string;
    };
    rationale: string;
  };
}

interface ExpandedCheckResult {
  domains: Record<string, string>;
  socials: {
    x: { status: string; url?: string; checkRequired?: boolean };
    instagram: { status: string; url?: string; checkRequired?: boolean };
    youtube: { status: string; url?: string; checkRequired?: boolean };
    tiktok?: { status: string; url?: string; checkRequired?: boolean };
    substack?: { status: string; urls?: string[]; checkRequired?: boolean };
  };
  tm: { status: string; serial: string | null };
  seo: Array<{ title: string; root: string; da: string }>;
  premium: boolean;
}

const PROMPT_SUGGESTIONS = [
  "AI-powered project management for remote teams",
  "Sustainable fashion marketplace",
  "Modern coffee shop with coworking",
  "Online fitness coaching platform",
  "Pet care services marketplace"
];

export default function ChatMode() {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GeneratedCandidate[]>([]);
  const [extendedTlds, setExtendedTlds] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");
  const [expandedNames, setExpandedNames] = useState<Set<string>>(new Set());
  const [checkingNames, setCheckingNames] = useState<Set<string>>(new Set());
  const [realCheckResults, setRealCheckResults] = useState<Record<string, ExpandedCheckResult>>({});

  const handleGenerate = async () => {
    if (!description.trim() || description.length < 10) {
      setError("Please provide more details about your business");
      return;
    }

    setError("");
    setLoading(true);
    setResults([]);
    setExpandedNames(new Set());
    setRealCheckResults({});

    try {
      const res = await fetch("/api/generate-simple", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessDescription: description,
          extendedTlds
        })
      });

      // Check if response is JSON before parsing
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server error: Invalid response format. Please try again.");
      }
      
      const data = await res.json();
      
      if (!res.ok) {
        // Handle specific error cases
        if (data.debug?.apiKeyExists === false) {
          throw new Error("OpenAI API key not configured. Please contact the site administrator.");
        }
        throw new Error(data.error || "Failed to generate names");
      }

      setResults(data.candidates || []);
    } catch (err) {
      console.error('Generation error:', err);
      if (err instanceof SyntaxError) {
        setError("Server error: Invalid response. Please refresh and try again.");
      } else {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = async (name: string, slug: string) => {
    const newExpanded = new Set(expandedNames);
    
    if (newExpanded.has(name)) {
      newExpanded.delete(name);
      setExpandedNames(newExpanded);
    } else {
      newExpanded.add(name);
      setExpandedNames(newExpanded);
      
      // If we haven't checked this name yet, run the real check
      if (!realCheckResults[name] && !checkingNames.has(name)) {
        const newChecking = new Set(checkingNames);
        newChecking.add(name);
        setCheckingNames(newChecking);
        
        try {
          const res = await fetch(`/api/check?name=${encodeURIComponent(slug)}`);
          const data = await res.json();
          
          if (res.ok) {
            setRealCheckResults(prev => ({
              ...prev,
              [name]: data
            }));
          }
        } catch (error) {
          console.error('Check failed:', error);
        } finally {
          const newChecking = new Set(checkingNames);
          newChecking.delete(name);
          setCheckingNames(newChecking);
        }
      }
    }
  };

  const toggleCompare = (name: string) => {
    const newSet = new Set(selectedForCompare);
    if (newSet.has(name)) {
      newSet.delete(name);
    } else if (newSet.size < 4) {
      newSet.add(name);
    }
    setSelectedForCompare(newSet);
  };

  const exportResults = (format: 'csv' | 'markdown') => {
    if (results.length === 0) return;

    let content = "";
    
    if (format === 'csv') {
      content = "Name,Style,Score,.com,.co,.io,.net,X,Instagram,YouTube,TikTok,Substack,USPTO,Rationale\n";
      results.forEach(r => {
        const row = [
          r.name,
          r.style,
          r.checkResults.score.total,
          r.checkResults.domains['.com']?.status || '❌',
          r.checkResults.domains['.co']?.status || '❌',
          r.checkResults.domains['.io']?.status || '❌',
          r.checkResults.domains['.net']?.status || '❌',
          r.checkResults.socials.x?.status || 'check',
          r.checkResults.socials.instagram?.status || 'check',
          r.checkResults.socials.youtube?.status || 'check',
          r.checkResults.socials.tiktok?.status || 'check',
          r.checkResults.socials.substack?.status || 'check',
          r.checkResults.tm.status,
          `"${r.checkResults.rationale}"`
        ];
        content += row.join(',') + '\n';
      });
    } else {
      content = `# NameSweep Results\n\n`;
      content += `**Business:** ${description}\n\n`;
      results.forEach(r => {
        content += `## ${r.name} (Score: ${r.checkResults.score.total}/100)\n\n`;
        content += `**Style:** ${r.style}\n`;
        content += `**Rationale:** ${r.checkResults.rationale}\n\n`;
        content += `### Availability\n`;
        content += `- Domains: ${Object.entries(r.checkResults.domains).map(([tld, status]) => `${tld}: ${status.status}`).join(', ')}\n`;
        content += `- USPTO: ${r.checkResults.tm.status}\n\n`;
      });
    }

    const blob = new Blob([content], { type: format === 'csv' ? 'text/csv' : 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `namesweep-results.${format === 'csv' ? 'csv' : 'md'}`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Chat Input */}
      <div className="card p-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-lg">Describe Your Business</h3>
          </div>
          
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell us about your business idea, target audience, and brand personality..."
            className="w-full min-h-[120px] px-4 py-3 rounded-lg border border-neutral-300 bg-white text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none transition-all duration-200"
          />

          {/* Prompt Suggestions */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-neutral-600">Try:</span>
            {PROMPT_SUGGESTIONS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => setDescription(prompt)}
                className="text-sm px-3 py-1 rounded-full bg-neutral-100 text-neutral-600 hover:bg-primary/10 hover:text-primary transition-all duration-200"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setExtendedTlds(!extendedTlds)}
              className="flex items-center gap-2 text-sm font-medium"
            >
              {extendedTlds ? (
                <ToggleRight className="w-5 h-5 text-primary" />
              ) : (
                <ToggleLeft className="w-5 h-5 text-neutral-400" />
              )}
              <span className="text-neutral-700">Extended TLD Check</span>
            </button>

            <button
              onClick={handleGenerate}
              disabled={loading || !description.trim()}
              className="btn-primary"
            >
              {loading ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Names
              </>
            )}
          </button>
        </div>

        </div>

        {error && (
          <div className="mt-4 p-3 bg-error/10 border border-error/20 rounded-lg text-error text-sm flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
            {error}
          </div>
        )}
      </div>

      {/* Results */}
      {results.length > 0 && (
        <>
          {/* Export Controls */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">
              Generated Names ({results.length})
            </h3>
            <div className="flex gap-2">
              {selectedForCompare.size > 0 && (
                <button className="btn-secondary text-sm">
                  <GitCompare className="mr-2 h-3 w-3" />
                  Compare ({selectedForCompare.size})
                </button>
              )}
              <button 
                onClick={() => exportResults('csv')}
                className="btn-secondary text-sm"
              >
                <Download className="mr-2 h-3 w-3" />
                CSV
              </button>
              <button 
                onClick={() => exportResults('markdown')}
                className="btn-secondary text-sm"
              >
                <Download className="mr-2 h-3 w-3" />
                Markdown
              </button>
            </div>
          </div>

          {/* Name Cards */}
          <div className="grid gap-4">
            {results.map((candidate, index) => {
              const isExpanded = expandedNames.has(candidate.name);
              const isChecking = checkingNames.has(candidate.name);
              const realData = realCheckResults[candidate.name];
              
              return (
                <div
                  key={candidate.name}
                  className={`card p-6 ${selectedForCompare.has(candidate.name) ? 'ring-2 ring-primary border-primary' : ''}`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="text-xl font-bold">
                          {candidate.name}
                        </h4>
                        <span className="badge">
                          {candidate.style}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-600 mt-2">
                        {candidate.checkResults.rationale}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <div className="text-2xl font-bold gradient-text">
                          {candidate.checkResults.score.total}
                        </div>
                        <div className="text-xs text-neutral-600">Score</div>
                      </div>
                      <button
                        onClick={() => toggleCompare(candidate.name)}
                        className={`p-2 rounded-lg transition ${
                          selectedForCompare.has(candidate.name)
                            ? 'bg-primary text-white'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                        }`}
                        title="Compare"
                      >
                        <GitCompare className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleExpand(candidate.name, candidate.slug)}
                        className="p-2 rounded-lg bg-neutral-100 text-neutral-600 hover:bg-neutral-200 transition"
                        title={isExpanded ? "Collapse" : "Expand details"}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="space-y-4 mt-6 pt-6 border-t border-neutral-200">
                      {isChecking ? (
                        <div className="flex items-center justify-center py-8">
                          <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mr-3"></span>
                          <span className="text-neutral-600">Running full availability check...</span>
                        </div>
                      ) : realData ? (
                        <>
                          {/* Domains */}
                          <div>
                            <h5 className="text-sm font-semibold mb-3 flex items-center gap-2">
                              <Star className="w-4 h-4 text-primary" />
                              Domain Availability
                            </h5>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              {Object.entries(realData.domains).map(([tld, status]) => (
                                <div
                                  key={tld}
                                  className={`p-3 rounded-lg border-2 transition ${
                                    status === "✅" 
                                      ? "status-available" 
                                      : status === "⚠️"
                                      ? "status-premium"
                                      : "status-taken"
                                  }`}
                                >
                                  <div className="text-lg mb-1">{status}</div>
                                  <div className="font-semibold text-sm">{candidate.slug}{tld}</div>
                                  {status === "⚠️" && (
                                    <div className="text-xs mt-1">Premium</div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Social Media */}
                          <div>
                            <h5 className="text-sm font-semibold mb-3 flex items-center gap-2">
                              <Users className="w-4 h-4 text-primary" />
                              Social Media Handles
                            </h5>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                              {Object.entries({
                                'X': realData.socials.x,
                                'Instagram': realData.socials.instagram,
                                'YouTube': realData.socials.youtube,
                                'TikTok': realData.socials.tiktok,
                                'Substack': realData.socials.substack
                              }).map(([platform, data]) => (
                                <div
                                  key={platform}
                                  className="p-3 rounded-lg border border-neutral-200 bg-neutral-50"
                                >
                                  <div className="font-semibold text-sm mb-2">{platform}</div>
                                  {data && ('url' in data || 'urls' in data) ? (
                                    'urls' in data && data.urls ? (
                                      <div className="space-y-1">
                                        {data.urls.map((url: string, i: number) => (
                                          <a 
                                            key={i}
                                            href={url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 text-xs text-primary hover:underline"
                                          >
                                            Check {i === 0 ? 'Profile' : 'Blog'}
                                            <ExternalLink className="w-3 h-3" />
                                          </a>
                                        ))}
                                      </div>
                                    ) : 'url' in data && data.url ? (
                                      <a 
                                        href={data.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium hover:bg-primary hover:text-white transition"
                                      >
                                        Check
                                        <ExternalLink className="w-3 h-3" />
                                      </a>
                                    ) : null
                                  ) : (
                                    <span className="text-xs text-neutral-500">Not checked</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Trademark */}
                          <div>
                            <h5 className="text-sm font-semibold mb-3 flex items-center gap-2">
                              <Shield className="w-4 h-4 text-primary" />
                              USPTO Trademark Status
                            </h5>
                            <div className={`p-4 rounded-lg border-2 ${
                              realData.tm.status === "none" 
                                ? "status-available" 
                                : realData.tm.status === "dead"
                                ? "status-premium"
                                : "status-taken"
                            }`}>
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="font-semibold">Status: </span>
                                  <span className={`font-medium ${
                                    realData.tm.status === "live" ? "text-error" :
                                    realData.tm.status === "dead" ? "text-warning" :
                                    "text-success"
                                  }`}>
                                    {realData.tm.status === "none" ? "No trademark found ✅" : realData.tm.status.toUpperCase()}
                                  </span>
                                </div>
                                {realData.tm.serial && (
                                  <div className="text-sm text-neutral-600">
                                    Serial: {realData.tm.serial}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* SEO Competition */}
                          <div>
                            <h5 className="text-sm font-semibold mb-3 flex items-center gap-2">
                              <TrendingUp className="w-4 h-4 text-primary" />
                              SEO Competition
                            </h5>
                            <div className="space-y-2">
                              {realData.seo.map((item, i) => (
                                <div key={i} className="p-3 rounded-lg bg-neutral-50 hover:bg-neutral-100 transition">
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium text-sm truncate">{item.title}</div>
                                      <div className="text-xs text-neutral-600">{item.root}</div>
                                    </div>
                                    <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                      item.da === "high" ? "badge-error" :
                                      item.da === "med" ? "badge-warning" :
                                      "badge-success"
                                    }`}>
                                      DA: {item.da.toUpperCase()}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-8 text-neutral-500">
                          Click expand button to run full availability check
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
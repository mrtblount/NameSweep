"use client";

import { useState } from "react";
import { Send, Sparkles, Loader2, ToggleLeft, ToggleRight, Download, GitCompare, RefreshCw, ChevronDown, ChevronUp, ExternalLink, Star, Shield, TrendingUp } from "lucide-react";

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
  "Tech startup for AI-powered project management",
  "Sustainable fashion brand for young professionals",
  "Local coffee shop with coworking space",
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
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Chat Input */}
      <div className="card p-6">
        <h3 className="text-xl font-bold text-ns-text mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-ns-accent" />
          Describe Your Business
        </h3>
        
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Tell us about your business idea, target audience, and brand personality..."
          className="w-full min-h-[120px] px-4 py-3 bg-white/[0.06] rounded-xl text-ns-text placeholder-white/40 border border-white/10 focus:border-ns-accent/50 focus:ring-2 focus:ring-ns-accent/50 focus:outline-none resize-none"
        />

        {/* Prompt Suggestions */}
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="text-xs text-ns-mute">Try:</span>
          {PROMPT_SUGGESTIONS.map((prompt, i) => (
            <button
              key={i}
              onClick={() => setDescription(prompt)}
              className="text-xs px-3 py-1 rounded-pill bg-white/5 text-ns-mute hover:bg-white/10 hover:text-ns-text transition"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={() => setExtendedTlds(!extendedTlds)}
            className="flex items-center gap-2 text-sm text-ns-text"
          >
            {extendedTlds ? (
              <ToggleRight className="w-5 h-5 text-ns-accent" />
            ) : (
              <ToggleLeft className="w-5 h-5 text-ns-mute" />
            )}
            Extended TLD Check
          </button>

          <button
            onClick={handleGenerate}
            disabled={loading || !description.trim()}
            className="btn-accent min-w-[140px]"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Generate Names
              </>
            )}
          </button>
        </div>

        {error && (
          <p className="text-red-500 text-sm mt-3">{error}</p>
        )}
      </div>

      {/* Results */}
      {results.length > 0 && (
        <>
          {/* Export Controls */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-ns-text">
              Generated Names ({results.length})
            </h3>
            <div className="flex gap-2">
              {selectedForCompare.size > 0 && (
                <button className="btn-ghost text-sm">
                  <GitCompare className="mr-2 h-4 w-4" />
                  Compare ({selectedForCompare.size})
                </button>
              )}
              <button 
                onClick={() => exportResults('csv')}
                className="btn-ghost text-sm"
              >
                <Download className="mr-2 h-4 w-4" />
                CSV
              </button>
              <button 
                onClick={() => exportResults('markdown')}
                className="btn-ghost text-sm"
              >
                <Download className="mr-2 h-4 w-4" />
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
                  className={`card p-6 ${selectedForCompare.has(candidate.name) ? 'ring-2 ring-ns-accent' : ''}`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="text-2xl font-bold text-ns-text">
                          {index + 1}. {candidate.name}
                        </h4>
                        <span className="px-3 py-1 rounded-pill bg-ns-accent/20 text-ns-accent text-xs font-medium">
                          {candidate.style}
                        </span>
                      </div>
                      <p className="text-sm text-ns-mute mt-2">
                        {candidate.checkResults.rationale}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-ns-accent">
                          {candidate.checkResults.score.total}
                        </div>
                        <div className="text-xs text-ns-mute">Score</div>
                      </div>
                      <button
                        onClick={() => toggleCompare(candidate.name)}
                        className={`p-2 rounded-lg transition ${
                          selectedForCompare.has(candidate.name)
                            ? 'bg-ns-accent text-ns-surface2'
                            : 'bg-white/5 text-ns-mute hover:bg-white/10'
                        }`}
                      >
                        <GitCompare className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleExpand(candidate.name, candidate.slug)}
                        className="p-2 rounded-lg bg-white/5 text-ns-text hover:bg-white/10 transition"
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
                    <div className="space-y-4 mt-6 pt-6 border-t border-white/10">
                      {isChecking ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin text-ns-accent mr-2" />
                          <span className="text-ns-mute">Running full availability check...</span>
                        </div>
                      ) : realData ? (
                        <>
                          {/* Domains */}
                          <div>
                            <h4 className="text-sm font-bold text-ns-text mb-3 flex items-center gap-2">
                              <Star className="w-4 h-4 text-ns-accent" />
                              Domain Availability
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              {Object.entries(realData.domains).map(([tld, status]) => (
                                <div
                                  key={tld}
                                  className={`p-3 rounded-lg border transition ${
                                    status === "✅" 
                                      ? "bg-green-500/10 border-green-500/30" 
                                      : status === "⚠️"
                                      ? "bg-yellow-500/10 border-yellow-500/30"
                                      : "bg-red-500/10 border-red-500/30"
                                  }`}
                                >
                                  <div className="text-xl mb-1">{status}</div>
                                  <div className="font-bold text-ns-text text-sm">{candidate.slug}{tld}</div>
                                  {status === "⚠️" && (
                                    <div className="text-xs text-yellow-500 mt-1">Premium</div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Social Media */}
                          <div>
                            <h4 className="text-sm font-bold text-ns-text mb-3 flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-ns-accent" />
                              Social Media Handles
                            </h4>
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
                                  className="p-3 rounded-lg border border-white/10 bg-white/5"
                                >
                                  <div className="font-bold text-ns-text text-sm mb-2">{platform}</div>
                                  {data && ('url' in data || 'urls' in data) ? (
                                    'urls' in data && data.urls ? (
                                      <div className="space-y-1">
                                        {data.urls.map((url: string, i: number) => (
                                          <a 
                                            key={i}
                                            href={url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 text-xs text-ns-accent hover:underline"
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
                                        className="inline-flex items-center gap-1 px-2 py-1 bg-ns-accent/20 text-ns-accent rounded-pill text-xs font-medium hover:bg-ns-accent hover:text-ns-surface2 transition"
                                      >
                                        Check
                                        <ExternalLink className="w-3 h-3" />
                                      </a>
                                    ) : null
                                  ) : (
                                    <span className="text-xs text-ns-mute">Not checked</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Trademark */}
                          <div>
                            <h4 className="text-sm font-bold text-ns-text mb-3 flex items-center gap-2">
                              <Shield className="w-4 h-4 text-ns-accent" />
                              USPTO Trademark Status
                            </h4>
                            <div className={`p-4 rounded-lg border ${
                              realData.tm.status === "none" 
                                ? "bg-green-500/10 border-green-500/30" 
                                : realData.tm.status === "dead"
                                ? "bg-yellow-500/10 border-yellow-500/30"
                                : "bg-red-500/10 border-red-500/30"
                            }`}>
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="font-bold text-ns-text">Status: </span>
                                  <span className={`capitalize font-medium ${
                                    realData.tm.status === "live" ? "text-red-500" :
                                    realData.tm.status === "dead" ? "text-yellow-500" :
                                    "text-ns-accent"
                                  }`}>
                                    {realData.tm.status === "none" ? "No trademark found ✅" : realData.tm.status}
                                  </span>
                                </div>
                                {realData.tm.serial && (
                                  <div className="text-sm text-ns-mute">
                                    Serial: {realData.tm.serial}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* SEO Competition */}
                          <div>
                            <h4 className="text-sm font-bold text-ns-text mb-3 flex items-center gap-2">
                              <TrendingUp className="w-4 h-4 text-ns-accent" />
                              SEO Competition
                            </h4>
                            <div className="space-y-2">
                              {realData.seo.map((item, i) => (
                                <div key={i} className="p-3 rounded-lg bg-white/5 border border-white/10">
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                      <div className="font-semibold text-sm text-ns-text truncate">{item.title}</div>
                                      <div className="text-xs text-ns-mute">{item.root}</div>
                                    </div>
                                    <div className={`px-2 py-1 rounded-pill text-xs font-bold ${
                                      item.da === "high" ? "bg-red-500/20 text-red-400" :
                                      item.da === "med" ? "bg-yellow-500/20 text-yellow-400" :
                                      "bg-ns-accent/20 text-ns-accent"
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
                        <div className="text-center py-8 text-ns-mute">
                          Click to run full availability check
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
"use client";

import { useState } from "react";
import { Send, Sparkles, Loader2, ToggleLeft, ToggleRight, Download, GitCompare, RefreshCw } from "lucide-react";

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

  const handleGenerate = async () => {
    if (!description.trim() || description.length < 10) {
      setError("Please provide more details about your business");
      return;
    }

    setError("");
    setLoading(true);
    setResults([]);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessDescription: description,
          extendedTlds
        })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate names");
      }

      setResults(data.candidates || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
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
            {results.map((candidate, index) => (
              <div
                key={candidate.name}
                className={`card p-6 ${selectedForCompare.has(candidate.name) ? 'ring-2 ring-ns-accent' : ''}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
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
                  </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {/* Domains */}
                  <div className="p-3 rounded-lg bg-white/5">
                    <div className="text-xs text-ns-mute mb-1">Domains</div>
                    <div className="flex gap-1">
                      {Object.entries(candidate.checkResults.domains).slice(0, 4).map(([tld, result]) => (
                        <span key={tld} className="text-sm">
                          {result.status}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Socials */}
                  <div className="p-3 rounded-lg bg-white/5">
                    <div className="text-xs text-ns-mute mb-1">Socials</div>
                    <div className="text-sm text-ns-text">
                      {candidate.checkResults.socials.x?.checkRequired ? (
                        <a href={candidate.checkResults.socials.x.url} target="_blank" rel="noopener" className="text-ns-accent hover:underline">
                          Check Required
                        </a>
                      ) : (
                        'Pending'
                      )}
                    </div>
                  </div>

                  {/* USPTO */}
                  <div className="p-3 rounded-lg bg-white/5">
                    <div className="text-xs text-ns-mute mb-1">USPTO</div>
                    <div className={`text-sm font-medium ${
                      candidate.checkResults.tm.status === 'none' ? 'text-ns-accent' :
                      candidate.checkResults.tm.status === 'dead' ? 'text-yellow-500' :
                      'text-red-500'
                    }`}>
                      {candidate.checkResults.tm.status === 'none' ? 'Clear' : candidate.checkResults.tm.status}
                    </div>
                  </div>

                  {/* SEO */}
                  <div className="p-3 rounded-lg bg-white/5">
                    <div className="text-xs text-ns-mute mb-1">SEO Competition</div>
                    <div className="text-sm text-ns-text">
                      {candidate.checkResults.seo.length} results
                    </div>
                  </div>
                </div>

                {/* Score Breakdown */}
                <details className="mt-3">
                  <summary className="text-xs text-ns-mute cursor-pointer hover:text-ns-text">
                    View score breakdown
                  </summary>
                  <div className="mt-2 grid grid-cols-5 gap-2 text-xs">
                    {Object.entries(candidate.checkResults.score.subscores).map(([key, value]) => (
                      <div key={key} className="text-center">
                        <div className="text-ns-mute capitalize">{key}</div>
                        <div className="text-ns-text font-bold">{value}</div>
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
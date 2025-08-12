"use client";

import { useState } from "react";
import { Search, TrendingUp, Shield, Zap, ArrowRight, Sparkles, MessageSquare, Info, Globe, Users, BarChart3, ChevronRight, ExternalLink, AlertCircle, ToggleLeft, ToggleRight } from "lucide-react";
import ChatMode from "@/components/ChatMode";

interface DomainInfo {
  status: '✅' | '⚠️' | '❌' | '❓';
  displayText?: string;
  url?: string;
}

interface CheckResult {
  domains: Record<string, string | DomainInfo>;
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
  recommendations?: {
    names: string[];
    analysis: string;
  };
  parsed?: {
    cleanName: string;
    originalInput: string;
    wasConverted: boolean;
    hadExtension: boolean;
    requestedExtension?: string;
  };
}

export default function Home() {
  const [brandName, setBrandName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<'check' | 'generate'>('check');
  const [extendedTlds, setExtendedTlds] = useState(false);
  const [loadingExtended, setLoadingExtended] = useState(false);

  const handleSearch = async (searchName?: string) => {
    const nameToSearch = searchName || brandName;
    
    if (!nameToSearch.trim() || nameToSearch.length < 2) {
      setError("Please enter at least 2 characters");
      return;
    }

    setError("");
    setLoading(true);
    setResult(null);

    try {
      const url = extendedTlds 
        ? `/api/check?name=${encodeURIComponent(nameToSearch)}&extended=true`
        : `/api/check?name=${encodeURIComponent(nameToSearch)}`;
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (searchName) {
        setBrandName(searchName);
      }

      if (!res.ok) {
        throw new Error(data.error || "Failed to check availability");
      }

      setResult(data);
      
      // If extended TLDs are enabled and we got the basic results, fetch AI-suggested TLDs
      if (extendedTlds && data.domains) {
        setLoadingExtended(true);
        try {
          const extRes = await fetch('/api/suggest-tlds-fast', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              domainName: data.parsed?.cleanName || nameToSearch,
              currentResults: data.domains 
            })
          });
          
          if (extRes.ok) {
            const extData = await extRes.json();
            // Merge extended TLDs with existing results
            setResult(prev => ({
              ...prev!,
              domains: {
                ...prev!.domains,
                ...extData.suggestedTlds
              }
            }));
          }
        } catch (extErr) {
          console.error('Failed to get extended TLDs:', extErr);
        } finally {
          setLoadingExtended(false);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-200">
        <div className="container">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-xl gradient-text">NameSweep</span>
              <span className="badge badge-success">
                <span className="inline-flex h-1.5 w-1.5 rounded-full bg-success animate-pulse"></span>
                Live
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#search" className="nav-link">Search</a>
              <a href="#pricing" className="nav-link">Pricing</a>
              <a href="#about" className="nav-link">About</a>
            </div>
            <div className="flex items-center gap-3">
              <button className="btn-ghost">Sign In</button>
              <button className="btn-primary">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="section relative pt-32 pb-8 md:pb-12 dot-bg overflow-hidden">
        <div className="absolute inset-0 mesh-gradient opacity-30"></div>
        <div className="container relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="badge mb-6 mx-auto animate-fade-down">
              <Sparkles className="w-3 h-3 mr-1" />
              AI-Powered Domain Intelligence
            </div>
            
            <h1 className="heading-1 mb-6 gradient-text-animated">
              Find Your Perfect Domain Name in Seconds
            </h1>
            
            <p className="text-body mb-8 max-w-2xl mx-auto">
              Check domain availability, social media handles, trademarks, and SEO competition instantly. 
              Powered by AI to help you make smart branding decisions.
            </p>
            
          </div>
        </div>
      </section>


      {/* Search Section */}
      <section className="py-8 sm:py-12" id="search">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            {/* Mode Toggle */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex bg-neutral-100 rounded-lg p-1">
                <button
                  onClick={() => setMode('check')}
                  className={`px-6 py-2 rounded-md text-sm font-medium transition ${
                    mode === 'check' 
                      ? 'bg-white text-neutral-900 shadow-sm' 
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <Search className="inline-block w-4 h-4 mr-2" />
                  Check a Name
                </button>
                <button
                  onClick={() => setMode('generate')}
                  className={`px-6 py-2 rounded-md text-sm font-medium transition ${
                    mode === 'generate' 
                      ? 'bg-white text-neutral-900 shadow-sm' 
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <Sparkles className="inline-block w-4 h-4 mr-2" />
                  AI Generator
                </button>
              </div>
            </div>
            
            <div className="text-center mb-8">
              <h2 className="heading-3 mb-2">
                {mode === 'check' ? 'Check Your Brand Name' : 'Generate Brand Names with AI'}
              </h2>
              <p className="text-neutral-600">
                {mode === 'check' 
                  ? 'Enter any name to check availability across domains, social media, and trademarks' 
                  : 'Describe your business and let AI generate the perfect brand names'}
              </p>
            </div>
            
            {mode === 'check' ? (
              <div className="card p-8">
                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="text"
                    placeholder="Enter your brand name..."
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="input-large flex-1"
                  />
                  <button 
                    onClick={() => handleSearch()} 
                    disabled={loading}
                    className="btn-primary px-8"
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                        Checking...
                      </span>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Check Availability
                      </>
                    )}
                  </button>
                </div>
                
                {/* Extended TLDs Toggle */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-200">
                  <button
                    onClick={() => setExtendedTlds(!extendedTlds)}
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    {extendedTlds ? (
                      <ToggleRight className="w-5 h-5 text-primary" />
                    ) : (
                      <ToggleLeft className="w-5 h-5 text-neutral-400" />
                    )}
                    <span>Extended TLDs</span>
                  </button>
                  <span className="text-xs text-neutral-500">
                    {extendedTlds ? "AI will suggest 10 relevant TLDs" : "Showing .com, .co, .io, .net only"}
                  </span>
                </div>
                
                {error && (
                  <div className="mt-4 p-3 bg-error/10 border border-error/20 rounded-lg text-error text-sm flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                    {error}
                  </div>
                )}
              </div>
            ) : (
              <ChatMode />
            )}
          </div>
        </div>
      </section>

      {/* Results Section */}
      {mode === 'check' && result && (
        <section className="section bg-neutral-50">
          <div className="container">
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Conversion Notice */}
              {result?.parsed?.wasConverted && (
                <div className="card-primary p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">
                        Converted to domain name: <span className="font-bold">{result.parsed.cleanName}</span>
                      </p>
                      <p className="text-sm text-neutral-600 mt-1">
                        Original input: &ldquo;{result.parsed.originalInput}&rdquo;
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Domains */}
              <div className="card p-6">
                <h3 className="heading-3 mb-6 flex items-center gap-2">
                  <Globe className="w-6 h-6 text-primary" />
                  Domain Availability
                  {loadingExtended && (
                    <span className="text-sm text-neutral-500 ml-auto flex items-center">
                      <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary mr-2"></span>
                      AI suggesting more TLDs...
                    </span>
                  )}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(result.domains).map(([tld, domainData]) => {
                    // Handle both string and object formats
                    const isObject = typeof domainData === 'object' && domainData !== null;
                    const status = isObject ? (domainData as DomainInfo).status : domainData as string;
                    const displayText = isObject ? (domainData as DomainInfo).displayText : '';
                    const url = isObject ? (domainData as DomainInfo).url : null;
                    
                    // Determine styling based on status
                    const getStatusClass = () => {
                      if (status === '✅') return 'status-available';
                      if (status === '⚠️') return 'status-premium';
                      if (status === '❌') return 'status-taken';
                      if (status === '❓') return 'status-unknown';
                      return 'status-unknown';
                    };
                    
                    return (
                      <div
                        key={tld}
                        className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${getStatusClass()}`}
                      >
                        <div className="text-2xl mb-2">
                          {status}
                        </div>
                        <div className="font-semibold">
                          {result?.parsed?.cleanName || brandName.toLowerCase().replace(/[^a-z0-9]/g, '')}{tld}
                        </div>
                        
                        {/* Display text based on status */}
                        {displayText && (
                          <div className="text-xs mt-1 text-neutral-600">
                            {displayText}
                          </div>
                        )}
                        
                        {/* Show link for live sites */}
                        {status === '❌' && displayText === 'has live site' && url && (
                          <a 
                            href={url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs mt-1 text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
                          >
                            Visit site
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        
                        {/* Special handling for unable to verify */}
                        {status === '❓' && (
                          <div className="text-xs mt-1 text-orange-600 font-medium">
                            Unable to verify - check manually
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Social Media */}
              <div className="card p-6">
                <h3 className="heading-3 mb-6 flex items-center gap-2">
                  <Users className="w-6 h-6 text-primary" />
                  Social Media Handles
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {Object.entries({
                    'X': result.socials.x,
                    'Instagram': result.socials.instagram,
                    'YouTube': result.socials.youtube,
                    'TikTok': result.socials.tiktok,
                    'Substack': result.socials.substack
                  }).map(([platform, data]) => (
                    <div
                      key={platform}
                      className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                        data?.status === '✅' 
                          ? 'status-available'
                          : data?.status === '❌'
                          ? 'status-taken'
                          : 'status-unknown'
                      }`}
                    >
                      <div className="font-semibold text-sm mb-1">{platform}</div>
                      <div className="text-2xl mb-2">
                        {data?.status === '✅' ? '✅' : data?.status === '❌' ? '❌' : '❓'}
                      </div>
                      <div className="text-xs">
                        {data?.status === '✅' ? 'Available' : 
                         data?.status === '❌' ? 'Taken' : 
                         'Check Manually'}
                      </div>
                      {data && ('url' in data || 'urls' in data) && (
                        <div className="mt-2">
                          {'urls' in data && data.urls ? (
                            data.urls.map((url: string, i: number) => (
                              <a 
                                key={i}
                                href={url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline flex items-center gap-1"
                              >
                                Verify
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            ))
                          ) : 'url' in data && data.url ? (
                            <a 
                              href={data.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline flex items-center gap-1"
                            >
                              Verify
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : null}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Trademark */}
              <div className="card p-6">
                <h3 className="heading-3 mb-6 flex items-center gap-2">
                  <Shield className="w-6 h-6 text-primary" />
                  USPTO Trademark Status
                </h3>
                <div className={`p-4 rounded-lg border-2 ${
                  result.tm.status === "none" 
                    ? "status-available" 
                    : result.tm.status === "dead"
                    ? "status-premium"
                    : "status-taken"
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold">Status: </span>
                      <span className={`font-medium ${
                        result.tm.status === "live" ? "text-error" :
                        result.tm.status === "dead" ? "text-warning" :
                        "text-success"
                      }`}>
                        {result.tm.status === "none" ? "No trademark found ✅" : result.tm.status.toUpperCase()}
                      </span>
                    </div>
                    {result.tm.serial && (
                      <div className="text-sm text-neutral-600">
                        Serial: {result.tm.serial}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* SEO Competition */}
              <div className="card p-6">
                <h3 className="heading-3 mb-6 flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-primary" />
                  SEO Competition Analysis
                </h3>
                <div className="space-y-3">
                  {result.seo.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 hover:bg-neutral-100 transition">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{item.title}</div>
                        <div className="text-sm text-neutral-600">{item.root}</div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        item.da === "high" ? "badge-error" :
                        item.da === "med" ? "badge-warning" :
                        "badge-success"
                      }`}>
                        DA: {item.da.toUpperCase()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Recommendations */}
              {result.recommendations && (
                <div className="card-primary p-6">
                  <h3 className="heading-3 mb-4 flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-primary" />
                    AI Recommendations
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-white/60">
                      <p className="text-neutral-700 leading-relaxed">
                        {result.recommendations.analysis || (
                          result.domains[".com"] === "✅" && result.tm.status === "none" 
                            ? "Excellent choice! The .com domain is available and no conflicting trademarks found."
                            : result.domains[".com"] === "⚠️"
                            ? "The .com domain is premium. Consider alternative TLDs or variations."
                            : result.tm.status === "live"
                            ? "Warning: Active trademark exists. Consider a different name to avoid legal issues."
                            : "Mixed availability. Review the results and consider alternative options."
                        )}
                      </p>
                    </div>
                    
                    {result.recommendations.names && result.recommendations.names.length > 0 && (
                      <div>
                        <p className="text-sm text-neutral-600 mb-3">
                          Try these alternative names:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {result.recommendations.names.map((name, index) => (
                            <button
                              key={index}
                              onClick={() => handleSearch(name)}
                              disabled={loading}
                              className="btn-outline text-sm"
                            >
                              {name}
                              <ChevronRight className="ml-1 h-3 w-3" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="section bg-gradient-primary text-white">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="heading-2 mb-4">
              Ready to Secure Your Perfect Domain?
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Join thousands of entrepreneurs who&apos;ve found their perfect domain with NameSweep
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn bg-white text-primary hover:bg-neutral-100">
                Get Started Free
              </button>
              <button className="btn border-2 border-white text-white hover:bg-white/10">
                View Pricing Plans
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 py-12 bg-white">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="font-display font-bold text-xl gradient-text mb-4">
                NameSweep
              </div>
              <p className="text-sm text-neutral-600">
                AI-powered domain intelligence platform for modern businesses.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Product</h4>
              <div className="space-y-2">
                <a href="#" className="block text-sm text-neutral-600 hover:text-primary transition">Features</a>
                <a href="#" className="block text-sm text-neutral-600 hover:text-primary transition">Pricing</a>
                <a href="#" className="block text-sm text-neutral-600 hover:text-primary transition">API</a>
                <a href="#" className="block text-sm text-neutral-600 hover:text-primary transition">Integrations</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Resources</h4>
              <div className="space-y-2">
                <a href="#" className="block text-sm text-neutral-600 hover:text-primary transition">Documentation</a>
                <a href="#" className="block text-sm text-neutral-600 hover:text-primary transition">Blog</a>
                <a href="#" className="block text-sm text-neutral-600 hover:text-primary transition">Support</a>
                <a href="#" className="block text-sm text-neutral-600 hover:text-primary transition">Status</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Company</h4>
              <div className="space-y-2">
                <a href="#" className="block text-sm text-neutral-600 hover:text-primary transition">About</a>
                <a href="#" className="block text-sm text-neutral-600 hover:text-primary transition">Privacy</a>
                <a href="#" className="block text-sm text-neutral-600 hover:text-primary transition">Terms</a>
                <a href="#" className="block text-sm text-neutral-600 hover:text-primary transition">Contact</a>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-neutral-200 text-center text-sm text-neutral-600">
            © 2024 NameSweep. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
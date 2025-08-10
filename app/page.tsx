"use client";

import { useState, useEffect } from "react";
import { Search, TrendingUp, Shield, Zap, ArrowRight, Check, X, Sparkles, Star, Rocket, MessageSquare } from "lucide-react";
import ChatMode from "@/components/ChatMode";

interface CheckResult {
  domains: Record<string, string>;
  socials: {
    x: { status: string; url?: string };
    instagram: { status: string; url?: string };
    youtube: { status: string; url?: string };
  };
  tm: { status: string; serial: string | null };
  seo: Array<{ title: string; root: string; da: string }>;
  premium: boolean;
  recommendations?: {
    names: string[];
    analysis: string;
  };
}

export default function Home() {
  const [brandName, setBrandName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<'check' | 'generate'>('check');

  useEffect(() => {
    const script = document.createElement('script');
    script.innerHTML = `
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!prefersReduced) {
        // Enhanced intersection observer with staggered animations
        const io = new IntersectionObserver((entries)=> {
          entries.forEach((e, index) => { 
            if (e.isIntersecting) {
              e.target.classList.add('animate-fadeUp');
              e.target.style.animationDelay = \`\${index * 0.1}s\`;
            }
          });
        }, { threshold: 0.12 });
        
        document.querySelectorAll('[data-reveal]').forEach(n => io.observe(n));

        // Enhanced halo effect with smoother movement
        const halo = document.querySelector('[data-halo]');
        if (halo) {
          let rafId;
          window.addEventListener('mousemove', (e) => {
            cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
              const x = (e.clientX / window.innerWidth - 0.5) * 2;
              const y = (e.clientY / window.innerHeight - 0.5) * 2;
              halo.style.transform = \`translate3d(\${x*8}px, \${y*6}px, 0) scale(1.1)\`;
            });
          });
        }

        // Add floating particles effect
        const addFloatingParticles = () => {
          const particles = document.querySelectorAll('.floating-particle');
          particles.forEach((particle, index) => {
            particle.style.animationDelay = \`\${index * 0.5}s\`;
            particle.style.animationDuration = \`\${3 + index * 0.5}s\`;
          });
        };
        addFloatingParticles();

        // Add shimmer effect to buttons
        const shimmerButtons = document.querySelectorAll('.shimmer-btn');
        shimmerButtons.forEach(btn => {
          btn.addEventListener('mouseenter', () => {
            btn.classList.add('animate-shimmer');
          });
          btn.addEventListener('mouseleave', () => {
            btn.classList.remove('animate-shimmer');
          });
        });
      }
    `;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

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
      const res = await fetch(`/api/check?name=${encodeURIComponent(nameToSearch)}`);
      const data = await res.json();
      
      if (searchName) {
        setBrandName(searchName);
      }

      if (!res.ok) {
        throw new Error(data.error || "Failed to check availability");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ns-bg">
      {/* Floating Particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="floating-particle absolute top-20 left-10 w-2 h-2 bg-ns-accent/30 rounded-full animate-float"></div>
        <div className="floating-particle absolute top-40 right-20 w-1 h-1 bg-ns-accent2/40 rounded-full animate-float"></div>
        <div className="floating-particle absolute bottom-40 left-20 w-1.5 h-1.5 bg-ns-accent/20 rounded-full animate-float"></div>
        <div className="floating-particle absolute bottom-20 right-10 w-1 h-1 bg-ns-accent2/30 rounded-full animate-float"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-ns-surface/70 border-b border-white/5">
        <div className="container px-6 md:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2 hover-pulse">
              <span className="font-display font-bold text-xl text-ns-text">NameSweep</span>
              <span className="inline-flex h-2 w-2 rounded-full bg-ns-accent animate-pulseGlow"></span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#buy" className="nav-link text-ns-text/70 hover:text-ns-text transition">Buy</a>
              <a href="#sell" className="nav-link text-ns-text/70 hover:text-ns-text transition">Sell</a>
              <a href="#watchlist" className="nav-link text-ns-text/70 hover:text-ns-text transition">Watchlist</a>
              <a href="#generator" className="nav-link text-ns-text/70 hover:text-ns-text transition">Generator</a>
              <a href="#pricing" className="nav-link text-ns-text/70 hover:text-ns-text transition">Pricing</a>
            </div>
            <div className="flex items-center gap-3">
              <button className="btn-ghost hidden sm:inline-flex hover-shimmer">Sign In</button>
              <button className="btn-accent">Get Started</button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="section relative isolate pt-32 pb-16 md:pb-24">
        <div className="absolute inset-x-0 -top-4 h-[46vh] max-h-[520px] bg-halo-arc pointer-events-none [mask-image:linear-gradient(to_bottom,black,transparent)]" data-halo></div>
        <div className="absolute inset-0 bg-dot-grid bg-grid opacity-[.16] animate-slowPan pointer-events-none"></div>

        <div className="container px-6 md:px-8">
          <div className="badge mb-5 w-max hover-glow" data-reveal>
            <span className="inline-flex h-2 w-2 rounded-full bg-ns-accent mr-2 animate-pulseGlow"></span>
            <Sparkles className="w-3 h-3 mr-1 animate-pulseGlow" />
            AI Domain Marketplace
          </div>

          <h1 className="font-display text-[clamp(32px,5vw,56px)] leading-tight tracking-[-0.01em] text-ns-text max-w-4xl gradient-text" data-reveal>
            Own Your Next Big Idea.
          </h1>

          <p className="mt-4 max-w-2xl text-white/70 animate-fadeIn" data-reveal>
            Check domain, social, trademark & SEO availability instantly. No fees, no hassle—just smart, seamless trading.
          </p>

                      <div className="mt-8 flex flex-col sm:flex-row gap-3 stagger-animation" data-reveal>
              <button className="btn-accent min-w-[140px]">
                <Rocket className="mr-2 h-4 w-4" />
                Start Checking
              </button>
              <a href="#features" className="btn-ghost">Learn More</a>
            </div>
        </div>
      </section>

      {/* Value Cards */}
      <section className="section py-16" id="features">
        <div className="container px-6 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 card-grid">
            <div className="card p-6 card-hover" data-reveal>
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-ns-accent/10 mb-4 hover-bounce">
                <Zap className="w-6 h-6 text-ns-accent animate-pulseGlow" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-bold text-ns-text mb-2">Own it Fast, Secure It Instantly</h3>
              <p className="text-ns-mute text-sm">Lightning-fast domain checks across all major TLDs with real-time availability updates.</p>
            </div>
            <div className="card p-6 card-hover" data-reveal>
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-ns-accent/10 mb-4 hover-bounce">
                <Shield className="w-6 h-6 text-ns-accent animate-pulseGlow" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-bold text-ns-text mb-2">Trademark Protection Built-In</h3>
              <p className="text-ns-mute text-sm">USPTO trademark checks ensure your brand is legally clear before you commit.</p>
            </div>
            <div className="card p-6 card-hover" data-reveal>
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-ns-accent/10 mb-4 hover-bounce">
                <TrendingUp className="w-6 h-6 text-ns-accent animate-pulseGlow" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-bold text-ns-text mb-2">Buy with Confidence</h3>
              <p className="text-ns-mute text-sm">SEO collision analysis and social media availability checks in one place.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="section py-16" id="search">
        <div className="container px-6 md:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Mode Toggle */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex bg-white/5 rounded-pill p-1">
                <button
                  onClick={() => setMode('check')}
                  className={`px-6 py-2 rounded-pill text-sm font-medium transition ${
                    mode === 'check' 
                      ? 'bg-ns-accent text-ns-surface2' 
                      : 'text-ns-mute hover:text-ns-text'
                  }`}
                >
                  <Search className="inline-block w-4 h-4 mr-2" />
                  Check a Name
                </button>
                <button
                  onClick={() => setMode('generate')}
                  className={`px-6 py-2 rounded-pill text-sm font-medium transition ${
                    mode === 'generate' 
                      ? 'bg-ns-accent text-ns-surface2' 
                      : 'text-ns-mute hover:text-ns-text'
                  }`}
                >
                  <MessageSquare className="inline-block w-4 h-4 mr-2" />
                  Describe Business
                </button>
              </div>
            </div>
            
            <h2 className="font-display text-[clamp(28px,3.6vw,40px)] text-center mb-8 text-ns-text animate-fadeIn" data-reveal>
              {mode === 'check' ? 'Check Your Brand Name' : 'Generate Brand Names'}
            </h2>
            
            {mode === 'check' ? (
              <div className="card p-6 md:p-8 card-hover" data-reveal>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    placeholder="Enter your brand name..."
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="flex-1 px-5 py-3 bg-white/[0.06] rounded-pill text-ns-text placeholder-white/40 border border-white/10 focus:border-ns-accent/50 focus:ring-2 focus:ring-ns-accent/50 focus:outline-none transition-all duration-300 ease-out focus:scale-[1.02] input-animated"
                  />
                  <button 
                    onClick={() => handleSearch()} 
                    disabled={loading}
                    className="btn-accent min-w-[140px]"
                  >
                    {loading ? (
                      <span className="loading-pulse">Checking...</span>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" strokeWidth={2} />
                        Check Now
                      </>
                    )}
                  </button>
                </div>
                {error && (
                  <p className="text-red-500 text-sm mt-3 text-center animate-fadeIn">{error}</p>
                )}
              </div>
            ) : (
              <ChatMode />
            )}
          </div>
        </div>
      </section>

      {/* Results Section */}
      {mode === 'check' && (loading || result) && (
        <section className="section py-16">
          <div className="container px-6 md:px-8">
            <div className="grid gap-6 max-w-6xl mx-auto">
              {/* Domains */}
              <div className="card p-6 card-hover" data-reveal>
                <h3 className="text-xl font-bold text-ns-text mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-ns-accent animate-pulseGlow" />
                  Domain Availability
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {loading ? (
                    <>
                      {[1,2,3,4].map((i) => (
                        <div key={i} className="h-20 bg-white/5 rounded-xl loading-pulse"></div>
                      ))}
                    </>
                  ) : result ? (
                    Object.entries(result.domains).map(([tld, status]) => (
                      <div
                        key={tld}
                        className={`p-4 rounded-xl border transition-all duration-300 ease-out hover:scale-105 hover-lift ${
                          status === "✅" 
                            ? "status-available" 
                            : status === "⚠️"
                            ? "status-premium"
                            : "status-taken"
                        }`}
                      >
                        <div className="text-2xl mb-1">{status}</div>
                        <div className="font-bold text-ns-text">{tld}</div>
                        {status === "⚠️" && (
                          <div className="text-xs text-yellow-500 mt-1">Premium</div>
                        )}
                      </div>
                    ))
                  ) : null}
                </div>
              </div>

              {/* Social Media */}
              <div className="card p-6 card-hover" data-reveal>
                <h3 className="text-xl font-bold text-ns-text mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-ns-accent animate-pulseGlow" />
                  Social Media Handles
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {loading ? (
                    <>
                      {[1,2,3].map((i) => (
                        <div key={i} className="h-20 bg-white/5 rounded-xl loading-pulse"></div>
                      ))}
                    </>
                  ) : result ? (
                    <>
                      {Object.entries({
                        'X (Twitter)': result.socials.x,
                        'Instagram': result.socials.instagram,
                        'YouTube': result.socials.youtube
                      }).map(([platform, data]) => (
                        <div
                          key={platform}
                          className={`p-4 rounded-xl border transition-all duration-300 ease-out hover:scale-105 hover-lift ${
                            data.status === "✅" 
                              ? "status-available" 
                              : "status-taken"
                          }`}
                        >
                          <div className="text-2xl mb-1">{data.status}</div>
                          <div className="font-bold text-ns-text text-sm">{platform}</div>
                          {data.url && (
                            <a 
                              href={data.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-ns-accent hover:underline mt-1 inline-block hover:text-ns-accent2 transition-colors"
                            >
                              View Profile
                            </a>
                          )}
                        </div>
                      ))}
                    </>
                  ) : null}
                </div>
              </div>

              {/* Trademark */}
              <div className="card p-6 card-hover" data-reveal>
                <h3 className="text-xl font-bold text-ns-text mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-ns-accent animate-pulseGlow" />
                  USPTO Trademark Status
                </h3>
                {loading ? (
                  <div className="h-16 bg-white/5 rounded-xl loading-pulse"></div>
                ) : result ? (
                  <div className={`p-4 rounded-xl border transition-all duration-300 ease-out hover:scale-105 hover-lift ${
                    result.tm.status === "none" 
                      ? "status-available" 
                      : result.tm.status === "dead"
                      ? "status-premium"
                      : "status-taken"
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-ns-text">Status: </span>
                        <span className={`capitalize font-medium ${
                          result.tm.status === "live" ? "text-red-500" :
                          result.tm.status === "dead" ? "text-yellow-500" :
                          "text-ns-accent"
                        }`}>
                          {result.tm.status === "none" ? "No trademark found ✅" : result.tm.status}
                        </span>
                      </div>
                      {result.tm.serial && (
                        <div className="text-sm text-ns-mute">
                          Serial: {result.tm.serial}
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>

              {/* SEO Collision */}
              <div className="card p-6 card-hover" data-reveal>
                <h3 className="text-xl font-bold text-ns-text mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-ns-accent animate-pulseGlow" />
                  SEO Competition
                </h3>
                {loading ? (
                  <>
                    {[1,2,3].map((i) => (
                      <div key={i} className="h-12 bg-white/5 rounded-xl loading-pulse mb-2"></div>
                    ))}
                  </>
                ) : result ? (
                  <div className="space-y-2">
                    {result.seo.map((item, index) => (
                      <div key={index} className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/[0.07] transition-all duration-300 ease-out hover:scale-[1.02] hover-lift">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm text-ns-text truncate">{item.title}</div>
                            <div className="text-xs text-ns-mute">{item.root}</div>
                          </div>
                          <div className={`px-3 py-1 rounded-pill text-xs font-bold transition-all duration-300 ease-out hover:scale-105 ${
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
                ) : null}
              </div>

              {/* AI Recommendations */}
              {result && (
                <div className="card p-6 bg-gradient-to-br from-ns-accent/10 to-ns-accent2/5 border-ns-accent/30 card-hover" data-reveal>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-ns-accent to-ns-accent2 bg-clip-text text-transparent mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 animate-pulseGlow" />
                    AI Recommendations
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-ns-surface/60 backdrop-blur border border-white/10 hover:bg-ns-surface/80 transition-all duration-300 ease-out">
                      <p className="text-ns-text leading-relaxed">
                        {result.recommendations?.analysis ? (
                          <span>{result.recommendations.analysis}</span>
                        ) : result.domains[".com"] === "✅" && result.tm.status === "none" ? (
                          <span className="text-ns-accent font-semibold">
                            Excellent choice! The .com domain is available and no conflicting trademarks found.
                          </span>
                        ) : result.domains[".com"] === "⚠️" ? (
                          <span className="text-yellow-500 font-semibold">
                            The .com domain is premium (expensive). Consider alternative TLDs or variations.
                          </span>
                        ) : result.tm.status === "live" ? (
                          <span className="text-red-500 font-semibold">
                            Warning: Active trademark exists. Consider a different name to avoid legal issues.
                          </span>
                        ) : (
                          <span className="text-yellow-500 font-semibold">
                            Mixed availability. Review the results and consider alternative options.
                          </span>
                        )}
                      </p>
                    </div>
                    
                    {result.recommendations?.names && result.recommendations.names.length > 0 && (
                      <div className="pt-4 border-t border-white/10">
                        <p className="text-sm text-ns-mute mb-4">
                          Try these alternative names:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {result.recommendations.names.map((name, index) => (
                            <button
                              key={index}
                              onClick={() => handleSearch(name)}
                              disabled={loading}
                              className="px-4 py-2 bg-white/10 rounded-pill text-ns-text font-medium text-sm hover:bg-ns-accent hover:text-ns-surface2 transition-all duration-300 ease-out hover:scale-105 hover-pulse disabled:opacity-50"
                            >
                              {name}
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

      {/* Final CTA */}
      <section className="section relative py-24">
        <div className="absolute inset-x-0 top-0 h-[30vh] max-h-[320px] bg-halo-arc pointer-events-none opacity-50"></div>
        <div className="container px-6 md:px-8 relative">
          <div className="text-center max-w-3xl mx-auto" data-reveal>
            <h2 className="font-display text-[clamp(28px,3.6vw,40px)] mb-4 text-ns-text gradient-text">
              Ready to Secure Your Brand?
            </h2>
            <p className="text-white/70 mb-8">
              Join thousands of entrepreneurs who&apos;ve found their perfect domain with NameSweep.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center stagger-animation">
              <button className="btn-accent min-w-[140px]">
                <Rocket className="mr-2 h-4 w-4" />
                Get Started Free
              </button>
              <button className="btn-ghost">View Pricing</button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12">
        <div className="container px-6 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4 hover-pulse">
                <span className="font-display font-bold text-xl text-ns-text">NameSweep</span>
                <span className="inline-flex h-2 w-2 rounded-full bg-ns-accent animate-pulseGlow"></span>
              </div>
              <p className="text-sm text-ns-mute">
                The smart way to check and secure your brand across domains, social media, and trademarks.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-ns-text mb-3">Product</h4>
              <div className="space-y-2">
                <a href="#" className="block text-sm text-ns-mute hover:text-ns-text transition-all duration-300 ease-out hover:translate-x-1">Domain Check</a>
                <a href="#" className="block text-sm text-ns-mute hover:text-ns-text transition-all duration-300 ease-out hover:translate-x-1">Trademark Search</a>
                <a href="#" className="block text-sm text-ns-mute hover:text-ns-text transition-all duration-300 ease-out hover:translate-x-1">Social Media</a>
                <a href="#" className="block text-sm text-ns-mute hover:text-ns-text transition-all duration-300 ease-out hover:translate-x-1">SEO Analysis</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-ns-text mb-3">Company</h4>
              <div className="space-y-2">
                <a href="#" className="block text-sm text-ns-mute hover:text-ns-text transition-all duration-300 ease-out hover:translate-x-1">About</a>
                <a href="#" className="block text-sm text-ns-mute hover:text-ns-text transition-all duration-300 ease-out hover:translate-x-1">Privacy</a>
                <a href="#" className="block text-sm text-ns-mute hover:text-ns-text transition-all duration-300 ease-out hover:translate-x-1">Terms</a>
                <a href="#" className="block text-sm text-ns-mute hover:text-ns-text transition-all duration-300 ease-out hover:translate-x-1">Contact</a>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 text-center text-sm text-ns-mute">
            © 2024 NameSweep. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
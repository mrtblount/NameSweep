"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";

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
}

export default function Home() {
  const [brandName, setBrandName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!brandName.trim() || brandName.length < 2) {
      setError("Please enter at least 2 characters");
      return;
    }

    setError("");
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`/api/check?name=${encodeURIComponent(brandName)}`);
      const data = await res.json();

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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            NameSweep
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Check domain, social, trademark & SEO availability instantly
          </p>
        </div>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Input
                placeholder="Enter your brand name..."
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="text-lg h-12"
              />
              <Button 
                onClick={handleSearch} 
                disabled={loading}
                size="lg"
                className="h-12 px-8"
              >
                <Search className="mr-2 h-5 w-5" />
                {loading ? "Checking..." : "Check"}
              </Button>
            </div>
            {error && (
              <p className="text-red-500 text-sm mt-2">{error}</p>
            )}
          </CardContent>
        </Card>

        {(loading || result) && (
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Domains</CardTitle>
                <CardDescription>Top-level domain availability</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {loading ? (
                    <>
                      <Skeleton className="h-20" />
                      <Skeleton className="h-20" />
                      <Skeleton className="h-20" />
                      <Skeleton className="h-20" />
                    </>
                  ) : result ? (
                    Object.entries(result.domains).map(([tld, status]) => (
                      <div
                        key={tld}
                        className="p-4 rounded-lg border text-center hover:shadow-md transition-shadow"
                      >
                        <div className="text-2xl mb-1">{status}</div>
                        <div className="font-semibold">{tld}</div>
                        {status === "⚠️" && (
                          <div className="text-xs text-orange-600 mt-1">Premium</div>
                        )}
                      </div>
                    ))
                  ) : null}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Social Media</CardTitle>
                <CardDescription>Handle availability on major platforms</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {loading ? (
                    <>
                      <Skeleton className="h-20" />
                      <Skeleton className="h-20" />
                      <Skeleton className="h-20" />
                    </>
                  ) : result ? (
                    <>
                      <div className="p-4 rounded-lg border text-center hover:shadow-md transition-shadow">
                        <div className="text-2xl mb-1">{result.socials.x.status}</div>
                        <div className="font-semibold">X (Twitter)</div>
                        {result.socials.x.url && (
                          <a 
                            href={result.socials.x.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline"
                          >
                            View
                          </a>
                        )}
                      </div>
                      <div className="p-4 rounded-lg border text-center hover:shadow-md transition-shadow">
                        <div className="text-2xl mb-1">{result.socials.instagram.status}</div>
                        <div className="font-semibold">Instagram</div>
                        {result.socials.instagram.url && (
                          <a 
                            href={result.socials.instagram.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline"
                          >
                            View
                          </a>
                        )}
                      </div>
                      <div className="p-4 rounded-lg border text-center hover:shadow-md transition-shadow">
                        <div className="text-2xl mb-1">{result.socials.youtube.status}</div>
                        <div className="font-semibold">YouTube</div>
                        {result.socials.youtube.url && (
                          <a 
                            href={result.socials.youtube.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline"
                          >
                            View
                          </a>
                        )}
                      </div>
                    </>
                  ) : null}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>USPTO Trademark</CardTitle>
                <CardDescription>US trademark registration status</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-16" />
                ) : result ? (
                  <div className="p-4 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-semibold">Status: </span>
                        <span className={`capitalize ${
                          result.tm.status === "live" ? "text-red-600" :
                          result.tm.status === "dead" ? "text-yellow-600" :
                          "text-green-600"
                        }`}>
                          {result.tm.status === "none" ? "No trademark found" : result.tm.status}
                        </span>
                      </div>
                      {result.tm.serial && (
                        <div className="text-sm text-gray-600">
                          Serial: {result.tm.serial}
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SEO Collision</CardTitle>
                <CardDescription>Top 3 Google search results</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <>
                    <Skeleton className="h-12 mb-2" />
                    <Skeleton className="h-12 mb-2" />
                    <Skeleton className="h-12" />
                  </>
                ) : result ? (
                  <div className="space-y-2">
                    {result.seo.map((item, index) => (
                      <div key={index} className="p-3 rounded-lg border hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-sm truncate">{item.title}</div>
                            <div className="text-xs text-gray-600">{item.root}</div>
                          </div>
                          <div className={`ml-4 px-2 py-1 rounded text-xs font-semibold ${
                            item.da === "high" ? "bg-red-100 text-red-700" :
                            item.da === "med" ? "bg-yellow-100 text-yellow-700" :
                            "bg-green-100 text-green-700"
                          }`}>
                            DA: {item.da.toUpperCase()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </CardContent>
            </Card>

            {result && (
              <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800">
                <CardHeader>
                  <CardTitle>Recommendation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg">
                    {result.domains[".com"] === "✅" && result.tm.status === "none" ? (
                      <span className="text-green-600 font-semibold">
                        Excellent choice! The .com domain is available and no conflicting trademarks found.
                      </span>
                    ) : result.domains[".com"] === "⚠️" ? (
                      <span className="text-orange-600 font-semibold">
                        The .com domain is premium (expensive). Consider alternative TLDs or variations.
                      </span>
                    ) : result.tm.status === "live" ? (
                      <span className="text-red-600 font-semibold">
                        Warning: Active trademark exists. Consider a different name to avoid legal issues.
                      </span>
                    ) : (
                      <span className="text-yellow-600 font-semibold">
                        Mixed availability. Review the results and consider alternative options.
                      </span>
                    )}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

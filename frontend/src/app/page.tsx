"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Header } from "@/components/ui/navbar";
import { Globe } from "@/components/ui/globe";
import { Marquee } from "@/components/ui/marquee";
import { BentoGridShowcase } from "@/components/ui/bento-grid";
import { HowItWorks } from "@/components/ui/how-it-works";
import { ApiShowcase } from "@/components/ui/api-showcase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Zap,
  BarChart3,
  Code2,
  Fingerprint,
  Link2,
  Globe2,
  ArrowRight,
  Check,
  Loader2,
} from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

// --- Stat items ---

function StatItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="mx-6 flex items-center gap-2 whitespace-nowrap text-sm text-zinc-300 md:mx-10">
      {icon}
      <span>{label}</span>
    </div>
  );
}

function StatDivider() {
  return <span className="mx-2 text-zinc-700">&bull;</span>;
}

// --- Feature Cards with rich interiors ---

const RedirectsCard = () => {
  const [latency, setLatency] = useState("98");
  const values = ["98", "42", "12", "67", "23"];

  useEffect(() => {
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % values.length;
      setLatency(values[idx]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="flex h-full flex-col border-zinc-800/80 bg-zinc-900/50">
      <CardHeader>
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
          <Zap className="h-6 w-6 text-red-500" />
        </div>
        {/* Animated latency counter */}
        <div className="mb-3 flex items-baseline gap-1">
          <span className="text-4xl font-bold text-white transition-all duration-500">{latency}</span>
          <span className="text-sm text-zinc-500">ms</span>
        </div>
        <CardTitle className="text-white">Lightning Redirects</CardTitle>
        <CardDescription className="text-zinc-400">
          Sub-100ms redirects powered by Redis caching and edge-optimized routing.
        </CardDescription>
      </CardHeader>
      <CardFooter className="mt-auto flex items-center justify-between">
        <Badge variant="outline" className="border-red-500/30 text-red-400">Redis-backed</Badge>
        <span className="text-xs text-zinc-500">50+ edge locations</span>
      </CardFooter>
    </Card>
  );
};

const AnalyticsCard = () => {
  const bars = [40, 65, 45, 80, 55, 90, 70];
  return (
    <Card className="relative h-full w-full overflow-hidden border-zinc-800/80 bg-zinc-900/50">
      <CardContent className="relative z-10 flex h-full flex-col items-center justify-center p-6">
        {/* Mini bar chart */}
        <div className="mb-4 flex items-end gap-1.5 h-16">
          {bars.map((h, i) => (
            <div
              key={i}
              className={`w-3 rounded-sm transition-all ${i === 5 ? "bg-red-500" : "bg-zinc-700"}`}
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        <span className="text-5xl font-bold text-red-500">98</span>
        <span className="mt-1 text-sm text-zinc-400">ms avg redirect</span>
      </CardContent>
    </Card>
  );
};

const ApiCard = () => (
  <Card className="h-full border-zinc-800/80 bg-zinc-900/50">
    <CardContent className="flex h-full flex-col justify-between p-6">
      <div className="flex items-start justify-between">
        <div>
          <CardTitle className="text-base font-medium text-white">Developer API</CardTitle>
          <CardDescription className="text-zinc-400">RESTful endpoints with SDKs</CardDescription>
        </div>
        <Badge variant="outline" className="border-red-500/30 text-red-400">REST</Badge>
      </div>
      {/* Mini code snippet */}
      <div
        className="mt-4 rounded-lg bg-zinc-950/80 p-3 text-xs leading-relaxed"
        style={{ fontFamily: "var(--font-geist-mono), monospace" }}
      >
        <div><span className="text-red-400">POST</span> <span className="text-zinc-400">/api/v1/shorten</span></div>
        <div className="text-zinc-600">{"// \u2192 { short_url: \"snap.dev/abc\" }"}</div>
      </div>
    </CardContent>
  </Card>
);

const ShortCodesCard = () => {
  const [typed, setTyped] = useState("");
  const word = "your-brand";

  useEffect(() => {
    let i = 0;
    let forward = true;
    const interval = setInterval(() => {
      if (forward) {
        i++;
        setTyped(word.slice(0, i));
        if (i === word.length) {
          forward = false;
          // Pause at full word
          setTimeout(() => {
            const delInterval = setInterval(() => {
              i--;
              setTyped(word.slice(0, i));
              if (i === 0) {
                clearInterval(delInterval);
                forward = true;
              }
            }, 80);
          }, 1500);
        }
      }
    }, 120);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="h-full border-zinc-800/80 bg-zinc-900/50">
      <CardContent className="flex h-full flex-wrap items-center justify-between gap-4 p-6">
        <div>
          <CardTitle className="text-base font-medium text-white">Custom Short Codes</CardTitle>
          <CardDescription className="text-zinc-400">
            Claim branded URLs like snap.link/your-brand. Build trust with vanity links.
          </CardDescription>
        </div>
        <div className="flex items-center gap-0">
          <div
            className="flex h-8 items-center rounded-l-md border border-zinc-700 bg-zinc-950/80 px-3 text-xs text-zinc-300"
            style={{ fontFamily: "var(--font-geist-mono), monospace" }}
          >
            <Link2 className="mr-2 h-3 w-3 text-red-500" />
            snap.dev/
          </div>
          <div
            className="flex h-8 min-w-[90px] items-center rounded-r-md border border-l-0 border-red-500/30 bg-red-500/10 px-3 text-xs text-red-400"
            style={{ fontFamily: "var(--font-geist-mono), monospace" }}
          >
            {typed}<span className="inline-block w-px h-3.5 bg-red-400 animate-pulse ml-px" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// --- Tech stack pills for footer ---
const techStack = ["FastAPI", "React", "Redis", "PostgreSQL", "TypeScript"];

// --- Main page ---

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [shortUrl, setShortUrl] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // GSAP page-load entrance
  useGSAP(() => {
    const els = document.querySelectorAll(".hero-anim");
    gsap.from(els, {
      opacity: 0,
      y: 20,
      duration: 0.6,
      ease: "power2.out",
      stagger: 0.15,
    });
  }, []);

  const isValidUrl = (s: string) => /^https?:\/\/.+/.test(s);

  const handleShorten = useCallback(async () => {
    setError("");
    if (!isValidUrl(url)) {
      setError("Please enter a valid URL starting with http:// or https://");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      setShortUrl(data.short_url);
    } catch {
      setError("API coming soon \u2014 check back after deploy");
    } finally {
      setLoading(false);
    }
  }, [url]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [shortUrl]);

  const handleReset = useCallback(() => {
    setUrl("");
    setShortUrl("");
    setError("");
  }, []);

  return (
    <main className="relative min-h-full">
      <Header />

      {/* ─── Section 1: Hero ─── */}
      <section id="hero" className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden">
        {/* Globe behind copy */}
        <div className="absolute left-1/2 top-[10%] aspect-square w-full max-w-[500px] -translate-x-1/2 md:max-w-[800px]">
          <Globe className="top-0" />
        </div>

        {/* Copy on top */}
        <div ref={heroRef} className="relative z-10 flex flex-col items-center gap-6 px-6 text-center">
          <div className="hero-anim inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/80 px-4 py-1.5 text-xs text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
            Now processing 50K+ redirects daily
          </div>

          <h1 className="hero-anim text-5xl font-bold tracking-tighter md:text-7xl lg:text-8xl">
            <span className="gradient-text">Shorten.</span>
            <br />
            <span className="gradient-text">Share.</span>
            <br />
            <span className="text-red-500">Track.</span>
          </h1>

          <p className="hero-anim max-w-[45ch] text-lg text-zinc-400">
            Lightning-fast URL shortener with real-time analytics,
            developer-friendly API, and custom short codes.
          </p>

          {/* URL Input Bar */}
          <div className="hero-anim w-full max-w-lg">
            {shortUrl ? (
              /* Success state */
              <div className="flex flex-col items-center gap-3">
                <div className="flex w-full items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3">
                  <span className="flex-1 truncate text-sm text-emerald-400" style={{ fontFamily: "var(--font-geist-mono), monospace" }}>
                    {shortUrl}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-400 transition-colors hover:bg-emerald-500/20 cursor-pointer"
                  >
                    {copied ? <Check className="h-3 w-3" /> : "Copy"}
                  </button>
                </div>
                <button
                  onClick={handleReset}
                  className="text-xs text-zinc-500 transition-colors hover:text-zinc-300 cursor-pointer"
                >
                  Shorten another &rarr;
                </button>
              </div>
            ) : (
              /* Default / Loading state */
              <div className="flex flex-col gap-2">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="relative flex-1">
                    <Link2 className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => { setUrl(e.target.value); setError(""); }}
                      placeholder="Paste your long URL here..."
                      disabled={loading}
                      className="h-12 w-full rounded-xl border border-zinc-800 bg-zinc-900/80 pl-11 pr-4 text-sm text-zinc-300 placeholder:text-zinc-600 outline-none transition-all focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 disabled:opacity-50"
                    />
                  </div>
                  <button
                    onClick={handleShorten}
                    disabled={loading}
                    className="flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-red-500 px-6 text-sm font-semibold text-white transition-all hover:bg-red-600 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Shorten"}
                    {!loading && <ArrowRight className="h-4 w-4" />}
                  </button>
                </div>
                {error && (
                  <p className="text-xs text-red-400">{error}</p>
                )}
              </div>
            )}
          </div>

          <div className="hero-anim flex items-center gap-6 text-xs text-zinc-500">
            <span className="flex items-center gap-1.5">
              <Zap className="h-3 w-3 text-red-500" /> 98ms avg redirect
            </span>
            <span className="flex items-center gap-1.5">
              <Globe2 className="h-3 w-3 text-red-500" /> 50+ countries
            </span>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
      </section>

      {/* ─── Section 2: Stats Marquee ─── */}
      <section id="stats" className="relative border-y border-zinc-800/50 bg-zinc-950/50 py-5">
        <Marquee duration={35} pauseOnHover fade fadeAmount={8}>
          <StatItem icon={<Zap className="h-4 w-4 text-red-500" />} label="10K+ links shortened" />
          <StatDivider />
          <StatItem icon={<BarChart3 className="h-4 w-4 text-red-500" />} label="98ms avg redirect" />
          <StatDivider />
          <StatItem icon={<Globe2 className="h-4 w-4 text-red-500" />} label="50+ countries served" />
          <StatDivider />
          <StatItem icon={<Code2 className="h-4 w-4 text-red-500" />} label="REST API available" />
          <StatDivider />
          <StatItem icon={<Fingerprint className="h-4 w-4 text-red-500" />} label="Custom short codes" />
          <StatDivider />
          <StatItem icon={<Zap className="h-4 w-4 text-red-500" />} label="99.9% uptime SLA" />
          <StatDivider />
        </Marquee>
      </section>

      {/* ─── Section 3: How It Works ─── */}
      <HowItWorks />

      {/* ─── Section 4: Features (Bento Grid) ─── */}
      <section id="features" className="scroll-offset relative py-24 lg:py-32">
        <div className="mx-auto max-w-5xl px-6 lg:px-12">
          <div className="mb-16 max-w-2xl">
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
              <span className="gradient-text">Everything you need to</span>
              <br />
              <span className="text-red-500">own your links</span>
            </h2>
            <p className="text-base leading-relaxed text-zinc-400">
              Built on FastAPI, React, Redis, and PostgreSQL for speed that
              doesn&apos;t compromise on features.
            </p>
          </div>

          <BentoGridShowcase
            primary={<RedirectsCard />}
            secondary={<AnalyticsCard />}
            tertiary={<ApiCard />}
            wide={<ShortCodesCard />}
          />
        </div>
      </section>

      {/* ─── Section 5: API Showcase ─── */}
      <ApiShowcase />

      {/* ─── Section 6: Footer ─── */}
      <footer className="border-t border-zinc-800/50 py-10">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-6 lg:px-12">
          {/* Attribution */}
          <p className="text-sm text-zinc-400">
            Built by{" "}
            <a href="#" className="text-white transition-colors hover:text-red-400">
              Your Name
            </a>
          </p>

          {/* Tech stack pills */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {techStack.map((tech) => (
              <span
                key={tech}
                className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs text-zinc-400"
              >
                {tech}
              </span>
            ))}
          </div>

          {/* Bottom row */}
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/rsphoenix02/snap"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-zinc-500 transition-colors hover:text-zinc-300"
            >
              GitHub
            </a>
            <span className="text-zinc-700">|</span>
            <span className="flex items-center gap-1.5 text-xs text-zinc-600">
              &copy; 2026 <Zap className="h-3 w-3 fill-red-500 text-red-500" /> SNAP
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}

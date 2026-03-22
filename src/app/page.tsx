"use client";

import { Header } from "@/components/ui/navbar";
import { Globe } from "@/components/ui/globe";
import { Marquee } from "@/components/ui/marquee";
import { BentoGrid, BentoCard } from "@/components/ui/bento-grid";
import {
  Zap,
  BarChart3,
  Code2,
  Fingerprint,
  Link2,
  Globe2,
  ArrowRight,
} from "lucide-react";

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

export default function Home() {
  return (
    <main className="relative min-h-full">
      <Header />

      {/* ─── Section 1: Hero ─── */}
      <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden">
        {/* Massive globe behind copy */}
        <div className="absolute left-1/2 top-[10%] w-full max-w-[500px] -translate-x-1/2 aspect-square md:max-w-[800px]">
          <Globe className="top-0" />
        </div>

        {/* Copy on top of globe */}
        <div className="relative z-10 flex flex-col items-center text-center gap-6 px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/80 px-4 py-1.5 text-xs text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
            Now processing 50K+ redirects daily
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-white">
            Shorten.
            <br />
            <span className="text-red-500">Share.</span>
            <br />
            Track.
          </h1>

          <p className="text-lg text-zinc-400 max-w-[45ch]">
            Lightning-fast URL shortener with real-time analytics,
            developer-friendly API, and custom short codes.
          </p>

          {/* URL Input Bar (static placeholder) */}
          <div className="flex w-full max-w-lg flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Link2 className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Paste your long URL here..."
                readOnly
                className="h-12 w-full rounded-xl border border-zinc-800 bg-zinc-900/80 pl-11 pr-4 text-sm text-zinc-300 placeholder:text-zinc-600 outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all"
              />
            </div>
            <button className="h-12 rounded-xl bg-red-500 px-6 text-sm font-semibold text-white transition-all hover:bg-red-600 active:scale-[0.98] flex items-center gap-2 justify-center whitespace-nowrap cursor-pointer">
              Shorten
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-6 text-xs text-zinc-500">
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
      <section className="relative border-y border-zinc-800/50 bg-zinc-950/50 py-5">
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

      {/* ─── Section 3: Features (Bento Grid) ─── */}
      <section id="features" className="relative py-24 lg:py-32">
        <div className="mx-auto max-w-5xl px-6 lg:px-12">
          <div className="mb-16 max-w-2xl">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-white md:text-4xl">
              Everything you need to
              <br />
              <span className="text-red-500">own your links</span>
            </h2>
            <p className="text-base leading-relaxed text-zinc-400">
              Built on FastAPI, React, Redis, and PostgreSQL for speed that
              doesn&apos;t compromise on features.
            </p>
          </div>

          <BentoGrid>
            <BentoCard
              icon={<Zap className="h-5 w-5" />}
              title="Fast Redirects"
              description="Sub-100ms redirects powered by Redis caching and edge-optimized routing across global points of presence."
            />
            <BentoCard
              icon={<BarChart3 className="h-5 w-5" />}
              title="Real-Time Analytics"
              description="Track clicks, referrers, geolocation, and device breakdowns with a live dashboard that updates in seconds."
            />
            <BentoCard
              icon={<Code2 className="h-5 w-5" />}
              title="Developer API"
              description="RESTful API with API key auth, rate limiting, and SDKs for Python, Node, and Go. Automate everything."
            />
            <BentoCard
              icon={<Fingerprint className="h-5 w-5" />}
              title="Custom Short Codes"
              description="Claim branded short codes like snap.link/your-brand. Vanity URLs that build trust and recognition."
            />
          </BentoGrid>
        </div>
      </section>

      {/* ─── Section 4: Footer ─── */}
      <footer className="border-t border-zinc-800/50 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-6 sm:flex-row lg:px-12">
          <p className="text-sm text-zinc-500">
            Built with FastAPI &middot; React &middot; Redis &middot; PostgreSQL
          </p>
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="text-sm text-zinc-500 transition-colors hover:text-zinc-300"
            >
              GitHub
            </a>
            <span className="text-zinc-700">|</span>
            <span className="text-xs text-zinc-600">
              &copy; 2026 SNAP
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}

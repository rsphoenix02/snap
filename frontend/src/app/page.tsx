"use client";

import { Header } from "@/components/ui/navbar";
import { Globe } from "@/components/ui/globe";
import { Marquee } from "@/components/ui/marquee";
import { BentoGridShowcase } from "@/components/ui/bento-grid";
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

// --- Feature Cards (adapted from ui_components/bento_grid.md demo cards) ---

const RedirectsCard = () => (
  <Card className="flex h-full flex-col border-zinc-800/80 bg-zinc-900/50">
    <CardHeader>
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
        <Zap className="h-6 w-6 text-red-500" />
      </div>
      <CardTitle className="text-white">Lightning Redirects</CardTitle>
      <CardDescription className="text-zinc-400">
        Sub-100ms redirects powered by Redis caching and edge-optimized routing.
        Your links resolve instantly across global points of presence.
      </CardDescription>
    </CardHeader>
    <CardFooter className="mt-auto flex items-center justify-between">
      <Badge variant="outline" className="border-red-500/30 text-red-400">
        Redis-backed
      </Badge>
      <span className="text-xs text-zinc-500">50+ edge locations</span>
    </CardFooter>
  </Card>
);

const AnalyticsCard = () => (
  <Card className="relative h-full w-full overflow-hidden border-zinc-800/80 bg-zinc-900/50">
    {/* Dotted background — from original StatisticCard */}
    <div
      className="absolute inset-0 opacity-10"
      style={{
        backgroundImage:
          "radial-gradient(rgba(239,68,68,0.5) 1px, transparent 1px)",
        backgroundSize: "16px 16px",
      }}
    />
    <CardContent className="relative z-10 flex h-full flex-col items-center justify-center p-6">
      <span className="text-7xl font-bold text-red-500">98</span>
      <span className="mt-1 text-sm text-zinc-400">ms avg redirect</span>
    </CardContent>
  </Card>
);

const ApiCard = () => (
  <Card className="h-full border-zinc-800/80 bg-zinc-900/50">
    <CardContent className="flex h-full flex-col justify-between p-6">
      <div className="flex items-start justify-between">
        <div>
          <CardTitle className="text-base font-medium text-white">
            Developer API
          </CardTitle>
          <CardDescription className="text-zinc-400">
            RESTful endpoints with SDKs
          </CardDescription>
        </div>
        <Badge variant="outline" className="border-red-500/30 text-red-400">
          REST
        </Badge>
      </div>
      <div className="mt-4 rounded-lg bg-zinc-950/80 p-3 font-mono text-xs text-zinc-400">
        <span className="text-red-400">POST</span> /api/v1/shorten
      </div>
    </CardContent>
  </Card>
);

const ShortCodesCard = () => (
  <Card className="h-full border-zinc-800/80 bg-zinc-900/50">
    <CardContent className="flex h-full flex-wrap items-center justify-between gap-4 p-6">
      <div>
        <CardTitle className="text-base font-medium text-white">
          Custom Short Codes
        </CardTitle>
        <CardDescription className="text-zinc-400">
          Claim branded URLs like snap.link/your-brand. Build trust with vanity
          links.
        </CardDescription>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex h-8 items-center rounded-md border border-zinc-700 bg-zinc-950/80 px-3 font-mono text-xs text-zinc-300">
          <Link2 className="mr-2 h-3 w-3 text-red-500" />
          snap.link/
        </div>
        <div className="flex h-8 items-center rounded-md border border-red-500/30 bg-red-500/10 px-3 font-mono text-xs text-red-400">
          your-brand
        </div>
      </div>
    </CardContent>
  </Card>
);

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

          <BentoGridShowcase
            primary={<RedirectsCard />}
            secondary={<AnalyticsCard />}
            tertiary={<ApiCard />}
            wide={<ShortCodesCard />}
          />
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
            <span className="flex items-center gap-1.5 text-xs text-zinc-600">
              &copy; 2026 <Zap className="h-3 w-3 text-red-500 fill-red-500" /> SNAP
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}

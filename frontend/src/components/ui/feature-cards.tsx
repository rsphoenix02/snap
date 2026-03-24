"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Link2 } from "lucide-react";

export const RedirectsCard = () => {
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

export const AnalyticsCard = () => {
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

export const ApiCard = () => (
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
        <div className="text-zinc-600">{"// \u2192 { short_url: \"snapurl.click/abc\" }"}</div>
      </div>
    </CardContent>
  </Card>
);

export const ShortCodesCard = () => {
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
            snapurl.click/
          </div>
          <div
            className="flex h-8 items-center rounded-r-md border border-l-0 border-red-500/30 bg-red-500/10 px-3 text-xs text-red-400"
            style={{ fontFamily: "var(--font-geist-mono), monospace", width: "14ch", whiteSpace: "nowrap" }}
          >
            {typed}<span className="inline-block w-px h-3.5 bg-red-400 animate-pulse ml-px" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

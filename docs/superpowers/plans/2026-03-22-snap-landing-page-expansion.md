# SNAP Landing Page Expansion — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand the SNAP landing page from 4 thin sections to 6 polished, production-quality sections with GSAP animations, making it an impressive portfolio piece for SDE1 interviews.

**Architecture:** Enhance existing Hero/Stats/Features/Footer sections in-place. Add two new standalone components (HowItWorks, ApiShowcase). Introduce GSAP + ScrollTrigger alongside existing Framer Motion. All scroll-triggered animations via GSAP; Framer Motion stays for navbar only.

**Tech Stack:** React 19, Next.js 16, TypeScript, Tailwind CSS v4, GSAP + @gsap/react + ScrollTrigger, Framer Motion (existing), Lucide React icons, Cobe (globe)

**Design Spec:** `docs/superpowers/specs/2026-03-22-snap-landing-page-expansion-design.md`

**Pre-requisite:** `CLAUDE.md` has already been updated to authorize 6-section layout, functional URL input, and new section IDs.

---

## File Map

### Files to Create
| File | Responsibility |
|------|---------------|
| `frontend/src/components/ui/how-it-works.tsx` | 3-step architecture flow with SVG connecting lines, GSAP scroll animation |
| `frontend/src/components/ui/api-showcase.tsx` | Tabbed code block (cURL/Python/JS) with typing animation, JSON response |

### Files to Modify
| File | Changes |
|------|---------|
| `frontend/src/app/globals.css` | Add dot-grid bg utility, gradient text utility, scroll-behavior, scroll-margin-top |
| `frontend/src/components/ui/navbar.tsx` | Add "How It Works" and "API" to nav links |
| `frontend/src/components/ui/bento-grid.tsx` | Rewrite: Framer Motion → GSAP ScrollTrigger, add hover glow |
| `frontend/src/app/page.tsx` | Major rewrite: gradient headline, functional URL input, rich bento card interiors, new sections, enhanced footer, GSAP page-load timeline |

---

## Task 1: Install GSAP Dependencies

**Files:** `frontend/package.json`

**Parallelizable:** No (dependency for all subsequent tasks)

- [ ] **Step 1: Install gsap and @gsap/react**

```bash
cd frontend && npm install gsap @gsap/react
```

- [ ] **Step 2: Verify installation**

```bash
cd frontend && node -e "require('gsap'); require('@gsap/react'); console.log('OK')"
```

Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add frontend/package.json frontend/package-lock.json
git commit -m "chore: add gsap and @gsap/react dependencies"
```

---

## Task 2: Global CSS Utilities

**Files:**
- Modify: `frontend/src/app/globals.css`

**Parallelizable:** Yes (independent of Tasks 3-6, only needs Task 1)

- [ ] **Step 1: Add utility classes to globals.css**

Append after the existing `* { border-color: var(--border); }` block:

```css
/* Smooth scroll with navbar offset */
html {
  scroll-behavior: smooth;
}

/* Scroll offset for sticky navbar */
.scroll-offset {
  scroll-margin-top: 80px;
}

/* Dot-grid background for How It Works and API sections */
.dot-grid-bg {
  background-image: radial-gradient(rgba(63, 63, 70, 0.2) 1px, transparent 1px);
  background-size: 24px 24px;
}

/* Gradient text utility */
.gradient-text {
  background: linear-gradient(to right, #ffffff, #a1a1aa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

- [ ] **Step 2: Verify dev server still starts**

```bash
cd frontend && npx next build --no-lint 2>&1 | tail -5
```

Expected: Build succeeds (or at minimum, no CSS errors).

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/globals.css
git commit -m "feat: add global CSS utilities for dot-grid, gradient text, smooth scroll"
```

---

## Task 3: Navbar — Add New Section Links

**Files:**
- Modify: `frontend/src/components/ui/navbar.tsx` (line 8-11, the `menuItems` array)

**Parallelizable:** Yes (independent of Tasks 2, 4-6)

- [ ] **Step 1: Update menuItems array**

Replace lines 8-11 in `navbar.tsx`:

```typescript
const menuItems = [
    { name: 'Features', target: 'features' },
    { name: 'Stats', target: 'stats' },
]
```

With:

```typescript
const menuItems = [
    { name: 'Features', target: 'features' },
    { name: 'How It Works', target: 'how-it-works' },
    { name: 'API', target: 'api' },
    { name: 'Stats', target: 'stats' },
]
```

- [ ] **Step 2: Verify no TypeScript errors**

```bash
cd frontend && npx tsc --noEmit 2>&1 | tail -10
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/ui/navbar.tsx
git commit -m "feat: add How It Works and API links to navbar"
```

---

## Task 4: How It Works Section (NEW)

**Files:**
- Create: `frontend/src/components/ui/how-it-works.tsx`

**Parallelizable:** Yes (independent of Tasks 2, 3, 5, 6)

- [ ] **Step 1: Create the HowItWorks component**

Create `frontend/src/components/ui/how-it-works.tsx` with:

```tsx
"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Link2, Zap, BarChart3 } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    number: "01",
    title: "Paste URL",
    tech: "React Frontend",
    description:
      "Submit any URL through our clean interface or REST API.",
    icon: Link2,
  },
  {
    number: "02",
    title: "Generate Hash",
    tech: "FastAPI + Redis",
    description:
      "Base62-encoded short code generated and cached for instant lookups.",
    icon: Zap,
  },
  {
    number: "03",
    title: "Redirect & Track",
    tech: "PostgreSQL + Analytics",
    description:
      "Lightning redirect with async click tracking — location, device, timestamp.",
    icon: BarChart3,
  },
];

export function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const linesRef = useRef<(SVGLineElement | null)[]>([]);

  useGSAP(
    () => {
      if (!containerRef.current) return;

      // Animate cards staggered left-to-right
      cardsRef.current.forEach((card, i) => {
        if (!card) return;
        gsap.from(card, {
          opacity: 0,
          y: 30,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            toggleActions: "play none none none",
          },
          delay: i * 0.2,
        });
      });

      // Animate connecting lines via stroke-dashoffset
      linesRef.current.forEach((line, i) => {
        if (!line) return;
        const length = line.getTotalLength();
        gsap.set(line, {
          strokeDasharray: length,
          strokeDashoffset: length,
        });
        gsap.to(line, {
          strokeDashoffset: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: cardsRef.current[i],
            start: "top 80%",
            toggleActions: "play none none none",
          },
          delay: 0.3,
        });
      });
    },
    { scope: containerRef }
  );

  return (
    <section
      id="how-it-works"
      className="scroll-offset dot-grid-bg relative py-24 lg:py-32"
    >
      <div
        ref={containerRef}
        className="mx-auto max-w-5xl px-6 lg:px-12"
      >
        {/* Section header */}
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
            <span className="gradient-text">How It</span>{" "}
            <span className="text-red-500">Works</span>
          </h2>
          <p className="text-base text-zinc-400">
            From URL to redirect in under 100ms
          </p>
        </div>

        {/* Steps flow */}
        <div className="relative flex flex-col items-center gap-8 md:flex-row md:items-start md:justify-between md:gap-4">
          {steps.map((step, i) => (
            <div key={step.number} className="flex items-center gap-4 md:flex-col md:items-center md:gap-0">
              {/* Card */}
              <div
                ref={(el) => { cardsRef.current[i] = el; }}
                className="flex w-64 flex-col items-center rounded-xl border border-zinc-800 bg-zinc-900/80 p-6 text-center"
              >
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
                  <step.icon className="h-6 w-6 text-red-500" />
                </div>
                <span className="mb-1 text-xs font-mono text-zinc-500">
                  {step.number}
                </span>
                <h3 className="mb-1 text-lg font-semibold text-white">
                  {step.title}
                </h3>
                <span className="mb-2 text-xs font-medium text-red-400">
                  {step.tech}
                </span>
                <p className="text-sm leading-relaxed text-zinc-400">
                  {step.description}
                </p>
              </div>

              {/* Connecting line (not after last card) */}
              {i < steps.length - 1 && (
                <svg
                  className="hidden h-[2px] w-16 md:block lg:w-24"
                  style={{ overflow: "visible" }}
                >
                  <line
                    ref={(el) => { linesRef.current[i] = el; }}
                    x1="0"
                    y1="1"
                    x2="100%"
                    y2="1"
                    stroke="#ef4444"
                    strokeWidth="2"
                    strokeDasharray="6 4"
                    opacity="0.5"
                  />
                </svg>
              )}

              {/* Vertical connector on mobile */}
              {i < steps.length - 1 && (
                <div className="h-8 w-px bg-zinc-700/50 md:hidden" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd frontend && npx tsc --noEmit 2>&1 | tail -10
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/ui/how-it-works.tsx
git commit -m "feat: add How It Works architecture flow section"
```

---

## Task 5: API Showcase Section (NEW)

**Files:**
- Create: `frontend/src/components/ui/api-showcase.tsx`

**Parallelizable:** Yes (independent of Tasks 2, 3, 4, 6)

- [ ] **Step 1: Create the ApiShowcase component**

Create `frontend/src/components/ui/api-showcase.tsx` with:

```tsx
"use client";

import { useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

const tabs = [
  {
    name: "cURL",
    code: `curl -X POST https://snap.dev/api/v1/shorten \\
  -H "Authorization: Bearer sk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://example.com/very-long-path",
    "custom_code": "my-link"
  }'`,
  },
  {
    name: "Python",
    code: `import requests

response = requests.post(
    "https://snap.dev/api/v1/shorten",
    headers={
        "Authorization": "Bearer sk_live_...",
        "Content-Type": "application/json",
    },
    json={
        "url": "https://example.com/very-long-path",
        "custom_code": "my-link",
    },
)
print(response.json())`,
  },
  {
    name: "JavaScript",
    code: `const response = await fetch(
  "https://snap.dev/api/v1/shorten",
  {
    method: "POST",
    headers: {
      "Authorization": "Bearer sk_live_...",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url: "https://example.com/very-long-path",
      custom_code: "my-link",
    }),
  }
);
const data = await response.json();`,
  },
];

const responseJson = `{
  "short_url": "https://snap.dev/my-link",
  "original_url": "https://example.com/very-long-path",
  "custom_code": "my-link",
  "created_at": "2026-03-22T10:30:00Z",
  "clicks": 0
}`;

export function ApiShowcase() {
  const [activeTab, setActiveTab] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef<HTMLPreElement>(null);
  const responseRef = useRef<HTMLDivElement>(null);
  const [typedText, setTypedText] = useState("");
  const [showResponse, setShowResponse] = useState(false);
  const hasAnimated = useRef(false);

  useGSAP(
    () => {
      if (!sectionRef.current || hasAnimated.current) return;

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 75%",
        once: true,
        onEnter: () => {
          if (hasAnimated.current) return;
          hasAnimated.current = true;

          const code = tabs[0].code;
          let i = 0;

          const typeInterval = setInterval(() => {
            if (i < code.length) {
              setTypedText(code.slice(0, i + 1));
              i++;
            } else {
              clearInterval(typeInterval);
              // Show response after typing completes
              setTimeout(() => setShowResponse(true), 500);
            }
          }, 30);
        },
      });
    },
    { scope: sectionRef }
  );

  const handleTabChange = (index: number) => {
    setActiveTab(index);
    // After initial animation, show full code for other tabs
    if (hasAnimated.current) {
      setTypedText(tabs[index].code);
    }
  };

  const displayCode = hasAnimated.current && activeTab !== 0
    ? tabs[activeTab].code
    : activeTab === 0
      ? typedText
      : tabs[activeTab].code;

  return (
    <section
      id="api"
      className="scroll-offset dot-grid-bg relative py-24 lg:py-32"
    >
      <div ref={sectionRef} className="mx-auto max-w-5xl px-6 lg:px-12">
        {/* Section header */}
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
            <span className="gradient-text">Developer-First</span>{" "}
            <span className="text-red-500">API</span>
          </h2>
          <p className="text-base text-zinc-400">
            Clean REST endpoints. API key auth. JSON everywhere.
          </p>
        </div>

        {/* Split layout */}
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Left: Tabbed code block */}
          <div className="flex-[3] overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
            {/* Tabs */}
            <div className="flex border-b border-zinc-800">
              {tabs.map((tab, i) => (
                <button
                  key={tab.name}
                  onClick={() => handleTabChange(i)}
                  className={`px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                    activeTab === i
                      ? "border-b-2 border-red-500 text-white"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </div>
            {/* Code */}
            <pre
              ref={codeRef}
              className="overflow-x-auto p-5 font-mono text-sm leading-relaxed text-zinc-300"
              style={{ fontFamily: "var(--font-geist-mono), monospace" }}
            >
              <code>{displayCode}</code>
              {activeTab === 0 && !hasAnimated.current && (
                <span className="inline-block h-4 w-1.5 animate-pulse bg-red-500 align-middle" />
              )}
            </pre>
          </div>

          {/* Right: Response */}
          <div
            ref={responseRef}
            className={`flex-[2] overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 transition-all duration-500 ${
              showResponse || (hasAnimated.current && activeTab !== 0)
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            <div className="border-b border-zinc-800 px-4 py-2.5">
              <span className="text-sm font-medium text-zinc-400">
                Response{" "}
                <span className="ml-2 text-xs text-emerald-400">
                  200 OK
                </span>
              </span>
            </div>
            <pre
              className="overflow-x-auto p-5 font-mono text-sm leading-relaxed text-zinc-300"
              style={{ fontFamily: "var(--font-geist-mono), monospace" }}
            >
              <code>{responseJson}</code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd frontend && npx tsc --noEmit 2>&1 | tail -10
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/ui/api-showcase.tsx
git commit -m "feat: add API Showcase section with tabbed code blocks"
```

---

## Task 6: Bento Grid — Rewrite with GSAP + Rich Card Interiors

**Files:**
- Modify: `frontend/src/components/ui/bento-grid.tsx` (full rewrite, 100 lines → ~100 lines)

**Parallelizable:** Yes (independent of Tasks 2-5)

- [ ] **Step 1: Rewrite bento-grid.tsx**

Replace entire contents of `frontend/src/components/ui/bento-grid.tsx` with:

```tsx
"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

interface BentoGridShowcaseProps {
  primary: React.ReactNode;
  secondary: React.ReactNode;
  tertiary: React.ReactNode;
  wide: React.ReactNode;
  className?: string;
}

export const BentoGridShowcase = ({
  primary,
  secondary,
  tertiary,
  wide,
  className,
}: BentoGridShowcaseProps) => {
  const gridRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!gridRef.current) return;
      const cards = gridRef.current.querySelectorAll<HTMLElement>("[data-bento-card]");

      gsap.from(cards, {
        opacity: 0,
        y: 30,
        scale: 0.97,
        duration: 0.6,
        ease: "power2.out",
        stagger: 0.12,
        scrollTrigger: {
          trigger: gridRef.current,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });
    },
    { scope: gridRef }
  );

  return (
    <div
      ref={gridRef}
      className={cn(
        "grid w-full grid-cols-1 gap-6 md:grid-cols-2",
        "md:grid-rows-2",
        "auto-rows-[minmax(180px,auto)]",
        className
      )}
    >
      <div data-bento-card className="group md:col-span-1 md:row-span-2 transition-all duration-300 hover:shadow-[0_0_20px_rgba(239,68,68,0.1)] rounded-xl">
        {primary}
      </div>
      <div data-bento-card className="group md:col-span-1 md:row-span-1 transition-all duration-300 hover:shadow-[0_0_20px_rgba(239,68,68,0.1)] rounded-xl">
        {secondary}
      </div>
      <div data-bento-card className="group md:col-span-1 md:row-span-1 transition-all duration-300 hover:shadow-[0_0_20px_rgba(239,68,68,0.1)] rounded-xl">
        {tertiary}
      </div>
      <div data-bento-card className="group md:col-span-2 md:row-span-1 transition-all duration-300 hover:shadow-[0_0_20px_rgba(239,68,68,0.1)] rounded-xl">
        {wide}
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd frontend && npx tsc --noEmit 2>&1 | tail -10
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/ui/bento-grid.tsx
git commit -m "refactor: rewrite bento-grid from Framer Motion to GSAP ScrollTrigger with hover glow"
```

---

## Task 7: Page.tsx — Full Assembly

**Files:**
- Modify: `frontend/src/app/page.tsx` (major rewrite — all 255 lines)

**Parallelizable:** No (depends on Tasks 1-6 being committed)

This is the integration task. It wires everything together: gradient headline, functional URL input with validation/loading/error states, rich bento card interiors, new section imports, enhanced footer, GSAP page-load timeline.

- [ ] **Step 1: Rewrite page.tsx**

Replace the entire contents of `frontend/src/app/page.tsx` with:

```tsx
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
        <div className="text-zinc-600">{"// → { short_url: \"snap.dev/abc\" }"}</div>
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
      setError("API coming soon — check back after deploy");
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
                  Shorten another →
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
```

**Note:** The `values` array in `RedirectsCard` and `word` in `ShortCodesCard` are defined inside the component but are constant — this is intentional to keep the components self-contained. The `useEffect` cleanup functions handle `clearInterval` to prevent memory leaks.

**Note on stat counters:** The spec calls for animated count-up numbers in the marquee. However, the marquee duplicates its children 4x for seamless scrolling, and animating counters on continuously-scrolling duplicated elements creates visual artifacts. The numbers are kept as static text — the marquee's scrolling motion itself provides sufficient visual interest. This is a deliberate simplification.

- [ ] **Step 2: Verify build succeeds**

```bash
cd frontend && npx next build --no-lint 2>&1 | tail -10
```

Expected: Build succeeds.

- [ ] **Step 3: Visual check**

```bash
cd frontend && npx next dev &
```

Open `http://localhost:3000` and verify:
- Hero gradient headline renders correctly
- URL input accepts text (don't need backend yet — error fallback should show)
- Stats marquee scrolls with borders
- How It Works section shows 3 cards with connecting lines
- Features bento grid animates on scroll with hover glow
- API Showcase types out curl command on scroll
- Footer shows tech pills
- All sections are navigable via navbar links
- Mobile responsive (resize browser)

- [ ] **Step 4: Commit**

```bash
git add frontend/src/app/page.tsx
git commit -m "feat: assemble expanded landing page with all 6 sections, GSAP animations, functional input"
```

---

## Task 8: Final Build Verification & Cleanup

**Files:** All modified files

**Parallelizable:** No (final pass)

- [ ] **Step 1: Full build check**

```bash
cd frontend && npx next build --no-lint 2>&1
```

Expected: Build succeeds with no errors.

- [ ] **Step 2: TypeScript strict check**

```bash
cd frontend && npx tsc --noEmit 2>&1
```

Expected: No errors.

- [ ] **Step 3: Check file sizes**

```bash
wc -l frontend/src/components/ui/how-it-works.tsx frontend/src/components/ui/api-showcase.tsx frontend/src/components/ui/bento-grid.tsx frontend/src/app/page.tsx
```

Expected: All files under 400 lines.

- [ ] **Step 4: Final commit if any cleanup was needed**

```bash
git status
# Stage only relevant files if there are changes — do NOT use git add -A
# git add <specific files> && git commit -m "chore: final cleanup for landing page expansion"
```

---

## Execution Notes

### Parallelization Map

```
Task 1 (Install GSAP)
  │
  ├─→ Task 2 (CSS utilities)      ─┐
  ├─→ Task 3 (Navbar links)       ─┤
  ├─→ Task 4 (How It Works)       ─┼─→ Task 7 (Page assembly) ─→ Task 8 (Verification)
  ├─→ Task 5 (API Showcase)       ─┤
  └─→ Task 6 (Bento Grid rewrite) ─┘
```

Tasks 2-6 can all run in **parallel worktree agents** after Task 1 completes. Task 7 must wait for all of 2-6, and Task 8 is the final verification pass.

### Key Decisions
- GSAP `registerPlugin(ScrollTrigger)` is called at module level in each component that uses it. This is safe — GSAP deduplicates plugin registration.
- The URL input validation is simple regex (`/^https?:\/\/.+/`). No need for a validation library.
- Card mini-visuals (latency counter, typing animation) use `setInterval` inside `useEffect` with proper cleanup.
- The typing animation in API Showcase only runs once (tracked via `hasAnimated` ref). Switching tabs shows full code immediately.

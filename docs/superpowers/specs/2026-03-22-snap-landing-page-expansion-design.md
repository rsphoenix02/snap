# SNAP Landing Page Expansion — Design Spec

**Date:** 2026-03-22
**Goal:** Transform the SNAP landing page from a minimal 4-section layout into a polished, production-quality portfolio piece that impresses SDE1 interviewers at big tech and startups.

## Context

The current page has: Hero (globe + static input), Stats Marquee, Features (bento grid, 4 cards), Footer. It's functional but feels thin — a recruiter visiting from a resume would see a student project, not a shipped product.

**Target audience:** Technical interviewers and recruiters evaluating engineering quality.
**Design direction:** Elevate the existing dark (#0A0A0A) + red (#EF4444) aesthetic with Vercel/Linear-tier polish. Add two new sections (How It Works, API Showcase) to demonstrate system design and API thinking.

**Pre-implementation requirement:** Update `CLAUDE.md` to authorize the 6-section layout, functional URL input, and new section IDs before any coding begins.

## Page Structure (6 Sections)

### 1. Hero (Enhanced) — `id="hero"`

**Current:** Globe, headline, subtitle, pill badge, static readonly input, red CTA button.

**Changes:**
- **Functional URL input** — wired to backend API (`POST /api/shorten`). Three states:
  - **Default:** empty input with placeholder "Paste your long URL here..."
  - **Loading:** button shows spinner, input disabled
  - **Success:** input area transforms to show shortened URL + copy button (checkmark feedback on click) + "Shorten another" reset link + subtle glow animation
  - **Offline fallback:** when API is unreachable, show inline toast "API coming soon — check back after deploy" below the input. Do not block the UI.
- **Client-side URL validation** — validate URL format before submission (must start with `http://` or `https://`, basic URL regex). Show inline error text in red-400 below the input for invalid URLs.
- **Gradient headline** — "Shorten. Share. Track." where "Track." is rendered in red (#EF4444), rest uses a white-to-zinc-400 gradient. (This changes the current behavior where "Share." is red — intentional, "Track." better represents the analytics differentiator.)
- **GSAP entrance sequence** — on page load, staggered reveal: navbar (opacity+y) → pill badge → headline → subtitle → input bar. Each element 150ms after the previous. Uses `gsap.from()` with `opacity: 0, y: 20, duration: 0.6, ease: "power2.out"`.
- Globe remains unchanged.

### 2. Stats Marquee (Enhanced) — `id="stats"`

**Current:** 6 scrolling stat items with dividers.

**Changes:**
- **Animated counters** — numbers count up from 0 to their value on page load (not scroll-triggered, since the marquee is near the top and its items are continuously scrolling/duplicated). Animation runs once on mount using GSAP `to()` with `snap: { value: 1 }`. The counter targets the first set of stat elements only; duplicated marquee clones display the final values immediately.
- **Framing borders** — thin `border-t` and `border-b` in `zinc-800/50` to visually separate the strip from adjacent sections.
- No other changes — keep it slim.

### 3. How It Works (NEW) — `id="how-it-works"`

**Purpose:** Showcase system architecture. This is the section interviewers will ask about in system design discussions.

**Layout:** Full-width section with centered content (max-w-5xl). Section header: "How It Works" with subtitle "From URL to redirect in under 100ms". `scroll-margin-top: 80px` for navbar offset.

**Content — 3-step horizontal flow:**
1. **"Paste URL"** — icon: Link. Label: "React Frontend". Description: "Submit any URL through our clean interface or REST API."
2. **"Generate Hash"** — icon: Zap. Label: "FastAPI + Redis". Description: "Base62-encoded short code generated and cached for instant lookups."
3. **"Redirect & Track"** — icon: BarChart3. Label: "PostgreSQL + Analytics". Description: "Lightning redirect with async click tracking — location, device, timestamp."

**Visual design:**
- Each step is a card (zinc-900 bg, zinc-800 border, rounded-xl) with the icon, step number, tech label, and description.
- Cards connected by animated dashed lines (SVG `stroke-dashoffset` technique — NOT `drawSVG` which is a paid GSAP plugin). Lines are SVG `<line>` elements with `stroke-dasharray` set to total length, animated from full offset to 0.
- **Dot-grid background** — subtle repeating dot pattern (`radial-gradient`, 1px dots, ~24px spacing, zinc-800 color at ~20% opacity) behind the section.
- **GSAP scroll animation** — cards reveal left-to-right with stagger (0.2s delay each). Connecting lines animate via `stroke-dashoffset` after preceding card appears.

**Mobile:** Cards stack vertically, connecting lines go downward.

### 4. Features — Bento Grid (Enhanced) — `id="features"`

**Current:** 4 cards with lucide icons, red badge labels, Framer Motion staggered fade-in.

**Changes — richer card interiors:**
Each card keeps its current structure but gains a small visual element above the text:

1. **Lightning Redirects** — animated latency display cycling through values: "98ms" → "42ms" → "12ms" with a subtle pulse. Use `setInterval` + CSS transition.
2. **Analytics Dashboard** — mini sparkline/bar chart (pure CSS or SVG, no chart library). 5-6 bars of varying height in zinc-700 with one highlighted in red.
3. **Developer API** — 3-line code snippet: `curl -X POST /api/shorten` styled as a tiny dark code block (zinc-950 bg, monospace font via `var(--font-geist-mono)`, colored tokens).
4. **Custom Short Codes** — typing animation showing `snap.dev/` then typing `your-brand` character by character, looping.

**Additional visual upgrades:**
- **Hover glow** — on hover, card gets a subtle `box-shadow: 0 0 20px rgba(239,68,68,0.1)` and border brightens to zinc-700.
- **Partial rewrite: Framer → GSAP** — the existing `bento-grid.tsx` is built around Framer Motion's `motion.section`/`motion.div` with `containerVariants`/`itemVariants`. This will be rewritten to use plain `div` elements with `useRef` + GSAP `useGSAP` hook + ScrollTrigger for scroll-triggered stagger (`y: 30, opacity: 0, scale: 0.97`). This is a significant refactor of the component, not a minor edit.

### 5. API Showcase (NEW) — `id="api"`

**Purpose:** Demonstrate that a real, well-designed REST API exists. Interviewers evaluating backend skills will look at this.

**Layout:** Full-width section, centered content (max-w-5xl). Section header: "Developer-First API" with subtitle "Clean REST endpoints. API key auth. JSON everywhere." `scroll-margin-top: 80px` for navbar offset.

**Content — split layout:**
- **Left side (60%):** Tabbed code block with 3 tabs — cURL, Python, JavaScript.
  - cURL: `curl -X POST https://snap.dev/api/v1/shorten -H "Authorization: Bearer sk_..." -H "Content-Type: application/json" -d '{"url": "https://example.com/very-long-path", "custom_code": "my-link"}'`
  - Python: equivalent using `requests` library
  - JavaScript: equivalent using `fetch`
- **Right side (40%):** JSON response block showing: `{ "short_url": "https://snap.dev/my-link", "original_url": "...", "created_at": "...", "clicks": 0 }`

**Visual design:**
- Code blocks use zinc-950 background, monospace font (`var(--font-geist-mono)`), with syntax coloring: strings in green, keys in blue/cyan, keyword/flags in red accent.
- Active tab highlighted with red underline.
- **GSAP typing animation** — on scroll into view, the curl command types out character by character (~30ms per char), then the response block fades in after a 500ms delay.
- Subtle rounded corners, zinc-800 border on code blocks.

**Mobile:** Stack vertically — request code on top, response below. Tabs remain functional.

### 6. Footer (Enhanced)

**Current:** GitHub link + "Built with FastAPI · React · Redis · PostgreSQL" plain text.

**Changes:**
- **Personal attribution** — "Built by [Name]" with links to portfolio/LinkedIn/GitHub profile.
- **Tech stack as pills** — each technology rendered as a small badge/pill (`bg-zinc-900 border border-zinc-800 rounded-full px-3 py-1 text-xs`) with the tech name. Optionally include small SVG logos.
- **GitHub repo link** — keep existing link, optionally add a live star count badge via shields.io img tag.
- Layout: centered, 2-3 rows max. Top row: attribution. Middle row: tech pills. Bottom row: GitHub link.

## Global Visual Upgrades

### Animation Stack
- **GSAP (new dependency)** — `gsap` + `@gsap/react`. ScrollTrigger must be explicitly registered via `gsap.registerPlugin(ScrollTrigger)` — do this once in `page.tsx` or a shared setup. Used for: scroll-triggered reveals, staggered sequences, typing animations, counter animations, line drawing.
- **Framer Motion (existing)** — keep for navbar animations (including existing spring physics for the morphing pill — these are grandfathered in), mobile menu, and any hover/layout transitions not being migrated. No need to migrate unless it conflicts with GSAP.
- **Easing** — all new GSAP animations use `power2.out` or `power3.out`. No spring/bounce physics in new code.

### Visual Treatments
- **Dot-grid background** — applied to "How It Works" and "API Showcase" sections. CSS `radial-gradient` pattern, zinc-800 dots at ~15-20% opacity, ~24px grid spacing. Defined as a utility class in `globals.css`.
- **Gradient text** — section headers use `bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent`. Key words highlighted in red. Defined as a utility class in `globals.css`.
- **Smooth scroll** — `html { scroll-behavior: smooth }`. Each section with a nav link gets `scroll-margin-top: 80px` to offset the sticky navbar.
- **Page load sequence** — GSAP timeline: navbar → hero pill → headline → subtitle → input → globe fade-in. Total duration ~1.5s.

### New Dependencies
- `gsap` — animation engine (includes ScrollTrigger as a bundled plugin)
- `@gsap/react` — React integration (`useGSAP` hook for proper cleanup)

### Files to Create
- `components/ui/how-it-works.tsx` — architecture flow section with SVG connecting lines
- `components/ui/api-showcase.tsx` — tabbed code block section with typing animation

### Files to Modify
- `app/page.tsx` — add new sections, wire up URL input (with validation + loading + error states), GSAP page-load timeline, register ScrollTrigger, footer enhancements (attribution, tech pills)
- `app/globals.css` — dot-grid background utility class, gradient text utility class, `scroll-margin-top` for sections, `scroll-behavior: smooth` on html
- `components/ui/bento-grid.tsx` — **partial rewrite**: replace Framer Motion with GSAP ScrollTrigger, add rich card interiors (mini visuals), add hover glow. This is a significant refactor.
- `components/ui/navbar.tsx` — add nav links for "How It Works" (`#how-it-works`) and "API" (`#api`) sections
- `CLAUDE.md` — update to authorize 6-section layout, functional URL input, and new section IDs

## Constraints
- Mobile responsive throughout. All new sections stack vertically on small screens.
- Animations must be subtle — no spring/bounce physics in new code. Existing navbar springs are kept.
- Globe remains the single hero visual — no particles or extra effects.
- URL input gracefully handles missing backend (API not yet deployed).
- No pricing, testimonials, FAQ, or blog sections.
- Keep individual component files under 400 lines.

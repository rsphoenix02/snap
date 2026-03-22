# SNAP — URL Shortener Landing Page

## Stack
- React 19 + Next.js 16 + TypeScript + Tailwind CSS v4
- Animation: GSAP (ScrollTrigger, useGSAP) + Framer Motion (navbar, hover states)
- Dark theme: bg `#0A0A0A`, text white/zinc hierarchy, accent `#EF4444` (red)
- Font: Inter (body), Geist Mono (code blocks — use `var(--font-geist-mono)`)

## UI Components
Reference `ui_components/*.md` for pre-built component code and usage prompts. Copy the code first, then adapt to Snap's dark theme and red accent. Available:
- **globe** — Hero centerpiece. White wireframe, red arcs between random coordinates, slow auto-rotate. Uses cobe v1-style `onRender` callback pattern.
- **navbar** — Sticky top nav. Logo left, section anchors right. Framer Motion springs for morphing pill (grandfathered).
- **marquee** — Stats bar. Scrolling metrics with animated counters on mount.
- **bento grid** — Features section. 4 cards with rich mini-visuals inside. GSAP ScrollTrigger for reveal.
- **dock** — Optional mobile nav alternative.

## Page Structure (6 sections)
1. **Hero** (`id="hero"`) — Full viewport. Globe centered behind copy (higher z-index). Gradient headline "Shorten. Share. Track." ("Track." in red). Functional URL input wired to `POST /api/shorten` with validation, loading, success, and offline fallback states. GSAP staggered entrance sequence on page load.
2. **Stats Marquee** (`id="stats"`) — Slim strip below hero. Scrolling metrics with count-up animation on mount. Framed with `zinc-800/50` borders.
3. **How It Works** (`id="how-it-works"`) — 3-step horizontal architecture flow: React Frontend → FastAPI+Redis → PostgreSQL+Analytics. Cards connected by SVG dashed lines animated via `stroke-dashoffset`. Dot-grid background. GSAP scroll-triggered reveal.
4. **Features** (`id="features"`) — Bento grid, 4 cards with lucide icons and rich mini-visuals (latency counter, sparkline chart, code snippet, typing animation). Hover glow effect. GSAP ScrollTrigger stagger.
5. **API Showcase** (`id="api"`) — Split layout: tabbed code block (cURL/Python/JS) on left, JSON response on right. Syntax highlighting with Geist Mono. GSAP typing animation on scroll. Dot-grid background.
6. **Footer** — Personal attribution + tech stack as pills + GitHub repo link.

## Animation Rules
- GSAP for all scroll-triggered animations and page-load sequences. Register ScrollTrigger once in `page.tsx`.
- Framer Motion for navbar animations and hover/layout transitions only.
- Easing: `power2.out` or `power3.out`. No spring/bounce physics in new code.
- Existing navbar springs are grandfathered — do not remove.
- All sections with nav links: `scroll-margin-top: 80px`.

## Rules
- Read the relevant `ui_components/*.md` file BEFORE writing any component. Copy the code, then modify.
- Do not add sections beyond the 6 listed above.
- Do not add pricing, testimonials, FAQ, or blog sections.
- Keep animations subtle — scroll fade-ins, no competing effects.
- Mobile responsive. All sections stack vertically on small screens.
- Globe must be the single hero visual — no background particles or extra effects.
- Keep individual component files under 400 lines.
- URL input gracefully handles missing backend (toast: "API coming soon").
- Use `var(--font-geist-mono)` for all monospace/code text.

## Design Spec
Full design spec at `docs/superpowers/specs/2026-03-22-snap-landing-page-expansion-design.md`.

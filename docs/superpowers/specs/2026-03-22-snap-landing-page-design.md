# SNAP Landing Page — Design Spec

## Overview
Single-page dark landing page for SNAP, a URL shortener service. Built with Next.js 16, TypeScript, Tailwind CSS.

## Theme
- Background: `#0A0A0A` (off-black)
- Accent: `#EF4444` (red)
- Text: white / zinc hierarchy (`zinc-400` body, `zinc-500` muted)
- Font: Inter
- Single accent color only, no gradients or neon glows

## Section 1: Hero
- Full viewport height (`min-h-[100dvh]`)
- **Massive COBE globe** centered, extending ~40% below viewport bottom
- Globe config: dark surface (`dark: 1`), white wireframe dots, tiny red markers on 20 world cities, red arcs between random city pairs, slow auto-rotate (`phi += 0.005`)
- Globe uses original `ui_components/globe.md` component code (v1-style `onRender` callback)
- Copy centered on top of globe (higher z-index):
  - Pill badge: "Now processing 50K+ redirects daily"
  - H1: "Shorten. / Share. (red) / Track."
  - Subtitle: one-liner about the product
  - Static URL input bar + red "Shorten →" CTA button (non-functional placeholder)
- Bottom gradient fade: `transparent → #0A0A0A`

## Section 2: Stats Marquee
- Slim horizontal strip with `border-y border-zinc-800/50`
- Uses `ui_components/marquee.md` component directly
- Scrolling metrics with red lucide icons: "10K+ links shortened", "98ms avg redirect", "50+ countries served", "REST API available", "Custom short codes", "99.9% uptime SLA"
- Pause on hover, edge fade

## Section 3: Features (Bento Grid)
- Left-aligned heading: "Everything you need to **own your links**" (red span)
- Subheading mentioning the tech stack
- 2×2 grid using `ui_components/bento_grid.md` structure, simplified to 4 cards
- Cards: `zinc-900/50` bg, `zinc-800` border, `rounded-2xl`, `p-8`
- Each card: red icon (lucide), title, one-liner description
- Cards: Fast Redirects, Real-Time Analytics, Developer API, Custom Short Codes
- Animation: scroll-triggered fade-in via Framer Motion `whileInView`, ease curve (no spring/bounce)
- Subtle hover: border lightens, faint red glow in corner

## Section 4: Footer
- `border-t border-zinc-800/50`, minimal padding
- Left: "Built with FastAPI · React · Redis · PostgreSQL"
- Right: GitHub link + copyright

## Navbar
- Uses `ui_components/navbar.md` component, adapted for dark theme
- Logo: red rounded-lg box with Zap icon + "SNAP" text
- Menu: Features, API, Pricing, Docs
- Scroll behavior: shrinks to floating pill with backdrop blur + border
- CTAs: Login (outline) + Sign Up (red), collapse to single "Get Started" when scrolled

## Performance Requirements
- Globe: single stable `useEffect`, `onRender` callback mutates `phi` directly (no state-driven re-renders)
- Arcs: regenerated every ~4s via direct config mutation, NOT by destroying/recreating the globe
- No competing `requestAnimationFrame` loops
- Framer Motion animations use `whileInView` with `viewport={{ once: true }}`
- No `useState` for continuous animations

## What NOT to Build
- No pricing, testimonials, FAQ, or blog sections
- No spring/bounce physics animations
- No background particles or effects competing with globe
- No additional sections beyond the 4 listed

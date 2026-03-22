# SNAP — URL Shortener Landing Page

## Stack
- React + Tailwind CSS
- Dark theme: bg `#0A0A0A`, text white/zinc hierarchy, accent `#EF4444` (red)
- Font: Inter

## UI Components
Reference `ui_components/*.md` for pre-built component code and usage prompts. Adapt each to Snap's dark theme and red accent. Available:
- **globe** — Hero centerpiece. White wireframe, red arcs between random coordinates, slow auto-rotate.
- **navbar** — Sticky top nav. Logo left, section anchors right.
- **marquee** — Stats bar. Scrolling metrics: "10K+ links shortened", "98ms avg redirect", "50+ countries".
- **bento grid** — Features section. 4 cards max: Fast Redirects, Analytics, API Access, Custom Short Codes.
- **dock** — Optional mobile nav alternative.

## Page Structure (4 sections only — do not add more)
1. **Hero** — Full viewport. Massive globe centered behind copy, extending ~40% below viewport bottom with gradient fade-out. Copy centered on top (higher z-index): pill badge, headline "Shorten. Share. Track.", subtitle, URL input bar with red "Shorten" CTA. Input is non-functional (static placeholder). Globe uses original `ui_components/globe.md` code with `onRender` callback pattern — NOT cobe v2 `update()` API.
2. **Stats marquee** — Slim horizontal strip below hero with scrolling metrics.
3. **Features** — Bento grid, 4 cards with lucide icons. One-liner descriptions. No walls of text.
4. **Footer** — Minimal. GitHub repo link, "Built with FastAPI · React · Redis · PostgreSQL" as plain text.

## Rules
- Read the relevant `ui_components/*.md` file BEFORE writing any component. Copy the code, then modify.
- Do not invent sections beyond the 4 listed above.
- Do not add pricing, testimonials, FAQ, or blog sections.
- Keep animations subtle — scroll fade-ins only, no spring/bounce physics.
- Mobile responsive. All sections stack vertically on small screens.
- Globe must be the single hero visual — no background particles or extra effects competing with it.

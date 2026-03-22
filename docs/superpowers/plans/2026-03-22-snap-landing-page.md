# SNAP Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the SNAP URL shortener landing page with a working globe, proper performance, and all 4 sections visible.

**Architecture:** Single-page Next.js 16 app. Components copied from `ui_components/*.md` and adapted for dark theme + cobe v2 API. Globe centered behind hero copy with arcs. Marquee, bento grid, footer below.

**Tech Stack:** Next.js 16, TypeScript, Tailwind CSS v4, cobe v2, framer-motion, lucide-react

**Spec:** `docs/superpowers/specs/2026-03-22-snap-landing-page-design.md`

---

## File Structure

All files live under `app/src/`. Files marked "Rewrite" exist but are broken.

| File | Action | Responsibility |
|------|--------|---------------|
| `components/ui/globe.tsx` | Rewrite | COBE globe adapted from `ui_components/globe.md` for v2 API + arcs |
| `components/ui/navbar.tsx` | Rewrite | Navbar from `ui_components/navbar.md`, dark theme, SNAP branding |
| `components/ui/marquee.tsx` | Keep | Already works, copied from `ui_components/marquee.md` |
| `components/ui/bento-grid.tsx` | Rewrite | Simplified 4-card grid from `ui_components/bento_grid.md` |
| `components/ui/button.tsx` | Create | Button component from `ui_components/navbar.md` deps (liquid-glass-button) |
| `app/globals.css` | Keep | Dark theme CSS vars already correct |
| `app/layout.tsx` | Keep | Inter font, dark mode already correct |
| `app/page.tsx` | Rewrite | Assemble all 4 sections with new centered-globe hero layout |
| `lib/utils.ts` | Keep | cn() utility already correct |

---

### Task 1: Rewrite Globe Component

**Files:**
- Rewrite: `app/src/components/ui/globe.tsx`
- Reference: `ui_components/globe.md`

The original component uses cobe v1 `onRender` callback. Cobe v2.0.1 (installed) removed `onRender` — must use `globe.update()` in a `requestAnimationFrame` loop instead. V2 also adds native `arcs` support.

- [ ] **Step 1: Copy the original component structure from `ui_components/globe.md`**

Adapt for cobe v2:
- Remove `onRender` from config object
- Create globe with `createGlobe(canvas, config)` which returns `{ update, destroy }`
- Use `requestAnimationFrame` loop calling `globe.update({ phi })` to rotate
- Add `arcs` to config for red connection lines between cities
- Keep the same pointer interaction pattern (drag to rotate)

```tsx
// Key differences from ui_components/globe.md:
// 1. No onRender in COBEOptions (v2 removed it)
// 2. createGlobe returns { update, destroy }
// 3. rAF loop calls globe.update({ phi: currentPhi }) each frame
// 4. arcs added to initial config
// 5. setInterval regenerates arcs via globe.update({ arcs: newArcs })
```

Globe config for SNAP dark theme:
```tsx
dark: 1,
diffuse: 0.4,
mapSamples: 16000,
mapBrightness: 2,
baseColor: [0.15, 0.15, 0.15],
markerColor: [239/255, 68/255, 68/255],
glowColor: [0.15, 0.1, 0.1],
markers: CITIES.map(([lat, lng]) => ({ location: [lat, lng] as [number,number], size: 0.03 })),
arcs: generateArcs(CITIES, 12),
arcColor: [239/255, 68/255, 68/255] as [number,number,number],
```

Critical performance rules:
- Single `useEffect` with empty deps `[]` — globe created once
- Single `requestAnimationFrame` loop — cancelled on cleanup
- Pointer interaction uses refs, NOT useState for continuous values
- Arc regeneration via `globe.update({ arcs })` on a `setInterval` — does NOT destroy/recreate globe
- `setR` (from pointer drag) is the ONLY state that triggers re-render, and it's only set on drag

Container must support oversized positioning (the hero will make it massive and offset it).

- [ ] **Step 2: Verify globe renders in isolation**

Temporarily render just `<Globe />` in page.tsx to confirm:
- Globe appears with dark surface
- Red markers are tiny dots (size 0.03), NOT huge circles
- Red arcs visible between cities
- Smooth auto-rotation at 60fps
- No green/colored artifacts
- Drag interaction works

- [ ] **Step 3: Commit**

```bash
git add app/src/components/ui/globe.tsx
git commit -m "fix: rewrite globe for cobe v2 API with arcs"
```

---

### Task 2: Rewrite Navbar Component

**Files:**
- Rewrite: `app/src/components/ui/navbar.tsx`
- Create: `app/src/components/ui/button.tsx`
- Reference: `ui_components/navbar.md`

- [ ] **Step 1: Copy button component from `ui_components/navbar.md` deps**

The navbar imports `@/components/ui/liquid-glass-button`. Copy the `Button` export from the liquid-glass-button code in `ui_components/navbar.md` into `button.tsx`. Only need the basic `Button` — skip `LiquidButton` and `MetalButton` (not used).

- [ ] **Step 2: Copy navbar component from `ui_components/navbar.md`**

Adapt:
- Replace `import { Button } from '@/components/ui/liquid-glass-button'` → `'@/components/ui/button'`
- Replace logo SVG + "Dalim" text with SNAP branding (red Zap icon box + "SNAP")
- Update `menuItems` to: Features (#features), API (#features), Pricing (#), Docs (#)
- Dark theme colors: `bg-[#0a0a0a]/80` for scrolled state, `border-zinc-800`, `text-zinc-400`
- CTA buttons: Login (outline, zinc border), Sign Up (red bg), Get Started (red bg, shown when scrolled)

- [ ] **Step 3: Commit**

```bash
git add app/src/components/ui/navbar.tsx app/src/components/ui/button.tsx
git commit -m "feat: add navbar with SNAP branding from ui_components"
```

---

### Task 3: Rewrite Bento Grid Component

**Files:**
- Rewrite: `app/src/components/ui/bento-grid.tsx`
- Reference: `ui_components/bento_grid.md`

- [ ] **Step 1: Simplify the bento grid from `ui_components/bento_grid.md`**

The original `BentoGridShowcase` has 6 slots in a 3-column layout. SNAP needs a simpler 2×2 grid with 4 identical cards.

**How to simplify:**
- Remove `BentoGridShowcase` and its 6-slot interface entirely
- Remove the specific card types (IntegrationCard, TrackersCard, etc.)
- Create new `BentoGrid` (container) + `BentoCard` (item) with simple props: icon, title, description
- Grid: `grid-cols-1 md:grid-cols-2 gap-4` (2 columns, not 3)
- Remove slots 5 and 6 (shortcuts wide card, productivity card)

Take the `containerVariants` (stagger) from the original. **Replace `itemVariants`** — the original uses `type: "spring", stiffness: 100, damping: 10` which violates the "no spring/bounce physics" rule. Use instead:
- `BentoGrid`: motion.div with 2-col grid, `whileInView` trigger, `viewport={{ once: true }}`
- `BentoCard`: motion.div with icon + title + description, dark card styling

**Animation (CRITICAL — no spring):** Replace the spring transition with ease curve:
```tsx
transition: {
  duration: 0.5,
  ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
}
```

Card styling:
```
rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-8
hover:border-zinc-700 hover:bg-zinc-900/80 transition-colors
```

Icon container: `rounded-lg bg-red-500/10 text-red-500`

- [ ] **Step 2: Commit**

```bash
git add app/src/components/ui/bento-grid.tsx
git commit -m "feat: simplified bento grid for 4 feature cards"
```

---

### Task 4: Assemble the Page

**Files:**
- Rewrite: `app/src/app/page.tsx`

- [ ] **Step 1: Build Hero section**

Layout: centered copy floating over massive globe.
- Globe container: `absolute`, centered horizontally, top offset so it extends below viewport
- Globe sizing: `max-w-[800px]` on desktop (bigger than before), responsive down
- Copy container: `relative z-10`, centered with flexbox, text-center
- Bottom fade: `absolute bottom-0` gradient div

```
Section: min-h-[100dvh], relative, overflow-hidden, flex items-center justify-center
Globe wrapper: absolute, centered, top-[10%], w-full max-w-[800px] aspect-square
Copy: relative z-10, flex flex-col items-center text-center
```

- [ ] **Step 2: Build Stats Marquee section**

Use existing `<Marquee>` component (already works). Create `StatItem` and `StatDivider` inline components. 6 metrics with red lucide icons.

- [ ] **Step 3: Build Features section**

Left-aligned heading with red accent span. `<BentoGrid>` with 4 `<BentoCard>` components. Lucide icons: Zap, BarChart3, Code2, Fingerprint.

- [ ] **Step 4: Build Footer section**

Minimal: tech stack text left, GitHub + copyright right. `border-t border-zinc-800/50`.

- [ ] **Step 5: Visual verification**

Run `npm run dev`, check in browser:
- [ ] All 4 sections visible and scrollable
- [ ] Globe rotates smoothly at 60fps with red arcs
- [ ] Globe is massive, centered behind hero copy, fades at bottom
- [ ] Marquee scrolls continuously
- [ ] Bento cards fade in on scroll
- [ ] Navbar collapses on scroll
- [ ] Mobile responsive (stack to single column)

- [ ] **Step 6: Build check**

```bash
npm run build
```

Expected: clean build, no type errors.

- [ ] **Step 7: Commit**

```bash
git add app/src/app/page.tsx
git commit -m "feat: assemble SNAP landing page with all 4 sections"
```

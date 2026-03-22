# Monorepo Restructure + Codebase Cleanup — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure SNAP from `app/` to `frontend/`, promote git to monorepo root, remove dead code, and fix navbar links.

**Architecture:** Simple rename of `app/` → `frontend/` with git repo moved to root. Dead code stripped from `liquid-glass-button.tsx`. Navbar links wired to real page sections.

**Tech Stack:** Next.js 16, React 19, Tailwind v4, Framer Motion, TypeScript

**Spec:** `docs/superpowers/specs/2026-03-22-monorepo-restructure-design.md`

---

### Task 1: Move git repo to monorepo root

**Files:**
- Move: `app/.git/` → `.git/`
- Create: `.gitignore` (root level)

- [ ] **Step 1: Move .git directory up to snap/ root**

```bash
mv app/.git .git
```

- [ ] **Step 2: Create root .gitignore**

```gitignore
node_modules/
.next/
out/
build/
.env
.env.*
*.tsbuildinfo
```

- [ ] **Step 3: Verify git works from root**

```bash
git status
```

Expected: shows the repo contents (will show lots of changes since paths shifted)

- [ ] **Step 4: Commit**

```bash
git add .gitignore
git commit -m "chore: promote git repo to monorepo root, add root .gitignore"
```

---

### Task 2: Rename app/ to frontend/

**Files:**
- Rename: `app/` → `frontend/`
- Delete: `frontend/.next/`, `frontend/node_modules/`

- [ ] **Step 1: Rename the directory**

```bash
mv app frontend
```

- [ ] **Step 2: Delete build artifacts and node_modules**

```bash
rm -rf frontend/.next frontend/node_modules
```

- [ ] **Step 3: Remove files not carried over**

```bash
rm -f frontend/README.md frontend/CLAUDE.md frontend/next-env.d.ts
```

- [ ] **Step 4: Reinstall dependencies**

```bash
cd frontend && npm install
```

- [ ] **Step 5: Verify dev server starts**

```bash
cd frontend && npx next dev
```

Expected: compiles successfully, page loads at localhost:3000

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: restructure app/ to frontend/ for monorepo layout"
```

---

### Task 3: Delete unused demo files and button.tsx

**Files:**
- Delete: `frontend/src/components/ui/globe-demo.tsx`
- Delete: `frontend/src/components/ui/marquee-demo.tsx`
- Delete: `frontend/src/components/ui/navbar-demo.tsx`
- Delete: `frontend/src/components/ui/button.tsx`

- [ ] **Step 1: Delete the four files**

```bash
rm frontend/src/components/ui/globe-demo.tsx
rm frontend/src/components/ui/marquee-demo.tsx
rm frontend/src/components/ui/navbar-demo.tsx
rm frontend/src/components/ui/button.tsx
```

- [ ] **Step 2: Verify no imports reference these files**

```bash
grep -r "globe-demo\|marquee-demo\|navbar-demo\|from.*button" frontend/src/ --include="*.tsx" --include="*.ts"
```

Expected: only `liquid-glass-button` imports appear (no references to the deleted files)

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: remove unused demo files and duplicate button.tsx"
```

---

### Task 4: Strip dead code from liquid-glass-button.tsx

**Files:**
- Modify: `frontend/src/components/ui/liquid-glass-button.tsx`

- [ ] **Step 1: Rewrite liquid-glass-button.tsx to keep only Button and buttonVariants**

The file should contain only:

```tsx
"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center cursor-pointer justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-primary-foreground hover:bg-destructive/90",
        cool: "dark:inset-shadow-2xs dark:inset-shadow-white/10 bg-linear-to-t border border-b-2 border-zinc-950/40 from-primary to-primary/85 shadow-md shadow-primary/20 ring-1 ring-inset ring-white/25 transition-[filter] duration-200 hover:brightness-110 active:brightness-90 dark:border-x-0 text-primary-foreground dark:text-primary-foreground dark:border-t-0 dark:border-primary/50 dark:ring-white/5",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

Everything below line 57 in the original file is removed: `liquidbuttonVariants`, `LiquidButton`, `GlassFilter`, `ShineEffect`, `ColorVariant`, `colorVariants`, `metalButtonVariants`, `MetalButtonProps`, `MetalButton`.

- [ ] **Step 2: Verify the navbar still imports correctly**

```bash
grep -n "liquid-glass-button" frontend/src/components/ui/navbar.tsx
```

Expected: `import { Button } from '@/components/ui/liquid-glass-button'` — this import still works since `Button` is still exported.

- [ ] **Step 3: Verify build passes**

```bash
cd frontend && npx next build
```

Expected: build succeeds with no errors

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/ui/liquid-glass-button.tsx
git commit -m "refactor: strip unused LiquidButton, MetalButton, GlassFilter from liquid-glass-button.tsx"
```

---

### Task 5: Remove unused dependencies from package.json

**Files:**
- Modify: `frontend/package.json`

- [ ] **Step 1: Uninstall unused packages**

```bash
cd frontend && npm uninstall @radix-ui/react-label @radix-ui/react-switch
```

- [ ] **Step 2: Verify no imports reference them**

```bash
grep -r "react-label\|react-switch" frontend/src/ --include="*.tsx" --include="*.ts"
```

Expected: no matches

- [ ] **Step 3: Commit**

```bash
git add frontend/package.json frontend/package-lock.json
git commit -m "chore: remove unused @radix-ui/react-label and @radix-ui/react-switch"
```

---

### Task 6: Fix navbar links and CTA buttons

**Files:**
- Modify: `frontend/src/components/ui/navbar.tsx`

- [ ] **Step 1: Update menuItems to match real sections**

Change:
```tsx
const menuItems = [
    { name: 'Products', href: '#link' },
    { name: 'Designs', href: '#link' },
    { name: 'Pricing', href: '#link' },
    { name: 'About', href: '#link' },
]
```

To:
```tsx
const menuItems = [
    { name: 'Features', target: 'features' },
    { name: 'Stats', target: 'stats' },
]
```

- [ ] **Step 2: Convert desktop nav links from Link to smooth-scroll buttons**

Change the desktop nav links section (lines 82-91) to:
```tsx
<div className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
    {menuItems.map((item, index) => (
        <button
            key={index}
            onClick={() => {
                document.getElementById(item.target)?.scrollIntoView({ behavior: 'smooth' })
            }}
            className="text-zinc-400 text-sm hover:text-white transition-colors duration-300 whitespace-nowrap cursor-pointer">
            {item.name}
        </button>
    ))}
</div>
```

- [ ] **Step 3: Convert mobile nav links to smooth-scroll buttons**

Change the mobile menu links section (lines 170-182) to:
```tsx
{menuItems.map((item, i) => (
    <motion.div
        key={i}
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -12 }}
        transition={{ delay: i * 0.05, type: 'spring', stiffness: 200, damping: 20 }}>
        <button
            onClick={() => {
                setMenuState(false)
                setTimeout(() => {
                    document.getElementById(item.target)?.scrollIntoView({ behavior: 'smooth' })
                }, 150)
            }}
            className="text-zinc-400 text-sm py-2.5 px-2 rounded-lg hover:text-white hover:bg-white/[0.04] transition-colors duration-200 block w-full text-left cursor-pointer">
            {item.name}
        </button>
    </motion.div>
))}
```

- [ ] **Step 4: Replace CTA section — remove Get Started, always show Login + Sign Up**

Replace the entire CTA div (lines 121-158) with:
```tsx
{/* CTA — pushed to far right */}
<div className="lg:ml-auto hidden lg:flex items-center gap-2">
    <Button asChild variant="outline" size="sm">
        <Link href="#">
            <span>Login</span>
        </Link>
    </Button>
    <Button asChild size="sm">
        <Link href="#">
            <span>Sign Up</span>
        </Link>
    </Button>
</div>
```

This removes the `AnimatePresence` toggle and `isScrolled` conditional — Login and Sign Up are always visible on desktop. On mobile, these buttons are `hidden` here because they already exist inside the mobile dropdown menu (the `AnimatePresence` mobile section below). Note: `isScrolled` is NOT dead code — it is still used by the `motion.div` container for the shrink/expand animation and must be kept.

- [ ] **Step 5: Remove unused Link import if no longer needed**

Check if `Link` from `next/link` is still used (it is — for Login/Sign Up CTAs). Keep the import.

- [ ] **Step 6: Verify build passes**

```bash
cd frontend && npx next build
```

Expected: build succeeds

- [ ] **Step 7: Commit**

```bash
git add frontend/src/components/ui/navbar.tsx
git commit -m "fix: wire navbar links to real sections, remove Get Started CTA"
```

---

### Task 7: Add id="stats" to page.tsx

**Files:**
- Modify: `frontend/src/app/page.tsx`

- [ ] **Step 1: Add id to stats marquee section**

Change line 193:
```tsx
<section className="relative border-y border-zinc-800/50 bg-zinc-950/50 py-5">
```

To:
```tsx
<section id="stats" className="relative border-y border-zinc-800/50 bg-zinc-950/50 py-5">
```

- [ ] **Step 2: Verify id="features" already exists on the features section**

Line 211 should already have:
```tsx
<section id="features" className="relative py-24 lg:py-32">
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/page.tsx
git commit -m "fix: add id=stats to marquee section for navbar scroll targeting"
```

---

### Task 8: Final verification

- [ ] **Step 1: Run full build**

```bash
cd frontend && npx next build
```

Expected: build succeeds with no errors or warnings

- [ ] **Step 2: Verify directory structure matches spec**

```bash
ls -la frontend/src/components/ui/
```

Expected: navbar.tsx, globe.tsx, marquee.tsx, bento-grid.tsx, card.tsx, badge.tsx, liquid-glass-button.tsx — no demo files, no button.tsx

- [ ] **Step 3: Verify git status is clean**

```bash
git status
```

Expected: nothing to commit, working tree clean

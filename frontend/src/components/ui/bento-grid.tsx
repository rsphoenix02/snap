"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

/**
 * Props for the BentoGridShowcase component.
 * Each prop represents a "slot" in the grid.
 * Adapted from the 6-slot reference to 4 slots for Snap's feature cards.
 */
interface BentoGridShowcaseProps {
  /** Tall left card spanning 2 rows (e.g., Lightning Redirects) */
  primary: React.ReactNode;
  /** Top-right card (e.g., Analytics) */
  secondary: React.ReactNode;
  /** Bottom-right card (e.g., Developer API) */
  tertiary: React.ReactNode;
  /** Full-width bottom card (e.g., Custom Short Codes) */
  wide: React.ReactNode;
  /** Optional class names for the grid container */
  className?: string;
}

/**
 * A responsive, animated bento grid layout component.
 * Arranges four content slots in a 2-col asymmetric layout:
 *   [primary (tall)] [secondary]
 *   [    ...       ] [tertiary ]
 *   [       wide (full width) ]
 *
 * Based on ui_components/bento_grid.md reference, adapted for
 * GSAP ScrollTrigger (per CLAUDE.md animation rules) and 4-slot layout.
 */
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
      const cards =
        gridRef.current.querySelectorAll<HTMLElement>("[data-bento-card]");

      // Set initial state explicitly, then animate to final state
      // Using gsap.fromTo prevents the flash-then-hide bug where
      // gsap.from() shows the final state on first render before
      // overwriting it with the "from" values.
      gsap.fromTo(
        cards,
        { opacity: 0, y: 30, scale: 0.97 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          ease: "power2.out",
          stagger: 0.12,
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top 85%",
            once: true,
          },
        }
      );
    },
    { scope: gridRef }
  );

  return (
    <div
      ref={gridRef}
      className={cn(
        // Core grid: 1 col mobile, 2 col desktop
        "grid w-full grid-cols-1 gap-6 md:grid-cols-2",
        // 3 explicit rows: 2 equal + 1 auto for wide card
        "md:grid-rows-3",
        // Minimum row height for implicit rows
        "auto-rows-[minmax(180px,auto)]",
        className
      )}
    >
      {/* Slot 1: Primary — tall left card spanning rows 1–2 */}
      <div
        data-bento-card
        className="group md:col-span-1 md:row-span-2 rounded-xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(239,68,68,0.1)]"
      >
        {primary}
      </div>

      {/* Slot 2: Secondary — top right */}
      <div
        data-bento-card
        className="group md:col-span-1 md:row-span-1 rounded-xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(239,68,68,0.1)]"
      >
        {secondary}
      </div>

      {/* Slot 3: Tertiary — bottom right */}
      <div
        data-bento-card
        className="group md:col-span-1 md:row-span-1 rounded-xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(239,68,68,0.1)]"
      >
        {tertiary}
      </div>

      {/* Slot 4: Wide — full width bottom row */}
      <div
        data-bento-card
        className="group md:col-span-2 md:row-span-1 rounded-xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(239,68,68,0.1)]"
      >
        {wide}
      </div>
    </div>
  );
};

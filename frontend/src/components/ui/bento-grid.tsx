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

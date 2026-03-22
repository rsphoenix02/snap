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

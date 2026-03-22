"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Link2, Zap, BarChart3, type LucideIcon } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

interface StepData {
  readonly icon: LucideIcon;
  readonly title: string;
  readonly tech: string;
  readonly description: string;
  readonly benefits: readonly string[];
}

const stepsData: readonly StepData[] = [
  {
    icon: Link2,
    title: "Paste Your URL",
    tech: "React Frontend",
    description: "Submit any URL through our clean interface or REST API.",
    benefits: [
      "Instant URL validation",
      "Bulk shortening support",
      "Browser extension ready",
    ],
  },
  {
    icon: Zap,
    title: "Generate Hash",
    tech: "FastAPI + Redis",
    description:
      "Base62-encoded short code generated and cached for instant lookups.",
    benefits: [
      "Custom short codes available",
      "Collision-free generation",
      "Redis-cached for speed",
    ],
  },
  {
    icon: BarChart3,
    title: "Redirect & Track",
    tech: "PostgreSQL + Analytics",
    description:
      "Lightning redirect with async click tracking — location, device, timestamp.",
    benefits: [
      "Sub-100ms redirects",
      "Real-time analytics dashboard",
      "Geographic & device insights",
    ],
  },
] as const;

function StepCard({
  icon: Icon,
  title,
  tech,
  description,
  benefits,
}: StepData) {
  return (
    <div className="relative flex h-full flex-col rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-6 text-white transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:border-red-500/30 hover:bg-zinc-800/80">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mb-1 text-xl font-semibold text-white">{title}</h3>
      <span className="mb-3 inline-block text-xs font-medium text-red-400" style={{ fontFamily: "var(--font-geist-mono)" }}>
        {tech}
      </span>
      <p className="mb-6 text-sm leading-relaxed text-zinc-400">
        {description}
      </p>
      <ul className="mt-auto space-y-3">
        {benefits.map((benefit, index) => (
          <li key={index} className="flex items-center gap-3">
            <div className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-red-500/20">
              <div className="h-2 w-2 rounded-full bg-red-500" />
            </div>
            <span className="text-sm text-zinc-400">{benefit}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!sectionRef.current) return;

      // Animate step number indicators
      gsap.from(sectionRef.current.querySelectorAll("[data-step-number]"), {
        opacity: 0,
        scale: 0.5,
        duration: 0.5,
        ease: "power2.out",
        stagger: 0.2,
        scrollTrigger: {
          trigger: sectionRef.current.querySelector("[data-step-bar]"),
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });

      // Animate connecting line
      gsap.from(sectionRef.current.querySelector("[data-step-line]"), {
        scaleX: 0,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: sectionRef.current.querySelector("[data-step-bar]"),
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });

      // Animate cards with stagger
      gsap.from(sectionRef.current.querySelectorAll("[data-step-card]"), {
        opacity: 0,
        y: 30,
        duration: 0.6,
        ease: "power2.out",
        stagger: 0.2,
        scrollTrigger: {
          trigger: sectionRef.current.querySelector("[data-step-card]"),
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="scroll-offset dot-grid-bg relative py-24 lg:py-32"
    >
      <div className="mx-auto max-w-4xl px-6 lg:px-12">
        {/* Section header */}
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
            <span className="gradient-text">How It Works</span>
          </h2>
          <p className="text-base text-zinc-400">
            From URL to redirect in under 100ms
          </p>
        </div>

        {/* Step number indicators with connecting line */}
        <div className="relative mx-auto mb-8 hidden w-full max-w-4xl md:block" data-step-bar>
          <div
            aria-hidden="true"
            className="absolute left-[16.6667%] top-1/2 h-0.5 w-[66.6667%] -translate-y-1/2 origin-left bg-zinc-700"
            data-step-line
          />
          <div className="relative grid grid-cols-3">
            {stepsData.map((_, index) => (
              <div
                key={index}
                className="flex h-8 w-8 items-center justify-center justify-self-center rounded-full bg-zinc-800 font-semibold text-white ring-4 ring-[#0a0a0a]"
                data-step-number
              >
                {index + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Steps grid */}
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-3">
          {stepsData.map((step, index) => (
            <div key={index} data-step-card>
              <StepCard
                icon={step.icon}
                title={step.title}
                tech={step.tech}
                description={step.description}
                benefits={step.benefits}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

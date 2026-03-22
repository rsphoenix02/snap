You are given a task to integrate an existing React component in the codebase

The codebase should support:
- shadcn project structure  
- Tailwind CSS
- Typescript

If it doesn't, provide instructions on how to setup project via shadcn CLI, install Tailwind or Typescript.

Determine the default path for components and styles. 
If default path for components is not /components/ui, provide instructions on why it's important to create this folder
Copy-paste this component to /components/ui folder:
```tsx
marquee.tsx
"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  duration?: number;
  pauseOnHover?: boolean;
  direction?: "left" | "right" | "up" | "down";
  fade?: boolean;
  fadeAmount?: number;
}

export function Marquee({
  children,
  className,
  duration = 20,
  pauseOnHover = false,
  direction = "left",
  fade = true,
  fadeAmount = 10,
  ...props
}: MarqueeProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = React.useState(false);

  const items = React.Children.toArray(children);
  const isVertical = direction === "up" || direction === "down";

  return (
    <>
      <style>
        {`
        @keyframes scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }

        @keyframes scroll-reverse {
          from {
            transform: translateX(-50%);
          }
          to {
            transform: translateX(0);
          }
        }

        @keyframes scroll-y {
          from {
            transform: translateY(0);
          }
          to {
            transform: translateY(-50%);
          }
        }

        @keyframes scroll-y-reverse {
          from {
            transform: translateY(-50%);
          }
          to {
            transform: translateY(0);
          }
        }

        .marquee-scroller {
          display: flex;
          animation: ${
          isVertical
            ? (direction === "up" ? "scroll-y" : "scroll-y-reverse")
            : (direction === "left" ? "scroll" : "scroll-reverse")
        } ${duration}s linear infinite;
        }

        .marquee-scroller.paused {
          animation-play-state: paused;
        }
      `}
      </style>
      <div
        ref={containerRef}
        className={cn(
          "flex w-full overflow-hidden",
          isVertical && "flex-col",
          className,
        )}
        style={{
          ...(fade && {
            maskImage: isVertical
              ? `linear-gradient(to bottom, transparent 0%, black ${fadeAmount}%, black ${
                100 - fadeAmount
              }%, transparent 100%)`
              : `linear-gradient(to right, transparent 0%, black ${fadeAmount}%, black ${
                100 - fadeAmount
              }%, transparent 100%)`,
            WebkitMaskImage: isVertical
              ? `linear-gradient(to bottom, transparent 0%, black ${fadeAmount}%, black ${
                100 - fadeAmount
              }%, transparent 100%)`
              : `linear-gradient(to right, transparent 0%, black ${fadeAmount}%, black ${
                100 - fadeAmount
              }%, transparent 100%)`,
          }),
        }}
        onMouseEnter={() => pauseOnHover && setIsPaused(true)}
        onMouseLeave={() => pauseOnHover && setIsPaused(false)}
        {...props}
      >
        <div
          className={cn(
            "marquee-scroller flex shrink-0",
            isVertical && "flex-col",
            isPaused && "paused",
          )}
        >
          {items.map((item, index) => (
            <div
              key={`first-${index}`}
              className={cn("flex shrink-0", isVertical && "w-full")}
            >
              {item}
            </div>
          ))}
          {items.map((item, index) => (
            <div
              key={`second-${index}`}
              className={cn("flex shrink-0", isVertical && "w-full")}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}


demo.tsx
import { Marquee } from "@/components/ui/marquee"

export default function Demo() {
  return (
    <div className="flex items-center justify-center min-h-[400px] w-full">
      <Marquee>
        <span className="mx-8 text-2xl font-medium">React</span>
        <span className="mx-8 text-2xl font-medium">Next.js</span>
        <span className="mx-8 text-2xl font-medium">Tailwind</span>
        <span className="mx-8 text-2xl font-medium">TypeScript</span>
        <span className="mx-8 text-2xl font-medium">Supabase</span>
      </Marquee>
    </div>
  )
}

```

Implementation Guidelines
 1. Analyze the component structure and identify all required dependencies
 2. Review the component's argumens and state
 3. Identify any required context providers or hooks and install them
 4. Questions to Ask
 - What data/props will be passed to this component?
 - Are there any specific state management requirements?
 - Are there any required assets (images, icons, etc.)?
 - What is the expected responsive behavior?
 - What is the best place to use this component in the app?

Steps to integrate
 0. Copy paste all the code above in the correct directories
 1. Install external dependencies
 2. Fill image assets with Unsplash stock images you know exist
 3. Use lucide-react icons for svgs or logos if component requires them

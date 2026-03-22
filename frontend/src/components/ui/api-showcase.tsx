"use client";

import { useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

const tabs = [
  {
    name: "cURL",
    code: `curl -X POST https://snap.dev/api/v1/shorten \\
  -H "Authorization: Bearer sk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://example.com/very-long-path",
    "custom_code": "my-link"
  }'`,
  },
  {
    name: "Python",
    code: `import requests

response = requests.post(
    "https://snap.dev/api/v1/shorten",
    headers={
        "Authorization": "Bearer sk_live_...",
        "Content-Type": "application/json",
    },
    json={
        "url": "https://example.com/very-long-path",
        "custom_code": "my-link",
    },
)
print(response.json())`,
  },
  {
    name: "JavaScript",
    code: `const response = await fetch(
  "https://snap.dev/api/v1/shorten",
  {
    method: "POST",
    headers: {
      "Authorization": "Bearer sk_live_...",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url: "https://example.com/very-long-path",
      custom_code: "my-link",
    }),
  }
);
const data = await response.json();`,
  },
];

const responseJson = `{
  "short_url": "https://snap.dev/my-link",
  "original_url": "https://example.com/very-long-path",
  "custom_code": "my-link",
  "created_at": "2026-03-22T10:30:00Z",
  "clicks": 0
}`;

export function ApiShowcase() {
  const [activeTab, setActiveTab] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef<HTMLPreElement>(null);
  const responseRef = useRef<HTMLDivElement>(null);
  const [typedText, setTypedText] = useState("");
  const [showResponse, setShowResponse] = useState(false);
  const hasAnimated = useRef(false);

  useGSAP(
    () => {
      if (!sectionRef.current || hasAnimated.current) return;

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 75%",
        once: true,
        onEnter: () => {
          if (hasAnimated.current) return;
          hasAnimated.current = true;

          const code = tabs[0].code;
          let i = 0;

          const typeInterval = setInterval(() => {
            if (i < code.length) {
              setTypedText(code.slice(0, i + 1));
              i++;
            } else {
              clearInterval(typeInterval);
              // Show response after typing completes
              setTimeout(() => setShowResponse(true), 500);
            }
          }, 30);
        },
      });
    },
    { scope: sectionRef }
  );

  const handleTabChange = (index: number) => {
    setActiveTab(index);
    // After initial animation, show full code for other tabs
    if (hasAnimated.current) {
      setTypedText(tabs[index].code);
    }
  };

  const displayCode = hasAnimated.current && activeTab !== 0
    ? tabs[activeTab].code
    : activeTab === 0
      ? typedText
      : tabs[activeTab].code;

  return (
    <section
      id="api"
      className="scroll-offset dot-grid-bg relative py-24 lg:py-32"
    >
      <div ref={sectionRef} className="mx-auto max-w-5xl px-6 lg:px-12">
        {/* Section header */}
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
            <span className="gradient-text">Developer-First</span>{" "}
            <span className="text-red-500">API</span>
          </h2>
          <p className="text-base text-zinc-400">
            Clean REST endpoints. API key auth. JSON everywhere.
          </p>
        </div>

        {/* Split layout */}
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Left: Tabbed code block */}
          <div className="flex-[3] overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
            {/* Tabs */}
            <div className="flex border-b border-zinc-800">
              {tabs.map((tab, i) => (
                <button
                  key={tab.name}
                  onClick={() => handleTabChange(i)}
                  className={`px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                    activeTab === i
                      ? "border-b-2 border-red-500 text-white"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </div>
            {/* Code */}
            <pre
              ref={codeRef}
              className="overflow-x-auto p-5 font-mono text-sm leading-relaxed text-zinc-300"
              style={{ fontFamily: "var(--font-geist-mono), monospace" }}
            >
              <code>{displayCode}</code>
              {activeTab === 0 && !hasAnimated.current && (
                <span className="inline-block h-4 w-1.5 animate-pulse bg-red-500 align-middle" />
              )}
            </pre>
          </div>

          {/* Right: Response */}
          <div
            ref={responseRef}
            className={`flex-[2] overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 transition-all duration-500 ${
              showResponse || (hasAnimated.current && activeTab !== 0)
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            <div className="border-b border-zinc-800 px-4 py-2.5">
              <span className="text-sm font-medium text-zinc-400">
                Response{" "}
                <span className="ml-2 text-xs text-emerald-400">
                  200 OK
                </span>
              </span>
            </div>
            <pre
              className="overflow-x-auto p-5 font-mono text-sm leading-relaxed text-zinc-300"
              style={{ fontFamily: "var(--font-geist-mono), monospace" }}
            >
              <code>{responseJson}</code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}

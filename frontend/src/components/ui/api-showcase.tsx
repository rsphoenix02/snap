"use client";

import { useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

const tabs = [
  {
    name: "cURL",
    lang: "bash",
    code: `curl -X POST https://snapurl.click/api/v1/shorten \\
  -H "Authorization: Bearer sk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://example.com/very-long-path",
    "custom_code": "my-link"
  }'`,
  },
  {
    name: "Python",
    lang: "python",
    code: `import requests

response = requests.post(
    "https://snapurl.click/api/v1/shorten",
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
    lang: "javascript",
    code: `const response = await fetch(
  "https://snapurl.click/api/v1/shorten",
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

// Pre-compute the max line count across all tabs to prevent layout shift
const maxCodeLines = Math.max(...tabs.map((t) => t.code.split("\n").length));

const responseJson = `{
  "short_url": "https://snapurl.click/my-link",
  "original_url": "https://example.com/very-long-path",
  "custom_code": "my-link",
  "created_at": "2026-03-22T10:30:00Z",
  "clicks": 0
}`;

function WindowDots() {
  return (
    <div className="flex items-center gap-1.5">
      <span className="h-3 w-3 rounded-full bg-zinc-700" />
      <span className="h-3 w-3 rounded-full bg-zinc-700" />
      <span className="h-3 w-3 rounded-full bg-zinc-700" />
    </div>
  );
}

function LineNumbers({ count }: { count: number }) {
  return (
    <div
      className="select-none pr-4 text-right text-zinc-600"
      style={{ fontFamily: "var(--font-geist-mono), monospace" }}
      aria-hidden
    >
      {Array.from({ length: count }, (_, i) => (
        <div key={i}>{i + 1}</div>
      ))}
    </div>
  );
}

function highlightCode(code: string): React.ReactNode[] {
  return code.split("\n").map((line, lineIdx) => {
    const parts: React.ReactNode[] = [];
    let remaining = line;
    let keyCounter = 0;

    const push = (text: string, className?: string) => {
      if (text) {
        parts.push(
          className ? (
            <span key={`${lineIdx}-${keyCounter++}`} className={className}>
              {text}
            </span>
          ) : (
            <span key={`${lineIdx}-${keyCounter++}`}>{text}</span>
          )
        );
      }
    };

    while (remaining.length > 0) {
      // Strings (double or single quoted)
      const strMatch = remaining.match(/^("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/);
      if (strMatch) {
        push(strMatch[0], "text-emerald-400");
        remaining = remaining.slice(strMatch[0].length);
        continue;
      }
      // Keywords
      const kwMatch = remaining.match(
        /^(curl|import|const|await|let|var|def|print|from|return|async|function)\b/
      );
      if (kwMatch) {
        push(kwMatch[0], "text-red-400 font-semibold");
        remaining = remaining.slice(kwMatch[0].length);
        continue;
      }
      // HTTP methods
      const methodMatch = remaining.match(/^(POST|GET|PUT|DELETE|PATCH)\b/);
      if (methodMatch) {
        push(methodMatch[0], "text-amber-400 font-semibold");
        remaining = remaining.slice(methodMatch[0].length);
        continue;
      }
      // Flags (-X, -H, -d)
      const flagMatch = remaining.match(/^(-[A-Za-z])\b/);
      if (flagMatch) {
        push(flagMatch[0], "text-cyan-400");
        remaining = remaining.slice(flagMatch[0].length);
        continue;
      }
      // Object keys (word followed by colon or =>)
      const keyMatch = remaining.match(/^([a-zA-Z_]\w*)(?=\s*[:=])/);
      if (keyMatch) {
        push(keyMatch[0], "text-sky-400");
        remaining = remaining.slice(keyMatch[0].length);
        continue;
      }
      // Methods/functions (word followed by open paren)
      const fnMatch = remaining.match(/^(\.\w+|\w+)(?=\()/);
      if (fnMatch) {
        push(fnMatch[0], "text-violet-400");
        remaining = remaining.slice(fnMatch[0].length);
        continue;
      }
      // Numbers
      const numMatch = remaining.match(/^(\d+)/);
      if (numMatch) {
        push(numMatch[0], "text-amber-300");
        remaining = remaining.slice(numMatch[0].length);
        continue;
      }
      // Default: one character at a time
      push(remaining[0]);
      remaining = remaining.slice(1);
    }

    return (
      <div key={lineIdx} className="leading-6">
        {parts.length > 0 ? parts : "\u00A0"}
      </div>
    );
  });
}

function highlightJson(json: string): React.ReactNode[] {
  return json.split("\n").map((line, lineIdx) => {
    const parts: React.ReactNode[] = [];
    let remaining = line;
    let keyCounter = 0;

    const push = (text: string, className?: string) => {
      if (text) {
        parts.push(
          className ? (
            <span key={`j-${lineIdx}-${keyCounter++}`} className={className}>
              {text}
            </span>
          ) : (
            <span key={`j-${lineIdx}-${keyCounter++}`}>{text}</span>
          )
        );
      }
    };

    while (remaining.length > 0) {
      // JSON keys
      const keyMatch = remaining.match(/^("[\w_]+")\s*:/);
      if (keyMatch) {
        push(keyMatch[1], "text-sky-400");
        remaining = remaining.slice(keyMatch[1].length);
        continue;
      }
      // String values
      const strMatch = remaining.match(/^"(?:[^"\\]|\\.)*"/);
      if (strMatch) {
        push(strMatch[0], "text-emerald-400");
        remaining = remaining.slice(strMatch[0].length);
        continue;
      }
      // Numbers
      const numMatch = remaining.match(/^\d+/);
      if (numMatch) {
        push(numMatch[0], "text-amber-300");
        remaining = remaining.slice(numMatch[0].length);
        continue;
      }
      push(remaining[0]);
      remaining = remaining.slice(1);
    }

    return (
      <div key={lineIdx} className="leading-6">
        {parts.length > 0 ? parts : "\u00A0"}
      </div>
    );
  });
}

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
    if (hasAnimated.current) {
      setTypedText(tabs[index].code);
    }
  };

  const displayCode =
    hasAnimated.current && activeTab !== 0
      ? tabs[activeTab].code
      : activeTab === 0
        ? typedText
        : tabs[activeTab].code;

  const codeLineCount = displayCode.split("\n").length;
  const responseLineCount = responseJson.split("\n").length;

  return (
    <section
      id="api"
      className="scroll-offset dot-grid-bg relative py-24 lg:py-32"
    >
      <div ref={sectionRef} className="mx-auto max-w-6xl px-6 lg:px-12">
        {/* Section header */}
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
            <span className="gradient-text">Developer-First API</span>
          </h2>
          <p className="text-base text-zinc-400">
            Clean REST endpoints. API key auth. JSON everywhere.
          </p>
        </div>

        {/* Split layout */}
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Left: Request panel */}
          <div className="flex-[3] overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-950/80 shadow-2xl shadow-black/40 backdrop-blur-sm">
            {/* Window chrome header */}
            <div className="flex items-center justify-between border-b border-zinc-800/80 bg-zinc-900/60 px-4 py-3">
              <WindowDots />
              <span
                className="text-xs text-zinc-500"
                style={{ fontFamily: "var(--font-geist-mono), monospace" }}
              >
                {tabs[activeTab].lang}
              </span>
              <span className="inline-flex items-center rounded-md bg-red-500/15 px-2 py-0.5 text-[11px] font-bold tracking-wider text-red-400 ring-1 ring-red-500/30">
                POST
              </span>
            </div>

            {/* Tabs row */}
            <div className="flex border-b border-zinc-800/60 bg-zinc-900/30">
              {tabs.map((tab, i) => (
                <button
                  key={tab.name}
                  onClick={() => handleTabChange(i)}
                  className={`relative cursor-pointer px-5 py-2.5 text-[13px] font-medium transition-colors ${
                    activeTab === i
                      ? "bg-zinc-950/80 text-white"
                      : "text-zinc-500 hover:bg-zinc-900/40 hover:text-zinc-300"
                  }`}
                  style={{ fontFamily: "var(--font-geist-mono), monospace" }}
                >
                  {tab.name}
                  {activeTab === i && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500" />
                  )}
                </button>
              ))}
            </div>

            {/* Code content with line numbers — fixed height to prevent layout shift */}
            <div
              className="flex overflow-x-auto p-5"
              style={{ minHeight: `${maxCodeLines * 24 + 40}px` }}
            >
              <LineNumbers count={maxCodeLines} />
              <pre
                ref={codeRef}
                className="flex-1 text-[13px] text-zinc-300"
                style={{ fontFamily: "var(--font-geist-mono), monospace" }}
              >
                <code>
                  {highlightCode(displayCode)}
                  {activeTab === 0 && !hasAnimated.current && (
                    <span className="inline-block h-4 w-1.5 animate-pulse bg-red-500 align-middle" />
                  )}
                </code>
              </pre>
            </div>
          </div>

          {/* Right: Response panel */}
          <div
            ref={responseRef}
            className={`flex-[3] overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-950/80 shadow-2xl shadow-black/40 backdrop-blur-sm transition-all duration-500 ${
              showResponse || (hasAnimated.current && activeTab !== 0)
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            {/* Window chrome header */}
            <div className="flex items-center justify-between border-b border-zinc-800/80 bg-zinc-900/60 px-4 py-3">
              <WindowDots />
              <span
                className="text-xs text-zinc-500"
                style={{ fontFamily: "var(--font-geist-mono), monospace" }}
              >
                response.json
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/15 px-2 py-0.5 text-[11px] font-bold tracking-wider text-emerald-400 ring-1 ring-emerald-500/30">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                200 OK
              </span>
            </div>

            {/* JSON content with line numbers */}
            <div className="flex overflow-x-auto p-5">
              <LineNumbers count={responseLineCount} />
              <pre
                className="flex-1 text-[13px] text-zinc-300"
                style={{ fontFamily: "var(--font-geist-mono), monospace" }}
              >
                <code>{highlightJson(responseJson)}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

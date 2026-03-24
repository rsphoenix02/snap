"use client";

import { useState } from "react";
import { X, Loader2, Copy, Check } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { apiFetch } from "@/lib/api";

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

const EXPIRY_OPTIONS = [
  { label: "Never", value: null },
  { label: "1 hour", value: 1 },
  { label: "24 hours", value: 24 },
  { label: "7 days", value: 168 },
  { label: "30 days", value: 720 },
];

export function CreateLinkModal({ onClose, onCreated }: Props) {
  const { accessToken } = useAuth();
  const [url, setUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [expiresIn, setExpiresIn] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ short_url: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const body: Record<string, unknown> = { url };
    if (customCode.trim()) body.custom_code = customCode.trim();
    if (expiresIn !== null) body.expires_in = expiresIn;

    const res = await apiFetch<{ short_url: string }>("/api/links", {
      method: "POST",
      body: JSON.stringify(body),
      token: accessToken,
    });
    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else if (res.data) {
      setResult(res.data);
    }
  };

  const handleCopy = async () => {
    if (result) {
      await navigator.clipboard.writeText(result.short_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Create Short Link</h2>
          <button onClick={result ? onCreated : onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X className="size-5" />
          </button>
        </div>

        {result ? (
          <div className="space-y-4">
            <p className="text-sm text-zinc-400">Your short link is ready:</p>
            <div className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5">
              <span className="text-sm text-emerald-400 truncate flex-1" style={{ fontFamily: "var(--font-geist-mono)" }}>
                {result.short_url}
              </span>
              <button onClick={handleCopy} className="text-zinc-400 hover:text-white transition-colors">
                {copied ? <Check className="size-4 text-emerald-400" /> : <Copy className="size-4" />}
              </button>
            </div>
            <button
              onClick={() => { onCreated(); }}
              className="w-full rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-600 transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">URL</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                placeholder="https://example.com/very/long/url"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Custom Code (optional)</label>
              <input
                type="text"
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value)}
                placeholder="my-link"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Expiry</label>
              <select
                value={expiresIn ?? ""}
                onChange={(e) => setExpiresIn(e.target.value ? Number(e.target.value) : null)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500"
              >
                {EXPIRY_OPTIONS.map((opt) => (
                  <option key={opt.label} value={opt.value ?? ""}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="size-4 animate-spin" />}
              Shorten
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

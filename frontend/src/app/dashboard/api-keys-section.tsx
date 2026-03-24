"use client";

import { useCallback, useEffect, useState } from "react";
import { Key, Loader2, Copy, Check, Trash2, AlertTriangle } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { apiFetch } from "@/lib/api";

interface ApiKeyItem {
  id: string;
  key_preview: string;
  created_at: string;
  last_used_at: string | null;
  is_active: boolean;
}

export function ApiKeysSection() {
  const { accessToken } = useAuth();
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchKeys = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    const res = await apiFetch<{ keys: ApiKeyItem[] }>("/api/keys", { token: accessToken });
    if (res.data) setKeys(res.data.keys);
    setLoading(false);
  }, [accessToken]);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const handleGenerate = async () => {
    if (!accessToken) return;
    setGenerating(true);
    const res = await apiFetch<{ key: string }>("/api/keys", {
      method: "POST",
      token: accessToken,
    });
    setGenerating(false);
    if (res.data?.key) {
      setNewKey(res.data.key);
      fetchKeys();
    }
  };

  const handleRevoke = async (id: string) => {
    if (!accessToken) return;
    await apiFetch(`/api/keys/${id}`, { method: "DELETE", token: accessToken });
    fetchKeys();
  };

  const handleCopyKey = async () => {
    if (newKey) {
      await navigator.clipboard.writeText(newKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Key className="size-4 text-zinc-400" />
          <h2 className="text-lg font-semibold text-white">API Keys</h2>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="flex items-center gap-2 rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors disabled:opacity-50"
        >
          {generating && <Loader2 className="size-3.5 animate-spin" />}
          Generate API Key
        </button>
      </div>

      {/* New key warning */}
      {newKey && (
        <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
          <div className="flex items-start gap-2 mb-2">
            <AlertTriangle className="size-4 text-amber-400 mt-0.5 shrink-0" />
            <p className="text-sm text-amber-300">
              Copy this key now. You won&apos;t be able to see it again.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2">
            <code className="text-sm text-emerald-400 truncate flex-1" style={{ fontFamily: "var(--font-geist-mono)" }}>
              {newKey}
            </code>
            <button onClick={handleCopyKey} className="text-zinc-400 hover:text-white transition-colors shrink-0">
              {copied ? <Check className="size-4 text-emerald-400" /> : <Copy className="size-4" />}
            </button>
          </div>
        </div>
      )}

      {/* Keys table */}
      {loading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="size-5 animate-spin text-zinc-500" />
        </div>
      ) : keys.length > 0 ? (
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="px-3 py-2 text-left text-xs font-medium text-zinc-500 uppercase">Key</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-zinc-500 uppercase hidden sm:table-cell">Created</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-zinc-500 uppercase hidden md:table-cell">Last Used</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-zinc-500 uppercase">Status</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {keys.map((k) => (
              <tr key={k.id} className="border-b border-zinc-800/50">
                <td className="px-3 py-2">
                  <code className="text-sm text-zinc-400" style={{ fontFamily: "var(--font-geist-mono)" }}>
                    {k.key_preview}
                  </code>
                </td>
                <td className="px-3 py-2 hidden sm:table-cell">
                  <span className="text-sm text-zinc-500">
                    {new Date(k.created_at).toLocaleDateString()}
                  </span>
                </td>
                <td className="px-3 py-2 hidden md:table-cell">
                  <span className="text-sm text-zinc-500">
                    {k.last_used_at ? new Date(k.last_used_at).toLocaleDateString() : "Never"}
                  </span>
                </td>
                <td className="px-3 py-2 text-center">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${
                    k.is_active ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-700 text-zinc-400"
                  }`}>
                    {k.is_active ? "Active" : "Revoked"}
                  </span>
                </td>
                <td className="px-3 py-2 text-right">
                  {k.is_active && (
                    <button
                      onClick={() => handleRevoke(k.id)}
                      className="text-zinc-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-sm text-zinc-500 text-center py-4">No API keys yet</p>
      )}
    </div>
  );
}

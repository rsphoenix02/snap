"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { apiFetch } from "@/lib/api";
import { LinkDetail, type AnalyticsCacheEntry } from "./link-detail";

interface LinkItem {
  id: number;
  short_code: string;
  original_url: string;
  click_count: number;
  created_at: string;
  is_active: boolean;
  short_url?: string;
}

interface Props {
  refreshKey: number;
}

export function LinksTable({ refreshKey }: Props) {
  const { accessToken } = useAuth();
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [expandedCode, setExpandedCode] = useState<string | null>(null);
  const analyticsCache = useRef<Record<string, AnalyticsCacheEntry>>({});
  const limit = 20;

  const handleDataLoaded = useCallback((code: string, entry: AnalyticsCacheEntry) => {
    analyticsCache.current = { ...analyticsCache.current, [code]: entry };
  }, []);

  const fetchLinks = useCallback(async () => {
    if (!accessToken) return;
    const res = await apiFetch<{ links: LinkItem[]; total: number }>("/api/links?page=" + page + "&limit=" + limit, {
      token: accessToken,
    });
    if (res.data) {
      setLinks(res.data.links);
      setTotal(res.data.total);
    }
  }, [accessToken, page]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks, refreshKey]);

  const totalPages = Math.ceil(total / limit);

  const toggleExpand = (code: string) => {
    setExpandedCode(expandedCode === code ? null : code);
  };

  if (links.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-center">
        <p className="text-zinc-500">No links yet. Create your first short link!</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-zinc-800">
            <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Short Code</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase hidden md:table-cell">Original URL</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 uppercase">Clicks</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 uppercase hidden sm:table-cell">Created</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-zinc-500 uppercase">Status</th>
          </tr>
        </thead>
        <tbody>
          {links.map((link) => (
            <Fragment key={link.short_code}>
              <tr
                onClick={() => toggleExpand(link.short_code)}
                className="border-b border-zinc-800/50 hover:bg-zinc-800/30 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3">
                  <span className="text-sm text-red-400" style={{ fontFamily: "var(--font-geist-mono)" }}>
                    {link.short_code}
                  </span>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className="text-sm text-zinc-400 truncate block max-w-xs">
                    {link.original_url}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-sm text-white">{link.click_count}</span>
                </td>
                <td className="px-4 py-3 text-right hidden sm:table-cell">
                  <span className="text-sm text-zinc-500">
                    {new Date(link.created_at).toLocaleDateString()}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${
                    link.is_active ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-700 text-zinc-400"
                  }`}>
                    {link.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
              </tr>
              {expandedCode === link.short_code && (
                <tr>
                  <td colSpan={5} className="px-4 py-4 bg-zinc-900/80">
                    <LinkDetail
                      code={link.short_code}
                      active={link.is_active}
                      onUpdate={fetchLinks}
                      cached={analyticsCache.current[link.short_code]}
                      onDataLoaded={handleDataLoaded}
                    />
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800">
          <span className="text-sm text-zinc-500">
            Page {page} of {totalPages} ({total} links)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1 text-zinc-500 hover:text-white disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1 text-zinc-500 hover:text-white disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

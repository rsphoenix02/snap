"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, Plus, Link2, MousePointerClick, TrendingUp, Loader2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { apiFetch } from "@/lib/api";
import { CreateLinkModal } from "./create-link-modal";
import { LinksTable } from "./links-table";
import { ApiKeysSection } from "./api-keys-section";

interface DashboardSummary {
  total_links: number;
  total_clicks: number;
  top_link: { short_code: string; original_url: string; click_count: number } | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, accessToken, isLoading, logout } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

  const fetchSummary = useCallback(async () => {
    if (!accessToken) return;
    const res = await apiFetch<DashboardSummary>("/api/dashboard/summary", {
      token: accessToken,
    });
    if (res.data) setSummary(res.data);
  }, [accessToken]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary, refreshKey]);

  const handleLinkCreated = () => {
    setShowCreateModal(false);
    setRefreshKey((k) => k + 1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <Loader2 className="size-8 animate-spin text-zinc-500" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Top bar */}
      <div className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="size-5 text-red-500 fill-red-500" />
          <span className="font-semibold text-lg tracking-tighter text-white">SNAP</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-400">{user.name}</span>
          <button
            onClick={logout}
            className="text-sm text-zinc-500 hover:text-white transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="flex items-center gap-2 text-zinc-400 mb-2">
              <Link2 className="size-4" />
              <span className="text-sm">Total Links</span>
            </div>
            <p className="text-3xl font-bold text-white">{summary?.total_links ?? 0}</p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="flex items-center gap-2 text-zinc-400 mb-2">
              <MousePointerClick className="size-4" />
              <span className="text-sm">Total Clicks</span>
            </div>
            <p className="text-3xl font-bold text-white">{summary?.total_clicks ?? 0}</p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="flex items-center gap-2 text-zinc-400 mb-2">
              <TrendingUp className="size-4" />
              <span className="text-sm">Top Performing</span>
            </div>
            {summary?.top_link ? (
              <div>
                <p className="text-lg font-semibold text-white truncate">{summary.top_link.short_code}</p>
                <p className="text-sm text-zinc-500 truncate">{summary.top_link.original_url}</p>
                <p className="text-sm text-zinc-400 mt-1">{summary.top_link.click_count} clicks</p>
              </div>
            ) : (
              <p className="text-sm text-zinc-500">No links yet</p>
            )}
          </div>
        </div>

        {/* Create Link button */}
        <div className="flex justify-end">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-600 transition-colors"
          >
            <Plus className="size-4" />
            Create Link
          </button>
        </div>

        {/* Links table */}
        <LinksTable refreshKey={refreshKey} />

        {/* API Keys */}
        <ApiKeysSection />
      </div>

      {/* Create Link Modal */}
      {showCreateModal && (
        <CreateLinkModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handleLinkCreated}
        />
      )}
    </div>
  );
}

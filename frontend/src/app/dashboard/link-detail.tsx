"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { useAuth } from "@/context/auth-context";
import { apiFetch } from "@/lib/api";

export interface AnalyticsData {
  points: TimePoint[];
  referrers: ReferrerItem[];
  devices: DeviceItem[];
  browsers: BrowserItem[];
}

export interface AnalyticsCacheEntry {
  range: string;
  data: AnalyticsData;
}

interface Props {
  code: string;
  active: boolean;
  onUpdate: () => void;
  cached?: AnalyticsCacheEntry;
  onDataLoaded?: (code: string, entry: AnalyticsCacheEntry) => void;
}

interface TimePoint {
  timestamp: string;
  count: number;
}

interface ReferrerItem {
  source: string;
  count: number;
}

interface DeviceItem {
  type: string;
  count: number;
}

interface BrowserItem {
  name: string;
  count: number;
}

const RANGES = ["24h", "7d", "30d", "all"] as const;

export function LinkDetail({ code, active, onUpdate, cached, onDataLoaded }: Props) {
  const { accessToken } = useAuth();
  const [range, setRange] = useState<string>(cached?.range ?? "7d");
  const [points, setPoints] = useState<TimePoint[]>(cached?.data.points ?? []);
  const [referrers, setReferrers] = useState<ReferrerItem[]>(cached?.data.referrers ?? []);
  const [devices, setDevices] = useState<DeviceItem[]>(cached?.data.devices ?? []);
  const [browsers, setBrowsers] = useState<BrowserItem[]>(cached?.data.browsers ?? []);
  const [loading, setLoading] = useState(!cached);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [editExpiry, setEditExpiry] = useState("");

  const fetchData = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);

    const [clicksRes, refRes, devRes] = await Promise.all([
      apiFetch<{ points: TimePoint[] }>(`/api/links/${code}/clicks?range=${range}`, { token: accessToken }),
      apiFetch<{ referrers: ReferrerItem[] }>(`/api/links/${code}/referrers`, { token: accessToken }),
      apiFetch<{ devices: DeviceItem[]; browsers: BrowserItem[] }>(`/api/links/${code}/devices`, { token: accessToken }),
    ]);

    const newPoints = clicksRes.data?.points ?? [];
    const newReferrers = refRes.data?.referrers ?? [];
    const newDevices = devRes.data?.devices ?? [];
    const newBrowsers = devRes.data?.browsers ?? [];

    setPoints(newPoints);
    setReferrers(newReferrers);
    setDevices(newDevices);
    setBrowsers(newBrowsers);
    setLoading(false);

    onDataLoaded?.(code, {
      range,
      data: {
        points: newPoints,
        referrers: newReferrers,
        devices: newDevices,
        browsers: newBrowsers,
      },
    });
  }, [accessToken, code, range, onDataLoaded]);

  useEffect(() => {
    if (cached && range === cached.range) return;
    fetchData();
  }, [fetchData, cached, range]);

  const handleDeactivate = async () => {
    if (!accessToken) return;
    await apiFetch(`/api/links/${code}`, { method: "DELETE", token: accessToken });
    onUpdate();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="size-5 animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time-series chart */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-white">Click Traffic</h3>
          <div className="flex gap-1">
            {RANGES.map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  range === r ? "bg-red-500 text-white" : "text-zinc-500 hover:text-white"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        {points.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={points}>
              <defs>
                <linearGradient id="clickGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis
                dataKey="timestamp"
                stroke="#52525b"
                tick={{ fontSize: 11, fill: "#71717a" }}
                tickFormatter={(v) => {
                  const d = new Date(v);
                  return range === "24h" ? d.toLocaleTimeString([], { hour: "2-digit" }) : d.toLocaleDateString([], { month: "short", day: "numeric" });
                }}
              />
              <YAxis stroke="#52525b" tick={{ fontSize: 11, fill: "#71717a" }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: "#a1a1aa" }}
                itemStyle={{ color: "#ef4444" }}
              />
              <Area type="monotone" dataKey="count" stroke="#ef4444" fill="url(#clickGradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-zinc-500 text-center py-8">No click data for this period</p>
        )}
      </div>

      {/* Referrers + Devices side by side */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border border-zinc-800 p-4">
          <h4 className="text-xs font-medium text-zinc-500 uppercase mb-3">Top Referrers</h4>
          {referrers.length > 0 ? (
            <ul className="space-y-2">
              {referrers.map((r) => (
                <li key={r.source} className="flex justify-between text-sm">
                  <span className="text-zinc-300 truncate">{r.source}</span>
                  <span className="text-zinc-500 ml-2">{r.count}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-zinc-600">No data</p>
          )}
        </div>

        <div className="rounded-lg border border-zinc-800 p-4">
          <h4 className="text-xs font-medium text-zinc-500 uppercase mb-3">Devices</h4>
          {devices.length > 0 ? (
            <ul className="space-y-2">
              {devices.map((d) => (
                <li key={d.type} className="flex justify-between text-sm">
                  <span className="text-zinc-300 capitalize">{d.type}</span>
                  <span className="text-zinc-500">{d.count}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-zinc-600">No data</p>
          )}
        </div>

        <div className="rounded-lg border border-zinc-800 p-4">
          <h4 className="text-xs font-medium text-zinc-500 uppercase mb-3">Browsers</h4>
          {browsers.length > 0 ? (
            <ul className="space-y-2">
              {browsers.map((b) => (
                <li key={b.name} className="flex justify-between text-sm">
                  <span className="text-zinc-300">{b.name}</span>
                  <span className="text-zinc-500">{b.count}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-zinc-600">No data</p>
          )}
        </div>
      </div>

      {/* Edit + Deactivate/Reactivate */}
      <div className="flex justify-between items-start">
        {editing ? (
          <div className="space-y-3">
            <div className="flex items-end gap-3 flex-wrap">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Destination URL</label>
                <input
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  placeholder="https://example.com/new-url"
                  className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 w-72"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Title</label>
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Link title"
                  className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Expiry</label>
                <input
                  type="datetime-local"
                  value={editExpiry}
                  onChange={(e) => setEditExpiry(e.target.value)}
                  className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  if (!accessToken) return;
                  const body: Record<string, unknown> = {};
                  if (editUrl.trim()) body.original_url = editUrl.trim();
                  if (editTitle.trim()) body.title = editTitle.trim();
                  if (editExpiry) body.expires_at = new Date(editExpiry).toISOString();
                  await apiFetch(`/api/links/${code}`, {
                    method: "PATCH",
                    body: JSON.stringify(body),
                    token: accessToken,
                  });
                  setEditing(false);
                  onUpdate();
                }}
                className="rounded-lg bg-red-500 px-3 py-2 text-sm text-white hover:bg-red-600 transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => setEditing(false)}
                className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            Edit
          </button>
        )}
        {active ? (
          <button
            onClick={handleDeactivate}
            className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400 hover:bg-red-500/20 transition-colors"
          >
            <Trash2 className="size-3.5" />
            Deactivate
          </button>
        ) : (
          <button
            onClick={async () => {
              if (!accessToken) return;
              await apiFetch(`/api/links/${code}`, {
                method: "PATCH",
                body: JSON.stringify({ is_active: true }),
                token: accessToken,
              });
              onUpdate();
            }}
            className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400 hover:bg-emerald-500/20 transition-colors"
          >
            Reactivate
          </button>
        )}
      </div>
    </div>
  );
}

"use client";

import { memo, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
} from "react-simple-maps";

const GEO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// ip-api.com name → Natural Earth TopoJSON name
const COUNTRY_ALIASES: Record<string, string> = {
  "United States": "United States of America",
  USA: "United States of America",
  UK: "United Kingdom",
  "South Korea": "Korea",
  "North Korea": "Dem. Rep. Korea",
  "Czech Republic": "Czechia",
  "DR Congo": "Dem. Rep. Congo",
  "Ivory Coast": "Côte d'Ivoire",
  Myanmar: "Myanmar",
  "Bosnia and Herzegovina": "Bosnia and Herz.",
  "Dominican Republic": "Dominican Rep.",
  "Central African Republic": "Central African Rep.",
};

interface GeoItem {
  country: string;
  count: number;
}

interface Props {
  data: GeoItem[];
}

function interpolateColor(t: number): string {
  // zinc-900 (#18181b) → red-500 (#ef4444)
  const r = Math.round(24 + t * (239 - 24));
  const g = Math.round(24 + t * (68 - 24));
  const b = Math.round(27 + t * (68 - 27));
  return `rgb(${r}, ${g}, ${b})`;
}

function GeoHeatmapInner({ data }: Props) {
  const [tooltip, setTooltip] = useState<{
    name: string;
    count: number;
    x: number;
    y: number;
  } | null>(null);

  // Build lookup: normalize ip-api names → TopoJSON names
  const countByName = new Map<string, number>();
  for (const d of data) {
    const mapped = COUNTRY_ALIASES[d.country] ?? d.country;
    countByName.set(mapped, (countByName.get(mapped) ?? 0) + d.count);
  }
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  if (data.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <h4 className="text-xs font-medium text-zinc-500 uppercase mb-3">
        Geographic Distribution
      </h4>
      <div className="rounded-lg border border-zinc-800 bg-[#0A0A0A] overflow-hidden">
        <ComposableMap
          projectionConfig={{ rotate: [-10, 0, 0], scale: 147 }}
          height={400}
          style={{ width: "100%", height: "auto" }}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const name: string = geo.properties.name;
                const count = countByName.get(name) ?? 0;
                const t =
                  count > 0 ? Math.max(0.15, count / maxCount) : 0;
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={count > 0 ? interpolateColor(t) : "#18181b"}
                    stroke="#27272a"
                    strokeWidth={0.5}
                    onMouseEnter={(e) => {
                      setTooltip({
                        name,
                        count,
                        x: e.clientX,
                        y: e.clientY,
                      });
                    }}
                    onMouseMove={(e) => {
                      setTooltip((prev) =>
                        prev
                          ? { ...prev, x: e.clientX, y: e.clientY }
                          : null,
                      );
                    }}
                    onMouseLeave={() => setTooltip(null)}
                    style={{
                      default: { outline: "none" },
                      hover: {
                        fill:
                          count > 0
                            ? interpolateColor(Math.min(t + 0.2, 1))
                            : "#27272a",
                        outline: "none",
                      },
                      pressed: { fill: "#ef4444", outline: "none" },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>
      </div>
      {tooltip && tooltip.count > 0 && (
        <div
          className="fixed z-50 pointer-events-none rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm shadow-xl"
          style={{ left: tooltip.x + 12, top: tooltip.y - 10 }}
        >
          <span className="text-white font-medium">{tooltip.name}</span>
          <span className="text-zinc-400 ml-2">
            {tooltip.count} {tooltip.count === 1 ? "click" : "clicks"}
          </span>
        </div>
      )}
    </div>
  );
}

export const GeoHeatmap = memo(GeoHeatmapInner);

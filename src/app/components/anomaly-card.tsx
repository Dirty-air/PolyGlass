"use client";

import Link from "next/link";
import { Activity, AlertTriangle, BarChart3, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { AnomalyItem } from "@/app/hooks/useAnomalies";

function formatVolume(volume: number): string {
  if (volume >= 1_000_000) return `$${(volume / 1_000_000).toFixed(1)}M`;
  if (volume >= 1_000) return `$${(volume / 1_000).toFixed(1)}K`;
  return `$${volume.toFixed(0)}`;
}

function badgeText(item: AnomalyItem): string {
  if (item.type === "price" && typeof item.priceChangePct === "number") {
    const sign = item.priceChangePct > 0 ? "+" : "";
    return `${sign}${item.priceChangePct}%`;
  }
  return `Vol ${formatVolume(item.market.volume)}`;
}

function badgeColor(item: AnomalyItem): string {
  if (item.type === "price") return "bg-rose-500/15 text-rose-100 border border-rose-500/30";
  return "bg-sky-500/15 text-sky-100 border border-sky-500/30";
}

function iconFor(item: AnomalyItem) {
  if (item.type === "price") return <AlertTriangle className="h-4 w-4 text-rose-300" />;
  return <BarChart3 className="h-4 w-4 text-sky-300" />;
}

const ROTATION_INTERVAL_MS = 5000;

export function AnomalyCard({ anomalies, loading }: { anomalies: AnomalyItem[]; loading: boolean }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  // 重置并轮播
  useEffect(() => {
    setActiveIndex(0);
    if (anomalies.length <= 1) return;
    const id = setInterval(() => {
      setActiveIndex((idx) => (idx + 1) % anomalies.length);
    }, ROTATION_INTERVAL_MS);
    return () => clearInterval(id);
  }, [anomalies]);

  // 触发淡入淡出
  useEffect(() => {
    setVisible(false);
    const id = setTimeout(() => setVisible(true), 40);
    return () => clearTimeout(id);
  }, [activeIndex]);

  const maxVolume = useMemo(() => Math.max(...anomalies.map((a) => a.market.volume), 1), [anomalies]);
  const activeItem = anomalies[activeIndex];

  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400/25 via-cyan-400/20 to-indigo-500/25 ring-1 ring-white/10">
          <Activity className="h-5 w-5 text-emerald-100" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/50">Market Anomalies</p>
          <h3 className="text-lg font-semibold text-white">Realtime snapshot</h3>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-white/5 bg-white/5 p-3">
              <div className="mb-2 h-4 w-3/4 animate-pulse rounded bg-white/10" />
              <div className="flex items-center justify-between">
                <div className="h-3 w-1/2 animate-pulse rounded bg-white/10" />
                <div className="h-6 w-16 animate-pulse rounded bg-white/10" />
              </div>
              <div className="mt-2 h-2 w-full animate-pulse rounded bg-white/5" />
            </div>
          ))}
        </div>
      ) : anomalies.length === 0 ? (
        <div className="rounded-xl border border-white/5 bg-white/5 p-4 text-sm text-white/50">No notable anomalies</div>
      ) : (
        <div className="space-y-3">
          {activeItem && (
            <div className="space-y-2">
              <Link
                key={`${activeItem.market.marketId}-${activeIndex}`}
                href={`https://polymarket.com/event/${activeItem.market.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group block rounded-xl border border-white/10 bg-gradient-to-r from-white/10 via-white/5 to-transparent px-3 py-3 transition hover:border-teal-500/30 hover:from-teal-500/10"
                style={{
                  transition: "opacity 450ms ease, transform 450ms ease",
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0px)" : "translateY(8px)",
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 ring-1 ring-white/10">
                      {iconFor(activeItem)}
                    </div>
                    <div className="space-y-1">
                      <h4 className="line-clamp-2 text-sm font-semibold leading-tight text-white group-hover:text-teal-100 transition">
                        {activeItem.market.title}
                      </h4>
                      <p className="text-xs text-white/50">
                        {activeItem.event?.title || activeItem.market.tags[0] || "General"}
                      </p>
                    </div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeColor(activeItem)}`}>
                    {badgeText(activeItem)}
                  </span>
                </div>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full ${activeItem.type === "price" ? "bg-gradient-to-r from-emerald-400 to-rose-500" : "bg-gradient-to-r from-sky-400 to-indigo-500"}`}
                    style={{ width: `${Math.min(100, Math.max(6, (activeItem.market.volume / maxVolume) * 100))}%` }}
                  />
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px] text-white/50">
                  <span className="flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5 text-white/60" />
                    {activeItem.type === "price" ? "Price swing" : "Volume spike"}
                  </span>
                  <span>Vol {formatVolume(activeItem.market.volume)}</span>
                </div>
              </Link>
              {anomalies.length > 1 && (
                <div className="flex items-center justify-center gap-2">
                  {anomalies.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveIndex(i)}
                      aria-label={`Show anomaly ${i + 1}`}
                      className={`h-2 w-2 rounded-full transition-all duration-300 ${
                        i === activeIndex ? "bg-teal-300 scale-110" : "bg-white/25 hover:bg-white/40"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

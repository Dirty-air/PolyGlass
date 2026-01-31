"use client";

import { MarketTable } from "./components/market-table";
import { Header } from "../components/header";
import { useMarkets } from "../hooks/useMarkets";

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-white/10 ${className}`} />;
}

export default function MarketsPage() {
  const { markets, events, marketEvents, loading, error } = useMarkets();

  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-6 py-8 lg:px-10">
      {/* Header 导航 */}
      <Header />

      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-semibold text-white">All Markets</h1>
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-rose-200">
          Failed to load markets: {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col gap-4">
          <div className="flex gap-3">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="rounded-lg border border-white/10">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 border-b border-white/5 p-4">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Markets Table */}
      {!loading && markets && events && marketEvents && (
        <MarketTable markets={markets} events={events} marketEvents={marketEvents} />
      )}
    </main>
  );
}

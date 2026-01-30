"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, Flame, Shield, Sparkles } from "lucide-react";
import { Header } from "./components/header";
import { StatCard } from "./components/stat-card";
import { MarketActivity } from "./components/market-activity";
import { TraderFeed } from "./components/trader-feed";
import { MarketsTable } from "./components/markets-table";
import { PillTabs } from "./components/pill-tabs";
import { filters, marketActivity, marketsTable, networkStats, traderFeed } from "./data/mock";

export default function Home() {
  const [activeFilter, setActiveFilter] = useState("All");

  const filteredMarkets = useMemo(() => {
    if (activeFilter === "All") return marketsTable;
    return marketsTable.filter((m) => m.tags.map((t) => t.toLowerCase()).includes(activeFilter.toLowerCase()));
  }, [activeFilter]);

  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-8 px-6 py-8 lg:px-10">
      <Header />

      <section className="grid gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/40 backdrop-blur lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3 text-sm uppercase tracking-[0.3em] text-white/60">
            <span className="rounded-full bg-teal-400/20 px-3 py-1 text-[11px] font-semibold text-teal-100">
              Live on-chain
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-teal-300/50 via-white/40 to-purple-500/40" />
            <span className="text-white/40">Updated Jan 30, 2026</span>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-white/60">Polymarket Data & Analytics</p>
              <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">
                The command center for prediction liquidity
              </h1>
              <p className="mt-3 max-w-2xl text-base text-white/60">
                Aggregate open interest, volatility, and trader flow from Polymarket with institutional-grade visual
                signals. Built for quant teams, DAOs, and degen desks.
              </p>
              <div className="mt-5 flex flex-wrap gap-3 text-sm">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-white">
                  <Shield className="h-4 w-4 text-teal-200" /> On-chain verified
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-white">
                  <Flame className="h-4 w-4 text-orange-200" /> Latency &lt; 90s
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-white">
                  <Sparkles className="h-4 w-4 text-indigo-200" /> API & Webhooks
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-3">
              <button className="flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-400 to-indigo-500 px-5 py-3 text-sm font-semibold text-black shadow-[0_15px_45px_rgba(109,243,231,0.35)] transition hover:scale-[1.01]">
                Launch data room
                <ArrowUpRight className="h-4 w-4" />
              </button>
              <span className="text-xs text-white/50">No wallet needed for read-only mode</span>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-5">
          <div className="absolute -left-6 -top-10 h-28 w-28 rounded-full bg-teal-400/20 blur-3xl" />
          <div className="absolute -right-6 bottom-0 h-24 w-24 rounded-full bg-purple-500/25 blur-3xl" />
          <p className="text-sm uppercase tracking-[0.2em] text-white/60">Network Pulse</p>
          <h3 className="mt-2 text-xl font-semibold text-white">Solana • Base • Ethereum</h3>
          <p className="mt-3 text-sm text-white/60">
            Multi-chain listeners stream orderbooks, trades, and liquidation signals into a unified warehouse. Routing
            powered by GoldSky / Substreams.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs text-white/50">Data freshness</p>
              <p className="text-2xl font-semibold text-white">~72s</p>
              <p className="text-xs text-teal-100">Streaming</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs text-white/50">API latency (p95)</p>
              <p className="text-2xl font-semibold text-white">214ms</p>
              <p className="text-xs text-indigo-100">Edge cached</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {networkStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MarketActivity items={marketActivity} />
        </div>
        <TraderFeed items={traderFeed} />
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/50">Market Prices</p>
            <h3 className="text-xl font-semibold text-white">Real-time Polymarket board</h3>
          </div>
          <PillTabs tabs={filters} active={activeFilter} onSelect={setActiveFilter} />
        </div>
        <MarketsTable rows={filteredMarkets} />
      </section>
    </main>
  );
}

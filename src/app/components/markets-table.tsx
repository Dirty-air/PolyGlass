import { ArrowUpRight, ArrowDownRight, Tag } from "lucide-react";
import clsx from "clsx";

type MarketRow = {
  market: string;
  priceYes: number;
  priceNo: number;
  volume: string;
  liquidity: string;
  expiry: string;
  tags: string[];
  change: number;
};

export function MarketsTable({ rows }: { rows: MarketRow[] }) {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/50">Markets</p>
          <h3 className="text-lg font-semibold text-white">Liquidity heatmap</h3>
        </div>
        <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/70">
          Updated <span className="text-white">~15m</span>
        </div>
      </div>

      <div className="divide-y divide-white/5">
        <div className="grid grid-cols-12 gap-4 px-5 py-3 text-[13px] uppercase tracking-wide text-white/50">
          <span className="col-span-4">Market</span>
          <span className="col-span-2">Yes</span>
          <span className="col-span-2">No</span>
          <span>Volume</span>
          <span>Liquidity</span>
          <span>Expiry</span>
        </div>

        {rows.map((row) => {
          const isPositive = row.change >= 0;
          return (
            <div
              key={row.market}
              className="grid grid-cols-12 gap-4 px-5 py-4 transition hover:bg-white/10"
            >
              <div className="col-span-4 flex flex-col gap-2">
                <span className="text-sm font-semibold text-white">{row.market}</span>
                <div className="flex flex-wrap items-center gap-2 text-xs text-white/50">
                  {row.tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-1">
                      <Tag className="h-3.5 w-3.5 text-white/40" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="col-span-2 flex items-center gap-2">
                <div className="h-2.5 flex-1 rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-teal-300 to-indigo-500 shadow-[0_0_20px_rgba(109,243,231,0.35)]"
                    style={{ width: `${row.priceYes * 100}%` }}
                  />
                </div>
                <span className="w-12 text-sm font-semibold text-white">{(row.priceYes * 100).toFixed(0)}%</span>
              </div>

              <div className="col-span-2 flex items-center gap-2">
                <div className="h-2.5 flex-1 rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-rose-300 to-amber-400"
                    style={{ width: `${row.priceNo * 100}%` }}
                  />
                </div>
                <span className="w-12 text-sm font-semibold text-white">{(row.priceNo * 100).toFixed(0)}%</span>
              </div>

              <div className="flex items-center text-sm font-semibold text-white">{row.volume}</div>
              <div className="flex items-center text-sm font-semibold text-white">{row.liquidity}</div>
              <div className="flex items-center justify-between text-sm text-white/70">
                <span>{row.expiry}</span>
                <span
                  className={clsx(
                    "inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold",
                    isPositive
                      ? "bg-emerald-400/20 text-emerald-100"
                      : "bg-rose-400/20 text-rose-100",
                  )}
                >
                  {isPositive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                  {isPositive ? "+" : "-"}
                  {Math.abs(row.change).toFixed(1)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

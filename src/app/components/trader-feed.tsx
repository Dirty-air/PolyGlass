import Link from "next/link";
import { Trophy, TrendingUp, ArrowRight } from "lucide-react";

type FeedItem = {
  trader: string;
  address: string;
  pnl: string;
  market: string;
  timeframe: string;
};

export function TraderFeed({ items }: { items: FeedItem[] }) {
  return (
    <div className="card relative h-full p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-300 drop-shadow-[0_0_10px_rgba(255,204,0,0.5)]" />
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-white/50">Trader Activity</p>
            <h3 className="text-lg font-semibold text-white">Biggest on-chain wins</h3>
          </div>
        </div>
        <Link
          href="/smart-money"
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-white/50 transition hover:bg-white/10 hover:text-teal-300"
        >
          View all
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <Link
            key={item.address}
            href={`/smart-money?trader=${item.address}`}
            className="group flex items-center justify-between rounded-xl border border-white/10 bg-gradient-to-r from-white/10 via-white/5 to-transparent px-3 py-3 transition hover:border-teal-500/30 hover:from-teal-500/10"
          >
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-white group-hover:text-teal-300 transition">{item.trader}</span>
              <span className="text-xs text-white/50">{item.market}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-semibold text-emerald-100">
                {item.timeframe}
              </span>
              <div className="flex items-center gap-1 text-sm font-semibold text-emerald-200">
                <TrendingUp className="h-4 w-4" />
                {item.pnl}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

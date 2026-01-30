import { ArrowRight, Clock3 } from "lucide-react";
import clsx from "clsx";

type Activity = {
  title: string;
  tag: string;
  liquidity: string;
  price: number;
  change: number;
  endsIn: string;
};

export function MarketActivity({ items }: { items: Activity[] }) {
  return (
    <div className="card h-full p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-white/50">Market Activity</p>
          <h3 className="text-lg font-semibold text-white">Trending predictions</h3>
        </div>
        <button className="hidden items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/80 transition hover:bg-white/15 md:flex">
          View all
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-3">
        {items.map((item) => {
          const isPositive = item.change >= 0;
          return (
            <div
              key={item.title}
              className="group rounded-xl border border-white/10 bg-white/5 p-4 transition hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/10"
            >
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-xs text-white/60">
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">
                      {item.tag}
                    </span>
                    <span className="inline-flex items-center gap-1 text-white/50">
                      <Clock3 className="h-3.5 w-3.5" />
                      {item.endsIn} left
                    </span>
                  </div>
                  <p className="text-base font-semibold text-white">{item.title}</p>
                  <p className="text-xs text-white/50">Liquidity {item.liquidity}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-lg font-semibold text-white">{(item.price * 100).toFixed(0)}%</span>
                    <span
                      className={clsx(
                        "inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold",
                        isPositive
                          ? "bg-teal-400/20 text-teal-100"
                          : "bg-rose-400/20 text-rose-100",
                      )}
                    >
                      {isPositive ? "+" : "-"}
                      {Math.abs(item.change).toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-xs text-white/40">Yes price • {item.price.toFixed(2)}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

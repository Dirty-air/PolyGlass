import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import clsx from "clsx";

type StatCardProps = {
  label: string;
  value: string;
  change: number;
  badge?: string;
  hint?: string;
};

export function StatCard({ label, value, change, badge, hint }: StatCardProps) {
  const isPositive = change >= 0;

  return (
    <div className="card relative overflow-hidden p-4 shadow-[0_15px_60px_rgba(0,0,0,0.35)]">
      <div className="absolute inset-0 opacity-60">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-purple-500/10" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>

      <div className="relative flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-[0.2em] text-white/50">{label}</span>
          <span className="text-2xl font-semibold text-white">{value}</span>
        </div>
        <div
          className={clsx(
            "flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold",
            isPositive
              ? "bg-teal-400/15 text-teal-100 ring-1 ring-teal-300/30"
              : "bg-rose-400/15 text-rose-100 ring-1 ring-rose-300/30",
          )}
        >
          {isPositive ? (
            <ArrowUpRight className="h-4 w-4" />
          ) : (
            <ArrowDownRight className="h-4 w-4" />
          )}
          <span>{Math.abs(change).toFixed(1)}%</span>
        </div>
      </div>

      <div className="relative mt-4 flex items-center justify-between text-xs text-white/60">
        <div className="flex items-center gap-2">
          {badge && (
            <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-white/70">
              {badge}
            </span>
          )}
          {hint && <span className="hidden sm:block text-white/40">{hint}</span>}
        </div>
        <div className="h-1.5 w-24 rounded-full bg-gradient-to-r from-teal-300/60 via-indigo-400/70 to-purple-500/60 shadow-[0_0_25px_rgba(109,243,231,0.35)]" />
      </div>
    </div>
  );
}

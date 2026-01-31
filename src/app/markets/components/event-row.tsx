"use client";

import { Fragment, useMemo } from "react";
import { Plus, Minus, ExternalLink } from "lucide-react";
import type { Market, Event } from "@/types/market";
import { OutcomeRow } from "./outcome-row";
import { VolumeBar } from "./volume-bar";

/** 分组后的 Event 数据 */
export interface EventGroup {
  event: Event;
  markets: Market[];
  totalVolume: number;
  totalOpenInterest: number;
  image?: string;
}

interface EventRowProps {
  group: EventGroup;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  scaleVolume: number;
  scaleOpenInterest: number;
}

/** 格式化金额 */
function formatMoney(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

/** 格式化日期 */
function formatDate(dateStr?: string): string {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
}

export function EventRow({ group, index, isExpanded, onToggle, scaleVolume, scaleOpenInterest }: EventRowProps) {
  const hasMarkets = group.markets.length > 0;
  const marketCount = group.markets.length;

  // 计算 outcome 级别的 max，用于子行 bar 缩放
  const outcomeMaxVolume = useMemo(() => {
    const volumes = group.markets.map(m => m.volume).filter(v => v > 0);
    return volumes.length > 0 ? Math.max(...volumes) : 1;
  }, [group.markets]);

  const outcomeMaxOI = outcomeMaxVolume * 0.6;

  // 动画延迟，最多延迟 1 秒（前 20 行有明显效果）
  const animationDelay = Math.min(index * 0.03, 1);

  return (
    <Fragment>
      {/* Event 父行 */}
      <tr
        className="group transition hover:bg-white/5 animate-fade-in-up"
        style={{ animationDelay: `${animationDelay}s` }}
      >
        <td className="px-3 py-3">
          {hasMarkets && (
            <button
              onClick={onToggle}
              className="flex h-5 w-5 items-center justify-center rounded text-white/50 hover:bg-white/10 hover:text-white"
            >
              {isExpanded ? <Minus className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
            </button>
          )}
        </td>
        <td className="px-3 py-3">
          <div className="flex items-center gap-3">
            {group.image && (
              <img src={group.image} alt="" className="h-8 w-8 rounded-full object-cover" />
            )}
            <a
              href={`https://polymarket.com/event/${group.event.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group/link flex items-center gap-1.5 max-w-[300px] text-white hover:text-blue-400 transition"
            >
              <span className="truncate">{group.event.title}</span>
              <ExternalLink className="h-3 w-3 opacity-0 group-hover/link:opacity-100 transition flex-shrink-0" />
            </a>
            {hasMarkets && (
              <span className="text-xs text-white/40">({marketCount})</span>
            )}
          </div>
        </td>
        <td className="px-3 py-3 text-white/40">—</td>
        <td className="px-3 py-3">
          <span className="rounded bg-purple-500/20 px-2 py-0.5 text-xs text-purple-300">
            Polymarket
          </span>
        </td>
        <td className="px-3 py-3 text-right">
          <div className="flex flex-col items-end gap-1">
            <span className="font-medium text-white">{formatMoney(group.totalVolume)}</span>
            <div className="w-32">
              <VolumeBar value={group.totalVolume} denom={scaleVolume} />
            </div>
          </div>
        </td>
        <td className="px-3 py-3 text-right">
          <div className="flex flex-col items-end gap-1">
            <span className="font-medium text-white">{formatMoney(group.totalOpenInterest)}</span>
            <div className="w-32">
              <VolumeBar value={group.totalOpenInterest} denom={scaleOpenInterest} />
            </div>
          </div>
        </td>
        <td className="px-3 py-3 text-white/70">{formatDate(group.event.endDate)}</td>
        <td className="px-3 py-3">
          <span className="rounded bg-white/10 px-2 py-0.5 text-xs text-white/70">
            {group.markets[0]?.tags?.[0] || "General"}
          </span>
        </td>
        <td className="px-3 py-3"></td>
      </tr>

      {/* 展开后的 Outcome 子行 */}
      {isExpanded && group.markets.map((market) => (
        <OutcomeRow
          key={market.marketId}
          market={market}
          eventSlug={group.event.slug}
          outcomeMaxVolume={outcomeMaxVolume}
          outcomeMaxOI={outcomeMaxOI}
        />
      ))}
    </Fragment>
  );
}

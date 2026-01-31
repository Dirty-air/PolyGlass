"use client";

import { useState, Fragment } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import type { Market } from "@/types/market";
import type { BetTypeGroup } from "@/lib/bet-type";
import { OutcomeRow } from "./outcome-row";

interface BetTypeGroupRowProps {
  group: BetTypeGroup;
  eventSlug: string;
  outcomeMaxVolume: number;
  outcomeMaxOI: number;
  defaultExpanded?: boolean;
}

/**
 * 盘口类型分组行
 * 用于体育类市场的盘口聚合展示
 */
export function BetTypeGroupRow({
  group,
  eventSlug,
  outcomeMaxVolume,
  outcomeMaxOI,
  defaultExpanded = false,
}: BetTypeGroupRowProps) {
  // Moneyline 默认展开，其他类型默认折叠
  const [isExpanded, setIsExpanded] = useState(
    defaultExpanded || group.type === "moneyline"
  );

  const marketCount = group.markets.length;

  // 如果只有一个市场，直接显示 OutcomeRow，不显示分组标题
  if (marketCount === 1) {
    return (
      <OutcomeRow
        market={group.markets[0]}
        eventSlug={eventSlug}
        outcomeMaxVolume={outcomeMaxVolume}
        outcomeMaxOI={outcomeMaxOI}
      />
    );
  }

  return (
    <Fragment>
      {/* 分组标题行 */}
      <tr
        className="bg-white/[0.02] text-xs cursor-pointer transition hover:bg-white/[0.04]"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <td className="pl-8 py-2">
          <button className="flex h-4 w-4 items-center justify-center text-white/40 hover:text-white">
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </button>
        </td>
        <td className="px-3 py-2" colSpan={8}>
          <div className="flex items-center gap-2">
            <span className="text-white/60 font-medium">{group.label}</span>
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/50">
              {marketCount}
            </span>
          </div>
        </td>
      </tr>

      {/* 展开后的子市场 */}
      {isExpanded &&
        group.markets.map((market) => (
          <OutcomeRow
            key={market.marketId}
            market={market}
            eventSlug={eventSlug}
            outcomeMaxVolume={outcomeMaxVolume}
            outcomeMaxOI={outcomeMaxOI}
          />
        ))}
    </Fragment>
  );
}

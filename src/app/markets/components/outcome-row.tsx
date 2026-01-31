"use client";

import type { Market } from "@/types/market";
import { VolumeBar } from "./volume-bar";

interface OutcomeRowProps {
  market: Market;
  maxVolume: number;
  maxOpenInterest: number;
}

/** 格式化金额 */
function formatMoney(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
}

/** 计算 No/Yes ratio */
function calcRatio(priceYes: number): string {
  if (priceYes === 0) return "∞";
  const priceNo = 1 - priceYes;
  const ratio = priceNo / priceYes;
  if (ratio >= 100) return ratio.toFixed(0);
  if (ratio >= 10) return ratio.toFixed(1);
  return ratio.toFixed(2);
}

export function OutcomeRow({ market, maxVolume, maxOpenInterest }: OutcomeRowProps) {
  const openInterest = market.volume * 0.6;
  const isActive = !market.endDate || new Date(market.endDate) > new Date();

  return (
    <tr className="bg-white/[0.02] transition hover:bg-white/[0.04]">
      {/* 缩进列 + 图片 + 名称 */}
      <td className="pl-10 pr-3 py-2">
        <div className="flex items-center gap-3">
          {market.image && (
            <img
              src={market.image}
              alt=""
              className="h-6 w-6 rounded-full object-cover"
            />
          )}
          <span className="text-white/90 text-sm truncate max-w-[200px]">
            {market.title}
          </span>
          {isActive && (
            <span className="rounded bg-green-500/20 px-1.5 py-0.5 text-xs text-green-400">
              Active
            </span>
          )}
        </div>
      </td>

      {/* No / Yes 价格 */}
      <td className="px-3 py-2">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <span className="text-white/50">No</span>
            <span className="text-white/70">${(1 - market.priceYes).toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-white/50">Yes</span>
            <span className="font-medium text-green-400">${market.priceYes.toFixed(2)}</span>
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block ml-1"></span>
          </div>
        </div>
      </td>

      {/* Source */}
      <td className="px-3 py-2">
        <span className="rounded bg-purple-500/20 px-2 py-0.5 text-xs text-purple-300">
          Polymarket
        </span>
      </td>

      {/* Volume */}
      <td className="px-3 py-2 text-right">
        <div className="flex flex-col items-end gap-1">
          <span className="text-sm text-white/70">{formatMoney(market.volume)}</span>
          <div className="w-24">
            <VolumeBar value={market.volume} denom={maxVolume} />
          </div>
        </div>
      </td>

      {/* Open Interest */}
      <td className="px-3 py-2 text-right">
        <div className="flex flex-col items-end gap-1">
          <span className="text-sm text-white/70">{formatMoney(openInterest)}</span>
          <div className="w-24">
            <VolumeBar value={openInterest} denom={maxOpenInterest} />
          </div>
        </div>
      </td>

      {/* 占位列 */}
      <td className="px-3 py-2"></td>
      <td className="px-3 py-2"></td>
      <td className="px-3 py-2"></td>
    </tr>
  );
}

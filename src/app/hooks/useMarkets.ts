"use client";

import { useQuery } from "@tanstack/react-query";
import type { Market, Event, MarketEvent } from "@/types/market";

/** API 响应结构 */
interface MarketsResponse {
  data: Market[];
  events: Event[];
  marketEvents: MarketEvent[];
  tokenMap: Record<string, { marketId: string; outcome: "YES" | "NO" }>;
}

/** 从 API 获取市场数据 */
async function fetchMarkets(): Promise<MarketsResponse> {
  const res = await fetch("/api/markets");
  if (!res.ok) throw new Error(`Failed to fetch markets: ${res.status}`);
  return res.json();
}

/**
 * 市场数据 Hook（基于 React Query）
 *
 * 优化点：
 * - 5 分钟 staleTime：避免频繁请求
 * - 自动缓存：跨页面导航时复用数据
 * - 请求去重：多个组件同时调用时只发一次请求
 */
export function useMarkets() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["markets"],
    queryFn: fetchMarkets,
  });

  // Ensure data exists and is an array
  const markets = data?.data && Array.isArray(data.data) ? data.data : null;

  return {
    markets,
    events: data?.events ?? null,
    marketEvents: data?.marketEvents ?? null,
    loading: isLoading,
    error: error ? (error as Error).message : null,
  };
}

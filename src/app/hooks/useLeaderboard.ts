"use client";

import { useQuery } from "@tanstack/react-query";

interface LeaderboardEntry {
  address: string;
  totalPnl: number;
  realizedPnl: number;
  roi: number;
  winRate: number;
  tradeCount: number;
  marketCount: number;
  tags: string[];
}

interface TraderFeedItem {
  trader: string;
  address: string;
  pnl: string;
  market: string;
  timeframe: string;
}

function formatUsd(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

function shortenAddress(addr: string): string {
  return `${addr.slice(0, 5)}...${addr.slice(-4)}`;
}

/** 从 API 获取排行榜数据 */
async function fetchLeaderboard(limit: number): Promise<TraderFeedItem[]> {
  const res = await fetch(`/api/leaderboard?limit=${limit}`);
  if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
  const json = await res.json();
  const entries: LeaderboardEntry[] = json.data;
  return entries.map((e) => ({
    trader: shortenAddress(e.address),
    address: e.address,
    pnl: formatUsd(e.realizedPnl),
    market: `${e.marketCount} markets`,
    timeframe: `${e.winRate}% win`,
  }));
}

/**
 * 排行榜 Hook（基于 React Query）
 *
 * 优化点：
 * - 2 分钟 staleTime：避免频繁请求
 * - 请求去重：多个组件同时调用时只发一次请求
 */
export function useLeaderboard(limit = 5) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["leaderboard", limit],
    queryFn: () => fetchLeaderboard(limit),
    staleTime: 2 * 60 * 1000, // 2 分钟内不重新请求
    gcTime: 10 * 60 * 1000,   // 缓存保留 10 分钟
  });

  return {
    data: data ?? null,
    loading: isLoading,
    error: error ? (error as Error).message : null,
  };
}

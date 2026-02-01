"use client";

import { useQuery } from "@tanstack/react-query";
import type { ScoredTrader } from "@/types/fills";

/** 兼容旧版接口的类型定义 */
export interface SmartMoneyEntry {
  address: string;
  totalPnl: number;
  realizedPnl: number;
  roi: number;
  winRate: number;
  tradeCount: number;
  marketCount: number;
  tags: string[];
  labels: string[];
  score?: number;
  // Retail 相关字段
  hasDeposit?: boolean;
  netDepositUSDC?: number;
  originType?: "EOA" | "CONTRACT" | "PROXY";
  isRelayer?: boolean;
}

type SortField = "score" | "roi" | "winRate" | "volume" | "realizedPnL";
type ViewMode = "all" | "retail";

interface UseSmartMoneyOptions {
  sortBy?: SortField | string;
  order?: "asc" | "desc";
  limit?: number;
  view?: ViewMode;
}

/** API 响应类型（带 labels） */
interface SmartMoneyApiResponse extends ScoredTrader {
  labels: string[];
}

/**
 * 将新 API 响应转换为兼容旧版的格式
 */
function toSmartMoneyEntry(trader: SmartMoneyApiResponse): SmartMoneyEntry {
  return {
    address: trader.address,
    totalPnl: trader.realizedPnL,
    realizedPnl: trader.realizedPnL,
    roi: trader.roi,
    winRate: trader.winRate,
    tradeCount: trader.tradesCount,
    marketCount: trader.marketsCount,
    tags: trader.tags,
    labels: trader.labels || [],
    score: trader.score,
    hasDeposit: trader.hasDeposit,
    netDepositUSDC: trader.netDepositUSDC,
    originType: trader.originType,
    isRelayer: trader.isRelayer,
  };
}

/** 从 API 获取 Smart Money 数据 */
async function fetchSmartMoney(
  sortBy: string,
  limit: number,
  view: ViewMode
): Promise<SmartMoneyEntry[]> {
  const params = new URLSearchParams({
    sort: sortBy,
    limit: String(limit),
    view: view,
  });

  const res = await fetch(`/api/smart-money?${params}`);
  if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
  const json = await res.json();
  if (json.error) throw new Error(json.error);
  return (json.data as SmartMoneyApiResponse[]).map(toSmartMoneyEntry);
}

/**
 * 获取 Smart Money 排行榜 Hook（基于 React Query）
 *
 * 优化点：
 * - 2 分钟 staleTime：避免频繁请求
 * - 请求去重：多个组件同时调用时只发一次请求
 * - 自动缓存：跨页面导航时复用数据
 */
export function useSmartMoney(options: UseSmartMoneyOptions = {}) {
  const { sortBy = "score", limit = 100, view = "retail" } = options;

  const { data, isLoading, error } = useQuery({
    queryKey: ["smart-money", sortBy, limit, view],
    queryFn: () => fetchSmartMoney(sortBy, limit, view),
    staleTime: 2 * 60 * 1000, // 2 分钟内不重新请求
    gcTime: 10 * 60 * 1000,   // 缓存保留 10 分钟
  });

  return {
    data: data ?? null,
    loading: isLoading,
    error: error ? (error as Error).message : null,
  };
}

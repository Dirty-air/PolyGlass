/**
 * GET /api/smart-money
 * Smart Money 排行榜 API
 *
 * 查询参数：
 * - view: all | retail (默认 retail)
 * - sort: score | roi | winRate | volume | realizedPnL (默认 score)
 * - order: asc | desc (默认 desc)
 * - limit: number (默认 50)
 */
import { NextResponse } from "next/server";
import { getSmartTraders } from "@/db/analytics";
import { getTagsForAddresses } from "@/db/tags";
import type { ScoredTrader } from "@/types/fills";

/** 前端排序字段到数据库字段的映射 */
const SORT_FIELD_MAP: Record<string, string> = {
  score: "score",
  roi: "roi",
  winRate: "win_rate",
  volume: "volume_usdc",
  realizedPnL: "realized_pnl",
};

/** 生成 labels（用于前端显示） */
function generateLabels(trader: ScoredTrader): string[] {
  const labels: string[] = [];
  if (trader.hasDeposit) labels.push("depositor");
  if (trader.volumeUSDC > 10000) labels.push("whale");
  if (trader.roi > 50) labels.push("high-roi");
  if (trader.winRate > 60) labels.push("consistent");
  return labels;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sort = searchParams.get("sort") || "score";
    const limit = Math.min(Number(searchParams.get("limit")) || 50, 200);
    const view = (searchParams.get("view") || "retail") as "all" | "retail";

    // 映射排序字段
    const dbSortField = SORT_FIELD_MAP[sort] || "score";

    // 查询数据库（带 view 过滤）
    const traders = await getSmartTraders(limit, dbSortField, view);

    // 批量获取用户自定义标签
    const addresses = traders.map((t) => t.address);
    const userTagsMap = await getTagsForAddresses(addresses);

    // 合并标签，增加 retail 相关字段
    const data = traders.map((t) => ({
      ...t,
      tags: [
        ...t.tags,
        ...(userTagsMap[t.address.toLowerCase()] || []),
      ],
      labels: generateLabels(t),
    }));

    return NextResponse.json({
      data,
      total: data.length,
      view,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

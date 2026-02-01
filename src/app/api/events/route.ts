/**
 * API: GET /api/events
 * 获取事件列表（含统计）
 *
 * 查询参数：
 * - smart_money: "true" | "false" (默认 false) - 是否包含 Smart Money 统计
 */
import { NextResponse } from "next/server";
import { getEventsWithStats, getEventsWithSmartMoneyStats } from "@/db";

/** 为响应添加缓存头 */
function withCacheHeaders(response: NextResponse): NextResponse {
  response.headers.set(
    "Cache-Control",
    "public, s-maxage=120, stale-while-revalidate=600"
  );
  return response;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const includeSmartMoney = searchParams.get("smart_money") === "true";

  // 如果需要 Smart Money 统计，使用新函数
  if (includeSmartMoney) {
    const events = await getEventsWithSmartMoneyStats();
    return withCacheHeaders(NextResponse.json({ data: events }));
  }

  // 默认返回普通统计
  const events = await getEventsWithStats();
  return withCacheHeaders(NextResponse.json({ data: events }));
}

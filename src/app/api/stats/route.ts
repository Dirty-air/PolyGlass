/**
 * Stats API - 返回仪表盘统计数据
 */
import { NextResponse } from "next/server";
import { getClient } from "@/db/init";

interface Stats {
  totalTrades: number;
  totalVolume: number;
  activeTraders: number;
  activeMarkets: number;
}

export async function GET() {
  const client = getClient();

  const tradeStatsResult = await client.execute(`
    SELECT
      COUNT(*) as total_trades,
      SUM(CAST(maker_amount AS REAL) / 1e6) as total_volume
    FROM trades
  `);
  const tradeStats = tradeStatsResult.rows[0] as unknown as {
    total_trades: number;
    total_volume: number;
  };

  const traderCountResult = await client.execute(`
    SELECT COUNT(DISTINCT address) as count FROM (
      SELECT maker as address FROM trades
      UNION
      SELECT taker as address FROM trades
    )
  `);
  const traderCount = traderCountResult.rows[0] as unknown as { count: number };

  const marketCountResult = await client.execute(
    "SELECT COUNT(DISTINCT market_id) as count FROM trades WHERE market_id IS NOT NULL"
  );
  const marketCount = marketCountResult.rows[0] as unknown as { count: number };

  const stats: Stats = {
    totalTrades: tradeStats.total_trades,
    totalVolume: tradeStats.total_volume || 0,
    activeTraders: traderCount.count,
    activeMarkets: marketCount.count,
  };

  const response = NextResponse.json({ data: stats });
  response.headers.set(
    "Cache-Control",
    "public, s-maxage=120, stale-while-revalidate=600"
  );
  return response;
}

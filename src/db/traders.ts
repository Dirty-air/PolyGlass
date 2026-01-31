/**
 * 模块E：Traders 统计查询（Turso 异步 API）
 * 支持 agent（maker/taker）和 origin（EOA）两种视图
 */
import { getDb } from "./init";
import { getTagsForAddresses } from "./tags";

export type TraderView = "origin" | "agent";

export interface TraderStatsRow {
  address: string;
  trade_count: number;
  market_count: number;
  volume_usdc: number;
  tags: string[];
}

/** 按 originFrom 聚合（默认） */
const ORIGIN_SQL = `
  SELECT
    COALESCE(origin_from, maker) as address,
    COUNT(*) as trade_count,
    COUNT(DISTINCT market_id) as market_count,
    COALESCE(SUM(
      CASE direction
        WHEN 'BUY' THEN CAST(taker_amount AS REAL) / 1e6
        WHEN 'SELL' THEN CAST(maker_amount AS REAL) / 1e6
        ELSE 0
      END
    ), 0) as volume_usdc
  FROM trades
  WHERE market_id IS NOT NULL
  GROUP BY COALESCE(origin_from, maker)
  ORDER BY trade_count DESC
  LIMIT ?
`;

/** 按 maker/taker 聚合（传统视图） */
const AGENT_SQL = `
  SELECT
    address,
    COUNT(*) as trade_count,
    COUNT(DISTINCT market_id) as market_count,
    COALESCE(SUM(volume), 0) as volume_usdc
  FROM (
    SELECT maker as address, market_id,
      CASE direction WHEN 'BUY' THEN 0 WHEN 'SELL' THEN CAST(maker_amount AS REAL) / 1e6 ELSE 0 END as volume
    FROM trades WHERE market_id IS NOT NULL
    UNION ALL
    SELECT taker as address, market_id,
      CASE direction WHEN 'BUY' THEN CAST(taker_amount AS REAL) / 1e6 WHEN 'SELL' THEN 0 ELSE 0 END as volume
    FROM trades WHERE market_id IS NOT NULL
  )
  GROUP BY address
  ORDER BY trade_count DESC
  LIMIT ?
`;

/**
 * 获取交易者排行（含标签）
 * @param view "origin" 按 originFrom 聚合（默认），"agent" 按 maker/taker 聚合
 */
export async function getTraderStats(
  limit = 100,
  view: TraderView = "origin"
): Promise<TraderStatsRow[]> {
  const client = getDb();
  const sql = view === "origin" ? ORIGIN_SQL : AGENT_SQL;
  const result = await client.execute({ sql, args: [limit] });

  const rows = result.rows as unknown as Array<{
    address: string;
    trade_count: number;
    market_count: number;
    volume_usdc: number;
  }>;

  // 批量获取标签
  const addresses = rows.map((r) => r.address);
  const tagsMap = await getTagsForAddresses(addresses);

  return rows.map((r) => ({
    ...r,
    tags: tagsMap[r.address.toLowerCase()] || [],
  }));
}

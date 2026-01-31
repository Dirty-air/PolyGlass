/**
 * 模块E：Markets 数据操作（Turso 异步 API）
 */
import { getDb } from "./init";
import type { Market } from "@/types/market";

/** 数据库存储的市场基础信息 */
export interface StoredMarket {
  marketId: string;
  title: string;
  conditionId: string;
  tokenYes: string;
  tokenNo: string;
}

const INSERT_SQL = `
  INSERT OR REPLACE INTO markets
  (id, title, condition_id, token_yes, token_no)
  VALUES (?, ?, ?, ?, ?)
`;

/**
 * 批量保存市场
 */
export async function saveMarkets(markets: Market[]): Promise<number> {
  if (markets.length === 0) return 0;
  const client = getDb();
  const statements = markets.map((m) => ({
    sql: INSERT_SQL,
    args: [m.marketId, m.title, m.conditionId, m.tokenYes, m.tokenNo],
  }));
  await client.batch(statements, "write");
  return markets.length;
}

/**
 * 获取所有市场
 */
export async function getMarkets(): Promise<StoredMarket[]> {
  const client = getDb();
  const result = await client.execute("SELECT * FROM markets");
  return result.rows.map((r) => {
    const row = r as unknown as {
      id: string; title: string; condition_id: string;
      token_yes: string; token_no: string;
    };
    return {
      marketId: row.id,
      title: row.title,
      conditionId: row.condition_id,
      tokenYes: row.token_yes,
      tokenNo: row.token_no,
    };
  });
}

/** 市场统计信息 */
interface MarketStats {
  id: string;
  title: string;
  trade_count: number;
  volume: number;
}

/**
 * 获取带统计的市场列表
 */
export async function getMarketsWithStats(): Promise<MarketStats[]> {
  const client = getDb();
  const result = await client.execute(`
    SELECT
      m.id, m.title,
      COUNT(t.id) as trade_count,
      COALESCE(SUM(CAST(t.taker_amount AS REAL) / 1e6), 0) as volume
    FROM markets m
    LEFT JOIN trades t ON m.id = t.market_id
    GROUP BY m.id
    ORDER BY trade_count DESC
  `);
  return result.rows as unknown as MarketStats[];
}

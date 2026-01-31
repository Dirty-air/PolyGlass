/**
 * 模块：Events 数据操作（Turso 异步 API）
 */
import { getDb } from "./init";
import type { Event, MarketEvent } from "@/types/market";

const INSERT_EVENT_SQL = `
  INSERT OR REPLACE INTO events
  (id, title, slug, description, category, end_date, active)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`;

const INSERT_MARKET_EVENT_SQL = `
  INSERT OR IGNORE INTO market_events (market_id, event_id)
  VALUES (?, ?)
`;

/**
 * 批量保存事件
 */
export async function saveEvents(events: Event[]): Promise<number> {
  if (events.length === 0) return 0;
  const client = getDb();
  const statements = events.map((e) => ({
    sql: INSERT_EVENT_SQL,
    args: [
      e.id, e.title, e.slug || null, e.description || null,
      e.category || null, e.endDate || null, e.active ? 1 : 0,
    ],
  }));
  await client.batch(statements, "write");
  return events.length;
}

/**
 * 批量保存市场-事件关联
 */
export async function saveMarketEvents(relations: MarketEvent[]): Promise<number> {
  if (relations.length === 0) return 0;
  const client = getDb();
  const statements = relations.map((r) => ({
    sql: INSERT_MARKET_EVENT_SQL,
    args: [r.marketId, r.eventId],
  }));
  await client.batch(statements, "write");
  return relations.length;
}

/** 事件统计信息 */
interface EventStats {
  id: string;
  title: string;
  slug: string;
  category: string;
  end_date: string;
  active: number;
  market_count: number;
  total_volume: number;
}

/**
 * 获取事件列表（含统计）
 */
export async function getEventsWithStats(): Promise<EventStats[]> {
  const client = getDb();
  const result = await client.execute(`
    SELECT
      e.id, e.title, e.slug, e.category, e.end_date, e.active,
      COUNT(DISTINCT me.market_id) as market_count,
      COALESCE(SUM(t.volume), 0) as total_volume
    FROM events e
    LEFT JOIN market_events me ON e.id = me.event_id
    LEFT JOIN (
      SELECT market_id, SUM(CAST(taker_amount AS REAL) / 1e6) as volume
      FROM trades GROUP BY market_id
    ) t ON me.market_id = t.market_id
    GROUP BY e.id
    ORDER BY total_volume DESC
  `);
  return result.rows as unknown as EventStats[];
}

/**
 * 获取事件详情
 */
export async function getEventById(eventId: string): Promise<EventStats | undefined> {
  const client = getDb();
  const result = await client.execute({
    sql: `
      SELECT
        e.id, e.title, e.slug, e.category, e.end_date, e.active,
        COUNT(DISTINCT me.market_id) as market_count,
        COALESCE(SUM(t.volume), 0) as total_volume
      FROM events e
      LEFT JOIN market_events me ON e.id = me.event_id
      LEFT JOIN (
        SELECT market_id, SUM(CAST(taker_amount AS REAL) / 1e6) as volume
        FROM trades GROUP BY market_id
      ) t ON me.market_id = t.market_id
      WHERE e.id = ?
      GROUP BY e.id
    `,
    args: [eventId],
  });
  return result.rows.length > 0
    ? (result.rows[0] as unknown as EventStats)
    : undefined;
}

/** 事件下的市场信息 */
interface EventMarket {
  id: string;
  title: string;
  trade_count: number;
  volume: number;
}

/**
 * 获取事件下的所有市场
 */
export async function getMarketsByEventId(eventId: string): Promise<EventMarket[]> {
  const client = getDb();
  const result = await client.execute({
    sql: `
      SELECT
        m.id, m.title,
        COUNT(t.id) as trade_count,
        COALESCE(SUM(CAST(t.taker_amount AS REAL) / 1e6), 0) as volume
      FROM markets m
      INNER JOIN market_events me ON m.id = me.market_id
      LEFT JOIN trades t ON m.id = t.market_id
      WHERE me.event_id = ?
      GROUP BY m.id
      ORDER BY volume DESC
    `,
    args: [eventId],
  });
  return result.rows as unknown as EventMarket[];
}

/**
 * 获取所有市场-事件关联
 */
export async function getAllMarketEvents(): Promise<MarketEvent[]> {
  const client = getDb();
  const result = await client.execute("SELECT market_id, event_id FROM market_events");
  return result.rows.map((r) => {
    const row = r as unknown as { market_id: string; event_id: string };
    return { marketId: row.market_id, eventId: row.event_id };
  });
}

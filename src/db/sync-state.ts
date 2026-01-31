/**
 * 同步状态管理模块
 * sync_state 表 CRUD + 表结构迁移
 */
import { getDb } from "./init";

/** 检查表是否有指定列 */
async function hasColumn(tableName: string, columnName: string): Promise<boolean> {
  const db = getDb();
  const result = await db.execute(`PRAGMA table_info(${tableName})`);
  return result.rows.some((row) => (row as Record<string, unknown>).name === columnName);
}

/** 确保同步相关表存在（幂等，自动迁移） */
export async function ensureSyncTables(): Promise<void> {
  const db = getDb();

  // 1. 创建 sync_state 表
  await db.execute(`
    CREATE TABLE IF NOT EXISTS sync_state (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);

  // 2. 检查 markets 表是否需要升级
  const hasLiquidity = await hasColumn("markets", "liquidity");

  if (!hasLiquidity) {
    // 旧表结构，需要重建
    await db.batch(
      [
        { sql: "DROP TABLE IF EXISTS markets", args: [] },
        {
          sql: `CREATE TABLE markets (
                  id           TEXT PRIMARY KEY,
                  title        TEXT NOT NULL,
                  slug         TEXT NOT NULL DEFAULT '',
                  condition_id TEXT NOT NULL,
                  token_yes    TEXT NOT NULL,
                  token_no     TEXT NOT NULL,
                  price_yes    REAL NOT NULL DEFAULT 0.5,
                  price_no     REAL NOT NULL DEFAULT 0.5,
                  volume       REAL NOT NULL DEFAULT 0,
                  liquidity    REAL NOT NULL DEFAULT 0,
                  tags         TEXT NOT NULL DEFAULT '[]',
                  end_date     TEXT,
                  image        TEXT,
                  outcomes     TEXT NOT NULL DEFAULT '["No","Yes"]',
                  active       INTEGER NOT NULL DEFAULT 1,
                  updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
                )`,
          args: [],
        },
      ],
      "write",
    );
  }
}

/** 读取同步游标值 */
export async function getSyncValue(key: string): Promise<string | null> {
  const db = getDb();
  const result = await db.execute({
    sql: "SELECT value FROM sync_state WHERE key = ?",
    args: [key],
  });
  if (result.rows.length === 0) return null;
  return (result.rows[0] as unknown as { value: string }).value;
}

/** 写入同步游标值 */
export async function setSyncValue(key: string, value: string): Promise<void> {
  const db = getDb();
  await db.execute({
    sql: "INSERT OR REPLACE INTO sync_state (key, value) VALUES (?, ?)",
    args: [key, value],
  });
}

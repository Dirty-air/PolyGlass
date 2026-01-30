/**
 * Migration: 为 trades 表添加 origin_from 列
 * 运行: npx tsx scripts/migrate-origin-from.ts
 */
import Database from "better-sqlite3";
import { join } from "path";

const DB_PATH = join(process.cwd(), "data", "app.db");

function migrate() {
  const db = new Database(DB_PATH);

  // 检查列是否已存在
  const columns = db.prepare("PRAGMA table_info(trades)").all() as Array<{ name: string }>;
  const hasOriginFrom = columns.some((c) => c.name === "origin_from");

  if (hasOriginFrom) {
    console.log("Column origin_from already exists, skipping.");
    db.close();
    return;
  }

  // 添加列
  console.log("Adding origin_from column to trades table...");
  db.exec("ALTER TABLE trades ADD COLUMN origin_from TEXT");

  // 添加索引
  console.log("Creating index on origin_from...");
  db.exec("CREATE INDEX IF NOT EXISTS idx_trades_origin ON trades(origin_from)");

  console.log("Migration complete.");
  db.close();
}

migrate();

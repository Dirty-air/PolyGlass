/**
 * 数据迁移脚本：从本地 SQLite 迁移到 Turso
 */
import Database from "better-sqlite3";
import { createClient } from "@libsql/client";
import { join } from "path";

const LOCAL_DB_PATH = join(process.cwd(), "data", "app.db");

// Turso 连接信息
const TURSO_URL = process.env.TURSO_DATABASE_URL!;
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN;

async function migrate() {
  console.log("开始迁移数据到 Turso...");

  // 连接本地数据库
  const localDb = new Database(LOCAL_DB_PATH, { readonly: true });
  console.log("✓ 已连接本地数据库");

  // 连接 Turso
  const turso = createClient({
    url: TURSO_URL,
    authToken: TURSO_TOKEN,
  });
  console.log("✓ 已连接 Turso");

  // 1. 创建表结构
  console.log("\n[1/7] 创建表结构...");
  await turso.executeMultiple(`
    CREATE TABLE IF NOT EXISTS markets (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      condition_id TEXT NOT NULL,
      token_yes TEXT NOT NULL,
      token_no TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS trades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tx_hash TEXT NOT NULL,
      log_index INTEGER NOT NULL,
      block_number INTEGER NOT NULL,
      maker TEXT NOT NULL,
      taker TEXT NOT NULL,
      maker_asset_id TEXT NOT NULL,
      taker_asset_id TEXT NOT NULL,
      maker_amount TEXT NOT NULL,
      taker_amount TEXT NOT NULL,
      fee TEXT NOT NULL,
      token_id TEXT,
      market_id TEXT,
      outcome TEXT,
      direction TEXT NOT NULL,
      price REAL,
      origin_from TEXT,
      UNIQUE(tx_hash, log_index)
    );

    CREATE TABLE IF NOT EXISTS address_tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      address TEXT NOT NULL,
      tag TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(address, tag)
    );

    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT,
      description TEXT,
      category TEXT,
      end_date TEXT,
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS market_events (
      market_id TEXT NOT NULL,
      event_id TEXT NOT NULL,
      PRIMARY KEY (market_id, event_id)
    );

    CREATE TABLE IF NOT EXISTS fills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      address TEXT NOT NULL,
      market_id TEXT NOT NULL,
      outcome_side TEXT NOT NULL,
      shares_delta REAL NOT NULL,
      cash_delta_usdc REAL NOT NULL,
      price REAL NOT NULL,
      timestamp INTEGER NOT NULL,
      tx_hash TEXT NOT NULL,
      log_index INTEGER NOT NULL,
      role TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(tx_hash, log_index, role)
    );

    CREATE TABLE IF NOT EXISTS trader_stats (
      address TEXT PRIMARY KEY,
      trades_count INTEGER NOT NULL DEFAULT 0,
      markets_count INTEGER NOT NULL DEFAULT 0,
      volume_usdc REAL NOT NULL DEFAULT 0,
      realized_pnl REAL NOT NULL DEFAULT 0,
      total_buy_cost REAL NOT NULL DEFAULT 0,
      roi REAL NOT NULL DEFAULT 0,
      closed_markets_count INTEGER NOT NULL DEFAULT 0,
      win_markets_count INTEGER NOT NULL DEFAULT 0,
      win_rate REAL NOT NULL DEFAULT 0,
      score REAL DEFAULT NULL,
      tags TEXT DEFAULT NULL,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS signals (
      id TEXT PRIMARY KEY,
      address TEXT NOT NULL,
      market_id TEXT NOT NULL,
      outcome_side TEXT NOT NULL,
      net_usdc REAL NOT NULL,
      timestamp INTEGER NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log("✓ 表结构创建完成");

  // 2. 迁移 markets
  console.log("\n[2/7] 迁移 markets...");
  const markets = localDb.prepare("SELECT * FROM markets").all() as any[];
  if (markets.length > 0) {
    const marketStmts = markets.map((m) => ({
      sql: "INSERT OR REPLACE INTO markets (id, title, condition_id, token_yes, token_no) VALUES (?, ?, ?, ?, ?)",
      args: [m.id, m.title, m.condition_id, m.token_yes, m.token_no],
    }));
    await turso.batch(marketStmts, "write");
  }
  console.log(`✓ 迁移了 ${markets.length} 条 markets`);

  // 3. 迁移 events
  console.log("\n[3/7] 迁移 events...");
  const events = localDb.prepare("SELECT * FROM events").all() as any[];
  if (events.length > 0) {
    const eventStmts = events.map((e) => ({
      sql: "INSERT OR REPLACE INTO events (id, title, slug, description, category, end_date, active) VALUES (?, ?, ?, ?, ?, ?, ?)",
      args: [e.id, e.title, e.slug, e.description, e.category, e.end_date, e.active],
    }));
    await turso.batch(eventStmts, "write");
  }
  console.log(`✓ 迁移了 ${events.length} 条 events`);

  // 4. 迁移 market_events
  console.log("\n[4/7] 迁移 market_events...");
  const marketEvents = localDb.prepare("SELECT * FROM market_events").all() as any[];
  if (marketEvents.length > 0) {
    const meStmts = marketEvents.map((me) => ({
      sql: "INSERT OR IGNORE INTO market_events (market_id, event_id) VALUES (?, ?)",
      args: [me.market_id, me.event_id],
    }));
    await turso.batch(meStmts, "write");
  }
  console.log(`✓ 迁移了 ${marketEvents.length} 条 market_events`);

  // 5. 迁移 trades（分批处理）
  console.log("\n[5/7] 迁移 trades...");
  const tradeCount = (localDb.prepare("SELECT COUNT(*) as count FROM trades").get() as any).count;
  console.log(`  总共 ${tradeCount} 条 trades，分批迁移...`);

  const BATCH_SIZE = 100;
  for (let offset = 0; offset < tradeCount; offset += BATCH_SIZE) {
    const trades = localDb.prepare(`SELECT * FROM trades LIMIT ${BATCH_SIZE} OFFSET ${offset}`).all() as any[];
    if (trades.length > 0) {
      const tradeStmts = trades.map((t) => ({
        sql: `INSERT OR IGNORE INTO trades
              (tx_hash, log_index, block_number, maker, taker, maker_asset_id, taker_asset_id,
               maker_amount, taker_amount, fee, token_id, market_id, outcome, direction, price, origin_from)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [t.tx_hash, t.log_index, t.block_number, t.maker, t.taker, t.maker_asset_id,
               t.taker_asset_id, t.maker_amount, t.taker_amount, t.fee, t.token_id,
               t.market_id, t.outcome, t.direction, t.price, t.origin_from],
      }));
      await turso.batch(tradeStmts, "write");
    }
    process.stdout.write(`  进度: ${Math.min(offset + BATCH_SIZE, tradeCount)}/${tradeCount}\r`);
  }
  console.log(`\n✓ 迁移了 ${tradeCount} 条 trades`);

  // 6. 迁移 fills（分批处理）
  console.log("\n[6/7] 迁移 fills...");
  const fillCount = (localDb.prepare("SELECT COUNT(*) as count FROM fills").get() as any).count;
  console.log(`  总共 ${fillCount} 条 fills，分批迁移...`);

  for (let offset = 0; offset < fillCount; offset += BATCH_SIZE) {
    const fills = localDb.prepare(`SELECT * FROM fills LIMIT ${BATCH_SIZE} OFFSET ${offset}`).all() as any[];
    if (fills.length > 0) {
      const fillStmts = fills.map((f) => ({
        sql: `INSERT OR IGNORE INTO fills
              (address, market_id, outcome_side, shares_delta, cash_delta_usdc, price, timestamp, tx_hash, log_index, role)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [f.address, f.market_id, f.outcome_side, f.shares_delta, f.cash_delta_usdc,
               f.price, f.timestamp, f.tx_hash, f.log_index, f.role],
      }));
      await turso.batch(fillStmts, "write");
    }
    process.stdout.write(`  进度: ${Math.min(offset + BATCH_SIZE, fillCount)}/${fillCount}\r`);
  }
  console.log(`\n✓ 迁移了 ${fillCount} 条 fills`);

  // 7. 迁移 trader_stats
  console.log("\n[7/7] 迁移 trader_stats...");
  const traderStats = localDb.prepare("SELECT * FROM trader_stats").all() as any[];
  if (traderStats.length > 0) {
    const statsStmts = traderStats.map((t) => ({
      sql: `INSERT OR REPLACE INTO trader_stats
            (address, trades_count, markets_count, volume_usdc, realized_pnl, total_buy_cost,
             roi, closed_markets_count, win_markets_count, win_rate, score, tags)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [t.address, t.trades_count, t.markets_count, t.volume_usdc, t.realized_pnl,
             t.total_buy_cost, t.roi, t.closed_markets_count, t.win_markets_count,
             t.win_rate, t.score, t.tags],
    }));
    // 分批处理
    for (let i = 0; i < statsStmts.length; i += BATCH_SIZE) {
      await turso.batch(statsStmts.slice(i, i + BATCH_SIZE), "write");
    }
  }
  console.log(`✓ 迁移了 ${traderStats.length} 条 trader_stats`);

  // 关闭连接
  localDb.close();

  console.log("\n========================================");
  console.log("✅ 数据迁移完成！");
  console.log("========================================");
}

migrate().catch((err) => {
  console.error("迁移失败:", err);
  process.exit(1);
});

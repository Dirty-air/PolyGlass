/**
 * DDL 迁移脚本：为 Retail 过滤功能添加新表和字段
 * 1. trades 表新增 origin_type, origin_is_relayer
 * 2. 新建 origin_metadata 表
 * 3. 新建 deposits 表
 * 4. trader_stats 表新增 origin_type, is_relayer, is_proxy_wallet, has_deposit, net_deposit_usdc
 */
import { createClient } from "@libsql/client";

const TURSO_URL = process.env.TURSO_DATABASE_URL!;
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN;

async function migrate() {
  console.log("开始 Retail 过滤功能 DDL 迁移...\n");

  if (!TURSO_URL) {
    throw new Error("TURSO_DATABASE_URL 环境变量未设置");
  }

  const turso = createClient({
    url: TURSO_URL,
    authToken: TURSO_TOKEN,
  });
  console.log("✓ 已连接 Turso\n");

  // 1. trades 表新增字段
  console.log("[1/4] 扩展 trades 表...");
  try {
    await turso.execute(`ALTER TABLE trades ADD COLUMN origin_type TEXT`);
    console.log("  ✓ 添加 origin_type 列");
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("duplicate column")) {
      console.log("  - origin_type 列已存在，跳过");
    } else {
      throw e;
    }
  }

  try {
    await turso.execute(`ALTER TABLE trades ADD COLUMN origin_is_relayer INTEGER DEFAULT 0`);
    console.log("  ✓ 添加 origin_is_relayer 列");
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("duplicate column")) {
      console.log("  - origin_is_relayer 列已存在，跳过");
    } else {
      throw e;
    }
  }

  // 创建索引
  await turso.execute(`CREATE INDEX IF NOT EXISTS idx_trades_origin_type ON trades(origin_type)`);
  await turso.execute(`CREATE INDEX IF NOT EXISTS idx_trades_origin_is_relayer ON trades(origin_is_relayer)`);
  await turso.execute(`CREATE INDEX IF NOT EXISTS idx_trades_origin_from ON trades(origin_from)`);
  console.log("  ✓ 创建索引完成");

  // 2. 创建 origin_metadata 表
  console.log("\n[2/4] 创建 origin_metadata 表...");
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS origin_metadata (
      address TEXT PRIMARY KEY,
      is_contract INTEGER NOT NULL DEFAULT 0,
      is_relayer INTEGER NOT NULL DEFAULT 0,
      is_proxy_wallet INTEGER DEFAULT NULL,
      trades_count_24h INTEGER DEFAULT 0,
      median_time_gap_sec REAL DEFAULT NULL,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await turso.execute(`CREATE INDEX IF NOT EXISTS idx_origin_meta_is_contract ON origin_metadata(is_contract)`);
  await turso.execute(`CREATE INDEX IF NOT EXISTS idx_origin_meta_is_relayer ON origin_metadata(is_relayer)`);
  console.log("  ✓ origin_metadata 表创建完成");

  // 3. 创建 deposits 表
  console.log("\n[3/4] 创建 deposits 表...");
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS deposits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tx_hash TEXT NOT NULL,
      log_index INTEGER NOT NULL,
      block_number INTEGER NOT NULL,
      from_address TEXT NOT NULL,
      to_address TEXT NOT NULL,
      amount TEXT NOT NULL,
      amount_usdc REAL NOT NULL,
      token_address TEXT NOT NULL,
      direction TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(tx_hash, log_index)
    )
  `);
  await turso.execute(`CREATE INDEX IF NOT EXISTS idx_deposits_to_address ON deposits(to_address)`);
  await turso.execute(`CREATE INDEX IF NOT EXISTS idx_deposits_from_address ON deposits(from_address)`);
  await turso.execute(`CREATE INDEX IF NOT EXISTS idx_deposits_block ON deposits(block_number)`);
  console.log("  ✓ deposits 表创建完成");

  // 4. trader_stats 表新增字段
  console.log("\n[4/4] 扩展 trader_stats 表...");
  const newColumns = [
    { name: "origin_type", def: "TEXT" },
    { name: "is_relayer", def: "INTEGER DEFAULT 0" },
    { name: "is_proxy_wallet", def: "INTEGER DEFAULT NULL" },
    { name: "has_deposit", def: "INTEGER DEFAULT 0" },
    { name: "net_deposit_usdc", def: "REAL DEFAULT 0" },
  ];

  for (const col of newColumns) {
    try {
      await turso.execute(`ALTER TABLE trader_stats ADD COLUMN ${col.name} ${col.def}`);
      console.log(`  ✓ 添加 ${col.name} 列`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("duplicate column")) {
        console.log(`  - ${col.name} 列已存在，跳过`);
      } else {
        throw e;
      }
    }
  }

  // 创建复合索引支持 retail 过滤
  await turso.execute(`
    CREATE INDEX IF NOT EXISTS idx_trader_stats_retail
    ON trader_stats(origin_type, is_relayer, has_deposit)
  `);
  console.log("  ✓ 创建 retail 过滤索引完成");

  console.log("\n========================================");
  console.log("✅ Retail DDL 迁移完成！");
  console.log("========================================");
  console.log("\n下一步：");
  console.log("  1. pnpm tsx scripts/backfill-origin-type.ts");
  console.log("  2. pnpm tsx scripts/backfill-relayer.ts");
  console.log("  3. pnpm tsx scripts/backfill-deposits.ts");
}

migrate().catch((err) => {
  console.error("迁移失败:", err);
  process.exit(1);
});

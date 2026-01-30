/**
 * Backfill: 为已有 trades 补充 origin_from
 * 运行: npx tsx scripts/backfill-origin.ts
 */
import Database from "better-sqlite3";
import { join } from "path";
import { existsSync, readFileSync } from "fs";

// 加载环境变量
function loadEnv() {
  const envPath = join(process.cwd(), ".env.local");
  if (existsSync(envPath)) {
    const content = readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const [key, ...valueParts] = trimmed.split("=");
      if (key && valueParts.length > 0) {
        process.env[key.trim()] = valueParts.join("=").trim();
      }
    }
  }
}
loadEnv();

const DB_PATH = join(process.cwd(), "data", "app.db");
const RPC_URL = process.env.RPC_URL;
const PARALLEL = 5;

if (!RPC_URL) {
  console.error("RPC_URL not set");
  process.exit(1);
}

interface TxHashRow {
  tx_hash: string;
}

async function getTransactionFrom(txHash: string): Promise<string | null> {
  try {
    const res = await fetch(RPC_URL!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_getTransactionByHash",
        params: [txHash],
      }),
    });
    const json = await res.json();
    return json.result?.from?.toLowerCase() ?? null;
  } catch {
    return null;
  }
}

function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

async function main() {
  const db = new Database(DB_PATH);

  // 获取需要填充的 txHash
  const rows = db
    .prepare("SELECT DISTINCT tx_hash FROM trades WHERE origin_from IS NULL")
    .all() as TxHashRow[];

  console.log(`Found ${rows.length} unique txHash to backfill`);

  if (rows.length === 0) {
    console.log("Nothing to backfill");
    db.close();
    return;
  }

  const updateStmt = db.prepare(
    "UPDATE trades SET origin_from = ? WHERE tx_hash = ?"
  );

  let processed = 0;
  const batches = chunk(rows, PARALLEL);

  for (const batch of batches) {
    const results = await Promise.all(
      batch.map((r) => getTransactionFrom(r.tx_hash))
    );

    const tx = db.transaction(() => {
      batch.forEach((row, i) => {
        const from = results[i];
        if (from) {
          updateStmt.run(from, row.tx_hash);
        }
      });
    });
    tx();

    processed += batch.length;
    if (processed % 50 === 0 || processed === rows.length) {
      console.log(`Progress: ${processed}/${rows.length}`);
    }
  }

  console.log("Backfill complete");
  db.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

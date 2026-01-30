/**
 * 模块：批量获取 tx.from 填充 originFrom
 * 优化：同一 txHash 只查一次，并行请求限流
 */
import { createLogger } from "@/lib/logger";
import { getTransactionByHash } from "./rpc";
import { PARALLEL_REQUESTS } from "./config";
import type { DecodedTrade } from "@/types/trade";

const logger = createLogger("enrich");

/**
 * 将数组分块
 */
function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

/**
 * 批量获取 tx.from 填充 originFrom
 * @param trades 解码后的交易列表
 * @returns 填充了 originFrom 的交易列表
 */
export async function enrichOriginFrom(
  trades: DecodedTrade[]
): Promise<DecodedTrade[]> {
  if (trades.length === 0) return trades;

  // 1. 收集唯一 txHash
  const uniqueTxHashes = [...new Set(trades.map((t) => t.txHash))];
  logger.info(`Fetching originFrom for ${uniqueTxHashes.length} unique txs...`);

  // 2. 缓存 Map
  const txMap = new Map<string, string>();

  // 3. 分批并行查询
  const batches = chunk(uniqueTxHashes, PARALLEL_REQUESTS);
  let processed = 0;

  for (const batch of batches) {
    const results = await Promise.all(
      batch.map((txHash) => getTransactionByHash(txHash))
    );

    batch.forEach((hash, i) => {
      if (results[i]) {
        txMap.set(hash, results[i]!.from.toLowerCase());
      }
    });

    processed += batch.length;
    if (processed % 50 === 0 || processed === uniqueTxHashes.length) {
      logger.info(`Progress: ${processed}/${uniqueTxHashes.length}`);
    }
  }

  // 4. 填充 originFrom（fallback 到 maker）
  return trades.map((t) => ({
    ...t,
    originFrom: txMap.get(t.txHash) ?? t.maker.toLowerCase(),
  }));
}

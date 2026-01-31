/**
 * 链上 Fills 增量同步模块
 * 从 Polygon 扫描 OrderFilled 事件 → decode → resolve → save
 */
import { scanBlockRange } from "@/indexer/scan";
import { getLatestBlock } from "@/indexer/rpc";
import { decodeLogs } from "@/decoder";
import { resolveTrades } from "@/resolver/resolve";
import { saveFills } from "@/db/analytics";
import { getSyncValue, setSyncValue } from "@/db/sync-state";
import { createLogger } from "@/lib/logger";
import type { TokenMap } from "@/types/market";
import type { Fill } from "@/types/fills";
import type { ResolvedTrade } from "@/types/trade";

const logger = createLogger("sync-fills");

const SYNC_KEY = "last_fill_block";
const MAX_SCAN_BLOCKS = 5000; // Vercel 60s 超时安全值

export interface SyncFillsResult {
  fillsInserted: number;
  lastFillBlock: number;
  blocksScanned: number;
}

/** ResolvedTrade → Fill 适配器 */
function toFill(t: ResolvedTrade): Fill {
  const isBuy = t.direction === "BUY";
  const shares = Number(isBuy ? t.makerAmount : t.takerAmount) / 1e6;
  const cash = Number(isBuy ? t.takerAmount : t.makerAmount) / 1e6;

  return {
    address: (t.originFrom ?? t.taker).toLowerCase(),
    marketId: t.marketId,
    outcomeSide: t.outcome,
    sharesDelta: isBuy ? shares : -shares,
    cashDeltaUSDC: isBuy ? -cash : cash,
    price: t.price,
    timestamp: t.blockNumber,
    txHash: t.txHash,
    logIndex: t.logIndex,
    role: "taker",
  };
}

/**
 * 增量同步 fills
 * 使用 sync_state 记录 last_fill_block 实现断点续跑
 */
export async function syncFills(tokenMap: TokenMap): Promise<SyncFillsResult> {
  // 1. 读取游标
  const savedBlock = await getSyncValue(SYNC_KEY);
  const latestBlock = await getLatestBlock();
  const fromBlock = savedBlock ? parseInt(savedBlock) + 1 : latestBlock - 1000;

  // 2. 限制扫描范围（防超时）
  const toBlock = Math.min(fromBlock + MAX_SCAN_BLOCKS, latestBlock);
  if (fromBlock > toBlock) {
    logger.info("No new blocks to scan");
    return { fillsInserted: 0, lastFillBlock: latestBlock, blocksScanned: 0 };
  }

  logger.info(`Scanning blocks ${fromBlock} - ${toBlock} (${toBlock - fromBlock + 1} blocks)`);

  // 3. 扫描
  const rawLogs = await scanBlockRange(fromBlock, toBlock);
  logger.info(`Found ${rawLogs.length} OrderFilled logs`);

  if (rawLogs.length === 0) {
    await setSyncValue(SYNC_KEY, toBlock.toString());
    return { fillsInserted: 0, lastFillBlock: toBlock, blocksScanned: toBlock - fromBlock + 1 };
  }

  // 4. 解码
  const { trades, errors } = decodeLogs(rawLogs);
  if (errors.length > 0) {
    logger.warn(`Decode errors: ${errors.length}`);
  }

  // 5. 归类（需要 tokenMap）
  const { resolved, unresolved } = resolveTrades(trades, tokenMap);
  if (unresolved.length > 0) {
    logger.info(`Unresolved trades: ${unresolved.length}`);
  }

  // 6. 转为 fills
  const fills = resolved.map(toFill);

  // 7. 保存
  const fillsInserted = await saveFills(fills);
  logger.info(`Inserted ${fillsInserted} fills`);

  // 8. 更新游标
  await setSyncValue(SYNC_KEY, toBlock.toString());

  return {
    fillsInserted,
    lastFillBlock: toBlock,
    blocksScanned: toBlock - fromBlock + 1,
  };
}

/**
 * 同步编排入口
 * 协调市场同步和 fills 同步
 */
import { syncMarkets } from "./sync-markets";
import { syncFills } from "./sync-fills";
import { ensureSyncTables } from "@/db/sync-state";
import { createLogger } from "@/lib/logger";

const logger = createLogger("sync");

export interface SyncResult {
  ok: boolean;
  marketsUpserted: number;
  eventsUpserted: number;
  fillsInserted: number;
  lastFillBlock: number;
  durationMs: number;
  error?: string;
}

/**
 * 执行完整同步
 * Phase 1: 同步市场数据（必须先完成，获取 tokenMap）
 * Phase 2: 增量同步 fills（依赖 tokenMap）
 */
export async function runFullSync(): Promise<SyncResult> {
  const start = Date.now();
  let marketsUpserted = 0;
  let eventsUpserted = 0;
  let fillsInserted = 0;
  let lastFillBlock = 0;
  const errors: string[] = [];

  try {
    // 0. 确保表结构
    logger.info("Ensuring database tables...");
    await ensureSyncTables();
  } catch (err) {
    logger.error(`Schema init failed: ${err}`);
    return {
      ok: false,
      marketsUpserted: 0,
      eventsUpserted: 0,
      fillsInserted: 0,
      lastFillBlock: 0,
      durationMs: Date.now() - start,
      error: `Schema init failed: ${err}`,
    };
  }

  // Phase 1: 同步市场（必须成功，否则无法进行 fills 同步）
  try {
    logger.info("Phase 1: Syncing markets...");
    const marketResult = await syncMarkets();
    marketsUpserted = marketResult.marketsUpserted;
    eventsUpserted = marketResult.eventsUpserted;

    // Phase 2: 增量同步 fills（可以失败，不影响 markets 数据）
    const elapsed = Date.now() - start;
    if (elapsed > 45_000) {
      // 已用 45s，跳过 fills 避免超时
      logger.warn("Skipping fills sync: nearing timeout");
      errors.push("Skipped fills sync: nearing timeout");
    } else {
      try {
        logger.info("Phase 2: Syncing fills...");
        const fillResult = await syncFills(marketResult.tokenMap);
        fillsInserted = fillResult.fillsInserted;
        lastFillBlock = fillResult.lastFillBlock;
      } catch (err) {
        logger.error(`Fills sync failed: ${err}`);
        errors.push(`Fills sync failed: ${err}`);
      }
    }
  } catch (err) {
    logger.error(`Markets sync failed: ${err}`);
    return {
      ok: false,
      marketsUpserted: 0,
      eventsUpserted: 0,
      fillsInserted: 0,
      lastFillBlock: 0,
      durationMs: Date.now() - start,
      error: `Markets sync failed: ${err}`,
    };
  }

  const durationMs = Date.now() - start;
  logger.info(`Sync complete in ${durationMs}ms`);

  return {
    ok: errors.length === 0,
    marketsUpserted,
    eventsUpserted,
    fillsInserted,
    lastFillBlock,
    durationMs,
    error: errors.length > 0 ? errors.join("; ") : undefined,
  };
}

export { syncMarkets } from "./sync-markets";
export { syncFills } from "./sync-fills";

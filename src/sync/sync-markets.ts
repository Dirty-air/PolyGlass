/**
 * 市场数据同步模块
 * 从 Gamma API 拉取 → 解析 → upsert 到 DB
 */
import { fetchGammaMarkets } from "@/markets/gamma";
import { buildMarketData } from "@/markets/tokenMap";
import { saveMarkets } from "@/db/markets";
import { saveEvents, saveMarketEvents } from "@/db/events";
import { createLogger } from "@/lib/logger";
import type { TokenMap } from "@/types/market";

const logger = createLogger("sync-markets");

export interface SyncMarketsResult {
  marketsUpserted: number;
  eventsUpserted: number;
  relationsUpserted: number;
  tokenMap: TokenMap;
}

/**
 * 同步市场数据（全量覆盖）
 * 返回 tokenMap 供 fills 同步使用
 */
export async function syncMarkets(): Promise<SyncMarketsResult> {
  logger.info("Fetching markets from Gamma API...");
  const raw = await fetchGammaMarkets();
  logger.info(`Fetched ${raw.length} markets from Gamma`);

  logger.info("Building market data...");
  const { markets, events, marketEvents, tokenMap } = buildMarketData(raw);
  logger.info(`Parsed: ${markets.length} markets, ${events.length} events`);

  logger.info("Upserting to database...");
  const marketsUpserted = await saveMarkets(markets);
  const eventsUpserted = await saveEvents(events);
  const relationsUpserted = await saveMarketEvents(marketEvents);

  logger.info(
    `Upserted: ${marketsUpserted} markets, ${eventsUpserted} events, ${relationsUpserted} relations`,
  );

  return { marketsUpserted, eventsUpserted, relationsUpserted, tokenMap };
}

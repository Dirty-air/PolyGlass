/**
 * 轻量级市场数据刷新脚本
 * 只从 Gamma API 获取市场数据并更新缓存
 */
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";

// 直接导入需要的模块
import { fetchGammaMarkets } from "../src/markets/gamma";
import { buildMarketData } from "../src/markets/tokenMap";
import { createLogger } from "../src/lib/logger";

const logger = createLogger("refresh-markets");
const CACHE_PATH = join(process.cwd(), "data", "markets-cache.json");

async function main() {
  logger.info("=== Refreshing Markets Data ===");

  // 从 Gamma API 获取数据
  logger.info("Fetching markets from Gamma API...");
  const raw = await fetchGammaMarkets();
  logger.info(`Fetched ${raw.length} raw markets`);

  // 构建市场数据
  logger.info("Building market data...");
  const result = buildMarketData(raw);
  logger.info(`Built ${result.markets.length} markets, ${result.events.length} events`);

  // 检查 outcomes 数据
  const marketsWithOutcomes = result.markets.filter(m => m.outcomes && m.outcomes[0] !== "No");
  logger.info(`Markets with non-Yes/No outcomes: ${marketsWithOutcomes.length}`);
  if (marketsWithOutcomes.length > 0) {
    const sample = marketsWithOutcomes.slice(0, 3);
    for (const m of sample) {
      logger.info(`  - "${m.title}" → outcomes: ${JSON.stringify(m.outcomes)}`);
    }
  }

  // 写入缓存文件
  const dir = dirname(CACHE_PATH);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(CACHE_PATH, JSON.stringify(result, null, 2));
  logger.info(`Cache updated: ${CACHE_PATH}`);

  logger.info("=== Refresh Complete ===");
}

main().catch((err) => {
  logger.error(`Refresh failed: ${err}`);
  process.exit(1);
});

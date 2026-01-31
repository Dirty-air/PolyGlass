export { getDb } from "./init";
export { saveTrades, getTrades, getTradeCount } from "./trades";
export { saveMarkets, getMarkets, getMarketsWithStats, type StoredMarket } from "./markets";
export { addTag, getTags, getTagsForAddresses } from "./tags";
export { getTraderStats } from "./traders";
export {
  saveEvents,
  saveMarketEvents,
  getEventsWithStats,
  getEventById,
  getMarketsByEventId,
  getEventsWithSmartMoneyStats,
  getEventDetailWithSmartMoney,
  getMarketsWithSmartMoneyByEventId,
  getSmartMoneyHoldersByMarket,
} from "./events";

// Smart Money 模块
export {
  saveFills,
  getAllFills,
  getFillsByAddress,
  getLatestFillBlock,
  saveScoredTraders,
  getSmartTraders,
  getTraderByAddress,
  getSmartAddresses,
  saveSignals,
  getRecentSignals,
  getSignalsByAddress,
  generateSignalsFromFills,
  DEFAULT_SIGNAL_CONFIG,
} from "./analytics";

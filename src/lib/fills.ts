/**
 * 模块：Fills 标准化层
 * 将 trade 转换为会计友好的 fill 记录
 *
 * 归类规则（基于 resolver）：
 * - direction=BUY: maker 提供 outcome tokens, taker 提供 USDC
 * - direction=SELL: taker 提供 outcome tokens, maker 提供 USDC
 *
 * 地址策略：
 * - 优先使用 origin_from（真实 EOA）
 * - fallback 到 maker/taker
 *
 * 精度：
 * - USDC: 6 位小数 (10^6)
 * - Outcome Token: 6 位小数（Polymarket CTF 实际也是 10^6）
 */
import type { TradeRow } from "@/types/trade";
import type { Fill } from "@/types/fills";

const USDC_DECIMALS = 1e6;
const TOKEN_DECIMALS = 1e6;

/**
 * 将一条 trade 标准化为 fill（基于 originFrom EOA 视角）
 * 只生成一条 fill 记录（真实交易发起者视角）
 */
export function normalizeTradeToFills(trade: TradeRow): Fill[] {
  if (!trade.market_id || !trade.outcome) return [];

  const makerAmount = Number(trade.maker_amount);
  const takerAmount = Number(trade.taker_amount);
  const outcomeSide = trade.outcome as "YES" | "NO";

  // 使用 originFrom（真实 EOA），fallback 到 maker
  const originAddress = (trade.origin_from ?? trade.maker).toLowerCase();

  if (trade.direction === "BUY") {
    // taker 买入 outcome tokens
    const shares = makerAmount / TOKEN_DECIMALS;
    const cash = takerAmount / USDC_DECIMALS;

    return [
      {
        address: originAddress,
        marketId: trade.market_id,
        outcomeSide,
        sharesDelta: shares,
        cashDeltaUSDC: -cash,
        price: trade.price ?? cash / shares,
        timestamp: trade.block_number,
        txHash: trade.tx_hash,
        logIndex: trade.log_index,
        role: "taker",
      },
    ];
  } else {
    // direction === "SELL"
    // taker 卖出 outcome tokens
    const shares = takerAmount / TOKEN_DECIMALS;
    const cash = makerAmount / USDC_DECIMALS;

    return [
      {
        address: originAddress,
        marketId: trade.market_id,
        outcomeSide,
        sharesDelta: -shares,
        cashDeltaUSDC: cash,
        price: trade.price ?? cash / shares,
        timestamp: trade.block_number,
        txHash: trade.tx_hash,
        logIndex: trade.log_index,
        role: "taker",
      },
    ];
  }
}

/**
 * 批量将 trades 转为 fills
 */
export function normalizeAllTrades(trades: TradeRow[]): Fill[] {
  return trades.flatMap(normalizeTradeToFills);
}

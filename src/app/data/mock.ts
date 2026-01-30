export const networkStats = [
  {
    label: "Total Volume (24h)",
    value: "$182.4M",
    change: 12.4,
    badge: "Live",
    hint: "Aggregated across all Polymarket markets",
  },
  {
    label: "Open Interest",
    value: "$1.26B",
    change: -3.8,
    badge: "DeFi",
    hint: "Sum of active outstanding positions",
  },
  {
    label: "Active Markets",
    value: "118,902",
    change: 4.1,
    badge: "New",
    hint: "Markets with liquidity > $5k",
  },
  {
    label: "Unique Traders (7d)",
    value: "742,118",
    change: 6.7,
    badge: "Growth",
    hint: "Wallets that touched Polymarket in the last 7 days",
  },
];

export const marketActivity = [
  {
    title: "Will ETH flip 4k before Mar 31?",
    tag: "Crypto",
    liquidity: "$3.2M",
    price: 0.61,
    change: 8.3,
    endsIn: "31d",
  },
  {
    title: "2026 US election winner: Democratic",
    tag: "Politics",
    liquidity: "$4.8M",
    price: 0.54,
    change: -2.1,
    endsIn: "280d",
  },
  {
    title: "BTC to close above 90k on Dec 31",
    tag: "Macro",
    liquidity: "$2.1M",
    price: 0.37,
    change: 11.2,
    endsIn: "335d",
  },
  {
    title: "SOL TVL to exceed $20B by Q3",
    tag: "DeFi",
    liquidity: "$1.4M",
    price: 0.44,
    change: 6.5,
    endsIn: "140d",
  },
];

export const traderFeed = [
  { trader: "0x6b9...12af", pnl: "$1,052,110", market: "ETH flip 4k", timeframe: "1d" },
  { trader: "0x99c...a07e", pnl: "$788,402", market: "BTC above 90k", timeframe: "1w" },
  { trader: "0xabc...3112", pnl: "$522,910", market: "US election winner", timeframe: "1d" },
  { trader: "0x8d4...91f3", pnl: "$318,044", market: "SOL TVL > $20B", timeframe: "1d" },
  { trader: "0x0fa...7e12", pnl: "$202,118", market: "Inflation < 2.8%", timeframe: "1d" },
];

export const filters = ["All", "Politics", "Crypto", "Macro", "Sports", "AI", "DeFi", "Climate"];

export const marketsTable = [
  {
    market: "Highest temperature in Buenos Aires on Jan 29?",
    priceYes: 0.97,
    priceNo: 0.03,
    volume: "$10k",
    liquidity: "$190k",
    expiry: "2026-01-29",
    tags: ["Weather", "LatAm"],
    change: 38.8,
  },
  {
    market: "Will BTC hit $90k between Jan 26-Feb 02?",
    priceYes: 0.42,
    priceNo: 0.58,
    volume: "$185k",
    liquidity: "$1.1M",
    expiry: "2026-02-02",
    tags: ["Crypto", "BTC"],
    change: 12.7,
  },
  {
    market: "ETH staking APR to stay above 3.5% in Q2",
    priceYes: 0.64,
    priceNo: 0.36,
    volume: "$92k",
    liquidity: "$730k",
    expiry: "2026-04-01",
    tags: ["Crypto", "ETH", "Yield"],
    change: -4.2,
  },
  {
    market: "Trump to win the US 2026 special senate seat",
    priceYes: 0.31,
    priceNo: 0.69,
    volume: "$210k",
    liquidity: "$905k",
    expiry: "2026-11-08",
    tags: ["Politics", "US"],
    change: 2.5,
  },
  {
    market: "Will Solana daily TPS exceed 10k in Q1",
    priceYes: 0.58,
    priceNo: 0.42,
    volume: "$148k",
    liquidity: "$640k",
    expiry: "2026-03-31",
    tags: ["DeFi", "Infra"],
    change: 6.9,
  },
];

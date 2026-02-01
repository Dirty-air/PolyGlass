# PolyGlass 演示说明

## 启动

```bash
pnpm dev
```

访问 http://localhost:3000

## 演示流程

### 1. Overview 页面

首页展示市场概览：
- 实时市场轮播和热力图看板
- 异常交易卡片
- 热门事件统计

### 2. Markets 页面

访问 `/markets`，展示 20,000+ 市场数据（自动同步 Polymarket，≤60s 延迟）：
- 搜索市场（如 "Trump"、"Bitcoin"）
- 标签筛选（Sports、Crypto、Politics 等）
- 点击 "+" 展开事件下的子市场
- 点击标题跳转 Polymarket 原站
- 支持按 Volume、结束日期排序，默认每页 50 条

### 3. 连接钱包

点击右上角 "Connect" 按钮：
- 支持 MetaMask、WalletConnect、Coinbase 等
- 连接后显示 `[Polygon] [0x1234...abcd]`
- 点击地址可查看详情或断开连接

### 4. Smart Money 页面

访问 `/smart-money`：
- 高绩效交易者排行榜（PnL、ROI、胜率、评分）
- 聪明钱包在市场中的持仓占比

### 5. Insights 页面

访问 `/insights`：
- 输入 Polymarket 事件 URL，LLM 自动生成市场分析报告

### 6. Calendar 页面

访问 `/calendar`：
- 按日期查看即将结算的 Polymarket 市场
- 颜色深度反映市场价值，悬停查看底层事件

## 数据同步

| 模块 | 数据源 | 同步方式 |
|------|--------|----------|
| Markets | Gamma API | 自动（≤60s） |
| Smart Money | Polygon RPC → Turso DB | 手动 `pnpm fetch` |

## 截图

| Overview | Markets | Connect |
|----------|---------|---------|
| ![overview](screenshots/demo-1.png) | ![markets](screenshots/demo-2.png) | ![connect](screenshots/demo-3.png) |

| Smart Money | Insights | Calendar |
|-------------|----------|----------|
| ![smart-money](screenshots/demo-4.png) | ![insights](screenshots/demo-5.png) | ![calendar](screenshots/demo-6.png) |

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Next.js 16 + React 19 + Tailwind CSS 4 |
| 可视化 | Recharts + Three.js |
| 钱包 | RainbowKit + wagmi + viem |
| 数据库 | Turso (libSQL) |
| 区块链 | Polygon RPC |
| 缓存 | React Query + HTTP Cache-Control |

## API 端点

| 端点 | 说明 |
|------|------|
| `GET /api/markets` | 市场列表（支持 search/status/tag 筛选） |
| `GET /api/events/[id]/markets` | 事件下的子市场 |
| `GET /api/smart-money` | Smart Money 排行榜 |
| `GET /api/stats` | 平台统计数据 |
| `GET /api/leaderboard` | 交易者排行榜 |

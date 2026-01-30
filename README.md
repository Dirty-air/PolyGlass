# PolyGlass · Polymarket 数据指挥舱

面向 Web3 的 Polymarket 数据聚合与可视化前端，基于 Next.js(App Router) + Tailwind v4 + pnpm。当前内置霓虹玻璃风 UI、示例数据与组件拆分，可直接接入真实链上/官方数据源。

## 快速开始
```bash
pnpm install        # 安装依赖
pnpm dev            # 启动开发，http://localhost:3000
pnpm lint           # 代码检查
pnpm build && pnpm start   # 生产模式
```

## 目录结构（关键模块）
- `src/app/layout.tsx`：全局布局、字体/SEO 元信息。
- `src/app/globals.css`：主题与玻璃风样式变量。
- `src/app/page.tsx`：主页编排（英雄区、指标卡、活动、交易员榜、表格）。
- `src/app/components/`：
  - `header.tsx`：导航与搜索/连接按钮。
  - `stat-card.tsx`：指标卡片。
  - `market-activity.tsx`：热门市场列表。
  - `trader-feed.tsx`：交易员收益榜。
  - `markets-table.tsx`：可筛选市场表格。
  - `pill-tabs.tsx`：胶囊标签切换。
- `src/app/data/mock.ts`：前端静态 mock 数据（待替换为真实源）。

## 模块规划与演进
1) 数据层
   - 新增 `src/lib/polymarket.ts`：封装 Polymarket 官方 API / GoldSky / Substreams 请求，定义类型。
   - 新增 `src/app/api/markets/route.ts` 等 Route Handler：做字段裁剪、缓存与错误兜底，供前端 fetch。
   - 前端用 SWR/React Query 轮询或 SSE/WebSocket 做实时更新（可配置 `refreshInterval`）。
2) 状态与交互
   - 轻量状态管理（Zustand/Jotai）存放筛选条件、用户态、主题。
   - 表格分页/排序/搜索联动 URL 查询参数，便于分享/回放。
3) 可视化
   - 为指标/表格行加入 sparkline、盘口深度图（可用 lightweight-charts 或 Recharts）。
   - Skeleton 与乐观更新，保证实时感。
4) 设计系统
   - 将色板/阴影/圆角抽象为 tokens（如 `src/styles/tokens.css`），组件依赖 tokens 而非魔法值。
5) 监控与质量
   - 增加 E2E（Playwright）和组件测试（Vitest/RTL）。
   - API 侧加入超时与 LRU/Redis 缓存，防抖高频请求。

## 数据接入示例（思路）
- API 拉取：在 `polymarket.ts` 中使用 `fetch` 调官方 markets/trades/orderbook，返回统一字段。
- Edge 路由：`route.ts` 中 `export const runtime = "edge";`，`fetch` 时 `cache: "no-store"` 或 `revalidate` 控制时效。
- 前端消费：`useSWR("/api/markets", fetcher, { refreshInterval: 30000 })`，与现有 `mock` 类型兼容替换。

## 代码规范
- TypeScript 全量，ESLint 已启用；组件保持无状态/可组合。
- Tailwind 优先，必要时补充全局变量；避免内联魔法色值，复用 tokens。
- 提交前运行 `pnpm lint`，必要时补充测试。 

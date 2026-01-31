/**
 * API: POST /api/sync/polymarket
 * 同步端点：Gamma API + Polygon 链上数据 → Turso DB
 * 需要 x-sync-token 头进行鉴权
 */
import { NextRequest, NextResponse } from "next/server";
import { runFullSync } from "@/sync";

export async function POST(req: NextRequest) {
  // 1. 鉴权
  const token = req.headers.get("x-sync-token");
  if (!token || token !== process.env.SYNC_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. 执行同步
  const result = await runFullSync();

  // 3. 返回结果
  return NextResponse.json(result, {
    status: result.ok ? 200 : 500,
  });
}

// 只允许 POST 方法
export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed. Use POST with x-sync-token header." },
    { status: 405 },
  );
}

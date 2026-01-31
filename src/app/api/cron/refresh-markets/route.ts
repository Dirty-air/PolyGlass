/**
 * API: GET /api/cron/refresh-markets
 * Vercel Cron 触发的市场数据同步
 * 使用 CRON_SECRET 进行鉴权
 */
import { NextRequest, NextResponse } from "next/server";
import { runFullSync } from "@/sync";

export async function GET(req: NextRequest) {
  // Vercel Cron 鉴权
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 执行完整同步
  const result = await runFullSync();

  return NextResponse.json(result, {
    status: result.ok ? 200 : 500,
  });
}

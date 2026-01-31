/**
 * API: GET /api/cron/refresh-markets
 * Vercel Cron 触发的市场数据刷新（暂时 stub）
 */
import { NextResponse } from "next/server";

export async function GET() {
  // TODO: 实现数据库同步逻辑
  return NextResponse.json({ message: "Cron refresh placeholder" });
}

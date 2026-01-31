/**
 * API: GET /api/traders
 * 获取交易者排行（含标签）
 * 参数: ?view=origin|agent (默认 origin)
 */
import { NextRequest, NextResponse } from "next/server";
import { getTraderStats } from "@/db";
import type { TraderView } from "@/db/traders";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const view = (searchParams.get("view") || "origin") as TraderView;

  if (view !== "origin" && view !== "agent") {
    return NextResponse.json({ error: "Invalid view" }, { status: 400 });
  }

  const traders = await getTraderStats(100, view);
  return NextResponse.json({ data: traders });
}

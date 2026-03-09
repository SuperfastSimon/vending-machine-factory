import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const timestamp = new Date().toISOString();

  let dbStatus: "ok" | "error" = "ok";
  let dbLatencyMs: number | null = null;
  let dbError: string | undefined;
  let userCount: number | undefined;

  try {
    const start = Date.now();
    userCount = await prisma.user.count();
    dbLatencyMs = Date.now() - start;
  } catch (err) {
    dbStatus = "error";
    dbError =
      err instanceof Error ? err.message : "Unknown database error";
  }

  const overall = dbStatus === "ok" ? "ok" : "degraded";

  return NextResponse.json(
    {
      status: overall,
      timestamp,
      checks: {
        database: {
          status: dbStatus,
          latencyMs: dbLatencyMs,
          userCount,
          ...(dbError && { error: dbError }),
        },
      },
    },
    { status: overall === "ok" ? 200 : 503 }
  );
}

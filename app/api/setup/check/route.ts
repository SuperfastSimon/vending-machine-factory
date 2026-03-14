// GET /api/setup/check — returns live service health for the owner dashboard.
// No auth required (it only reveals *which* services are configured, not keys).

import { NextResponse } from "next/server";
import { getEnvStatus } from "@/lib/env";

export const dynamic = "force-dynamic"; // never cache

export async function GET() {
  const status = getEnvStatus();

  // Optionally ping real services to confirm they're reachable
  const checks = await Promise.allSettled([
    checkSupabase(),
    checkDatabase(),
    checkAutoGPT(),
  ]);

  const live: Record<string, boolean | string> = {
    supabase:
      checks[0].status === "fulfilled" ? checks[0].value : checks[0].reason?.message ?? false,
    database:
      checks[1].status === "fulfilled" ? checks[1].value : checks[1].reason?.message ?? false,
    autogpt:
      checks[2].status === "fulfilled" ? checks[2].value : checks[2].reason?.message ?? false,
  };

  return NextResponse.json({ ...status, live });
}

// ── lightweight pings ────────────────────────────────────────

async function checkSupabase(): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return false;
  const res = await fetch(`${url}/rest/v1/`, {
    method: "HEAD",
    headers: {
      apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    },
    signal: AbortSignal.timeout(5000),
  });
  return res.ok || res.status === 401; // 401 = key works, just no anon access to root
}

async function checkDatabase(): Promise<boolean> {
  if (!process.env.DATABASE_URL) return false;
  // We import prisma lazily so the module doesn't crash when DATABASE_URL is absent
  try {
    const { prisma } = await import("@/lib/prisma");
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

async function checkAutoGPT(): Promise<boolean> {
  const key = process.env.AUTOGPT_API_KEY;
  if (!key) return false;
  const base =
    process.env.AUTOGPT_API_URL ?? "https://backend.agpt.co/external-api";
  const res = await fetch(`${base}/v1/library/agents`, {
    headers: { "X-API-Key": key },
    signal: AbortSignal.timeout(5000),
  });
  return res.ok;
}

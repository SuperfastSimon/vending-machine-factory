// File: /app/api/agent/run/route.ts
// Customer hits this to trigger an agent run

import { NextRequest, NextResponse } from "next/server";
import { triggerAgentRun, AutoGPTNotConfiguredError } from "@/lib/autogpt";
import { productConfig } from "@/config/product";
import { authenticateApiKey } from "@/lib/api-auth";
import { isSupabaseConfigured, isDatabaseConfigured } from "@/lib/env";

export async function POST(request: NextRequest) {
  try {
    // ── Guard: Supabase must be configured for auth ──────────
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Authentication service is not configured. Please contact the site owner." },
        { status: 503 }
      );
    }

    const { createServerClient } = await import("@supabase/ssr");
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(_name: string, _value: string) {},
          remove(_name: string) {},
        },
      }
    );

    // 1. Authenticate via Supabase session or API key
    let userId: string | null = null;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      userId = user.id;
    } else {
      userId = await authenticateApiKey(
        request.headers.get("authorization")
      );
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Check the user has a credit quota (only if DB is available)
    if (isDatabaseConfigured()) {
      const { prisma } = await import("@/lib/prisma");
      const dbUser = await prisma.user.findUnique({ where: { id: userId } });
      if (!dbUser || dbUser.credits_remaining < 1) {
        const hasQuota = checkUserQuota(dbUser?.plan ?? "free");
        if (!hasQuota) {
          return NextResponse.json(
            { error: "Usage limit reached. Please upgrade your plan." },
            { status: 429 }
          );
        }
      }
    }

    // 3. Get customer inputs
    const body = await request.json() as { inputs?: Record<string, unknown> };
    const inputs = body.inputs ?? {};

    // 4. Trigger the AutoGPT agent run
    const { executionId } = await triggerAgentRun(
      productConfig.agent.graphId,
      inputs
    );

    // 5. Log usage and create agent run record (only if DB is available)
    if (isDatabaseConfigured()) {
      await logUsage(userId, executionId, productConfig.agent.graphId);
    }

    return NextResponse.json({ executionId, status: "queued" });
  } catch (err) {
    if (err instanceof AutoGPTNotConfiguredError) {
      return NextResponse.json(
        { error: "AI agent service is not configured. Please contact the site owner." },
        { status: 503 }
      );
    }
    console.error("[agent/run] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── helpers ─────────────────────────────────────────────────

function checkUserQuota(plan: string): boolean {
  const quotas: Record<string, number> = {
    free: 5,
    pro: 100,
    business: 500,
  };
  // quota check is handled by credits_remaining in the DB;
  // this is a fallback for unknown plans
  return (quotas[plan] ?? 0) > 0;
}

async function logUsage(userId: string, executionId: string, agentId: string): Promise<void> {
  const { prisma } = await import("@/lib/prisma");
  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { credits_remaining: { decrement: 1 } },
    }),
    prisma.agentRun.create({
      data: {
        user_id: userId,
        agent_id: agentId,
        execution_id: executionId,
        status: "queued",
      },
    }),
  ]);
}

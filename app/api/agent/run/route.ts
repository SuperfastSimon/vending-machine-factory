// File: /app/api/agent/run/route.ts
// Customer hits this to trigger an agent run

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseRouteClient } from "@/lib/supabase-server";
import { triggerAgentRun } from "@/lib/autogpt";
import { productConfig, creditsForPlan } from "@/config/product";
import { prisma } from "@/lib/prisma";
import { authenticateApiKey } from "@/lib/api-auth";

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseRouteClient(request);

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

    // 2. Check the user has a credit quota
    const dbUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!dbUser || dbUser.credits_remaining < 1) {
      if (!checkUserQuota(dbUser?.plan ?? "free")) {
        return NextResponse.json(
          { error: "Usage limit reached. Please upgrade your plan." },
          { status: 429 }
        );
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

    // 5. Log usage and create agent run record
    await logUsage(userId, executionId, productConfig.agent.graphId);

    return NextResponse.json({ executionId, status: "queued" });
  } catch (err) {
    console.error("[agent/run] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── helpers ─────────────────────────────────────────────────

function checkUserQuota(plan: string): boolean {
  // Primary check is credits_remaining in the DB;
  // this is a fallback for unknown plans.
  return (creditsForPlan[plan] ?? 0) > 0;
}

async function logUsage(userId: string, executionId: string, agentId: string): Promise<void> {
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

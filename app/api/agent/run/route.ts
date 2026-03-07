// File: /app/api/agent/run/route.ts
// Customer hits this to trigger an agent run

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { triggerAgentRun } from "@/lib/autogpt";
import { productConfig } from "@/config/product";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
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

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Check the user has a credit quota
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser || dbUser.credits_remaining < 1) {
      const hasQuota = await checkUserQuota(dbUser?.plan ?? "free");
      if (!hasQuota) {
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

    // 5. Log usage
    await logUsage(user.id, executionId);

    return NextResponse.json({ executionId, status: "queued" });
  } catch (err) {
    console.error("[agent/run] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── helpers ─────────────────────────────────────────────────

function checkUserQuota(plan: string): Promise<boolean> {
  const quotas: Record<string, number> = {
    free: 5,
    pro: 100,
    business: 500,
  };
  // quota check is handled by credits_remaining in the DB;
  // this is a fallback for unknown plans
  return Promise.resolve((quotas[plan] ?? 0) > 0);
}

async function logUsage(userId: string, executionId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { credits_remaining: { decrement: 1 } },
  });
  console.log(`[agent/run] user=${userId} executionId=${executionId}`);
}

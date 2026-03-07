import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { PrismaClient } from "@prisma/client";
import { triggerAgentRun } from "@/lib/autogpt";
import { productConfig } from "@/config/product";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });

  if (!dbUser || dbUser.credits_remaining <= 0) {
    return NextResponse.json(
      { error: "No credits remaining. Please upgrade your plan." },
      { status: 402 }
    );
  }

  const body = await req.json();
  const inputs: Record<string, string> = body.inputs ?? {};

  // Deduct credit before running (refund if agent fails)
  await prisma.user.update({
    where: { id: user.id },
    data: { credits_remaining: { decrement: 1 } },
  });

  try {
    const { executionId } = await triggerAgentRun(
      productConfig.agent.graphId,
      inputs
    );
    return NextResponse.json({ executionId });
  } catch (err) {
    // Refund credit if agent could not be triggered
    await prisma.user.update({
      where: { id: user.id },
      data: { credits_remaining: { increment: 1 } },
    });

    console.error("AutoGPT trigger error:", err);
    return NextResponse.json(
      { error: "Failed to start agent. Please try again." },
      { status: 500 }
    );
  }
}

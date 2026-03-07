import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { PrismaClient } from "@prisma/client";
import { productConfig } from "@/config/product";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  // Authenticate the user via Supabase session cookie
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        set(_name: string, _value: string) {},
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  // Check credits
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser || dbUser.credits_remaining < 1) {
    return NextResponse.json({ error: "Insufficient credits" }, { status: 402 });
  }

  const { task } = await request.json() as { task?: string };
  if (!task || typeof task !== "string" || task.trim().length === 0) {
    return NextResponse.json({ error: "task is required" }, { status: 400 });
  }

  const agentId = productConfig.agentId;
  const apiEndpoint = productConfig.apiEndpoint;
  const apiKey = process.env.AUTOGPT_API_KEY;

  if (!agentId || !apiEndpoint || !apiKey) {
    return NextResponse.json(
      { error: "AutoGPT is not configured (agentId, apiEndpoint, or AUTOGPT_API_KEY missing)" },
      { status: 503 }
    );
  }

  // Call AutoGPT External API
  const autogptRes = await fetch(`${apiEndpoint}/agents/${agentId}/runs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ task: task.trim() }),
  });

  if (!autogptRes.ok) {
    const text = await autogptRes.text();
    return NextResponse.json(
      { error: "AutoGPT API error", detail: text },
      { status: 502 }
    );
  }

  const run = await autogptRes.json() as { id: string; [key: string]: unknown };

  // Deduct one credit
  await prisma.user.update({
    where: { id: user.id },
    data: { credits_remaining: { decrement: 1 } },
  });

  return NextResponse.json({ runId: run.id }, { status: 202 });
}

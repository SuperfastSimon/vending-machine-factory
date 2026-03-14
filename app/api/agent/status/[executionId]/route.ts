import { NextRequest, NextResponse } from "next/server";
import { getExecutionStatus, AutoGPTNotConfiguredError } from "@/lib/autogpt";
import { productConfig } from "@/config/product";
import { isSupabaseConfigured } from "@/lib/env";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ executionId: string }> }
) {
  // ── Guard: Supabase must be configured for auth ──────────
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Authentication service is not configured." },
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { executionId } = await params;

  try {
    const result = await getExecutionStatus(
      productConfig.agent.graphId,
      executionId
    );
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof AutoGPTNotConfiguredError) {
      return NextResponse.json(
        { error: "AI agent service is not configured." },
        { status: 503 }
      );
    }
    console.error("AutoGPT status error:", err);
    return NextResponse.json(
      { error: "Failed to get execution status." },
      { status: 500 }
    );
  }
}

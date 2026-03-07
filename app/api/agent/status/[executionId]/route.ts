import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getExecutionStatus } from "@/lib/autogpt";
import { productConfig } from "@/config/product";

export async function GET(
  _req: NextRequest,
  { params }: { params: { executionId: string } }
) {
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

  try {
    const result = await getExecutionStatus(
      productConfig.agent.graphId,
      params.executionId
    );
    return NextResponse.json(result);
  } catch (err) {
    console.error("AutoGPT status error:", err);
    return NextResponse.json(
      { error: "Failed to get execution status." },
      { status: 500 }
    );
  }
}

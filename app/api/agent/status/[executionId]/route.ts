import { NextRequest, NextResponse } from "next/server";
import { createSupabaseRouteClient } from "@/lib/supabase-server";
import { getExecutionStatus } from "@/lib/autogpt";
import { productConfig } from "@/config/product";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ executionId: string }> }
) {
  const supabase = createSupabaseRouteClient(request);

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
    console.error("AutoGPT status error:", err);
    return NextResponse.json(
      { error: "Failed to get execution status." },
      { status: 500 }
    );
  }
}

// File: /app/api/agent/status/[executionId]/route.ts
// Customer polls this for results

import { NextRequest, NextResponse } from "next/server";
import { getExecutionStatus } from "@/lib/autogpt";
import { productConfig } from "@/config/product";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ executionId: string }> }
) {
  const { executionId } = await params;
  const status = await getExecutionStatus(productConfig.agent.graphId, executionId);

  return NextResponse.json(status);
}

import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/webhooks/autogpt
 *
 * Receives completion callbacks from the AutoGPT platform.
 * AutoGPT sends a POST with a JSON body when an agent run finishes.
 *
 * Secure this endpoint by setting AUTOGPT_WEBHOOK_SECRET in your environment
 * and configuring the same secret in the AutoGPT platform webhook settings.
 * AutoGPT will include the secret in the X-AutoGPT-Signature header.
 */

interface AutoGPTWebhookPayload {
  runId: string;
  agentId: string;
  status: "completed" | "failed" | "cancelled";
  output?: string;
  error?: string;
}

export async function POST(request: NextRequest) {
  const secret = process.env.AUTOGPT_WEBHOOK_SECRET;

  // Verify the webhook signature if a secret is configured
  if (secret) {
    const signature = request.headers.get("x-autogpt-signature");
    if (!signature || signature !== secret) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  let payload: AutoGPTWebhookPayload;
  try {
    payload = await request.json() as AutoGPTWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { runId, agentId, status, output, error } = payload;

  if (!runId || !agentId || !status) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // TODO: persist run results to your database, notify the user, etc.
  // Example: await prisma.agentRun.update({ where: { id: runId }, data: { status, output } })

  console.log(`AutoGPT webhook — run ${runId} (agent ${agentId}): ${status}`, {
    output,
    error,
  });

  return NextResponse.json({ received: true });
}

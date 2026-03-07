import { timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendRunCompletedEmail } from "@/lib/email";

/**
 * POST /api/webhooks/autogpt
 *
 * Receives completion callbacks from the AutoGPT platform.
 * AutoGPT sends a POST with a JSON body when an agent run finishes.
 *
 * Requires AUTOGPT_WEBHOOK_SECRET to be set in environment variables.
 * Configure the same secret in the AutoGPT platform webhook settings.
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
  if (!secret) {
    console.error("[webhook] AUTOGPT_WEBHOOK_SECRET is not configured");
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  const signature = request.headers.get("x-autogpt-signature") ?? "";
  const expected = Buffer.from(secret, "utf8");
  const received = Buffer.from(signature, "utf8");
  let valid = false;
  try {
    valid = expected.length === received.length && timingSafeEqual(expected, received);
  } catch {
    valid = false;
  }
  if (!valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: AutoGPTWebhookPayload;
  try {
    payload = await request.json() as AutoGPTWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { runId, agentId, status } = payload;

  if (!runId || !agentId || !status) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Persist run results to the database
  const agentRun = await prisma.agentRun.update({
    where: { execution_id: runId },
    data: {
      status,
      output: output ?? null,
      error: error ?? null,
    },
    include: { user: { select: { email: true } } },
  });

  // Notify the user via email (non-blocking)
  if (status === "completed" || status === "failed") {
    sendRunCompletedEmail(agentRun.user.email, runId, status).catch((err) =>
      console.error("[email] failed to send:", err)
    );
  }

  return NextResponse.json({ received: true });
}

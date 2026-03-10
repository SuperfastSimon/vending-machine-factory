import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock prisma before importing the route
vi.mock("@/lib/prisma", () => ({
  prisma: {
    agentRun: {
      update: vi.fn().mockResolvedValue({
        user: { email: "test@example.com" },
      }),
    },
  },
}));

vi.mock("@/lib/email", () => ({
  sendRunCompletedEmail: vi.fn().mockResolvedValue(undefined),
}));

import { POST } from "@/app/api/webhooks/autogpt/route";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

function makeRequest(body: unknown, headers: Record<string, string> = {}) {
  return new NextRequest("http://localhost:3000/api/webhooks/autogpt", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json", ...headers },
  });
}

const TEST_SECRET = "test-webhook-secret";

describe("POST /api/webhooks/autogpt", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.AUTOGPT_WEBHOOK_SECRET = TEST_SECRET;
  });

  it("returns 400 for invalid JSON", async () => {
    const req = new NextRequest("http://localhost:3000/api/webhooks/autogpt", {
      method: "POST",
      body: "not json",
      headers: { "x-autogpt-signature": TEST_SECRET },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 for missing required fields", async () => {
    const res = await POST(makeRequest({ runId: "r1" }, { "x-autogpt-signature": TEST_SECRET }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Missing required fields");
  });

  it("returns 401 for invalid signature when secret is set", async () => {
    const res = await POST(
      makeRequest(
        { runId: "r1", agentId: "a1", status: "completed" },
        { "x-autogpt-signature": "wrong" }
      )
    );
    expect(res.status).toBe(401);
  });

  it("returns 500 when AUTOGPT_WEBHOOK_SECRET is not configured", async () => {
    delete process.env.AUTOGPT_WEBHOOK_SECRET;
    const res = await POST(makeRequest({ runId: "r1", agentId: "a1", status: "completed" }));
    expect(res.status).toBe(500);
  });

  it("persists run results and returns success", async () => {
    const payload = {
      runId: "run-123",
      agentId: "agent-456",
      status: "completed",
      output: "result text",
    };
    const res = await POST(makeRequest(payload, { "x-autogpt-signature": TEST_SECRET }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.received).toBe(true);
    expect(prisma.agentRun.update).toHaveBeenCalledWith({
      where: { execution_id: "run-123" },
      data: { status: "completed", output: "result text", error: null },
      include: { user: { select: { email: true } } },
    });
  });
});

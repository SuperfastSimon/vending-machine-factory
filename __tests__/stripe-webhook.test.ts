import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Stripe before importing the route
const { mockConstructEvent } = vi.hoisted(() => ({
  mockConstructEvent: vi.fn(),
}));
vi.mock("stripe", () => {
  class MockStripe {
    webhooks = { constructEvent: mockConstructEvent };
  }
  return { default: MockStripe };
});

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      update: vi.fn().mockResolvedValue({}),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      findFirst: vi.fn(),
    },
  },
}));

vi.mock("@/config/product", () => ({
  productConfig: {
    pricing: {
      plans: [
        { id: "free", credits: 5 },
        { id: "pro", credits: 100 },
        { id: "business", credits: 500 },
      ],
    },
  },
}));

import { POST } from "@/app/api/webhooks/stripe/route";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

function makeRequest(body: string, signature: string | null = "sig_test") {
  const headers: Record<string, string> = { "Content-Type": "text/plain" };
  if (signature) headers["stripe-signature"] = signature;
  return new NextRequest("http://localhost:3000/api/webhooks/stripe", {
    method: "POST",
    body,
    headers,
  });
}

describe("POST /api/webhooks/stripe", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 for missing signature", async () => {
    const res = await POST(makeRequest("body", null));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Missing signature");
  });

  it("returns 400 for invalid signature", async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error("Invalid signature");
    });
    const res = await POST(makeRequest("body", "sig_invalid"));
    expect(res.status).toBe(400);
  });

  it("handles checkout.session.completed event", async () => {
    mockConstructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: {
        object: {
          metadata: { userId: "user-1", plan: "pro" },
          customer: "cus_123",
        },
      },
    });

    const res = await POST(makeRequest("body"));
    expect(res.status).toBe(200);
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: {
        plan: "pro",
        credits_remaining: 100,
        stripe_customer_id: "cus_123",
      },
    });
  });

  it("handles customer.subscription.deleted event", async () => {
    mockConstructEvent.mockReturnValue({
      type: "customer.subscription.deleted",
      data: {
        object: { customer: "cus_123" },
      },
    });

    const res = await POST(makeRequest("body"));
    expect(res.status).toBe(200);
    expect(prisma.user.updateMany).toHaveBeenCalledWith({
      where: { stripe_customer_id: "cus_123" },
      data: { plan: "free", credits_remaining: 5 },
    });
  });
});

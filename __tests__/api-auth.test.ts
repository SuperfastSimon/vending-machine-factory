import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

import { authenticateApiKey } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

describe("authenticateApiKey", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null for missing header", async () => {
    expect(await authenticateApiKey(null)).toBeNull();
  });

  it("returns null for non-Bearer header", async () => {
    expect(await authenticateApiKey("Basic abc123")).toBeNull();
  });

  it("returns null for Bearer without vmf_ prefix", async () => {
    expect(await authenticateApiKey("Bearer some_other_key")).toBeNull();
  });

  it("returns null when user not found", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    expect(await authenticateApiKey("Bearer vmf_abc123")).toBeNull();
  });

  it("returns user id for valid API key", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "user-123",
    } as never);
    const result = await authenticateApiKey("Bearer vmf_validkey");
    expect(result).toBe("user-123");
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { api_key: "vmf_validkey" },
      select: { id: true },
    });
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { generateReferralCode, ensureReferralCode, trackReferral } from "@/lib/affiliate";
import { prisma } from "@/lib/prisma";

describe("generateReferralCode", () => {
  it("returns a string starting with ref_", () => {
    const code = generateReferralCode();
    expect(code).toMatch(/^ref_[a-f0-9]{12}$/);
  });

  it("generates unique codes", () => {
    const codes = new Set(Array.from({ length: 10 }, () => generateReferralCode()));
    expect(codes.size).toBe(10);
  });
});

describe("ensureReferralCode", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns existing referral code if user has one", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      referral_code: "ref_existing123",
    } as never);

    const code = await ensureReferralCode("user-1");
    expect(code).toBe("ref_existing123");
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it("generates and saves a new code if user has none", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      referral_code: null,
    } as never);
    vi.mocked(prisma.user.update).mockResolvedValue({} as never);

    const code = await ensureReferralCode("user-1");
    expect(code).toMatch(/^ref_/);
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { referral_code: expect.stringMatching(/^ref_/) },
    });
  });
});

describe("trackReferral", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("links new user to referrer when code is valid", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "referrer-id",
    } as never);
    vi.mocked(prisma.user.update).mockResolvedValue({} as never);

    await trackReferral("new-user-id", "ref_abc123");

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "new-user-id" },
      data: { referred_by: "referrer-id" },
    });
  });

  it("does nothing when referral code is invalid", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    await trackReferral("new-user-id", "ref_invalid");

    expect(prisma.user.update).not.toHaveBeenCalled();
  });
});

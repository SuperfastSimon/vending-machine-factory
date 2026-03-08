import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export function generateReferralCode(): string {
  return `ref_${crypto.randomBytes(6).toString("hex")}`;
}

export async function ensureReferralCode(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { referral_code: true },
  });

  if (user?.referral_code) return user.referral_code;

  const code = generateReferralCode();
  await prisma.user.update({
    where: { id: userId },
    data: { referral_code: code },
  });
  return code;
}

export async function trackReferral(
  newUserId: string,
  referralCode: string
): Promise<void> {
  const referrer = await prisma.user.findUnique({
    where: { referral_code: referralCode },
    select: { id: true },
  });

  if (referrer) {
    await prisma.user.update({
      where: { id: newUserId },
      data: { referred_by: referrer.id },
    });
    console.log(
      `[affiliate] user ${newUserId} referred by ${referrer.id} (code: ${referralCode})`
    );
  }
}

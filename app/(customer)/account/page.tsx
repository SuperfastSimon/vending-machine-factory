import { createSupabaseServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { productConfig } from "@/config/product";
import { ensureReferralCode } from "@/lib/affiliate";
import { headers } from "next/headers";
import ManageSubscriptionButton from "@/components/ManageSubscriptionButton";

export default async function AccountPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  const plan = dbUser?.plan ?? "free";
  const credits = dbUser?.credits_remaining ?? 0;
  const runCount = await prisma.agentRun.count({
    where: { user_id: user.id },
  });

  const referralCode = productConfig.affiliate.enabled
    ? await ensureReferralCode(user.id)
    : null;
  const hdrs = await headers();
  const host = hdrs.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const referralLink = referralCode
    ? `${protocol}://${host}/?ref=${referralCode}`
    : null;

  return (
    <main className="max-w-xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Account</h1>

      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        <Row label="Email" value={user.email ?? "—"} />
        <Row label="Plan" value={plan} capitalize />
        <Row label="Credits remaining" value={String(credits)} />
        <Row label="Total runs" value={String(runCount)} />
        <Row
          label="Member since"
          value={
            dbUser
              ? new Date(dbUser.created_at).toLocaleDateString()
              : "—"
          }
        />
      </div>

      {referralLink && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-2">
          <p className="text-sm font-medium text-gray-900">Referral link</p>
          <p className="text-xs text-gray-500">
            Share this link and earn {productConfig.affiliate.commissionPercent}% commission on referrals.
          </p>
          <code className="block text-xs bg-gray-50 rounded-lg px-3 py-2 text-gray-700 break-all select-all">
            {referralLink}
          </code>
        </div>
      )}

      {plan === "free" ? (
        <a
          href="/pricing"
          className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg text-sm transition-colors"
        >
          Upgrade to {productConfig.pricing.plans[1]?.name ?? "Pro"} →
        </a>
      ) : dbUser?.stripe_customer_id ? (
        <ManageSubscriptionButton />
      ) : null}
    </main>
  );
}

function Row({
  label,
  value,
  capitalize,
}: {
  label: string;
  value: string;
  capitalize?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-4">
      <span className="text-sm text-gray-500">{label}</span>
      <span
        className={`text-sm font-medium text-gray-900 ${
          capitalize ? "capitalize" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { productConfig } from "@/config/product";
import { prisma } from "@/lib/prisma";
import AgentInterface from "@/components/AgentInterface";

export default async function CustomerDashboardPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  const plan = dbUser?.plan ?? "free";
  const credits = dbUser?.credits_remaining ?? 0;
  const currentPlan = productConfig.pricing.plans.find((p) => p.id === plan);

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Plan</p>
          <p className="mt-1 text-lg font-semibold capitalize text-gray-900">{plan}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Credits left</p>
          <p
            className={`mt-1 text-lg font-semibold ${
              credits === 0 ? "text-red-600" : "text-gray-900"
            }`}
          >
            {credits}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Per month</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">
            {currentPlan?.credits ?? 0}
          </p>
        </div>
      </div>

      {/* Upgrade banner */}
      {plan === "free" && (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-white">Upgrade to Pro</p>
            <p className="mt-0.5 text-xs text-indigo-100">
              100 credits/month · priority processing · API access
            </p>
          </div>
          <a
            href="/pricing"
            className="shrink-0 ml-4 bg-white text-indigo-700 text-xs font-semibold px-4 py-2 rounded-lg hover:bg-indigo-50 transition"
          >
            View plans →
          </a>
        </div>
      )}

      {/* AI Interface */}
      <AgentInterface
        credits={credits}
        inputSchema={productConfig.agent.inputSchema}
      />
    </main>
  );
}

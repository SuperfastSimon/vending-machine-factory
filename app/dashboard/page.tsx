import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { productConfig } from "@/config/product";
import AgentInterface from "@/components/AgentInterface";

const prisma = new PrismaClient();

export default async function DashboardPage() {
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  let dbUser = await prisma.user.findUnique({ where: { id: user.id } });

  // Auto-create Prisma user on first login (after Supabase signup)
  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        id: user.id,
        email: user.email!,
        plan: "free",
        credits_remaining: 5,
      },
    });
  }

  const plan = dbUser?.plan ?? "free";
  const credits = dbUser?.credits_remaining ?? 0;
  const currentPlan = productConfig.pricing.plans.find((p) => p.id === plan);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">V</span>
          </div>
          <span className="font-semibold text-gray-900">{productConfig.name}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500 hidden sm:block">{user.email}</span>
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${
              plan === "free"
                ? "bg-gray-100 text-gray-600"
                : plan === "pro"
                ? "bg-indigo-100 text-indigo-700"
                : "bg-purple-100 text-purple-700"
            }`}
          >
            {plan}
          </span>
        </div>
      </header>

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
    </div>
  );
}

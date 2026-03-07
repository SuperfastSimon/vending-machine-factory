import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { productConfig } from "@/config/product";

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

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });

  const plan = dbUser?.plan ?? "free";
  const credits = dbUser?.credits_remaining ?? 0;
  const currentPlan = productConfig.pricing.plans.find((p) => p.id === plan);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <span className="font-semibold text-gray-900">{productConfig.name}</span>
        <span className="text-sm text-gray-500">{user.email}</span>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <p className="text-sm text-gray-500">Plan</p>
            <p className="mt-1 text-xl font-semibold capitalize text-gray-900">{plan}</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <p className="text-sm text-gray-500">Credits remaining</p>
            <p className="mt-1 text-xl font-semibold text-gray-900">{credits}</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <p className="text-sm text-gray-500">Credits per month</p>
            <p className="mt-1 text-xl font-semibold text-gray-900">
              {currentPlan?.credits ?? 0}
            </p>
          </div>
        </div>

        {plan === "free" && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-5 flex items-center justify-between">
            <p className="text-sm text-indigo-800">
              Upgrade to Pro for 100 credits/month and API access.
            </p>
            <a
              href="/pricing"
              className="ml-4 shrink-0 text-sm font-medium text-indigo-600 hover:underline"
            >
              View plans →
            </a>
          </div>
        )}
      </main>
    </div>
  );
}

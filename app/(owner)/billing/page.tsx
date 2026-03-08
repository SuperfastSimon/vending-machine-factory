import { prisma } from "@/lib/prisma";
import { productConfig } from "@/config/product";

export default async function BillingPage() {
  const [planCounts, totalRuns] = await Promise.all([
    prisma.user.groupBy({ by: ["plan"], _count: { _all: true } }),
    prisma.agentRun.count(),
  ]);

  const planMap = Object.fromEntries(
    planCounts.map((p) => [p.plan, p._count._all])
  );

  const monthlyRevenue = productConfig.pricing.plans.reduce((sum, plan) => {
    const userCount = planMap[plan.id] ?? 0;
    return sum + plan.price * userCount;
  }, 0);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Billing</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Est. Monthly Revenue</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
            {productConfig.pricing.currency} {monthlyRevenue.toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Total Runs</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{totalRuns}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Paying Customers</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
            {(planMap["pro"] ?? 0) + (planMap["business"] ?? 0)}
          </p>
        </div>
      </div>

      {/* Revenue breakdown */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Revenue Breakdown</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {productConfig.pricing.plans.map((plan) => {
            const count = planMap[plan.id] ?? 0;
            return (
              <div
                key={plan.id}
                className="flex items-center justify-between px-5 py-4"
              >
                <div>
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {plan.name}
                  </span>
                  <span className="ml-2 text-xs text-gray-400">
                    {count} user{count !== 1 ? "s" : ""}
                  </span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {productConfig.pricing.currency}{" "}
                  {(plan.price * count).toFixed(2)}/mo
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-gray-400">
        Revenue is estimated from plan subscriptions. For actual payouts, check
        your{" "}
        <a
          href="https://dashboard.stripe.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-600 underline"
        >
          Stripe Dashboard
        </a>
        .
      </p>
    </div>
  );
}

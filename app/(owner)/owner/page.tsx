import { prisma } from "@/lib/prisma";
import { productConfig } from "@/config/product";
import RunsChart from "@/components/RunsChart";
import StatusBadge from "@/components/StatusBadge";

export default async function OwnerDashboardPage() {
  const [users, planCounts, recentRuns, runStats] = await Promise.all([
    prisma.user.findMany({ orderBy: { created_at: "desc" }, take: 10 }),
    prisma.user.groupBy({ by: ["plan"], _count: { _all: true } }),
    prisma.agentRun.findMany({
      orderBy: { created_at: "desc" },
      take: 10,
      include: { user: { select: { email: true } } },
    }),
    prisma.agentRun.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const totalUsers = planCounts.reduce((sum, p) => sum + p._count._all, 0);
  const totalCredits = (
    await prisma.user.aggregate({ _sum: { credits_remaining: true } })
  )._sum.credits_remaining ?? 0;

  const planMap = Object.fromEntries(
    planCounts.map((p) => [p.plan, p._count._all])
  );
  const runStatMap = Object.fromEntries(
    runStats.map((r) => [r.status, r._count._all])
  );

  // Build daily run counts for the last 14 days
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const dailyRuns = await prisma.agentRun.findMany({
    where: { created_at: { gte: fourteenDaysAgo } },
    select: { created_at: true },
  });

  const runsByDay: Record<string, number> = {};
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    runsByDay[d.toISOString().slice(0, 10)] = 0;
  }
  for (const run of dailyRuns) {
    const day = run.created_at.toISOString().slice(0, 10);
    if (day in runsByDay) runsByDay[day]++;
  }

  const chartData = Object.entries(runsByDay).map(([date, runs]) => ({
    date: date.slice(5), // MM-DD
    runs,
  }));

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total users" value={totalUsers} />
        {productConfig.pricing.plans.map((plan) => (
          <StatCard
            key={plan.id}
            label={`${plan.name} users`}
            value={planMap[plan.id] ?? 0}
          />
        ))}
        <StatCard label="Credits outstanding" value={totalCredits} />
        <StatCard label="Completed runs" value={runStatMap["completed"] ?? 0} />
        <StatCard label="Failed runs" value={runStatMap["failed"] ?? 0} />
      </div>

      {/* Runs chart */}
      <RunsChart data={chartData} />

      {/* Recent agent runs */}
      <section className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Recent Agent Runs</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-5 py-3 font-medium">User</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentRuns.map((run) => (
                <tr key={run.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 text-gray-900">{run.user.email}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={run.status} />
                  </td>
                  <td className="px-5 py-3 text-gray-500">
                    {new Date(run.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
              {recentRuns.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-5 py-8 text-center text-gray-400">
                    No runs yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* User table */}
      <section className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Recent Users</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Plan</th>
                <th className="px-5 py-3 font-medium">Credits</th>
                <th className="px-5 py-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 text-gray-900">{u.email}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-medium capitalize ${
                        u.plan === "business"
                          ? "bg-purple-100 text-purple-700"
                          : u.plan === "pro"
                          ? "bg-indigo-100 text-indigo-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {u.plan}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-700">{u.credits_remaining}</td>
                  <td className="px-5 py-3 text-gray-500">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}


import { prisma } from "@/lib/prisma";
import { availableAgents } from "@/config/product";

export default async function AgentsPage() {
  const agentEntries = Object.entries(availableAgents);

  // Get run counts per agent
  const runCounts = await prisma.agentRun.groupBy({
    by: ["agent_id"],
    _count: { _all: true },
  });
  const countMap = Object.fromEntries(
    runCounts.map((r) => [r.agent_id, r._count._all])
  );

  // Get recent runs across all agents
  const recentRuns = await prisma.agentRun.findMany({
    orderBy: { created_at: "desc" },
    take: 10,
    include: { user: { select: { email: true } } },
  });

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Agents</h1>

      {/* Agent cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {agentEntries.map(([slug, agent]) => (
          <div
            key={slug}
            className="bg-white rounded-lg border border-gray-200 p-5 space-y-3"
          >
            <h3 className="font-semibold text-gray-900 capitalize text-sm">
              {slug.replace(/-/g, " ")}
            </h3>
            <div className="space-y-1 text-xs text-gray-500">
              <p>
                Graph:{" "}
                <code className="text-gray-600 font-mono">
                  {agent.graphId.slice(0, 8)}...
                </code>
              </p>
              <p>
                Runs:{" "}
                <span className="font-medium text-gray-900">
                  {countMap[agent.graphId] ?? 0}
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent runs table */}
      <section className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">
            Recent Runs (All Agents)
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-5 py-3 font-medium">User</th>
                <th className="px-5 py-3 font-medium">Agent</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentRuns.map((run) => (
                <tr key={run.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 text-gray-900">
                    {run.user.email}
                  </td>
                  <td className="px-5 py-3 text-gray-500 font-mono text-xs">
                    {run.agent_id.slice(0, 8)}...
                  </td>
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
                  <td
                    colSpan={4}
                    className="px-5 py-8 text-center text-gray-400"
                  >
                    No runs yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    completed: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700",
    queued: "bg-yellow-100 text-yellow-700",
    running: "bg-blue-100 text-blue-700",
  };
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded text-xs font-medium capitalize ${
        styles[status] ?? "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
}

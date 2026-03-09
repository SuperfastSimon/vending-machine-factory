import { createSupabaseServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import StatusBadge from "@/components/StatusBadge";

export default async function HistoryPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const runs = await prisma.agentRun.findMany({
    where: { user_id: user.id },
    orderBy: { created_at: "desc" },
    take: 50,
  });

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Run History</h1>

      {runs.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
          No runs yet. Go to your{" "}
          <a href="/dashboard" className="text-indigo-600 underline">
            dashboard
          </a>{" "}
          to start.
        </div>
      ) : (
        <div className="space-y-3">
          {runs.map((run) => (
            <div
              key={run.id}
              className="bg-white rounded-xl border border-gray-200 p-5 space-y-2"
            >
              <div className="flex items-center justify-between">
                <StatusBadge status={run.status} />
                <span className="text-xs text-gray-400">
                  {new Date(run.created_at).toLocaleString()}
                </span>
              </div>
              {run.output && (
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans max-h-40 overflow-y-auto bg-gray-50 rounded-lg p-3">
                  {run.output.length > 500
                    ? run.output.slice(0, 500) + "…"
                    : run.output}
                </pre>
              )}
              {run.error && (
                <p className="text-sm text-red-600">{run.error}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}


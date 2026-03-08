import { createSupabaseServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

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

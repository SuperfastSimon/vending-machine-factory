import { prisma } from "@/lib/prisma";

export default async function CustomersPage() {
  const users = await prisma.user.findMany({
    orderBy: { created_at: "desc" },
    include: { _count: { select: { agent_runs: true } } },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Customers</h1>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Plan</th>
                <th className="px-5 py-3 font-medium">Credits</th>
                <th className="px-5 py-3 font-medium">Runs</th>
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
                  <td className="px-5 py-3 text-gray-700">{u._count.agent_runs}</td>
                  <td className="px-5 py-3 text-gray-500">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-gray-400">
                    No customers yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

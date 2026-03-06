import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { productConfig } from "@/config/product";

const prisma = new PrismaClient();

export default async function OwnerPage() {
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

  const ownerEmail = process.env.OWNER_EMAIL;
  if (!ownerEmail || user.email !== ownerEmail) redirect("/dashboard");

  const [users, planCounts] = await Promise.all([
    prisma.user.findMany({ orderBy: { created_at: "desc" } }),
    prisma.user.groupBy({ by: ["plan"], _count: { _all: true } }),
  ]);

  const totalCredits = users.reduce((sum, u) => sum + u.credits_remaining, 0);

  const planMap = Object.fromEntries(
    planCounts.map((p) => [p.plan, p._count._all])
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <span className="font-semibold text-gray-900">{productConfig.name} — Owner</span>
        <span className="text-sm text-gray-500">{user.email}</span>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <p className="text-sm text-gray-500">Total users</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{users.length}</p>
          </div>
          {productConfig.pricing.plans.map((plan) => (
            <div key={plan.id} className="bg-white rounded-lg border border-gray-200 p-5">
              <p className="text-sm text-gray-500 capitalize">{plan.name} users</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {planMap[plan.id] ?? 0}
              </p>
            </div>
          ))}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <p className="text-sm text-gray-500">Credits outstanding</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{totalCredits}</p>
          </div>
        </div>

        {/* User table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">All Users</h2>
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
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium capitalize ${
                        u.plan === "business"
                          ? "bg-purple-100 text-purple-700"
                          : u.plan === "pro"
                          ? "bg-indigo-100 text-indigo-700"
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {u.plan}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-700">{u.credits_remaining}</td>
                    <td className="px-5 py-3 text-gray-500">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-gray-400">
                      No users yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

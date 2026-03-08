import { createSupabaseServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { productConfig } from "@/config/product";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/history", label: "History" },
  { href: "/account", label: "Account" },
];

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  let dbUser = await prisma.user.findUnique({ where: { id: user.id } });
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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">V</span>
            </div>
            <span className="font-semibold text-gray-900">{productConfig.name}</span>
          </div>
          <nav className="hidden sm:flex items-center gap-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500 hidden sm:block">{user.email}</span>
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${
              dbUser.plan === "free"
                ? "bg-gray-100 text-gray-600"
                : dbUser.plan === "pro"
                ? "bg-indigo-100 text-indigo-700"
                : "bg-purple-100 text-purple-700"
            }`}
          >
            {dbUser.plan}
          </span>
        </div>
      </header>
      {children}
    </div>
  );
}

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { productConfig, availableAgents } from "@/config/product";
import AgentInterface from "@/components/AgentInterface";

type AgentKey = keyof typeof availableAgents;

export default async function ProductPage({
  params,
}: {
  params: Promise<{ product: string }>;
}) {
  const { product } = await params;

  const agent = availableAgents[product as AgentKey];
  if (!agent) notFound();

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  const credits = dbUser?.credits_remaining ?? 0;

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <h1 className="text-xl font-bold text-gray-900 capitalize">
        {product.replace(/-/g, " ")}
      </h1>
      <AgentInterface
        credits={credits}
        inputSchema={productConfig.agent.inputSchema}
      />
    </main>
  );
}

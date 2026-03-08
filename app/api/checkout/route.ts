import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import Stripe from "stripe";
import { productConfig } from "@/config/product";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export async function POST(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(_name: string, _value: string) {},
        remove(_name: string) {},
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { planId?: string };
  const plan = productConfig.pricing.plans.find((p) => p.id === body.planId);

  if (!plan || plan.price === 0) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: user.email ?? undefined,
    line_items: [
      {
        price_data: {
          currency: productConfig.pricing.currency.toLowerCase(),
          product_data: { name: `${productConfig.name} — ${plan.name}` },
          unit_amount: plan.price * 100,
          recurring: { interval: "month" },
        },
        quantity: 1,
      },
    ],
    metadata: { userId: user.id, plan: plan.id },
    success_url: `${request.nextUrl.origin}/dashboard?upgraded=true`,
    cancel_url: `${request.nextUrl.origin}/pricing`,
  });

  return NextResponse.json({ url: session.url });
}

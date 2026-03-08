import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { productConfig } from "@/config/product";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

const creditsForPlan: Record<string, number> = Object.fromEntries(
  productConfig.pricing.plans.map((p) => [p.id, p.credits])
);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("[stripe webhook] signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const plan = session.metadata?.plan;
      if (userId && plan) {
        const stripeCustomerId =
          typeof session.customer === "string" ? session.customer : null;
        await prisma.user.update({
          where: { id: userId },
          data: {
            plan,
            credits_remaining: creditsForPlan[plan] ?? 5,
            ...(stripeCustomerId && { stripe_customer_id: stripeCustomerId }),
          },
        });
        console.log(`[stripe] user ${userId} upgraded to ${plan}`);
      }
      break;
    }

    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;
      const user = await prisma.user.findFirst({
        where: { stripe_customer_id: customerId },
      });
      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: { credits_remaining: creditsForPlan[user.plan] ?? 5 },
        });
        console.log(`[stripe] credits refreshed for user ${user.id}`);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      await prisma.user.updateMany({
        where: { stripe_customer_id: customerId },
        data: { plan: "free", credits_remaining: 5 },
      });
      console.log(`[stripe] subscription cancelled for customer ${customerId}`);
      break;
    }
  }

  return NextResponse.json({ received: true });
}

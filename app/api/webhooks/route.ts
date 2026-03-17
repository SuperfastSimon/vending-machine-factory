import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { createClient } from '../../../lib/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
});

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get('stripe-signature')!;

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    const supabase = await createClient();

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      await supabase
        .from('customers')
        .update({ subscription_tier: 'premium' })
        .eq('stripe_customer_id', session.customer);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    return NextResponse.json({ error: 'Webhook Error' }, { status: 400 });
  }
}

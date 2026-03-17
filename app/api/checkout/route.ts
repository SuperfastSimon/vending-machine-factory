import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createSupabaseServerClient } from '@/lib/supabase-server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
});

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });
    }

    // SECURITY FIX: Veilig JSON parsen. Crasht niet als de body leeg is.
    let priceId = process.env.STRIPE_PREMIUM_PRICE_ID;
    try {
      const body = await req.json();
      if (body && body.priceId) priceId = body.priceId;
    } catch (e) {
      // Geen geldige JSON body, we vallen veilig terug op de default Premium Price ID
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'ideal'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/app/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      customer_email: user.email,
      metadata: { supabase_user_id: user.id },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe Security/Config Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

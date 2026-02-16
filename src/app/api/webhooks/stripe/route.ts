import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { env } from '@/lib/env';
import { createAdminClient } from '@/lib/supabase/admin';
import type Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  const stripe = getStripe();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Stripe webhook signature verification failed:', message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const appId = session.metadata?.app_id;
    const unlockedBy = session.metadata?.unlocked_by;

    if (!appId || !unlockedBy) {
      console.error('Stripe webhook: missing metadata', { appId, unlockedBy });
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
    }

    const admin = createAdminClient();

    const { error } = await admin.from('app_unlocks').insert({
      app_id: appId,
      unlocked_by: unlockedBy,
      stripe_checkout_session_id: session.id,
      stripe_payment_intent_id: typeof session.payment_intent === 'string' ? session.payment_intent : null,
      amount_cents: session.amount_total || 0,
      currency: session.currency || 'usd',
    });

    if (error) {
      // UNIQUE constraint violation means duplicate delivery — treat as success
      if (error.code === '23505') {
        return NextResponse.json({ received: true, duplicate: true });
      }
      console.error('Stripe webhook: failed to insert app_unlock', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}

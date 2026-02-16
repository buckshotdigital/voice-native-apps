'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getStripe } from '@/lib/stripe';
import { UNLOCK_PRICE_CENTS } from '@/lib/constants';
import type { InterestTimelinePoint, InterestCountryBreakdown, InterestedUser } from '@/types';

export async function createCheckoutSession(appId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be signed in.' };
  }

  // Verify ownership
  const { data: app } = await supabase
    .from('apps')
    .select('id, name, submitted_by')
    .eq('id', appId)
    .maybeSingle();

  if (!app || app.submitted_by !== user.id) {
    return { error: 'App not found or you do not have permission.' };
  }

  // Check if already unlocked
  const { data: existing } = await supabase
    .from('app_unlocks')
    .select('id')
    .eq('app_id', appId)
    .maybeSingle();

  if (existing) {
    return { error: 'This app is already unlocked.' };
  }

  const stripe = getStripe();
  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'https://voicenativeapps.com';

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Unlock Interest Data — ${app.name}`,
            description: 'Access the full list of interested users with emails and CSV export.',
          },
          unit_amount: UNLOCK_PRICE_CENTS,
        },
        quantity: 1,
      },
    ],
    metadata: {
      app_id: appId,
      unlocked_by: user.id,
    },
    success_url: `${origin}/dashboard/interests/${appId}?unlocked=true`,
    cancel_url: `${origin}/dashboard/interests/${appId}?cancelled=true`,
  });

  return { url: session.url };
}

export async function getInterestAnalytics(appId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be signed in.' };
  }

  // Verify ownership
  const { data: app } = await supabase
    .from('apps')
    .select('id, name, submitted_by, interest_count, is_coming_soon')
    .eq('id', appId)
    .maybeSingle();

  if (!app || app.submitted_by !== user.id) {
    return { error: 'App not found or you do not have permission.' };
  }

  // Use admin client for RPCs (execution revoked from authenticated role)
  const adminClient = createAdminClient();

  // Fetch timeline, countries, and unlock status in parallel
  const [timelineResult, countriesResult, unlockResult] = await Promise.all([
    adminClient.rpc('get_interest_timeline', { p_app_id: appId }),
    adminClient.rpc('get_interest_countries', { p_app_id: appId }),
    supabase.from('app_unlocks').select('id').eq('app_id', appId).maybeSingle(),
  ]);

  return {
    app: { id: app.id, name: app.name, interest_count: app.interest_count, is_coming_soon: app.is_coming_soon },
    timeline: (timelineResult.data || []) as InterestTimelinePoint[],
    countries: (countriesResult.data || []) as InterestCountryBreakdown[],
    isUnlocked: !!unlockResult.data,
  };
}

export async function getInterestedUsers(appId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be signed in.' };
  }

  // Verify ownership
  const { data: app } = await supabase
    .from('apps')
    .select('id, submitted_by')
    .eq('id', appId)
    .maybeSingle();

  if (!app || app.submitted_by !== user.id) {
    return { error: 'App not found or you do not have permission.' };
  }

  // Verify payment
  const { data: unlock } = await supabase
    .from('app_unlocks')
    .select('id')
    .eq('app_id', appId)
    .maybeSingle();

  if (!unlock) {
    return { error: 'You must unlock this app to access interested users.' };
  }

  // Use admin client for RPC (execution revoked from authenticated role)
  const adminClient = createAdminClient();
  const { data: users, error } = await adminClient.rpc('get_interested_users', { p_app_id: appId });

  if (error) {
    return { error: 'Failed to fetch interested users.' };
  }

  return { users: (users || []) as InterestedUser[] };
}

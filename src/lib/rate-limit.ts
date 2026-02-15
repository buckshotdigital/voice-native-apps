/**
 * Database-backed rate limiter using Supabase RPC.
 * Works across all serverless instances (unlike in-memory Map).
 * Falls back to allowing the request if the DB call fails,
 * to avoid blocking legitimate users on transient errors.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

export async function rateLimit(
  supabase: SupabaseClient,
  key: string,
  { maxRequests, windowSeconds }: { maxRequests: number; windowSeconds: number }
): Promise<{ success: boolean }> {
  try {
    const { data: allowed, error } = await supabase.rpc('check_rate_limit', {
      p_key: key,
      p_max_requests: maxRequests,
      p_window_seconds: windowSeconds,
    });

    if (error) {
      console.error('Rate limit check failed:', error.message);
      return { success: true }; // fail-open on DB errors
    }

    return { success: !!allowed };
  } catch (e) {
    console.error('Rate limit error:', e);
    return { success: true }; // fail-open
  }
}

'use server';

import { createClient } from '@/lib/supabase/server';
import { reportSchema } from '@/lib/validations';
import { rateLimit } from '@/lib/rate-limit';

export async function submitReport(data: { app_id: string; reason: string; details: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be signed in to report an app.' };
  }

  // Rate limit: 5 reports per 10 minutes per user
  const rl = rateLimit(`report:${user.id}`, { maxRequests: 5, windowMs: 10 * 60 * 1000 });
  if (!rl.success) {
    return { error: 'Too many reports. Please wait a few minutes and try again.' };
  }

  const parsed = reportSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  // Check for duplicate report from same user
  const { data: existingReport } = await supabase
    .from('reports')
    .select('id')
    .eq('app_id', parsed.data.app_id)
    .eq('reporter_id', user.id)
    .eq('status', 'pending')
    .limit(1);

  if (existingReport && existingReport.length > 0) {
    return { error: 'You have already reported this app. Our team will review it.' };
  }

  const { error } = await supabase.from('reports').insert({
    app_id: parsed.data.app_id,
    reporter_id: user.id,
    reason: parsed.data.reason,
    details: parsed.data.details,
  });

  if (error) {
    return { error: 'Failed to submit report. Please try again.' };
  }

  return { success: true };
}

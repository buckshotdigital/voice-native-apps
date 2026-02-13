'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated', supabase: null, user: null };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return { error: 'Not authorized', supabase: null, user: null };
  }

  return { error: null, supabase, user };
}

export async function approveApp(appId: string) {
  const { error: authError, supabase } = await requireAdmin();
  if (authError || !supabase) return { error: authError };

  const { error } = await supabase
    .from('apps')
    .update({ status: 'approved', rejection_reason: null })
    .eq('id', appId);

  if (error) return { error: 'Failed to approve app.' };

  revalidatePath('/admin');
  revalidatePath('/apps');
  return { success: true };
}

export async function rejectApp(appId: string, reason: string) {
  const { error: authError, supabase } = await requireAdmin();
  if (authError || !supabase) return { error: authError };

  if (!reason || reason.trim().length < 5) {
    return { error: 'Please provide a rejection reason (at least 5 characters).' };
  }

  const { error } = await supabase
    .from('apps')
    .update({ status: 'rejected', rejection_reason: reason.trim() })
    .eq('id', appId);

  if (error) return { error: 'Failed to reject app.' };

  revalidatePath('/admin');
  return { success: true };
}

export async function toggleFeatured(appId: string) {
  const { error: authError, supabase } = await requireAdmin();
  if (authError || !supabase) return { error: authError };

  const { data: app } = await supabase
    .from('apps')
    .select('featured')
    .eq('id', appId)
    .single();

  if (!app) return { error: 'App not found.' };

  const { error } = await supabase
    .from('apps')
    .update({ featured: !app.featured })
    .eq('id', appId);

  if (error) return { error: 'Failed to update featured status.' };

  revalidatePath('/admin');
  revalidatePath('/apps');
  revalidatePath('/');
  return { success: true };
}

export async function resolveReport(reportId: string, status: 'resolved' | 'dismissed') {
  const { error: authError, supabase } = await requireAdmin();
  if (authError || !supabase) return { error: authError };

  const { error } = await supabase
    .from('reports')
    .update({ status })
    .eq('id', reportId);

  if (error) return { error: 'Failed to update report.' };

  revalidatePath('/admin');
  return { success: true };
}

'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { submitAppSchema } from '@/lib/validations';
import { MAX_SUBMISSIONS_PER_DAY } from '@/lib/constants';
import { slugify } from '@/lib/utils';
import { revalidatePath } from 'next/cache';
import { rateLimit } from '@/lib/rate-limit';

export async function submitApp(data: Record<string, unknown>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be signed in to submit an app.' };
  }

  // Rate limit: 5 submissions per 10 minutes per user
  const rl = rateLimit(`submit:${user.id}`, { maxRequests: 5, windowMs: 10 * 60 * 1000 });
  if (!rl.success) {
    return { error: 'Too many submissions. Please wait a few minutes and try again.' };
  }

  // Honeypot check
  if (data.website2) {
    // Silently reject bots — return success to avoid detection
    return { success: true, id: 'fake' };
  }

  // Validate input
  const parsed = submitAppSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const input = parsed.data;

  // Rate limit check
  const { data: profile } = await supabase
    .from('profiles')
    .select('submissions_today, last_submission_date')
    .eq('id', user.id)
    .maybeSingle();

  if (profile) {
    const today = new Date().toISOString().split('T')[0];
    const isToday = profile.last_submission_date === today;
    const todayCount = isToday ? profile.submissions_today : 0;

    if (todayCount >= MAX_SUBMISSIONS_PER_DAY) {
      return { error: `You can submit a maximum of ${MAX_SUBMISSIONS_PER_DAY} apps per day. Please try again tomorrow.` };
    }
  }

  // Duplicate check by website URL
  const { data: existing } = await supabase
    .from('apps')
    .select('id, name')
    .eq('website_url', input.website_url)
    .limit(1);

  if (existing && existing.length > 0) {
    return { error: `An app with this website URL already exists: "${existing[0].name}".` };
  }

  // Duplicate check by similar name
  const adminClient = createAdminClient();
  const { data: similarApps } = await adminClient
    .from('apps')
    .select('id, name')
    .ilike('name', input.name)
    .limit(1);

  if (similarApps && similarApps.length > 0) {
    return { error: `An app with a similar name already exists: "${similarApps[0].name}".` };
  }

  // Clean optional URL fields — convert empty strings to null
  const cleanUrl = (url?: string) => (url && url.trim() !== '' ? url.trim() : null);

  // Generate slug with uniqueness check
  let slug = slugify(input.name);
  const { data: existingSlug } = await adminClient.from('apps').select('id').eq('slug', slug).maybeSingle();
  if (existingSlug) {
    // Append timestamp suffix for uniqueness
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  // Insert the app
  const { data: newApp, error: insertError } = await supabase.from('apps').insert({
    submitted_by: user.id,
    name: input.name.trim(),
    slug,
    tagline: input.tagline.trim(),
    description: input.description.trim(),
    category_id: input.category_id,
    voice_features: input.voice_features,
    platforms: input.platforms,
    website_url: input.website_url.trim(),
    app_store_url: cleanUrl(input.app_store_url),
    play_store_url: cleanUrl(input.play_store_url),
    other_download_url: cleanUrl(input.other_download_url),
    demo_video_url: cleanUrl(input.demo_video_url),
    pricing_model: input.pricing_model,
    pricing_details: input.pricing_details?.trim() || null,
    logo_url: (data.logo_url as string) || '',
    screenshot_urls: (data.screenshot_urls as string[]) || [],
    status: 'pending',
  }).select('id').single();

  if (insertError) {
    return { error: 'Failed to submit app. Please try again.' };
  }

  // Handle tags
  try {
    if (input.tags && input.tags.length > 0) {
      for (const tagName of input.tags) {
        const tagSlug = slugify(tagName);
        // Upsert tag
        const { data: tag } = await supabase
          .from('tags')
          .upsert({ name: tagName.toLowerCase().trim(), slug: tagSlug }, { onConflict: 'slug' })
          .select('id')
          .single();

        if (tag && newApp) {
          await supabase.from('app_tags').insert({ app_id: newApp.id, tag_id: tag.id });
        }
      }
    }
  } catch (tagError) {
    console.error('Tag creation failed:', tagError);
    // Tags are non-critical — app is already created, continue
  }

  // Update rate limit counter
  const today = new Date().toISOString().split('T')[0];
  const isToday = profile?.last_submission_date === today;

  await supabase.from('profiles').update({
    submissions_today: isToday ? (profile?.submissions_today || 0) + 1 : 1,
    last_submission_date: today,
  }).eq('id', user.id);

  revalidatePath('/dashboard');
  return { success: true, id: newApp?.id };
}

export async function updateApp(appId: string, data: Record<string, unknown>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be signed in.' };
  }

  // Check ownership
  const { data: app } = await supabase
    .from('apps')
    .select('id, submitted_by, status')
    .eq('id', appId)
    .maybeSingle();

  if (!app || app.submitted_by !== user.id) {
    return { error: 'App not found or you do not have permission to edit it.' };
  }

  if (app.status === 'approved') {
    return { error: 'Approved apps cannot be edited. Contact an admin if changes are needed.' };
  }

  const parsed = submitAppSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const input = parsed.data;
  const cleanUrl = (url?: string) => (url && url.trim() !== '' ? url.trim() : null);

  const { error: updateError } = await supabase
    .from('apps')
    .update({
      name: input.name.trim(),
      tagline: input.tagline.trim(),
      description: input.description.trim(),
      category_id: input.category_id,
      voice_features: input.voice_features,
      platforms: input.platforms,
      website_url: input.website_url.trim(),
      app_store_url: cleanUrl(input.app_store_url),
      play_store_url: cleanUrl(input.play_store_url),
      other_download_url: cleanUrl(input.other_download_url),
      demo_video_url: cleanUrl(input.demo_video_url),
      pricing_model: input.pricing_model,
      pricing_details: input.pricing_details?.trim() || null,
      logo_url: (data.logo_url as string) || '',
      screenshot_urls: (data.screenshot_urls as string[]) || [],
      status: 'pending', // Re-submit for review
    })
    .eq('id', appId);

  if (updateError) {
    return { error: 'Failed to update app. Please try again.' };
  }

  revalidatePath('/dashboard');
  return { success: true };
}

export async function toggleUpvote(appId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be signed in to upvote.' };
  }

  // Rate limit: 30 upvote toggles per minute per user
  const rl = rateLimit(`upvote:${user.id}`, { maxRequests: 30, windowMs: 60 * 1000 });
  if (!rl.success) {
    return { error: 'Too many requests. Please slow down.' };
  }

  // Check if already upvoted
  const { data: existing } = await supabase
    .from('upvotes')
    .select('user_id')
    .eq('user_id', user.id)
    .eq('app_id', appId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from('upvotes')
      .delete()
      .eq('user_id', user.id)
      .eq('app_id', appId);

    if (error) return { error: 'Failed to remove upvote.' };
  } else {
    const { error } = await supabase
      .from('upvotes')
      .insert({ user_id: user.id, app_id: appId });

    if (error) return { error: 'Failed to upvote.' };
  }

  revalidatePath(`/apps`);
  return { success: true };
}

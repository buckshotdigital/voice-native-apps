'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { submitAppSchema, countryCodeSchema } from '@/lib/validations';
import { MAX_SUBMISSIONS_PER_DAY } from '@/lib/constants';
import { slugify } from '@/lib/utils';
import { revalidatePath } from 'next/cache';
import { rateLimit } from '@/lib/rate-limit';

/** Validate that a URL points to our Supabase storage bucket */
function isValidStorageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:'
      && parsed.hostname.endsWith('.supabase.co')
      && parsed.pathname.startsWith('/storage/v1/object/public/app-assets/');
  } catch {
    return false;
  }
}

export async function submitApp(data: Record<string, unknown>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be signed in to submit an app.' };
  }

  // Rate limit: 5 submissions per 10 minutes per user
  const rl = await rateLimit(supabase, `submit:${user.id}`, { maxRequests: 5, windowSeconds: 600 });
  if (!rl.success) {
    return { error: 'Too many submissions. Please wait a few minutes and try again.' };
  }

  // Honeypot check
  if (data.website2) {
    return { success: true, id: 'fake' };
  }

  // Validate input
  const parsed = submitAppSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const input = parsed.data;

  // Server-side validation of uploaded image URLs
  const logoUrl = (data.logo_url as string) || '';
  if (logoUrl && !isValidStorageUrl(logoUrl)) {
    return { error: 'Invalid logo URL. Please upload an image using the form.' };
  }

  const screenshotUrls = (data.screenshot_urls as string[]) || [];
  for (const url of screenshotUrls) {
    if (!isValidStorageUrl(url)) {
      return { error: 'Invalid screenshot URL. Please upload images using the form.' };
    }
  }

  // Atomic daily submission check — prevents race condition (Finding 4)
  const { data: allowed, error: quotaError } = await supabase.rpc(
    'check_and_increment_submissions',
    { p_user_id: user.id, p_max_submissions: MAX_SUBMISSIONS_PER_DAY }
  );

  if (quotaError) {
    console.error('Submission quota check failed:', quotaError.message);
    return { error: 'Unable to verify submission quota. Please try again.' };
  }

  if (!allowed) {
    return { error: `You can submit a maximum of ${MAX_SUBMISSIONS_PER_DAY} apps per day. Please try again tomorrow.` };
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
    is_coming_soon: input.is_coming_soon || false,
    expected_launch_date: input.is_coming_soon && input.expected_launch_date ? input.expected_launch_date : null,
    logo_url: logoUrl,
    screenshot_urls: screenshotUrls,
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
  }

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

  // Server-side validation of uploaded image URLs
  const logoUrl = (data.logo_url as string) || '';
  if (logoUrl && !isValidStorageUrl(logoUrl)) {
    return { error: 'Invalid logo URL. Please upload an image using the form.' };
  }

  const screenshotUrls = (data.screenshot_urls as string[]) || [];
  for (const url of screenshotUrls) {
    if (!isValidStorageUrl(url)) {
      return { error: 'Invalid screenshot URL. Please upload images using the form.' };
    }
  }

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
      is_coming_soon: input.is_coming_soon || false,
      expected_launch_date: input.is_coming_soon && input.expected_launch_date ? input.expected_launch_date : null,
      logo_url: logoUrl,
      screenshot_urls: screenshotUrls,
      status: 'pending',
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
  const rl = await rateLimit(supabase, `upvote:${user.id}`, { maxRequests: 30, windowSeconds: 60 });
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



export async function toggleInterest(appId: string, country?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be signed in.' };
  }

  // Rate limit: 30 interest toggles per minute per user
  const rl = await rateLimit(supabase, `interest:${user.id}`, { maxRequests: 30, windowSeconds: 60 });
  if (!rl.success) {
    return { error: 'Too many requests. Please slow down.' };
  }

  // Validate country code if provided
  const validCountry = country && countryCodeSchema.safeParse(country).success ? country : null;

  // Check if already interested
  const { data: existing } = await supabase
    .from('app_interests')
    .select('user_id')
    .eq('user_id', user.id)
    .eq('app_id', appId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from('app_interests')
      .delete()
      .eq('user_id', user.id)
      .eq('app_id', appId);

    if (error) return { error: 'Failed to remove interest.' };
  } else {
    const { error } = await supabase
      .from('app_interests')
      .insert({ user_id: user.id, app_id: appId, country: validCountry });

    if (error) return { error: 'Failed to express interest.' };
  }

  revalidatePath(`/apps`);
  return { success: true };
}

export async function launchApp(appId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be signed in.' };
  }

  // Check ownership
  const { data: app } = await supabase
    .from('apps')
    .select('id, submitted_by, is_coming_soon')
    .eq('id', appId)
    .maybeSingle();

  if (!app || app.submitted_by !== user.id) {
    return { error: 'App not found or you do not have permission.' };
  }

  if (!app.is_coming_soon) {
    return { error: 'This app is not marked as coming soon.' };
  }

  const { error } = await supabase
    .from('apps')
    .update({ is_coming_soon: false })
    .eq('id', appId);

  if (error) return { error: 'Failed to launch app.' };

  revalidatePath('/dashboard');
  revalidatePath('/apps');
  revalidatePath('/');
  return { success: true };
}

'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { authSchema, signUpSchema } from '@/lib/validations';
import { rateLimit } from '@/lib/rate-limit';

export async function signUp(formData: FormData) {
  const email = (formData.get('email') as string) || '';
  const supabase = await createClient();

  // Rate limit: 5 signup attempts per 15 minutes per email
  const rl = await rateLimit(supabase, `signup:${email.toLowerCase()}`, { maxRequests: 5, windowSeconds: 900 });
  if (!rl.success) {
    return { error: 'Too many signup attempts. Please wait a few minutes and try again.' };
  }

  const raw = {
    email,
    password: formData.get('password') as string,
    display_name: formData.get('display_name') as string,
  };

  const parsed = signUpSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { display_name: parsed.data.display_name },
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: 'Check your email to confirm your account.' };
}

export async function signIn(formData: FormData) {
  const email = (formData.get('email') as string) || '';
  const supabase = await createClient();

  // Rate limit: 10 login attempts per 15 minutes per email
  const rl = await rateLimit(supabase, `signin:${email.toLowerCase()}`, { maxRequests: 10, windowSeconds: 900 });
  if (!rl.success) {
    return { error: 'Too many login attempts. Please wait a few minutes and try again.' };
  }

  const raw = {
    email,
    password: formData.get('password') as string,
  };

  const parsed = authSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: error.message };
  }

  const redirectTo = formData.get('redirect') as string;
  // Validate redirect is an internal path to prevent open redirect attacks
  const safePath = redirectTo && redirectTo.startsWith('/') && !redirectTo.startsWith('//') ? redirectTo : '/dashboard';
  // Return redirect URL instead of calling redirect() so the client can do
  // a full page navigation, ensuring the Header component picks up the new session.
  return { redirect: safePath };
}

export async function signInWithOAuth(provider: 'google' | 'github') {
  const supabase = await createClient();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) {
    return { error: 'Site URL not configured. Please contact support.' };
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${siteUrl}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.url) {
    redirect(data.url);
  }
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return { redirect: '/' };
}

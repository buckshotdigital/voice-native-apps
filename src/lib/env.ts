/**
 * Environment variable validation — imported by Supabase clients to fail fast
 * with clear error messages instead of cryptic runtime crashes.
 */

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
      `Check your .env.local file or Vercel environment settings.`
    );
  }
  return value;
}

export const env = {
  get SUPABASE_URL() {
    return requireEnv('NEXT_PUBLIC_SUPABASE_URL');
  },
  get SUPABASE_ANON_KEY() {
    return requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  },
  get SUPABASE_SERVICE_ROLE_KEY() {
    return requireEnv('SUPABASE_SERVICE_ROLE_KEY');
  },
  get STRIPE_SECRET_KEY() {
    return requireEnv('STRIPE_SECRET_KEY');
  },
  get STRIPE_WEBHOOK_SECRET() {
    return requireEnv('STRIPE_WEBHOOK_SECRET');
  },
} as const;

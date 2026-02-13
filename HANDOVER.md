# VoiceNative Directory — Handover

## What This Is
A curated directory/marketplace for voice-native applications. Users browse, search, and submit voice-first apps. Admin approval required before listings go live.

## Live URLs
- **Vercel**: https://voice-native-apps.vercel.app
- **Supabase Project**: `wllwzzmubsqzovrrucgk` (us-east-1)
- **Supabase Dashboard**: https://supabase.com/dashboard/project/wllwzzmubsqzovrrucgk

## Stack
- **Frontend**: Next.js 16 (App Router, Turbopack) + Tailwind CSS v4
- **Backend**: Supabase (Auth, Postgres with RLS, Storage)
- **Hosting**: Vercel (production)
- **Validation**: Zod v4

## Admin User
- **Email**: info@bdsalesinc.ca — has `role: admin` in profiles table
- Access `/admin` for approval queue, reports, stats

## Environment Variables
All set in both `.env.local` (local) and Vercel dashboard (production):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL`

## Database Migrations (in order)
1. `001_initial_schema.sql` — Full schema: profiles, categories, apps, tags, app_tags, upvotes, reports, triggers, seed data, storage bucket
2. `002_fix_rls_recursion.sql` — `is_admin()` security definer function to fix infinite recursion in admin RLS policies
3. `003_fix_profile_trigger.sql` — Fixed `handle_new_user()` trigger: added `set search_path = public`, handle nullable email

## Key Design Decisions
- **Monochrome design system** with single accent color (#0066ff) — CSS custom properties in globals.css
- **Category icons**: Lucide SVG icons (not emojis) — mapped in `src/components/ui/CategoryIcon.tsx`, stored as string names in DB (`zap`, `heart-pulse`, `home`, etc.)
- **Logo**: Animated wave bars (5 bars with staggered CSS animation), keyframe `wave` defined in globals.css
- **Anti-gaming**: Honeypot fields, rate limiting (daily submission counter), URL validation, duplicate detection, required voice features

## Project Structure
```
src/
├── actions/          # Server actions (apps, auth, admin, reports)
├── app/              # Pages (home, apps, admin, dashboard, auth, submit)
├── components/
│   ├── apps/         # AppCard, AppGrid, ScreenshotCarousel, PlatformBadges, PricingBadge
│   ├── auth/         # AuthForm
│   ├── forms/        # SubmitAppForm, ImageUploader, TagInput
│   ├── layout/       # Header (with wave logo), Footer
│   ├── search/       # SearchBar, FilterPanel, SortDropdown
│   └── ui/           # CategoryIcon, StatusBadge, LoadingSpinner, UpvoteButton, ReportDialog
├── lib/
│   ├── supabase/     # client.ts, server.ts, admin.ts
│   ├── constants.ts
│   ├── utils.ts
│   └── validations.ts
└── types/            # TypeScript interfaces
```

## Deploy Commands
```bash
# Local dev
npm run dev

# Push DB migrations
npx supabase db push

# Deploy to Vercel
npx vercel --prod --yes
```

## Pending / TODO
- **Google OAuth**: Need to create OAuth credentials in Google Cloud Console, add client ID + secret to Supabase Auth providers. Callback URL: `https://wllwzzmubsqzovrrucgk.supabase.co/auth/v1/callback`
- **GitHub OAuth**: Need to create OAuth App in GitHub Developer Settings, add client ID + secret to Supabase Auth providers. Same callback URL.
- **Supabase email confirmation**: Currently may still be enabled — toggle off in Supabase Dashboard → Auth → Providers → Email → "Confirm email" for easier dev testing
- **Test user cleanup**: `testdevuser99@gmail.com` was created during testing — can be deleted from Supabase Auth dashboard
- **Add real app listings**: No approved apps yet, just the categories and schema
- **Custom domain**: Currently on `voice-native-apps.vercel.app` — can add custom domain in Vercel settings when ready

## Known Issues / Notes
- Zod v4 uses `.issues` not `.errors` — already fixed everywhere
- RLS infinite recursion fixed via `is_admin()` security definer function
- `NEXT_PUBLIC_SITE_URL` on Vercel is set to the Vercel URL — update if custom domain is added
- Email rate limit: Supabase limits to ~4 confirmation emails/hour — disable email confirmation for dev
- The `signInWithOAuth` redirect URL uses `NEXT_PUBLIC_SITE_URL` env var — make sure it matches the actual domain

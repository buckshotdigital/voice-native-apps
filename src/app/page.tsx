import Link from 'next/link';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import AppGrid from '@/components/apps/AppGrid';
import CategoryIcon from '@/components/ui/CategoryIcon';
import { ArrowRight } from 'lucide-react';
import {
  generateOrganizationSchema,
  generateWebSiteSchema,
  generateFAQSchema,
} from '@/lib/structured-data';

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createClient();
  const { count: totalApps } = await supabase
    .from('apps')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved');
  const { count: categoryCount } = await supabase
    .from('categories')
    .select('*', { count: 'exact', head: true });

  const appCount = totalApps || 100;
  const catCount = categoryCount || 10;

  return {
    title: {
      absolute: `Best ${appCount}+ Voice Apps in ${catCount} Categories (2026) - Free Directory`,
    },
    description: `Discover ${appCount}+ curated voice-native apps across ${catCount} categories. Voice assistants, smart home apps, AI tools, and more. Compare features side-by-side and find your perfect voice app.`,
    alternates: { canonical: '/' },
  };
}

export default async function HomePage() {
  const supabase = await createClient();

  const { data: featuredApps } = await supabase
    .from('apps')
    .select('*, category:categories(*)')
    .eq('status', 'approved')
    .eq('featured', true)
    .order('upvote_count', { ascending: false })
    .limit(10);

  const { data: comingSoonApps } = await supabase
    .from('apps')
    .select('*, category:categories(*)')
    .eq('status', 'approved')
    .eq('is_coming_soon', true)
    .order('interest_count', { ascending: false })
    .limit(6);

  const { data: latestApps } = await supabase
    .from('apps')
    .select('*, category:categories(*)')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(6);

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('display_order');

  const { count: totalApps } = await supabase
    .from('apps')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved');

  // Get current user + their upvotes/interests for displayed apps
  const { data: { user } } = await supabase.auth.getUser();
  const allDisplayedIds = [
    ...(featuredApps || []).map((a) => a.id),
    ...(comingSoonApps || []).map((a) => a.id),
    ...(latestApps || []).map((a) => a.id),
  ];
  let userUpvotedIds = new Set<string>();
  let userInterestedIds = new Set<string>();
  if (user && allDisplayedIds.length > 0) {
    const { data: upvotes } = await supabase
      .from('upvotes')
      .select('app_id')
      .eq('user_id', user.id)
      .in('app_id', allDisplayedIds);
    if (upvotes) {
      userUpvotedIds = new Set(upvotes.map((u) => u.app_id));
    }

    const comingSoonIds = (comingSoonApps || []).map((a) => a.id);
    if (comingSoonIds.length > 0) {
      const { data: interests } = await supabase
        .from('app_interests')
        .select('app_id')
        .eq('user_id', user.id)
        .in('app_id', comingSoonIds);
      if (interests) {
        userInterestedIds = new Set(interests.map((i) => i.app_id));
      }
    }
  }

  return (
    <div>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateWebSiteSchema()),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateOrganizationSchema()),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateFAQSchema([
            {
              question: 'What is a voice-native app?',
              answer: 'A voice-native app is an application designed with voice as the primary interface, not an afterthought. These apps use speech recognition, natural language processing, and conversational AI to let users interact through voice commands, dictation, or full conversations.',
            },
            {
              question: 'How many voice-native apps are listed?',
              answer: `VoiceNative Directory currently lists ${totalApps || 100}+ curated voice-first applications across ${categories?.length || 10} categories including voice assistants, smart home control, accessibility tools, and more.`,
            },
            {
              question: 'Is VoiceNative Directory free to use?',
              answer: 'Yes, browsing and searching the VoiceNative Directory is completely free. You can discover, compare, and find voice-first apps without any cost.',
            },
          ])),
        }}
      />

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-16 sm:px-6 sm:pt-28">
        <div className="max-w-2xl">
          <p className="text-[13px] font-medium tracking-wide text-muted uppercase">
            Voice-native app directory
          </p>
          <h1 className="mt-4 text-[clamp(1.875rem,5vw,3.5rem)] font-bold leading-[1.1] tracking-tight text-foreground">
            Discover apps built
            <br />
            for voice first.
          </h1>
          <p className="mt-5 max-w-lg text-[17px] leading-relaxed text-muted">
            A curated directory of applications that treat voice as the primary
            interface, not an afterthought. Browse, search, and find what&apos;s next.
          </p>

          {/* Search */}
          <div className="mt-8 max-w-md">
            <form action="/apps" method="get">
              <div className="relative">
                <svg className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                <input
                  type="text"
                  name="q"
                  placeholder="Search apps..."
                  className="w-full rounded-lg border bg-white py-2.5 pl-10 pr-4 text-[14px] text-foreground placeholder:text-muted/60 focus:border-foreground/20 focus:outline-none focus:ring-2 focus:ring-foreground/5"
                />
              </div>
            </form>
          </div>

          {/* Stat */}
          <p className="mt-6 text-[13px] text-muted">
            {totalApps || 0} apps listed across {categories?.length || 0} categories
          </p>
        </div>
      </section>

      {/* About — GEO: fact-rich paragraph for AI extraction */}
      <section className="border-t bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
          <h2 className="text-[13px] font-medium tracking-wide text-muted uppercase">About VoiceNative Directory</h2>
          <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-foreground/80">
            VoiceNative Directory is a curated collection of {totalApps || 0} voice-first applications
            across {categories?.length || 0} categories including voice assistants, smart home control,
            accessibility tools, and conversational AI. Each app is reviewed for quality and genuine
            voice-native interaction before listing. The directory helps users discover apps that treat
            voice as the primary interface — from voice commands and dictation to full conversational
            experiences — across platforms like iOS, Android, Web, macOS, and smart speakers.
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="border-t bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
          <div className="flex items-baseline justify-between">
            <h2 className="text-[13px] font-medium tracking-wide text-muted uppercase">Categories</h2>
            <Link href="/apps" className="flex items-center gap-1 text-[13px] font-medium text-muted transition-colors hover:text-foreground">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-3 md:grid-cols-5">
            {categories?.map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="flex flex-col items-center gap-2 bg-white px-4 py-5 text-center transition-colors hover:bg-surface"
              >
                <CategoryIcon icon={cat.icon} className="h-5 w-5 text-muted" />
                <span className="text-[13px] font-medium text-foreground">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured */}
      {featuredApps && featuredApps.length > 0 && (
        <section className="border-t">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
            <h2 className="text-[13px] font-medium tracking-wide text-muted uppercase">Featured</h2>
            <p className="mt-1 text-[15px] text-foreground">Hand-picked by our team</p>
            <div className="mt-8">
              <AppGrid apps={featuredApps} userId={user?.id} userUpvotedIds={userUpvotedIds} userInterestedIds={userInterestedIds} />
            </div>
          </div>
        </section>
      )}

      {/* Coming Soon */}
      {comingSoonApps && comingSoonApps.length > 0 && (
        <section className="border-t bg-white">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
            <h2 className="text-[13px] font-medium tracking-wide text-muted uppercase">Coming Soon</h2>
            <p className="mt-1 text-[15px] text-foreground">Upcoming voice-native apps — express your interest</p>
            <div className="mt-8">
              <AppGrid apps={comingSoonApps} userId={user?.id} userUpvotedIds={userUpvotedIds} userInterestedIds={userInterestedIds} />
            </div>
          </div>
        </section>
      )}

      {/* Latest */}
      <section className="border-t bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
          <div className="flex items-baseline justify-between">
            <div>
              <h2 className="text-[13px] font-medium tracking-wide text-muted uppercase">Recently added</h2>
              <p className="mt-1 text-[15px] text-foreground">The newest voice-native apps</p>
            </div>
            <Link href="/apps?sort=newest" className="flex items-center gap-1 text-[13px] font-medium text-muted transition-colors hover:text-foreground">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="mt-8">
            <AppGrid apps={latestApps || []} emptyMessage="No apps listed yet. Be the first to submit one." userId={user?.id} userUpvotedIds={userUpvotedIds} userInterestedIds={userInterestedIds} />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-14 text-center sm:px-6 sm:py-20">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Built something voice-native?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[15px] text-muted">
            Get your app in front of people who are actively looking for voice-first experiences.
          </p>
          <Link
            href="/submit"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-foreground px-5 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-foreground/80"
          >
            Submit your app
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
}

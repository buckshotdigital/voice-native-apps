import Link from 'next/link';
import type { Metadata } from 'next';
import {
  getCategories,
  getFeaturedApps,
  getComingSoonApps,
  getLatestApps,
  totalAppCount,
} from '@/lib/catalog';
import AppGrid from '@/components/apps/AppGrid';
import CategoryIcon from '@/components/ui/CategoryIcon';
import { ArrowRight } from 'lucide-react';
import {
  generateOrganizationSchema,
  generateWebSiteSchema,
  generateFAQSchema,
} from '@/lib/structured-data';

export function generateMetadata(): Metadata {
  const appCount = totalAppCount();
  const catCount = getCategories().length;

  return {
    title: {
      absolute: `Best ${appCount}+ Voice Apps in ${catCount} Categories (2026) - Free Directory`,
    },
    description: `Discover ${appCount}+ curated voice-native apps across ${catCount} categories. Voice assistants, smart home apps, AI tools, and more. Compare features side-by-side and find your perfect voice app.`,
    alternates: { canonical: '/' },
  };
}

export default function HomePage() {
  const featuredApps = getFeaturedApps(10);
  const comingSoonApps = getComingSoonApps(6);
  const latestApps = getLatestApps(6);
  const categories = getCategories();
  const totalApps = totalAppCount();

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
              answer: `VoiceNative Directory currently lists ${totalApps}+ curated voice-first applications across ${categories.length} categories including voice assistants, smart home control, accessibility tools, and more.`,
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
            {totalApps} apps listed across {categories.length} categories
          </p>
        </div>
      </section>

      {/* About — GEO: fact-rich paragraph for AI extraction */}
      <section className="border-t bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
          <h2 className="text-[13px] font-medium tracking-wide text-muted uppercase">About VoiceNative Directory</h2>
          <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-foreground/80">
            VoiceNative Directory is a curated collection of {totalApps} voice-first applications
            across {categories.length} categories including voice assistants, smart home control,
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
            {categories.map((cat) => (
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
      {featuredApps.length > 0 && (
        <section className="border-t">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
            <h2 className="text-[13px] font-medium tracking-wide text-muted uppercase">Featured</h2>
            <p className="mt-1 text-[15px] text-foreground">Hand-picked by our team</p>
            <div className="mt-8">
              <AppGrid apps={featuredApps} />
            </div>
          </div>
        </section>
      )}

      {/* Coming Soon */}
      {comingSoonApps.length > 0 && (
        <section className="border-t bg-white">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
            <h2 className="text-[13px] font-medium tracking-wide text-muted uppercase">Coming Soon</h2>
            <p className="mt-1 text-[15px] text-foreground">Upcoming voice-native apps</p>
            <div className="mt-8">
              <AppGrid apps={comingSoonApps} />
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
            <AppGrid apps={latestApps} emptyMessage="No apps listed yet." />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-14 text-center sm:px-6 sm:py-20">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Find your next voice-first app
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[15px] text-muted">
            Browse {totalApps} curated voice-native apps across {categories.length} categories.
          </p>
          <Link
            href="/apps"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-foreground px-5 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-foreground/80"
          >
            Browse the directory
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
}

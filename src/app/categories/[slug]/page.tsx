import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import AppGrid from '@/components/apps/AppGrid';
import CategoryIcon from '@/components/ui/CategoryIcon';
import { ArrowRight } from 'lucide-react';
import { PLATFORMS } from '@/lib/constants';
import type { Metadata } from 'next';
import {
  generateCollectionPageSchema,
  generateBreadcrumbSchema,
  generateItemListSchema,
  generateFAQSchema,
} from '@/lib/structured-data';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://voicenativeapps.com';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: category } = await supabase
    .from('categories')
    .select('name, description, id')
    .eq('slug', slug)
    .single();

  if (!category) return { title: 'Category Not Found' };

  const { count: appCount } = await supabase
    .from('apps')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved')
    .eq('category_id', category.id);

  const count = appCount || 0;
  const title = count > 0
    ? `Top ${count} ${category.name} Voice Apps (2026) - Compare Free & Paid`
    : `${category.name} Voice Apps (2026) - Compare Free & Paid`;
  const description = `Compare ${count > 0 ? `${count}+ ` : ''}voice-native ${category.name.toLowerCase()} apps. ${category.description} See ratings, pricing, and platform support.`;

  return {
    title,
    description,
    alternates: { canonical: `/categories/${slug}` },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!category) notFound();

  // Get app count for this category
  const { count: appCount } = await supabase
    .from('apps')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved')
    .eq('category_id', category.id);

  // Get top 12 apps in this category
  const { data: apps } = await supabase
    .from('apps')
    .select('*, category:categories(*)')
    .eq('status', 'approved')
    .eq('category_id', category.id)
    .order('upvote_count', { ascending: false })
    .limit(12);

  // Get current user + their upvotes/interests
  const { data: { user } } = await supabase.auth.getUser();
  let userUpvotedIds = new Set<string>();
  let userInterestedIds = new Set<string>();
  if (user && apps && apps.length > 0) {
    const appIds = apps.map((a) => a.id);
    const { data: upvotes } = await supabase
      .from('upvotes')
      .select('app_id')
      .eq('user_id', user.id)
      .in('app_id', appIds);
    if (upvotes) {
      userUpvotedIds = new Set(upvotes.map((u) => u.app_id));
    }

    const comingSoonIds = apps.filter((a) => a.is_coming_soon).map((a) => a.id);
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

  // Build FAQ data
  const topApps = (apps || []).slice(0, 3).map((a) => a.name);
  const freeApps = (apps || []).filter((a) => a.pricing_model === 'free' || a.pricing_model === 'freemium');
  const allPlatforms = new Set((apps || []).flatMap((a) => a.platforms));
  const platformNames = Array.from(allPlatforms)
    .map((p: string) => PLATFORMS.find((pl) => pl.value === p)?.label)
    .filter(Boolean);

  const faqItems = [
    {
      question: `What are the best ${category.name} voice apps?`,
      answer: topApps.length > 0
        ? `Some of the top-rated ${category.name.toLowerCase()} voice apps include ${topApps.join(', ')}. Browse the full list above to compare features and pricing.`
        : `Browse our curated directory to discover the best ${category.name.toLowerCase()} voice apps.`,
    },
    {
      question: `Are there free ${category.name} voice apps?`,
      answer: freeApps.length > 0
        ? `Yes, there are ${freeApps.length} free or freemium ${category.name.toLowerCase()} voice apps available, including ${freeApps.slice(0, 3).map((a) => a.name).join(', ')}.`
        : `Currently most ${category.name.toLowerCase()} voice apps offer paid plans. Check each listing for pricing details and free trial availability.`,
    },
    {
      question: `What platforms support ${category.name} voice apps?`,
      answer: platformNames.length > 0
        ? `${category.name} voice apps are available on ${platformNames.join(', ')}. Use the directory filters to find apps for your specific platform.`
        : `${category.name} voice apps are available across various platforms. Browse the listings above to see platform availability for each app.`,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateCollectionPageSchema(appCount || 0, category.name)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            generateBreadcrumbSchema([
              { name: 'Home', url: SITE_URL },
              { name: 'Directory', url: `${SITE_URL}/apps` },
              { name: category.name, url: `${SITE_URL}/categories/${slug}` },
            ]),
          ),
        }}
      />
      {apps && apps.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              generateItemListSchema(
                apps.map((app) => ({
                  name: app.name,
                  url: `${SITE_URL}/apps/${app.slug}`,
                })),
                `Best ${category.name} Voice Apps`,
              ),
            ),
          }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateFAQSchema(faqItems)),
        }}
      />

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface">
            <CategoryIcon icon={category.icon} className="h-5 w-5 text-muted" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{category.name}</h1>
            <p className="mt-0.5 text-[14px] text-muted">
              {appCount || 0} voice-native app{appCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        {category.description && (
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-foreground/80">
            {category.description}
          </p>
        )}
      </div>

      {/* Apps */}
      <AppGrid
        apps={apps || []}
        emptyMessage={`No apps in ${category.name} yet.`}
        userId={user?.id}
        userUpvotedIds={userUpvotedIds}
        userInterestedIds={userInterestedIds}
      />

      {/* View all link */}
      {(appCount || 0) > 12 && (
        <div className="mt-10 text-center">
          <Link
            href={`/apps?category=${slug}`}
            className="inline-flex items-center gap-1.5 rounded-lg border px-5 py-2.5 text-[14px] font-medium text-foreground transition-colors hover:bg-surface"
          >
            View all {appCount} apps
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {/* FAQ Section */}
      <section className="mt-16 border-t pt-10">
        <h2 className="text-lg font-bold tracking-tight text-foreground">
          Frequently Asked Questions
        </h2>
        <dl className="mt-6 space-y-6">
          {faqItems.map((faq) => (
            <div key={faq.question}>
              <dt className="text-[15px] font-semibold text-foreground">
                {faq.question}
              </dt>
              <dd className="mt-2 text-[14px] leading-relaxed text-muted">
                {faq.answer}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}

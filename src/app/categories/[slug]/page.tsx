import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import AppGrid from '@/components/apps/AppGrid';
import CategoryIcon from '@/components/ui/CategoryIcon';
import { ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import {
  generateCollectionPageSchema,
  generateBreadcrumbSchema,
  generateItemListSchema,
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
    ? `Best ${category.name} Voice Apps (${count}+ Listed) - 2026`
    : `${category.name} Voice Apps - 2026`;
  const description = `Compare ${count > 0 ? `${count}+ ` : ''}voice-native ${category.name.toLowerCase()} apps. ${category.description} Find the right voice-first tool for your needs.`;

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
    </div>
  );
}

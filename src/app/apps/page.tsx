import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import AppGrid from '@/components/apps/AppGrid';
import SearchBar from '@/components/search/SearchBar';
import FilterPanel from '@/components/search/FilterPanel';
import SortDropdown from '@/components/search/SortDropdown';
import type { Metadata } from 'next';
import {
  generateCollectionPageSchema,
  generateBreadcrumbSchema,
} from '@/lib/structured-data';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://voicenativeapps.com';

type SearchParams = {
  q?: string;
  category?: string;
  platform?: string;
  pricing?: string;
  sort?: string;
  page?: string;
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const params = await searchParams;
  const hasFilters = params.q || params.category || params.platform || params.pricing;

  const parts: string[] = [];
  if (params.q) parts.push(`"${params.q}"`);
  if (params.category) parts.push(params.category);
  if (params.platform) parts.push(params.platform);
  if (params.pricing) parts.push(params.pricing);

  const supabase = await createClient();
  const { count: totalCount } = await supabase
    .from('apps')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved');
  const appTotal = totalCount || 100;

  const description = hasFilters
    ? `Browse voice-native apps filtered by ${parts.join(', ')}. Compare features, pricing, and platforms.`
    : `Search and compare ${appTotal}+ voice-native apps by category, platform, and pricing. Free and paid voice-first tools for iOS, Android, Web, and more. Filter by platform and price to find your ideal tool.`;

  return {
    title: hasFilters
      ? `${parts.join(', ')} Voice Apps`
      : `Browse ${appTotal}+ Voice Apps - Compare Features & Pricing (2026)`,
    description,
    alternates: { canonical: '/apps' },
    ...(hasFilters || (params.page && parseInt(params.page) > 1)
      ? { robots: { index: false, follow: true } }
      : {}),
  };
}

export default async function BrowseAppsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('display_order');

  let query = supabase
    .from('apps')
    .select('*, category:categories(*)', { count: 'exact' })
    .eq('status', 'approved');

  if (params.q) {
    const q = `%${params.q}%`;
    query = query.or(`name.ilike.${q},tagline.ilike.${q}`);
  }

  if (params.category) {
    const cat = categories?.find((c) => c.slug === params.category);
    if (cat) query = query.eq('category_id', cat.id);
  }

  if (params.platform) {
    query = query.contains('platforms', [params.platform]);
  }

  if (params.pricing) {
    query = query.eq('pricing_model', params.pricing);
  }

  switch (params.sort) {
    case 'popular':
      query = query.order('upvote_count', { ascending: false });
      break;
    case 'name':
      query = query.order('name', { ascending: true });
      break;
    default:
      query = query.order('created_at', { ascending: false });
      break;
  }

  const page = Math.max(1, parseInt(params.page || '1'));
  const perPage = 12;
  const from = (page - 1) * perPage;
  query = query.range(from, from + perPage - 1);

  const { data: apps, count } = await query;
  const totalPages = Math.ceil((count || 0) / perPage);

  // Get current user + their upvotes/interests for displayed apps
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
          __html: JSON.stringify(generateCollectionPageSchema(count || 0)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            generateBreadcrumbSchema([
              { name: 'Home', url: SITE_URL },
              { name: 'Directory', url: `${SITE_URL}/apps` },
            ]),
          ),
        }}
      />

      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Directory</h1>
        <p className="mt-1 text-[14px] text-muted">
          {count || 0} voice-native app{count !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="flex flex-col gap-10 lg:flex-row">
        {/* Sidebar */}
        <aside className="w-full flex-shrink-0 lg:w-52">
          <Suspense fallback={null}>
            <FilterPanel categories={categories || []} />
          </Suspense>
        </aside>

        {/* Main */}
        <div className="flex-1">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <Suspense fallback={null}>
                <SearchBar />
              </Suspense>
            </div>
            <Suspense fallback={null}>
              <SortDropdown />
            </Suspense>
          </div>

          <AppGrid apps={apps || []} emptyMessage="No apps match your search." userId={user?.id} userUpvotedIds={userUpvotedIds} userInterestedIds={userInterestedIds} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-3">
              {page > 1 && (
                <a
                  href={`/apps?${new URLSearchParams({ ...params, page: String(page - 1) }).toString()}`}
                  className="rounded-md border px-3.5 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:bg-surface"
                >
                  Previous
                </a>
              )}
              <span className="text-[13px] text-muted">
                {page} / {totalPages}
              </span>
              {page < totalPages && (
                <a
                  href={`/apps?${new URLSearchParams({ ...params, page: String(page + 1) }).toString()}`}
                  className="rounded-md border px-3.5 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:bg-surface"
                >
                  Next
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

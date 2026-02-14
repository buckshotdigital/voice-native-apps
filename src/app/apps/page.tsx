import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import AppGrid from '@/components/apps/AppGrid';
import SearchBar from '@/components/search/SearchBar';
import FilterPanel from '@/components/search/FilterPanel';
import SortDropdown from '@/components/search/SortDropdown';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Directory - VoiceNative',
  description: 'Search and filter voice-native applications.',
};

export default async function BrowseAppsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    platform?: string;
    pricing?: string;
    sort?: string;
    page?: string;
  }>;
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
    query = query.textSearch('search_vector', params.q, { type: 'websearch' });
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

  // Get current user + their upvotes for displayed apps
  const { data: { user } } = await supabase.auth.getUser();
  let userUpvotedIds = new Set<string>();
  if (user && apps && apps.length > 0) {
    const { data: upvotes } = await supabase
      .from('upvotes')
      .select('app_id')
      .eq('user_id', user.id)
      .in('app_id', apps.map((a) => a.id));
    if (upvotes) {
      userUpvotedIds = new Set(upvotes.map((u) => u.app_id));
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
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

          <AppGrid apps={apps || []} emptyMessage="No apps match your search." userId={user?.id} userUpvotedIds={userUpvotedIds} />

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

import catalogData from '@/data/catalog.json';
import type { App, Category, Tag } from '@/types';

// Static, build-time catalog. Sourced from a one-time export of the
// (now-retired) Supabase project. See scripts/export/build_catalog.py.

const categories = (catalogData.categories as unknown as Category[])
  .slice()
  .sort((a, b) => a.display_order - b.display_order);

const categoriesById = new Map(categories.map((c) => [c.id, c]));

const apps: App[] = (catalogData.apps as unknown as App[]).map((a) => ({
  ...a,
  category: categoriesById.get(a.category_id),
}));

function byCreatedDesc(a: App, b: App): number {
  const av = a.created_at || '';
  const bv = b.created_at || '';
  return bv > av ? 1 : bv < av ? -1 : 0;
}

export function getCategories(): Category[] {
  return categories;
}

export function getCategoryBySlug(slug: string): Category | null {
  return categories.find((c) => c.slug === slug) ?? null;
}

export function getAllApps(): App[] {
  return apps;
}

export function getAppBySlug(slug: string): App | null {
  return apps.find((a) => a.slug === slug) ?? null;
}

export function totalAppCount(): number {
  return apps.length;
}

export function countAppsInCategory(categoryId: string): number {
  return apps.filter((a) => a.category_id === categoryId).length;
}

export function getFeaturedApps(limit = 10): App[] {
  return apps
    .filter((a) => a.featured && !a.is_coming_soon)
    .sort((a, b) => b.upvote_count - a.upvote_count)
    .slice(0, limit);
}

export function getComingSoonApps(limit = 6): App[] {
  return apps
    .filter((a) => a.is_coming_soon)
    .sort((a, b) => b.interest_count - a.interest_count)
    .slice(0, limit);
}

export function getLatestApps(limit = 6): App[] {
  return apps.slice().sort(byCreatedDesc).slice(0, limit);
}

export function getCategoryApps(categoryId: string, limit = 12): App[] {
  return apps
    .filter((a) => a.category_id === categoryId)
    .sort((a, b) => b.upvote_count - a.upvote_count)
    .slice(0, limit);
}

export function getAppTags(app: App): Tag[] {
  return (app.tags as Tag[] | undefined) ?? [];
}

export type BrowseParams = {
  q?: string;
  category?: string;
  platform?: string;
  pricing?: string;
  sort?: string;
  page?: string;
};

export function browseApps(
  params: BrowseParams,
  perPage = 12,
): { apps: App[]; count: number; page: number; totalPages: number } {
  let list = apps.slice();

  if (params.q) {
    const q = params.q.toLowerCase();
    list = list.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.tagline.toLowerCase().includes(q),
    );
  }

  if (params.category) {
    const cat = getCategoryBySlug(params.category);
    if (cat) list = list.filter((a) => a.category_id === cat.id);
    else list = [];
  }

  if (params.platform) {
    list = list.filter((a) =>
      (a.platforms as string[]).includes(params.platform as string),
    );
  }

  if (params.pricing) {
    list = list.filter((a) => a.pricing_model === params.pricing);
  }

  switch (params.sort) {
    case 'popular':
      list.sort((a, b) => b.upvote_count - a.upvote_count);
      break;
    case 'name':
      list.sort((a, b) => a.name.localeCompare(b.name));
      break;
    default:
      list.sort(byCreatedDesc);
      break;
  }

  const count = list.length;
  const page = Math.max(1, parseInt(params.page || '1', 10) || 1);
  const from = (page - 1) * perPage;
  const pageApps = list.slice(from, from + perPage);

  return { apps: pageApps, count, page, totalPages: Math.ceil(count / perPage) };
}

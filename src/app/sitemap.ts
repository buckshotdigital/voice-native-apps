import type { MetadataRoute } from 'next';
import { createAdminClient } from '@/lib/supabase/admin';

const BASE_URL = 'https://voice-native-apps.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createAdminClient();

  const { data: apps } = await supabase
    .from('apps')
    .select('slug, updated_at')
    .eq('status', 'approved');

  const { data: categories } = await supabase
    .from('categories')
    .select('slug');

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/apps`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = (categories || []).map((cat) => ({
    url: `${BASE_URL}/apps?category=${cat.slug}`,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const appRoutes: MetadataRoute.Sitemap = (apps || []).map((app) => ({
    url: `${BASE_URL}/apps/${app.slug}`,
    lastModified: app.updated_at ? new Date(app.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...categoryRoutes, ...appRoutes];
}

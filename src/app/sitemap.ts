import type { MetadataRoute } from 'next';
import { getAllApps, getCategories } from '@/lib/catalog';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://voicenativeapps.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const apps = getAllApps();
  const categories = getCategories();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/apps`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/terms`, changeFrequency: 'monthly' as const, priority: 0.3 },
    { url: `${BASE_URL}/privacy`, changeFrequency: 'monthly' as const, priority: 0.3 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${BASE_URL}/categories/${cat.slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const appRoutes: MetadataRoute.Sitemap = apps.map((app) => ({
    url: `${BASE_URL}/apps/${app.slug}`,
    lastModified: app.created_at ? new Date(app.created_at) : undefined,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...categoryRoutes, ...appRoutes];
}

import type { App, Category } from '@/types';
import { PLATFORMS, PRICING_MODELS } from '@/lib/constants';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://voicenativeapps.com';

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'VoiceNative Directory',
    url: SITE_URL,
    logo: `${SITE_URL}/icon.svg`,
    description:
      'The curated directory for voice-native applications. Browse, search, and discover apps that put voice interaction first.',
  };
}

export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'VoiceNative Directory',
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/apps?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function generateCollectionPageSchema(
  count: number,
  categoryName?: string,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: categoryName
      ? `${categoryName} Voice-Native Apps`
      : 'Voice-Native App Directory',
    description: categoryName
      ? `Browse ${count} voice-native applications in ${categoryName}.`
      : `Browse ${count} curated voice-native applications.`,
    url: SITE_URL + (categoryName ? `/categories/${categoryName.toLowerCase().replace(/\s+/g, '-')}` : '/apps'),
    numberOfItems: count,
  };
}

export function generateSoftwareApplicationSchema(
  app: App & { category?: Category },
) {
  const platformLabels = app.platforms
    .map((p) => PLATFORMS.find((pl) => pl.value === p)?.label)
    .filter(Boolean);

  const pricingLabel =
    PRICING_MODELS.find((m) => m.value === app.pricing_model)?.label || app.pricing_model;

  const offers: Record<string, string> = {
    '@type': 'Offer',
    price: app.pricing_model === 'free' ? '0' : '',
    priceCurrency: 'USD',
    category: pricingLabel,
  };
  if (app.pricing_model === 'free') {
    offers.price = '0';
  }

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: app.name,
    description: app.tagline,
    url: `${SITE_URL}/apps/${app.slug}`,
    applicationCategory: app.category?.name || 'Utility',
    operatingSystem: platformLabels.join(', '),
    offers,
    featureList: app.voice_features.join(', '),
    keywords: app.voice_features.join(', '),
    datePublished: app.created_at,
    dateModified: app.updated_at,
  };

  if (app.logo_url) {
    schema.image = app.logo_url;
  }
  if (app.website_url) {
    schema.downloadUrl = app.website_url;
  }
  if (app.app_store_url) {
    schema.installUrl = app.app_store_url;
  }

  return schema;
}

export function generateBreadcrumbSchema(
  items: { name: string; url: string }[],
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateFAQSchema(
  faqs: { question: string; answer: string }[],
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function generateItemListSchema(
  items: { name: string; url: string }[],
  listName: string,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: listName,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      url: item.url,
    })),
  };
}

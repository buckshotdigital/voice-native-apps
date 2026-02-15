import { notFound } from 'next/navigation';

import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import PlatformBadges from '@/components/apps/PlatformBadges';
import PricingBadge from '@/components/apps/PricingBadge';
import ScreenshotCarousel from '@/components/apps/ScreenshotCarousel';
import UpvoteButton from '@/components/ui/UpvoteButton';
import ReportDialog from '@/components/ui/ReportDialog';
import { formatDate } from '@/lib/utils';
import { PLATFORMS, PRICING_MODELS } from '@/lib/constants';
import {
  generateSoftwareApplicationSchema,
  generateBreadcrumbSchema,
} from '@/lib/structured-data';
import {
  ExternalLink,
  Globe,
  Apple,
  Smartphone,
  Download,
  Play,
  ArrowLeft,
  Mic,
} from 'lucide-react';
import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://voicenativeapps.com';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: app } = await supabase
    .from('apps')
    .select('name, tagline, logo_url, platforms, voice_features, pricing_model')
    .eq('slug', slug)
    .eq('status', 'approved')
    .single();

  if (!app) return { title: 'App Not Found' };

  const platformLabels = (app.platforms || [])
    .map((p: string) => PLATFORMS.find((pl) => pl.value === p)?.label)
    .filter(Boolean);
  const pricingLabel =
    PRICING_MODELS.find((m) => m.value === app.pricing_model)?.label || app.pricing_model;

  const description = `${app.tagline} Available on ${platformLabels.join(', ')}. ${pricingLabel} voice-native app with ${(app.voice_features || []).slice(0, 3).join(', ')}.`;

  return {
    title: app.name,
    description,
    keywords: [app.name, 'voice app', ...(app.voice_features || [])],
    alternates: { canonical: `/apps/${slug}` },
    openGraph: {
      title: app.name,
      description,
      images: app.logo_url ? [app.logo_url] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: app.name,
      description,
      images: app.logo_url ? [app.logo_url] : [],
    },
  };
}

export default async function AppDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: app } = await supabase
    .from('apps')
    .select('*, category:categories(*)')
    .eq('slug', slug)
    .eq('status', 'approved')
    .single();

  if (!app) notFound();

  // Get tags
  const { data: appTags } = await supabase
    .from('app_tags')
    .select('tag_id, tags(name, slug)')
    .eq('app_id', app.id);

  // Get current user and upvote status
  const { data: { user } } = await supabase.auth.getUser();
  let hasUpvoted = false;
  if (user) {
    const { data: upvote } = await supabase
      .from('upvotes')
      .select('user_id')
      .eq('user_id', user.id)
      .eq('app_id', app.id)
      .maybeSingle();
    hasUpvoted = !!upvote;
  }

  // Increment view count (best-effort, non-blocking)
  // Use optimistic locking to avoid race conditions
  supabase.from('apps').update({ view_count: (app.view_count || 0) + 1 }).eq('id', app.id).eq('view_count', app.view_count).then(() => {});

  // Build GEO fact-summary data
  const platformLabels = app.platforms
    .map((p: string) => PLATFORMS.find((pl) => pl.value === p)?.label)
    .filter(Boolean);
  const pricingLabel =
    PRICING_MODELS.find((m) => m.value === app.pricing_model)?.label || app.pricing_model;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateSoftwareApplicationSchema(app)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            generateBreadcrumbSchema([
              { name: 'Home', url: SITE_URL },
              { name: 'Directory', url: `${SITE_URL}/apps` },
              { name: app.name, url: `${SITE_URL}/apps/${app.slug}` },
            ]),
          ),
        }}
      />

      {/* Back link */}
      <Link
        href="/apps"
        className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to directory
      </Link>

      <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2">
          {/* Header */}
          <div className="flex items-start gap-3 sm:gap-5">
            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl bg-gray-100 sm:h-20 sm:w-20">
              {app.logo_url ? (
                <Image
                  src={app.logo_url}
                  alt={`${app.name} logo`}
                  className="h-full w-full object-cover"
                  fill
                  sizes="80px"
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-gray-400">
                  {app.name[0]}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">{app.name}</h1>
                {app.featured && (
                  <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                    Featured
                  </span>
                )}
              </div>
              <p className="mt-1 text-gray-500">{app.tagline}</p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <PricingBadge model={app.pricing_model} />
                {app.category && (
                  <Link
                    href={`/categories/${app.category.slug}`}
                    className="text-xs text-gray-400 hover:text-indigo-600"
                  >
                    {app.category.name}
                  </Link>
                )}
                <span className="text-xs text-gray-400">
                  Added {formatDate(app.created_at)}
                </span>
              </div>
            </div>
          </div>

          {/* GEO: Fact-rich summary for AI extraction */}
          <div className="mt-6 rounded-lg bg-gray-50 p-4 text-sm leading-relaxed text-gray-600">
            <strong>{app.name}</strong> is a {pricingLabel.toLowerCase()} voice-native application
            {app.category ? ` in ${app.category.name}` : ''}.
            Available on {platformLabels.join(', ')}.
            {app.voice_features && app.voice_features.length > 0 && (
              <> Key voice features include {app.voice_features.join(', ')}.</>
            )}
          </div>

          {/* Screenshots */}
          {app.screenshot_urls && app.screenshot_urls.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Screenshots</h2>
              <ScreenshotCarousel screenshots={app.screenshot_urls} />
            </div>
          )}

          {/* Description */}
          <div className="mt-8">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">About</h2>
            <div className="prose prose-sm max-w-none text-gray-600">
              {app.description.split('\n').map((para: string, i: number) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>

          {/* Voice features */}
          {app.voice_features && app.voice_features.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
                <Mic className="h-5 w-5 text-indigo-600" />
                Voice Features
              </h2>
              <div className="flex flex-wrap gap-2">
                {app.voice_features.map((feature: string) => (
                  <span
                    key={feature}
                    className="rounded-lg bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Platforms */}
          <div className="mt-8">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">Platforms</h2>
            <PlatformBadges platforms={app.platforms} size="md" />
          </div>

          {/* Tags */}
          {appTags && appTags.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-3 text-lg font-semibold text-gray-900">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {appTags.map((at: Record<string, unknown>) => {
                  const tag = at.tags as { name: string; slug: string } | null;
                  if (!tag) return null;
                  return (
                    <span
                      key={at.tag_id as string}
                      className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600"
                    >
                      #{tag.name}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Demo video */}
          {app.demo_video_url && (
            <div className="mt-8">
              <h2 className="mb-3 text-lg font-semibold text-gray-900">Demo Video</h2>
              <a
                href={app.demo_video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Play className="h-4 w-4" />
                Watch Demo
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="space-y-3">
              {/* Website */}
              <a
                href={app.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"
              >
                <Globe className="h-4 w-4" />
                Visit Website
              </a>

              {/* App Store */}
              {app.app_store_url && (
                <a
                  href={app.app_store_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  <Apple className="h-4 w-4" />
                  App Store
                </a>
              )}

              {/* Play Store */}
              {app.play_store_url && (
                <a
                  href={app.play_store_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  <Smartphone className="h-4 w-4" />
                  Google Play
                </a>
              )}

              {/* Other download */}
              {app.other_download_url && (
                <a
                  href={app.other_download_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  <Download className="h-4 w-4" />
                  Download
                </a>
              )}
            </div>

            {/* Pricing */}
            {app.pricing_details && (
              <p className="mt-3 text-center text-xs text-gray-500">{app.pricing_details}</p>
            )}
          </div>

          {/* Upvote & Report */}
          <div className="flex items-center gap-3">
            <UpvoteButton
              appId={app.id}
              initialCount={app.upvote_count}
              initialUpvoted={hasUpvoted}
              userId={user?.id || null}
            />
            <ReportDialog appId={app.id} userId={user?.id || null} />
          </div>

          {/* Stats */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-gray-900">Stats</h3>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Upvotes</dt>
                <dd className="font-medium text-gray-900">{app.upvote_count}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Views</dt>
                <dd className="font-medium text-gray-900">{app.view_count}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Listed</dt>
                <dd className="font-medium text-gray-900">{formatDate(app.created_at)}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

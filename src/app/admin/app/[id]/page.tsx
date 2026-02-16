import { notFound, redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import PlatformBadges from '@/components/apps/PlatformBadges';
import PricingBadge from '@/components/apps/PricingBadge';
import StatusBadge from '@/components/ui/StatusBadge';
import AdminAppActions from './AdminAppActions';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, ExternalLink, Mic } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Review App - Admin - VoiceNative Directory',
};

export default async function AdminAppReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login?redirect=/admin');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.role !== 'admin') redirect('/');

  const { data: app } = await supabase
    .from('apps')
    .select('*, category:categories(*), submitter:profiles!submitted_by(display_name, email)')
    .eq('id', id)
    .maybeSingle();

  if (!app) notFound();

  // Reports for this app
  const { data: reports } = await supabase
    .from('reports')
    .select('*, reporter:profiles!reporter_id(display_name)')
    .eq('app_id', id)
    .order('created_at', { ascending: false });

  const submitter = app.submitter as Record<string, string> | null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/admin"
        className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to admin
      </Link>

      {/* Header */}
      <div className="flex items-start gap-5">
        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl bg-gray-100">
          {app.logo_url ? (
            <Image src={app.logo_url} alt={app.name} fill className="object-cover" sizes="80px" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-gray-400">
              {app.name[0]}
            </div>
          )}
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{app.name}</h1>
            <StatusBadge status={app.status} />
            {app.is_coming_soon && (
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                Coming Soon
              </span>
            )}
            {app.featured && (
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
                Featured
              </span>
            )}
          </div>
          <p className="mt-1 text-gray-500">{app.tagline}</p>
          <div className="mt-2 text-sm text-gray-400">
            Submitted by {submitter?.display_name || submitter?.email || 'Unknown'} on{' '}
            {formatDate(app.created_at)}
          </div>
        </div>
      </div>

      {/* Admin Actions */}
      <div className="mt-6">
        <AdminAppActions appId={app.id} currentStatus={app.status} isFeatured={app.featured} />
      </div>

      {/* Details Grid */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          {/* Description */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-gray-900">Description</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm text-gray-600">{app.description}</p>
          </div>

          {/* Voice Features */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <Mic className="h-4 w-4 text-indigo-600" />
              Voice Features
            </h2>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {app.voice_features?.map((f: string) => (
                <span key={f} className="rounded-md bg-indigo-50 px-2 py-1 text-xs text-indigo-700">
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* Screenshots */}
          {app.screenshot_urls && app.screenshot_urls.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <h2 className="text-sm font-semibold text-gray-900">
                Screenshots ({app.screenshot_urls.length})
              </h2>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {app.screenshot_urls.map((url: string, i: number) => (
                  <div key={i} className="relative aspect-video overflow-hidden rounded-lg bg-gray-100">
                    <Image src={url} alt={`Screenshot ${i + 1}`} fill className="object-cover" sizes="300px" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Links */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-gray-900">Links</h2>
            <div className="mt-3 space-y-2">
              <LinkRow label="Website" url={app.website_url} />
              {app.app_store_url && <LinkRow label="App Store" url={app.app_store_url} />}
              {app.play_store_url && <LinkRow label="Google Play" url={app.play_store_url} />}
              {app.other_download_url && <LinkRow label="Other" url={app.other_download_url} />}
              {app.demo_video_url && <LinkRow label="Demo Video" url={app.demo_video_url} />}
            </div>
          </div>

          {/* Meta */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-gray-900">Details</h2>
            <dl className="mt-3 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Category</dt>
                <dd>{app.category?.icon} {app.category?.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Pricing</dt>
                <dd><PricingBadge model={app.pricing_model} /></dd>
              </div>
              {app.pricing_details && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Pricing Details</dt>
                  <dd>{app.pricing_details}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-gray-500">Platforms</dt>
                <dd><PlatformBadges platforms={app.platforms} /></dd>
              </div>
              {app.is_coming_soon && (
                <>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Interest Count</dt>
                    <dd className="text-blue-600 font-medium">{app.interest_count}</dd>
                  </div>
                  {app.expected_launch_date && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Expected Launch</dt>
                      <dd>{app.expected_launch_date}</dd>
                    </div>
                  )}
                </>
              )}
              <div className="flex justify-between">
                <dt className="text-gray-500">Upvotes</dt>
                <dd>{app.upvote_count}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Views</dt>
                <dd>{app.view_count}</dd>
              </div>
            </dl>
          </div>

          {/* Reports */}
          {reports && reports.length > 0 && (
            <div className="rounded-xl border border-red-200 bg-red-50/50 p-5">
              <h2 className="text-sm font-semibold text-red-800">
                Reports ({reports.length})
              </h2>
              <div className="mt-3 space-y-3">
                {reports.map((r) => {
                  const reporter = r.reporter as Record<string, string> | null;
                  return (
                    <div key={r.id} className="border-t border-red-200 pt-3 first:border-0 first:pt-0">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span className="rounded bg-red-100 px-1.5 py-0.5 text-red-700">{r.reason}</span>
                        <span>{reporter?.display_name || 'Anonymous'}</span>
                        <span>{formatDate(r.created_at)}</span>
                        <span className={`rounded px-1.5 py-0.5 text-xs ${
                          r.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          r.status === 'resolved' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>{r.status}</span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">{r.details}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LinkRow({ label, url }: { label: string; url: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-sm text-gray-500">{label}</span>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 truncate text-sm text-indigo-600 hover:text-indigo-700"
      >
        {url.replace(/^https?:\/\//, '').slice(0, 40)}
        <ExternalLink className="h-3 w-3 flex-shrink-0" />
      </a>
    </div>
  );
}

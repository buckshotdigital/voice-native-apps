import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatDate } from '@/lib/utils';
import { Plus, Edit, ExternalLink } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard - VoiceNative Directory',
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login?redirect=/dashboard');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const { data: apps } = await supabase
    .from('apps')
    .select('*, category:categories(name, icon)')
    .eq('submitted_by', user.id)
    .order('created_at', { ascending: false });

  const pendingCount = apps?.filter((a) => a.status === 'pending').length || 0;
  const approvedCount = apps?.filter((a) => a.status === 'approved').length || 0;
  const rejectedCount = apps?.filter((a) => a.status === 'rejected').length || 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-gray-500">
            Welcome back, {profile?.display_name || user.email}
          </p>
        </div>
        <Link
          href="/submit"
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          Submit New App
        </Link>
      </div>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
          <div className="mt-1 text-sm text-gray-500">Pending Review</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
          <div className="mt-1 text-sm text-gray-500">Approved</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="text-2xl font-bold text-red-600">{rejectedCount}</div>
          <div className="mt-1 text-sm text-gray-500">Rejected</div>
        </div>
      </div>

      {/* App list */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900">Your Submissions</h2>

        {!apps || apps.length === 0 ? (
          <div className="mt-4 flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 py-16">
            <p className="text-sm text-gray-500">You haven&apos;t submitted any apps yet.</p>
            <Link
              href="/submit"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" />
              Submit Your First App
            </Link>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {apps.map((app) => (
              <div
                key={app.id}
                className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4"
              >
                {/* Logo */}
                <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
                  {app.logo_url ? (
                    <Image
                      src={app.logo_url}
                      alt={app.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-lg font-bold text-gray-400">
                      {app.name[0]}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate font-semibold text-gray-900">{app.name}</h3>
                    <StatusBadge status={app.status} />
                  </div>
                  <p className="mt-0.5 truncate text-sm text-gray-500">{app.tagline}</p>
                  <p className="mt-1 text-xs text-gray-400">
                    {app.category?.icon} {app.category?.name} &middot; Submitted{' '}
                    {formatDate(app.created_at)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {app.status === 'approved' && (
                    <Link
                      href={`/apps/${app.slug}`}
                      className="rounded-lg border border-gray-200 p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                      title="View live listing"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  )}
                  {(app.status === 'pending' || app.status === 'rejected') && (
                    <Link
                      href={`/dashboard/edit/${app.id}`}
                      className="rounded-lg border border-gray-200 p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                      title="Edit submission"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Rejection reasons */}
        {apps?.some((a) => a.status === 'rejected') && (
          <div className="mt-6 rounded-lg bg-red-50 p-4">
            <h3 className="text-sm font-semibold text-red-800">Rejection Reasons</h3>
            <ul className="mt-2 space-y-2">
              {apps
                .filter((a) => a.status === 'rejected' && a.rejection_reason)
                .map((a) => (
                  <li key={a.id} className="text-sm text-red-700">
                    <strong>{a.name}:</strong> {a.rejection_reason}
                  </li>
                ))}
            </ul>
            <p className="mt-2 text-xs text-red-600">
              You can edit and resubmit rejected apps for review.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

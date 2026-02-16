import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import StatusBadge from '@/components/ui/StatusBadge';
import LaunchButton from '@/components/ui/LaunchButton';
import { formatDate } from '@/lib/utils';
import { Plus, Edit, ExternalLink, Bell, BarChart3 } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard',
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login?redirect=/dashboard');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  const { data: apps } = await supabase
    .from('apps')
    .select('*, category:categories(name, icon)')
    .eq('submitted_by', user.id)
    .order('created_at', { ascending: false });

  const pendingCount = apps?.filter((a) => a.status === 'pending').length || 0;
  const approvedCount = apps?.filter((a) => a.status === 'approved').length || 0;
  const rejectedCount = apps?.filter((a) => a.status === 'rejected').length || 0;
  const totalInterestCount = apps?.filter((a) => a.is_coming_soon).reduce((sum, a) => sum + (a.interest_count || 0), 0) || 0;

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
      <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-3 sm:p-5">
          <div className="text-xl font-bold text-yellow-600 sm:text-2xl">{pendingCount}</div>
          <div className="mt-1 text-xs text-gray-500 sm:text-sm">Pending</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-3 sm:p-5">
          <div className="text-xl font-bold text-green-600 sm:text-2xl">{approvedCount}</div>
          <div className="mt-1 text-xs text-gray-500 sm:text-sm">Approved</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-3 sm:p-5">
          <div className="text-xl font-bold text-red-600 sm:text-2xl">{rejectedCount}</div>
          <div className="mt-1 text-xs text-gray-500 sm:text-sm">Rejected</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-3 sm:p-5">
          <div className="flex items-center gap-1.5">
            <Bell className="h-4 w-4 text-blue-600 sm:h-5 sm:w-5" />
            <span className="text-xl font-bold text-blue-600 sm:text-2xl">{totalInterestCount}</span>
          </div>
          <div className="mt-1 text-xs text-gray-500 sm:text-sm">Interested</div>
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
                className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-3 sm:items-center sm:gap-4 sm:p-4"
              >
                {/* Logo */}
                <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100 sm:h-12 sm:w-12">
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
                    {app.is_coming_soon && app.status === 'approved' && (
                      <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700">
                        COMING SOON
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-sm text-gray-500">{app.tagline}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                    <span>{app.category?.icon} {app.category?.name} &middot; Submitted{' '}{formatDate(app.created_at)}</span>
                    {app.is_coming_soon && app.status === 'approved' && (
                      <span className="flex items-center gap-1 text-blue-600">
                        <Bell className="h-3 w-3" />
                        {app.interest_count} interested
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {app.is_coming_soon && app.status === 'approved' && (
                    <>
                      <Link
                        href={`/dashboard/interests/${app.id}`}
                        className="rounded-lg border border-gray-200 p-2 text-gray-400 hover:bg-gray-50 hover:text-blue-600"
                        title="View interest analytics"
                      >
                        <BarChart3 className="h-4 w-4" />
                      </Link>
                      <LaunchButton appId={app.id} />
                    </>
                  )}
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

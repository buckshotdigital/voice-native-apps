import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import StatusBadge from '@/components/ui/StatusBadge';
import AdminAppTable from './AdminAppTable';
import { formatDate } from '@/lib/utils';
import { Eye, Clock, CheckCircle, Flag, AlertTriangle } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Panel - VoiceNative Directory',
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login?redirect=/admin');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.role !== 'admin') redirect('/');

  // Fetch pending apps
  const { data: pendingApps, count: pendingCount } = await supabase
    .from('apps')
    .select('*, category:categories(name, icon), submitter:profiles!submitted_by(display_name, email)', { count: 'exact' })
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(50);

  // Fetch recent approved/rejected
  const { data: recentApps } = await supabase
    .from('apps')
    .select('*, category:categories(name, icon)')
    .in('status', ['approved', 'rejected'])
    .order('updated_at', { ascending: false })
    .limit(10);

  // Fetch pending reports
  const { data: pendingReports, count: reportCount } = await supabase
    .from('reports')
    .select('*, app:apps(name, slug), reporter:profiles!reporter_id(display_name)', { count: 'exact' })
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(50);

  // Stats
  const { count: totalApproved } = await supabase
    .from('apps')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved');

  // All approved apps for featured management
  const { data: allApprovedApps } = await supabase
    .from('apps')
    .select('id, name, slug, logo_url, featured, is_coming_soon, upvote_count, view_count, category:categories(name)')
    .eq('status', 'approved')
    .order('featured', { ascending: false })
    .order('name', { ascending: true });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-3 sm:p-5">
          <div className="flex items-center gap-1.5 text-yellow-600 sm:gap-2">
            <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-xl font-bold sm:text-2xl">{pendingCount || 0}</span>
          </div>
          <div className="mt-1 text-xs text-gray-500 sm:text-sm">Pending</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-3 sm:p-5">
          <div className="flex items-center gap-1.5 text-green-600 sm:gap-2">
            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-xl font-bold sm:text-2xl">{totalApproved || 0}</span>
          </div>
          <div className="mt-1 text-xs text-gray-500 sm:text-sm">Approved</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-3 sm:p-5">
          <div className="flex items-center gap-1.5 text-red-600 sm:gap-2">
            <Flag className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-xl font-bold sm:text-2xl">{reportCount || 0}</span>
          </div>
          <div className="mt-1 text-xs text-gray-500 sm:text-sm">Reports</div>
        </div>
      </div>

      {/* Approval Queue */}
      <div className="mt-10">
        <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          Approval Queue
        </h2>

        {!pendingApps || pendingApps.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-gray-300 py-12 text-center">
            <CheckCircle className="mx-auto h-8 w-8 text-green-400" />
            <p className="mt-2 text-sm text-gray-500">All caught up! No pending submissions.</p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {pendingApps.map((app) => (
              <div
                key={app.id}
                className="flex flex-col gap-3 rounded-xl border border-yellow-200 bg-yellow-50/50 p-3 sm:flex-row sm:items-center sm:gap-4 sm:p-4"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100 sm:h-12 sm:w-12">
                    {app.logo_url ? (
                      <Image src={app.logo_url} alt={app.name} fill className="object-cover" sizes="48px" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-lg font-bold text-gray-400">
                        {app.name[0]}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate font-semibold text-gray-900">{app.name}</h3>
                      {app.is_coming_soon && (
                        <span className="flex-shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                          Coming Soon
                        </span>
                      )}
                    </div>
                    <p className="truncate text-sm text-gray-500">{app.tagline}</p>
                    <p className="mt-1 text-xs text-gray-400">
                      by {(app.submitter as Record<string, string>)?.display_name || (app.submitter as Record<string, string>)?.email || 'Unknown'} &middot;{' '}
                      {formatDate(app.created_at)}
                    </p>
                  </div>
                </div>

                <Link
                  href={`/admin/app/${app.id}`}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 sm:w-auto sm:py-2"
                >
                  <Eye className="h-4 w-4" />
                  Review
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending Reports */}
      {pendingReports && pendingReports.length > 0 && (
        <div className="mt-10">
          <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <Flag className="h-5 w-5 text-red-500" />
            Pending Reports
          </h2>
          <div className="mt-4 space-y-3">
            {pendingReports.map((report) => {
              const app = report.app as Record<string, string> | null;
              const reporter = report.reporter as Record<string, string> | null;
              return (
                <div
                  key={report.id}
                  className="rounded-xl border border-red-200 bg-red-50/50 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        Report on <strong>{app?.name || 'Unknown'}</strong>
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Reason: {report.reason} &middot; by {reporter?.display_name || 'Anonymous'} &middot;{' '}
                        {formatDate(report.created_at)}
                      </p>
                      <p className="mt-1 text-sm text-gray-600">{report.details}</p>
                    </div>
                    {app?.slug && (
                      <Link
                        href={`/admin/app/${report.app_id}`}
                        className="flex-shrink-0 rounded-lg border border-gray-200 px-3 py-2 text-center text-sm text-gray-600 hover:bg-white sm:py-1.5"
                      >
                        View App
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All Approved Apps */}
      {allApprovedApps && allApprovedApps.length > 0 && (
        <AdminAppTable
          apps={allApprovedApps.map((app) => ({
            id: app.id,
            name: app.name,
            slug: app.slug,
            logo_url: app.logo_url,
            featured: app.featured,
            is_coming_soon: app.is_coming_soon,
            upvote_count: app.upvote_count,
            view_count: app.view_count,
            categoryName: (app.category as unknown as { name: string } | null)?.name || '—',
          }))}
        />
      )}

      {/* Recently Reviewed */}
      {recentApps && recentApps.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-bold text-gray-900">Recently Reviewed</h2>
          <div className="mt-4 space-y-3">
            {recentApps.map((app) => (
              <div key={app.id} className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4">
                <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  {app.logo_url ? (
                    <Image src={app.logo_url} alt={app.name} fill className="object-cover" sizes="40px" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm font-bold text-gray-400">
                      {app.name[0]}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-sm font-medium text-gray-900">{app.name}</h3>
                    <StatusBadge status={app.status} />
                    {app.is_coming_soon && (
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                        Coming Soon
                      </span>
                    )}
                  </div>
                </div>
                <Link
                  href={`/admin/app/${app.id}`}
                  className="text-sm text-indigo-600 hover:text-indigo-700"
                >
                  View
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

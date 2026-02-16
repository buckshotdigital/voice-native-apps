import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getInterestAnalytics, getInterestedUsers } from '@/actions/premium';
import InterestTimeline from '@/components/dashboard/InterestTimeline';
import CountryBreakdown from '@/components/dashboard/CountryBreakdown';
import UnlockButton from '@/components/dashboard/UnlockButton';
import InterestedUsersTable from '@/components/dashboard/InterestedUsersTable';
import CsvExportButton from '@/components/dashboard/CsvExportButton';
import { ArrowLeft, Bell, Lock, CheckCircle } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Interest Analytics',
  robots: { index: false, follow: false },
};

export default async function InterestAnalyticsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ unlocked?: string; cancelled?: string }>;
}) {
  const { id: appId } = await params;
  const { unlocked, cancelled } = await searchParams;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login?redirect=/dashboard');

  const result = await getInterestAnalytics(appId);

  if (result.error || !result.app) {
    notFound();
  }

  const { app, timeline, countries, isUnlocked } = result;

  // If unlocked, also fetch the user list
  let users = null;
  if (isUnlocked) {
    const usersResult = await getInterestedUsers(appId);
    if (usersResult.users) {
      users = usersResult.users;
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back link */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      {/* Header */}
      <div className="mt-4 flex items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{app.name}</h1>
          <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
            <Bell className="h-4 w-4 text-blue-500" />
            {app.interest_count} interested {app.interest_count === 1 ? 'user' : 'users'}
          </div>
        </div>
      </div>

      {/* Stripe redirect banners */}
      {unlocked === 'true' && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          <CheckCircle className="h-4 w-4 shrink-0" />
          Payment successful! You now have full access to interested user data.
        </div>
      )}
      {cancelled === 'true' && (
        <div className="mt-4 rounded-lg bg-yellow-50 border border-yellow-200 px-4 py-3 text-sm text-yellow-700">
          Payment was cancelled. You can try again anytime.
        </div>
      )}

      {/* Free Analytics */}
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <InterestTimeline data={timeline} />
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <CountryBreakdown data={countries} />
        </div>
      </div>

      {/* Premium Section */}
      <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6">
        {isUnlocked && users ? (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Interested Users ({users.length})
              </h2>
              <CsvExportButton appId={appId} appName={app.name} />
            </div>
            <div className="mt-4">
              <InterestedUsersTable users={users} />
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <Lock className="mx-auto h-10 w-10 text-gray-300" />
            <h2 className="mt-3 text-lg font-semibold text-gray-900">
              Unlock Interested Users
            </h2>
            <p className="mt-1 text-sm text-gray-500 max-w-md mx-auto">
              Get access to the full list of users who expressed interest in your app, including their emails, names, and countries. Export the data as CSV.
            </p>
            <div className="mt-5">
              <UnlockButton appId={appId} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

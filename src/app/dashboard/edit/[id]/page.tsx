import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import SubmitAppForm from '@/components/forms/SubmitAppForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Edit Submission - VoiceNative Directory',
};

export default async function EditAppPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login?redirect=/dashboard');

  const { data: app } = await supabase
    .from('apps')
    .select('*')
    .eq('id', id)
    .eq('submitted_by', user.id)
    .maybeSingle();

  if (!app) notFound();

  if (app.status === 'approved') {
    redirect('/dashboard');
  }

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('display_order');

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Submission</h1>
        <p className="mt-2 text-gray-500">
          Update your app details and resubmit for review.
        </p>
        {app.status === 'rejected' && app.rejection_reason && (
          <div className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">
            <strong>Rejection reason:</strong> {app.rejection_reason}
          </div>
        )}
      </div>

      <SubmitAppForm categories={categories || []} userId={user.id} editApp={app} />
    </div>
  );
}

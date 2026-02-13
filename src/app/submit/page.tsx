import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import SubmitAppForm from '@/components/forms/SubmitAppForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Submit an App - VoiceNative Directory',
  description: 'Submit your voice-native application to the directory.',
};

export default async function SubmitPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login?redirect=/submit');

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('display_order');

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Submit Your App</h1>
        <p className="mt-2 text-gray-500">
          Fill out the form below to submit your voice-native application. All submissions are
          reviewed by our team before going live.
        </p>
        <div className="mt-4 rounded-lg bg-blue-50 p-4 text-sm text-blue-700">
          <strong>Review process:</strong> Submissions are typically reviewed within 24-48 hours.
          You&apos;ll be able to track the status of your submission in your dashboard.
        </div>
      </div>

      <SubmitAppForm categories={categories || []} userId={user.id} />
    </div>
  );
}

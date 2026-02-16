import AuthForm from '@/components/auth/AuthForm';

export const metadata = {
  title: 'Sign In - VoiceNative',
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; error?: string; admin?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 sm:px-6">
      <div className="w-full max-w-sm">
        {params.error && (
          <p className="mb-6 rounded-md bg-red-50 px-3 py-2 text-[13px] text-red-600">
            {params.error}
          </p>
        )}
        <AuthForm mode="login" redirectTo={params.redirect} showEmailForm={params.admin === 'true'} />
      </div>
    </div>
  );
}

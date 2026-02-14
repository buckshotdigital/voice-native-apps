import AuthForm from '@/components/auth/AuthForm';

export const metadata = {
  title: 'Create Account - VoiceNative',
};

export default function SignUpPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 sm:px-6">
      <div className="w-full max-w-sm">
        <AuthForm mode="signup" />
      </div>
    </div>
  );
}

'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6">
      <p className="text-[13px] font-medium tracking-wide text-muted uppercase">Error</p>
      <h1 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
        Something went wrong
      </h1>
      <p className="mt-2 max-w-md text-center text-[14px] text-muted">
        An unexpected error occurred. Please try again or contact support if the problem persists.
      </p>
      <button
        onClick={reset}
        className="mt-6 cursor-pointer rounded-lg bg-foreground px-4 py-2 text-[14px] font-medium text-white transition-colors hover:bg-foreground/80"
      >
        Try again
      </button>
    </div>
  );
}

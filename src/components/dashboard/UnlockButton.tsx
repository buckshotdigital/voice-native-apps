'use client';

import { useState, useTransition } from 'react';
import { Lock } from 'lucide-react';
import { createCheckoutSession } from '@/actions/premium';
import { UNLOCK_PRICE_DISPLAY } from '@/lib/constants';

export default function UnlockButton({ appId }: { appId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await createCheckoutSession(appId);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.url) {
        window.location.href = result.url;
      }
    });
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={isPending}
        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        <Lock className="h-4 w-4" />
        {isPending ? 'Redirecting...' : `Unlock for ${UNLOCK_PRICE_DISPLAY}`}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}

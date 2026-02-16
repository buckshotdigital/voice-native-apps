'use client';

import { useState, useTransition } from 'react';
import { Bell } from 'lucide-react';
import { toggleInterest } from '@/actions/apps';

export default function InterestButton({
  appId,
  initialCount,
  initialInterested,
  userId,
}: {
  appId: string;
  initialCount: number;
  initialInterested: boolean;
  userId: string | null;
}) {
  const [interested, setInterested] = useState(initialInterested);
  const [count, setCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();
  const [showConsent, setShowConsent] = useState(false);

  function handleClick() {
    if (!userId) {
      window.location.href = '/auth/login?redirect=' + encodeURIComponent(window.location.pathname);
      return;
    }

    if (interested) {
      doToggle();
    } else {
      setShowConsent(true);
    }
  }

  function getCountry(): string | undefined {
    const match = document.cookie.match(/(?:^|;\s*)x-country=([A-Z]{2})/);
    return match?.[1];
  }

  function doToggle() {
    const wasInterested = interested;
    const prevCount = count;

    setInterested(!wasInterested);
    setCount(wasInterested ? prevCount - 1 : prevCount + 1);
    setShowConsent(false);

    startTransition(async () => {
      const country = getCountry();
      const result = await toggleInterest(appId, country);
      if (result?.error) {
        setInterested(wasInterested);
        setCount(prevCount);
      }
    });
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={isPending}
        className={`flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition ${
          interested
            ? 'border-blue-200 bg-blue-50 text-blue-600'
            : 'border-gray-200 bg-white text-gray-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600'
        } disabled:opacity-50`}
      >
        <Bell className={`h-4 w-4 ${interested ? 'fill-current' : ''}`} />
        <span>{interested ? 'Interested' : "I'm Interested"}</span>
        <span className="text-xs opacity-70">({count})</span>
      </button>

      {showConsent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">Express Interest</h3>
            <p className="mt-2 text-sm text-gray-600">
              By expressing interest, you agree that your email may be shared with this app&apos;s developer so they can notify you when it launches.
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <button
                onClick={doToggle}
                className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowConsent(false)}
                className="w-full rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

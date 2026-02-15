'use client';

import { useState, useTransition } from 'react';
import { toggleInterest } from '@/actions/apps';

export default function InterestChip({
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

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

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

  function doToggle() {
    const wasInterested = interested;
    const prevCount = count;

    setInterested(!wasInterested);
    setCount(wasInterested ? prevCount - 1 : prevCount + 1);
    setShowConsent(false);

    startTransition(async () => {
      const result = await toggleInterest(appId);
      if (result?.error) {
        setInterested(wasInterested);
        setCount(prevCount);
      }
    });
  }

  function handleConsentClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={isPending}
        className={`flex cursor-pointer items-center gap-1 rounded-md border px-1.5 py-0.5 text-[12px] transition ${
          interested
            ? 'border-blue-300 bg-blue-50 text-blue-600'
            : 'border-transparent text-muted hover:border-blue-200 hover:text-blue-600'
        } disabled:opacity-50`}
        aria-label={interested ? 'Remove interest' : 'Express interest'}
      >
        <svg
          className="h-3 w-3"
          viewBox="0 0 24 24"
          fill={interested ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {count}
      </button>

      {showConsent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={handleConsentClick}
        >
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">Express Interest</h3>
            <p className="mt-2 text-sm text-gray-600">
              By expressing interest, you agree that your email may be shared with this app&apos;s developer so they can notify you when it launches.
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); doToggle(); }}
                className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Confirm
              </button>
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowConsent(false); }}
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

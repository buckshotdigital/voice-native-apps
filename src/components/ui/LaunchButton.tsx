'use client';

import { useState, useTransition } from 'react';
import { Rocket } from 'lucide-react';
import { launchApp } from '@/actions/apps';

export default function LaunchButton({ appId }: { appId: string }) {
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);
  const [launched, setLaunched] = useState(false);

  function handleLaunch() {
    setShowConfirm(false);
    startTransition(async () => {
      const result = await launchApp(appId);
      if (!result?.error) {
        setLaunched(true);
      }
    });
  }

  if (launched) {
    return (
      <span className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs font-medium text-green-700">
        Launched!
      </span>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        disabled={isPending}
        className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 transition hover:bg-blue-100 disabled:opacity-50"
        title="Launch this app"
      >
        <Rocket className="h-3.5 w-3.5" />
        Launch
      </button>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">Launch App</h3>
            <p className="mt-2 text-sm text-gray-600">
              This will remove the &quot;Coming Soon&quot; badge and mark your app as live. This action cannot be undone.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleLaunch}
                disabled={isPending}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isPending ? 'Launching...' : 'Confirm Launch'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

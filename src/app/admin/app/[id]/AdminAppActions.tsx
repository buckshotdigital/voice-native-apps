'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { approveApp, rejectApp, toggleFeatured } from '@/actions/admin';
import { CheckCircle, XCircle, Star, StarOff } from 'lucide-react';

export default function AdminAppActions({
  appId,
  currentStatus,
  isFeatured,
}: {
  appId: string;
  currentStatus: string;
  isFeatured: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function handleApprove() {
    setError(null);
    startTransition(async () => {
      const result = await approveApp(appId);
      if (result?.error) {
        setError(result.error);
      } else {
        setMessage('App approved successfully!');
        router.refresh();
      }
    });
  }

  function handleReject() {
    setError(null);
    if (rejectReason.trim().length < 5) {
      setError('Please provide a rejection reason (at least 5 characters).');
      return;
    }
    startTransition(async () => {
      const result = await rejectApp(appId, rejectReason);
      if (result?.error) {
        setError(result.error);
      } else {
        setMessage('App rejected.');
        setShowRejectForm(false);
        router.refresh();
      }
    });
  }

  function handleToggleFeatured() {
    setError(null);
    startTransition(async () => {
      const result = await toggleFeatured(appId);
      if (result?.error) {
        setError(result.error);
      } else {
        setMessage(isFeatured ? 'Removed from featured.' : 'Added to featured!');
        router.refresh();
      }
    });
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <h3 className="text-sm font-semibold text-gray-900">Admin Actions</h3>

      {error && (
        <div className="mt-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}
      {message && (
        <div className="mt-2 rounded-lg bg-green-50 p-3 text-sm text-green-700">{message}</div>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {currentStatus === 'pending' && (
          <>
            <button
              onClick={handleApprove}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              <CheckCircle className="h-4 w-4" />
              Approve
            </button>
            <button
              onClick={() => setShowRejectForm(!showRejectForm)}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              <XCircle className="h-4 w-4" />
              Reject
            </button>
          </>
        )}

        {currentStatus === 'approved' && (
          <button
            onClick={handleToggleFeatured}
            disabled={isPending}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium transition disabled:opacity-50 ${
              isFeatured
                ? 'border-gray-300 text-gray-700 hover:bg-gray-100'
                : 'border-indigo-300 bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
            }`}
          >
            {isFeatured ? (
              <>
                <StarOff className="h-4 w-4" />
                Remove Featured
              </>
            ) : (
              <>
                <Star className="h-4 w-4" />
                Mark as Featured
              </>
            )}
          </button>
        )}

        {currentStatus === 'rejected' && (
          <button
            onClick={handleApprove}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            <CheckCircle className="h-4 w-4" />
            Approve (override rejection)
          </button>
        )}
      </div>

      {/* Reject reason form */}
      {showRejectForm && (
        <div className="mt-4 space-y-3">
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={3}
            placeholder="Reason for rejection (shown to the submitter)..."
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          />
          <div className="flex gap-2">
            <button
              onClick={handleReject}
              disabled={isPending}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              Confirm Rejection
            </button>
            <button
              onClick={() => {
                setShowRejectForm(false);
                setRejectReason('');
              }}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

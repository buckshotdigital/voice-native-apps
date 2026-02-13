'use client';

import { useState, useTransition } from 'react';
import { Heart } from 'lucide-react';
import { toggleUpvote } from '@/actions/apps';

export default function UpvoteButton({
  appId,
  initialCount,
  initialUpvoted,
  userId,
}: {
  appId: string;
  initialCount: number;
  initialUpvoted: boolean;
  userId: string | null;
}) {
  const [upvoted, setUpvoted] = useState(initialUpvoted);
  const [count, setCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!userId) {
      window.location.href = '/auth/login?redirect=' + encodeURIComponent(window.location.pathname);
      return;
    }

    // Optimistic update
    setUpvoted(!upvoted);
    setCount((prev) => (upvoted ? prev - 1 : prev + 1));

    startTransition(async () => {
      const result = await toggleUpvote(appId);
      if (result?.error) {
        // Revert on error
        setUpvoted(upvoted);
        setCount(count);
      }
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition ${
        upvoted
          ? 'border-red-200 bg-red-50 text-red-600'
          : 'border-gray-200 bg-white text-gray-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600'
      } disabled:opacity-50`}
    >
      <Heart className={`h-4 w-4 ${upvoted ? 'fill-current' : ''}`} />
      <span>{count}</span>
    </button>
  );
}

'use client';

import { useState, useTransition } from 'react';
import { toggleUpvote } from '@/actions/apps';

export default function UpvoteChip({
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

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!userId) {
      window.location.href = '/auth/login?redirect=' + encodeURIComponent(window.location.pathname);
      return;
    }

    const wasUpvoted = upvoted;
    const prevCount = count;

    setUpvoted(!wasUpvoted);
    setCount(wasUpvoted ? prevCount - 1 : prevCount + 1);

    startTransition(async () => {
      const result = await toggleUpvote(appId);
      if (result?.error) {
        setUpvoted(wasUpvoted);
        setCount(prevCount);
      }
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`flex cursor-pointer items-center gap-1 rounded-md border px-1.5 py-0.5 text-[12px] transition ${
        upvoted
          ? 'border-accent/30 bg-accent/8 text-accent'
          : 'border-transparent text-muted hover:border-accent/20 hover:text-accent'
      } disabled:opacity-50`}
      aria-label={upvoted ? 'Remove upvote' : 'Upvote this app'}
    >
      <svg
        className="h-3 w-3"
        viewBox="0 0 24 24"
        fill={upvoted ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="m18 15-6-6-6 6" />
      </svg>
      {count}
    </button>
  );
}

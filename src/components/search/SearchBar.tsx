'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useCallback, useEffect, useRef } from 'react';

export default function SearchBar({ basePath = '/apps' }: { basePath?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const handleSearch = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set('q', value);
      } else {
        params.delete('q');
      }
      params.delete('page');
      router.push(`${basePath}?${params.toString()}`);
    },
    [router, searchParams, basePath]
  );

  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const currentQ = searchParams.get('q') || '';
      if (query !== currentQ) {
        handleSearch(query);
      }
    }, 300);
    return () => clearTimeout(timerRef.current);
  }, [query, handleSearch, searchParams]);

  return (
    <div className="relative">
      <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            clearTimeout(timerRef.current);
            handleSearch(query);
          }
        }}
        placeholder="Search apps..."
        className="w-full rounded-lg border bg-white py-2.5 pl-9 pr-3 text-[14px] text-foreground placeholder:text-muted/50 focus:border-foreground/20 focus:outline-none focus:ring-2 focus:ring-foreground/5 sm:py-2"
      />
      {query && (
        <button
          onClick={() => {
            clearTimeout(timerRef.current);
            setQuery('');
            handleSearch('');
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-muted hover:text-foreground"
        >
          Clear
        </button>
      )}
    </div>
  );
}

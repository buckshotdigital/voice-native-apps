'use client';

import { useRouter, useSearchParams } from 'next/navigation';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most popular' },
  { value: 'name', label: 'Name A-Z' },
];

export default function SortDropdown() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get('sort') || 'newest';

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', value);
    router.push(`/apps?${params.toString()}`);
  }

  return (
    <select
      value={currentSort}
      onChange={(e) => handleChange(e.target.value)}
      className="rounded-lg border bg-white px-3 py-2.5 text-[13px] text-foreground focus:border-foreground/20 focus:outline-none focus:ring-2 focus:ring-foreground/5 sm:py-2"
    >
      {SORT_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

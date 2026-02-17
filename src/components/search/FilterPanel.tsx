'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PLATFORMS, PRICING_MODELS } from '@/lib/constants';
import PlatformIcon from '@/components/ui/PlatformIcon';
import { ChevronDown } from 'lucide-react';
import type { Category, Platform } from '@/types';

export default function FilterPanel({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  const currentCategory = searchParams.get('category') || '';
  const currentPlatform = searchParams.get('platform') || '';
  const currentPricing = searchParams.get('pricing') || '';

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page');
    router.push(`/apps?${params.toString()}`);
  }

  function clearAll() {
    const params = new URLSearchParams();
    const q = searchParams.get('q');
    if (q) params.set('q', q);
    router.push(`/apps?${params.toString()}`);
  }

  const hasFilters = currentCategory || currentPlatform || currentPricing;
  const activeCount = [currentCategory, currentPlatform, currentPricing].filter(Boolean).length;

  const filterContent = (
    <div className="space-y-6">
      {hasFilters && (
        <button onClick={clearAll} className="text-[12px] font-medium text-muted underline underline-offset-2 hover:text-foreground">
          Clear filters
        </button>
      )}

      {/* Category */}
      <div>
        <h3 className="text-[11px] font-semibold tracking-wider text-muted uppercase">Category</h3>
        <div className="mt-2 space-y-px">
          <button
            onClick={() => updateFilter('category', '')}
            className={`block w-full rounded-md px-2.5 py-2 text-left text-[13px] transition-colors ${
              !currentCategory ? 'bg-surface font-medium text-foreground' : 'text-muted hover:text-foreground'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => updateFilter('category', cat.slug)}
              className={`block w-full rounded-md px-2.5 py-2 text-left text-[13px] transition-colors ${
                currentCategory === cat.slug
                  ? 'bg-surface font-medium text-foreground'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Platform */}
      <div>
        <h3 className="text-[11px] font-semibold tracking-wider text-muted uppercase">Platform</h3>
        <div className="mt-2 space-y-px">
          <button
            onClick={() => updateFilter('platform', '')}
            className={`block w-full rounded-md px-2.5 py-2 text-left text-[13px] transition-colors ${
              !currentPlatform ? 'bg-surface font-medium text-foreground' : 'text-muted hover:text-foreground'
            }`}
          >
            All
          </button>
          {PLATFORMS.map((p) => (
            <button
              key={p.value}
              onClick={() => updateFilter('platform', p.value)}
              className={`flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-[13px] transition-colors ${
                currentPlatform === p.value
                  ? 'bg-surface font-medium text-foreground'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              <PlatformIcon platform={p.value as Platform} className="h-3.5 w-3.5" />
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div>
        <h3 className="text-[11px] font-semibold tracking-wider text-muted uppercase">Pricing</h3>
        <div className="mt-2 space-y-px">
          <button
            onClick={() => updateFilter('pricing', '')}
            className={`block w-full rounded-md px-2.5 py-2 text-left text-[13px] transition-colors ${
              !currentPricing ? 'bg-surface font-medium text-foreground' : 'text-muted hover:text-foreground'
            }`}
          >
            All
          </button>
          {PRICING_MODELS.map((p) => (
            <button
              key={p.value}
              onClick={() => updateFilter('pricing', p.value)}
              className={`block w-full rounded-md px-2.5 py-2 text-left text-[13px] transition-colors ${
                currentPricing === p.value
                  ? 'bg-surface font-medium text-foreground'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile: collapsible toggle */}
      <div className="lg:hidden">
        <button
          onClick={() => setOpen(!open)}
          className="flex w-full cursor-pointer items-center justify-between rounded-lg border bg-white px-4 py-3 text-[13px] font-medium text-foreground"
        >
          <span>
            Filters{activeCount > 0 && ` (${activeCount})`}
          </span>
          <ChevronDown className={`h-4 w-4 text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && (
          <div className="mt-3 rounded-lg border bg-white p-4">
            {filterContent}
          </div>
        )}
      </div>

      {/* Desktop: always visible sidebar */}
      <div className="hidden lg:block">
        {filterContent}
      </div>
    </>
  );
}

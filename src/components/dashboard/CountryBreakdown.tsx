'use client';

import type { InterestCountryBreakdown } from '@/types';

export default function CountryBreakdown({ data }: { data: InterestCountryBreakdown[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-gray-300 text-sm text-gray-400">
        No country data yet
      </div>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count));
  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700">Interest by Country</h3>
      <div className="mt-3 space-y-2">
        {data.slice(0, 10).map((item) => {
          const width = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
          const pct = total > 0 ? ((item.count / total) * 100).toFixed(1) : '0';
          return (
            <div key={item.country} className="flex items-center gap-2">
              <span className="w-14 shrink-0 text-xs font-medium text-gray-600">
                {item.country}
              </span>
              <div className="flex-1">
                <div className="h-4 rounded-full bg-gray-100">
                  <div
                    className="h-4 rounded-full bg-indigo-500"
                    style={{ width: `${Math.max(width, 2)}%` }}
                  />
                </div>
              </div>
              <span className="w-16 shrink-0 text-right text-xs text-gray-500">
                {item.count} ({pct}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

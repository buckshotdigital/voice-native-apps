'use client';

import type { InterestTimelinePoint } from '@/types';

export default function InterestTimeline({ data }: { data: InterestTimelinePoint[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-gray-300 text-sm text-gray-400">
        No interest data yet
      </div>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count));

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700">Interest Over Time</h3>
      <div className="mt-3 flex items-end gap-1 overflow-x-auto" style={{ minHeight: 120 }}>
        {data.map((point) => {
          const height = maxCount > 0 ? (point.count / maxCount) * 100 : 0;
          return (
            <div key={point.day} className="group flex flex-col items-center" style={{ minWidth: 28 }}>
              <div className="relative">
                <span className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] text-gray-500 opacity-0 transition-opacity group-hover:opacity-100">
                  {point.count}
                </span>
                <div
                  className="w-5 rounded-t bg-blue-500 transition-all group-hover:bg-blue-600"
                  style={{ height: `${Math.max(height, 4)}px` }}
                />
              </div>
              <span className="mt-1 text-[9px] text-gray-400">
                {new Date(point.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

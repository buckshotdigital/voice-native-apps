'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ScreenshotCarousel({ screenshots }: { screenshots: string[] }) {
  const [current, setCurrent] = useState(0);

  if (screenshots.length === 0) return null;

  return (
    <div className="relative">
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-gray-100">
        <Image
          src={screenshots[current]}
          alt={`Screenshot ${current + 1}`}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, 800px"
        />
      </div>

      {screenshots.length > 1 && (
        <>
          <button
            aria-label="Previous screenshot"
            onClick={() => setCurrent((prev) => (prev === 0 ? screenshots.length - 1 : prev - 1))}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2.5 shadow-md backdrop-blur-sm transition hover:bg-white sm:p-1.5"
          >
            <ChevronLeft className="h-5 w-5 text-gray-700" />
          </button>
          <button
            aria-label="Next screenshot"
            onClick={() => setCurrent((prev) => (prev === screenshots.length - 1 ? 0 : prev + 1))}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2.5 shadow-md backdrop-blur-sm transition hover:bg-white sm:p-1.5"
          >
            <ChevronRight className="h-5 w-5 text-gray-700" />
          </button>

          {/* Dots */}
          <div className="mt-3 flex justify-center gap-2 sm:gap-1.5">
            {screenshots.map((_, i) => (
              <button
                key={i}
                aria-label={`Go to screenshot ${i + 1}`}
                onClick={() => setCurrent(i)}
                className={`h-3 w-3 rounded-full transition sm:h-2 sm:w-2 ${
                  i === current ? 'bg-indigo-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

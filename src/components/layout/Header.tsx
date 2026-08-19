'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-70">
          <div className="flex h-7 w-7 items-center justify-center gap-[2px] rounded-md bg-foreground">
            <span className="inline-block w-[2.5px] rounded-full bg-white animate-[wave_1.2s_ease-in-out_infinite]" style={{ height: 8, animationDelay: '0s' }} />
            <span className="inline-block w-[2.5px] rounded-full bg-white animate-[wave_1.2s_ease-in-out_infinite]" style={{ height: 12, animationDelay: '0.1s' }} />
            <span className="inline-block w-[2.5px] rounded-full bg-white animate-[wave_1.2s_ease-in-out_infinite]" style={{ height: 14, animationDelay: '0.2s' }} />
            <span className="inline-block w-[2.5px] rounded-full bg-white animate-[wave_1.2s_ease-in-out_infinite]" style={{ height: 12, animationDelay: '0.3s' }} />
            <span className="inline-block w-[2.5px] rounded-full bg-white animate-[wave_1.2s_ease-in-out_infinite]" style={{ height: 8, animationDelay: '0.4s' }} />
          </div>
          <span className="text-[15px] font-semibold tracking-tight">VoiceNative</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          <Link href="/apps" className="rounded-md px-3 py-1.5 text-[13px] font-medium text-muted transition-colors hover:text-foreground">
            Directory
          </Link>
        </nav>

        {/* Mobile toggle */}
        <button
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          className="flex h-10 w-10 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <div className="flex flex-col gap-[5px]">
            <span className={`block h-[1.5px] w-4 bg-current transition-all ${mobileOpen ? 'translate-y-[3.5px] rotate-45' : ''}`} />
            <span className={`block h-[1.5px] w-4 bg-current transition-all ${mobileOpen ? '-translate-y-[3.5px] -rotate-45' : ''}`} />
          </div>
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="border-t bg-white px-4 py-3 sm:px-6 md:hidden">
          <div className="flex flex-col">
            <Link href="/apps" className="rounded-md px-3 py-3 text-[14px] font-medium text-muted hover:bg-surface hover:text-foreground" onClick={() => setMobileOpen(false)}>
              Directory
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

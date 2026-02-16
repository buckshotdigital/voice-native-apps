'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { signOut } from '@/actions/auth';
import { LogOut, LayoutDashboard, Shield, ChevronDown } from 'lucide-react';
import type { Profile } from '@/types';
import { getInitials } from '@/lib/utils';

export default function Header() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const supabaseRef = useRef(createClient());

  useEffect(() => {
    const supabase = supabaseRef.current;
    async function loadUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        setUser(authUser);
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();
        setProfile(data);
      }
    }
    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        setProfile(data);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleSignOut() {
    setMenuOpen(false);
    const result = await signOut();
    if (result?.redirect) {
      window.location.href = result.redirect;
    }
  }

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
          <Link
            href="/submit"
            className="ml-1 rounded-md bg-foreground px-3.5 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-foreground/80"
          >
            Submit
          </Link>

          {user ? (
            <div className="relative ml-2" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1.5 text-[13px] font-medium text-muted transition-colors hover:text-foreground"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-surface text-[10px] font-bold text-muted">
                  {getInitials(profile?.display_name || user.email || '?')}
                </div>
                <ChevronDown className="h-3 w-3" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 z-50 mt-1.5 w-44 rounded-lg border bg-white p-1 shadow-lg shadow-black/5">
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 rounded-md px-2.5 py-2 text-[13px] text-muted transition-colors hover:bg-surface hover:text-foreground"
                    onClick={() => setMenuOpen(false)}
                  >
                    <LayoutDashboard className="h-3.5 w-3.5" />
                    Dashboard
                  </Link>
                  {profile?.role === 'admin' && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 rounded-md px-2.5 py-2 text-[13px] text-muted transition-colors hover:bg-surface hover:text-foreground"
                      onClick={() => setMenuOpen(false)}
                    >
                      <Shield className="h-3.5 w-3.5" />
                      Admin
                    </Link>
                  )}
                  <div className="my-1 border-t" />
                  <button
                    onClick={handleSignOut}
                    className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-[13px] text-muted transition-colors hover:bg-surface hover:text-foreground"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="ml-2 rounded-md px-3 py-1.5 text-[13px] font-medium text-muted transition-colors hover:text-foreground"
            >
              Sign in
            </Link>
          )}
        </nav>

        {/* Mobile toggle */}
        <button
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
        <div className="border-t bg-white px-4 py-2 sm:px-6 md:hidden">
          <div className="flex flex-col">
            <Link href="/apps" className="rounded-md px-3 py-3 text-[14px] font-medium text-muted hover:bg-surface hover:text-foreground" onClick={() => setMobileOpen(false)}>
              Directory
            </Link>
            <Link href="/submit" className="rounded-md px-3 py-3 text-[14px] font-medium text-foreground hover:bg-surface" onClick={() => setMobileOpen(false)}>
              Submit
            </Link>
            {user ? (
              <>
                <Link href="/dashboard" className="rounded-md px-3 py-3 text-[14px] font-medium text-muted hover:bg-surface hover:text-foreground" onClick={() => setMobileOpen(false)}>
                  Dashboard
                </Link>
                <button onClick={handleSignOut} className="cursor-pointer rounded-md px-3 py-3 text-left text-[14px] font-medium text-muted hover:bg-surface hover:text-foreground">
                  Sign out
                </button>
              </>
            ) : (
              <Link href="/auth/login" className="rounded-md px-3 py-3 text-[14px] font-medium text-muted hover:bg-surface hover:text-foreground" onClick={() => setMobileOpen(false)}>
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

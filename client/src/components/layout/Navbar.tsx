'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth';
import { useModeStore } from '@/lib/store/mode';
import { BookOpen, LogOut, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import ModeToggle from './ModeToggle';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { mode } = useModeStore();

  return (
    <nav className="sticky top-0 z-30 border-b border-slate-200/80 bg-[#f8fafb]/95 shadow-[0_8px_30px_rgba(17,27,46,0.05)] backdrop-blur-xl pt-safe dark:border-slate-700/80 dark:bg-[#111b2e]/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between min-h-16 py-2">

          {/* ── Left: logo + nav links ──────────────────────────────── */}
          <div className="flex items-center">
            {/* Logo — always link to mode home */}
            <Link
              href={mode === 'author' ? '/novels' : '/read'}
              className="flex items-center shrink-0"
            >
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary-600 text-white shadow-sm">
                <BookOpen className="h-5 w-5" />
              </span>
              <span className="ml-2 hidden font-serif text-lg font-bold tracking-tight text-slate-950 dark:text-white sm:block">
                Trang sách
              </span>
            </Link>

            {/* Mode-specific nav links (desktop) */}
            <div className="hidden sm:ml-8 sm:flex sm:items-center sm:space-x-1">
              {mode === 'author' ? (
                <Link
                  href="/novels"
                  className={cn(
                    'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    pathname?.startsWith('/novels')
                      ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/40 dark:text-primary-200'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100',
                  )}
                >
                  Truyện của tôi
                </Link>
              ) : (
                <Link
                  href="/read"
                  className={cn(
                    'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    pathname === '/read' || pathname?.startsWith('/read/')
                      ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/40 dark:text-primary-200'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100',
                  )}
                >
                  Thư viện
                </Link>
              )}
            </div>
          </div>

          {/* ── Right: mode toggle + user + logout ─────────────────── */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Mode toggle pill */}
            <ModeToggle />

            {/* User display (desktop) */}
            <div className="hidden items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400 sm:flex">
              <User className="h-4 w-4 text-primary-600" />
              <span className="max-w-[120px] truncate">{user?.displayName}</span>
            </div>

            {/* Logout */}
            <button
              onClick={logout}
              title="Đăng xuất"
              className="rounded-lg p-2.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 sm:p-2"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

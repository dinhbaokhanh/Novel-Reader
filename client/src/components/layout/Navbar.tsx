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
    <nav className="bg-white dark:bg-gray-800 shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">

          {/* ── Left: logo + nav links ──────────────────────────────── */}
          <div className="flex items-center">
            {/* Logo — always link to mode home */}
            <Link
              href={mode === 'author' ? '/novels' : '/read'}
              className="flex items-center shrink-0"
            >
              <BookOpen className="h-7 w-7 text-primary-600" />
              <span className="ml-2 text-lg font-bold text-gray-900 dark:text-white hidden sm:block">
                AI Novel Writer
              </span>
            </Link>

            {/* Mode-specific nav links (desktop) */}
            <div className="hidden sm:ml-8 sm:flex sm:items-center sm:space-x-1">
              {mode === 'author' ? (
                <Link
                  href="/novels"
                  className={cn(
                    'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    pathname?.startsWith('/novels')
                      ? 'text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-900/30'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700',
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
                      ? 'text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-900/30'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700',
                  )}
                >
                  Thư viện
                </Link>
              )}
            </div>
          </div>

          {/* ── Right: mode toggle + user + logout ─────────────────── */}
          <div className="flex items-center gap-3">
            {/* Mode toggle pill */}
            <ModeToggle />

            {/* User display (desktop) */}
            <div className="hidden sm:flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
              <User className="h-4 w-4 text-gray-400" />
              <span className="max-w-[120px] truncate">{user?.displayName}</span>
            </div>

            {/* Logout */}
            <button
              onClick={logout}
              title="Đăng xuất"
              className="p-2 rounded-md text-gray-500 dark:text-gray-400
                         hover:text-gray-800 dark:hover:text-gray-200
                         hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

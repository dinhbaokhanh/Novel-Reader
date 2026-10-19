'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth';
import { useModeStore } from '@/lib/store/mode';
import Navbar from './Navbar';

export default function ProtectedLayout({
  children,
  noPadding = false,
}: {
  children: React.ReactNode;
  noPadding?: boolean;
}) {
  const router   = useRouter();
  const pathname = usePathname();

  const { isAuthenticated, isInitialized, initialize } = useAuthStore();
  const { mode, load: loadMode, isInitialized: modeInitialized } = useModeStore();

  // ── Initialize auth + mode from storage (once on mount) ───────────────
  useEffect(() => {
    initialize();
    loadMode();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auth guard: redirect to /login if not authenticated ───────────────
  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push('/login');
    }
  }, [isInitialized, isAuthenticated, router]);

  // ── Mode guard: /novels/** only available in author mode ──────────────
  useEffect(() => {
    if (!isInitialized || !modeInitialized || !isAuthenticated) return;

    const isAuthorRoute = pathname?.startsWith('/novels');
    if (isAuthorRoute && mode === 'reader') {
      router.replace('/read');
    }
  }, [isInitialized, modeInitialized, isAuthenticated, mode, pathname, router]);

  // ── Spinner while loading ─────────────────────────────────────────────
  if (!isInitialized || !modeInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  // Author on a reader-only route — blank while redirect fires
  const isAuthorRoute = pathname?.startsWith('/novels');
  if (isAuthorRoute && mode === 'reader') return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      {noPadding ? (
        <>{children}</>
      ) : (
        <main className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      )}
    </div>
  );
}

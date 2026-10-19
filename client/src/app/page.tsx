'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth';
import { useModeStore } from '@/lib/store/mode';

export default function Home() {
  const router = useRouter();

  const { isAuthenticated, isInitialized, initialize } = useAuthStore();
  const { mode, load: loadMode, isInitialized: modeInitialized } = useModeStore();

  useEffect(() => {
    initialize();
    loadMode();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isInitialized || !modeInitialized) return;

    if (!isAuthenticated) {
      router.replace('/login');
    } else if (mode === 'reader') {
      router.replace('/read');
    } else {
      router.replace('/novels');
    }
  }, [isInitialized, modeInitialized, isAuthenticated, mode, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
    </div>
  );
}

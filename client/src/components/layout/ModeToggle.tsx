'use client';

import { useModeStore } from '@/lib/store/mode';
import { useRouter, usePathname } from 'next/navigation';
import { PenLine, BookOpen } from 'lucide-react';

/**
 * Pill toggle: Tác giả ↔ Người đọc
 * Shown inside Navbar. Switches mode and redirects to the
 * appropriate home route.
 */
export default function ModeToggle() {
  const { mode, setMode } = useModeStore();
  const router   = useRouter();
  const pathname = usePathname();

  const switchTo = (target: 'author' | 'reader') => {
    if (target === mode) return;
    setMode(target);
    if (target === 'author') {
      router.push('/novels');
    } else {
      router.push('/read');
    }
  };

  const isAuthor = mode === 'author';

  return (
    <div
      className="inline-flex items-center rounded-full border border-gray-200
                 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 p-0.5 gap-0.5"
    >
      <button
        onClick={() => switchTo('author')}
        title="Chế độ tác giả"
        className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-medium
                    transition-all duration-200
                    ${isAuthor
                      ? 'bg-white dark:bg-gray-700 text-primary-700 dark:text-primary-300 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
      >
        <PenLine className="h-3.5 w-3.5" />
        <span>Tác giả</span>
      </button>

      <button
        onClick={() => switchTo('reader')}
        title="Chế độ đọc"
        className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-medium
                    transition-all duration-200
                    ${!isAuthor
                      ? 'bg-white dark:bg-gray-700 text-primary-700 dark:text-primary-300 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
      >
        <BookOpen className="h-3.5 w-3.5" />
        <span>Đọc</span>
      </button>
    </div>
  );
}

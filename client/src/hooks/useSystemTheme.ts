import { useEffect, useState } from 'react';
import { ReadingTheme } from '@/lib/types';

/**
 * Trả về 'dark' nếu system đang ở dark mode, 'light' nếu không.
 * Dùng cho các trang tác giả (không có reading theme riêng).
 */
export function useSystemTheme(): ReadingTheme {
  const [theme, setTheme] = useState<ReadingTheme>('light');

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    setTheme(mq.matches ? 'dark' : 'light');

    const handler = (e: MediaQueryListEvent) =>
      setTheme(e.matches ? 'dark' : 'light');

    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return theme;
}

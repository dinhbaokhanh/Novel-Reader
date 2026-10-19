import { useCallback, useEffect, useRef } from 'react';
import { readerApi } from '@/lib/api/reader';

/**
 * Auto-save reading progress (scroll position) to the server.
 * Debounces saves so we don't flood the API on every scroll event.
 */
export function useReadingProgress(
  novelId: string,
  chapterId: string,
  enabled = true,
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = useCallback(
    (scrollPosition: number) => {
      if (!enabled) return;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        readerApi
          .saveProgress({ novelId, chapterId, scrollPosition })
          .catch(() => {/* silent – progress save is best-effort */});
      }, 1500); // debounce 1.5 s
    },
    [novelId, chapterId, enabled],
  );

  // Attach scroll listener
  useEffect(() => {
    if (!enabled) return;

    const onScroll = () => save(Math.round(window.scrollY));
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [save, enabled]);

  // Save on page-hide (tab close / navigate away)
  useEffect(() => {
    if (!enabled) return;
    const onHide = () => {
      readerApi
        .saveProgress({ novelId, chapterId, scrollPosition: Math.round(window.scrollY) })
        .catch(() => {});
    };
    window.addEventListener('pagehide', onHide);
    return () => window.removeEventListener('pagehide', onHide);
  }, [novelId, chapterId, enabled]);
}

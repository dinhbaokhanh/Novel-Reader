import { useEffect, useRef } from 'react';

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

/**
 * Detect horizontal swipe on the given element ref (or document if null).
 * Threshold: 60 px horizontal delta with less than 80 px vertical drift.
 */
export function useSwipe(
  { onSwipeLeft, onSwipeRight }: SwipeHandlers,
  enabled = true,
) {
  const startX = useRef(0);
  const startY = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    const onTouchStart = (e: TouchEvent) => {
      startX.current = e.touches[0].clientX;
      startY.current = e.touches[0].clientY;
    };

    const onTouchEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - startX.current;
      const dy = e.changedTouches[0].clientY - startY.current;

      // Require mostly-horizontal swipe
      if (Math.abs(dx) < 60 || Math.abs(dy) > 80) return;

      if (dx < 0) onSwipeLeft?.();
      else onSwipeRight?.();
    };

    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, [enabled, onSwipeLeft, onSwipeRight]);
}

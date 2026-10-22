import { useCallback, useEffect, useRef, useState } from 'react';

interface PullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  threshold?: number;
  maxPull?: number;
  enabled?: boolean;
}

/**
 * iOS-style pull-to-refresh. Only engages when the page is scrolled to the
 * very top so it never fights with normal scrolling.
 */
export function usePullToRefresh({
  onRefresh,
  threshold = 64,
  maxPull = 96,
  enabled = true,
}: PullToRefreshOptions) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef<number | null>(null);
  const currentPull = useRef(0);

  const finish = useCallback(async () => {
    setPullDistance(0);
    currentPull.current = 0;
    startY.current = null;
    setIsRefreshing(false);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const onTouchStart = (event: TouchEvent) => {
      if (isRefreshing) return;
      if (window.scrollY > 2) return;
      startY.current = event.touches[0].clientY;
      currentPull.current = 0;
    };

    const onTouchMove = (event: TouchEvent) => {
      if (startY.current === null) return;
      const delta = event.touches[0].clientY - startY.current;
      if (delta <= 0) {
        currentPull.current = 0;
        setPullDistance(0);
        return;
      }
      // rubber-band damping
      const damped = Math.min(maxPull, Math.pow(delta, 0.72) * 2.4);
      currentPull.current = damped;
      setPullDistance(damped);
    };

    const onTouchEnd = async () => {
      if (startY.current === null) return;
      const shouldRefresh = currentPull.current >= threshold;
      if (!shouldRefresh) {
        setPullDistance(0);
        currentPull.current = 0;
        startY.current = null;
        return;
      }
      setPullDistance(threshold);
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        await finish();
      }
    };

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('touchcancel', onTouchEnd);

    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [enabled, isRefreshing, maxPull, onRefresh, threshold, finish]);

  return { pullDistance, isRefreshing };
}

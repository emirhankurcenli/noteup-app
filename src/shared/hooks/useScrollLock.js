import { useEffect } from 'react';

/**
 * Prevents mobile OS/keyboard from pushing window.scrollY > 0.
 * Immediately resets scroll position whenever it drifts.
 */
export const useScrollLock = () => {
  useEffect(() => {
    const handleWindowScroll = () => {
      if (window.scrollY !== 0 || window.scrollX !== 0) {
        window.scrollTo(0, 0);
      }
    };
    window.addEventListener('scroll', handleWindowScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleWindowScroll);
  }, []);
};
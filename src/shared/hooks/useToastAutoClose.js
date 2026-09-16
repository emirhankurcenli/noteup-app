import { useEffect } from 'react';

/**
 * Automatically clears the toast notification after 3 seconds.
 */
export const useToastAutoClose = ({ toast, setToast }) => {
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);
};
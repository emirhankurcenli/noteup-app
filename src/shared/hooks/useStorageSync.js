import { useEffect } from 'react';
import { STORAGE_KEYS } from '@shared/utils/storageKeys';

/**
 * Listens for localStorage changes from other browser tabs/windows
 * and syncs notes/reminders state accordingly.
 */
export const useStorageSync = ({ myCode, setNotes, setReminders }) => {
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEYS.NOTES) {
        try { setNotes(JSON.parse(e.newValue || '[]')); } catch (err) {}
      }
      if (e.key === STORAGE_KEYS.REMINDERS) {
        try { setReminders(JSON.parse(e.newValue || '[]')); } catch (err) {}
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [myCode]);
};
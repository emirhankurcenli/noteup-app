import { useEffect } from 'react';

export const useGlobalEventListeners = ({
  notes,
  setNotes,
  setReminders,
  myCode,
  user,
  toast,
  setToast,
  setEditingNote,
  setShowReminderModal,
  setShowEditorMenu,
  setActiveMenuNoteId,
  openEditingNote,
  persistNotes,
}) => {
  // Cross-tab Storage Sync
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 's23_notes') {
        try { setNotes(JSON.parse(e.newValue || '[]')); } catch (err) { console.error('Cross-tab notes parse error:', err); }
      }
      if (e.key === 's23_reminders') {
        try { setReminders(JSON.parse(e.newValue || '[]')); } catch (err) { console.error('Cross-tab reminders parse error:', err); }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [myCode]);

  // Window Scroll Lock Enforcement (Prevents mobile OS/keyboard from pushing window.scrollY > 0)
  useEffect(() => {
    const handleWindowScroll = () => {
      if (window.scrollY !== 0 || window.scrollX !== 0) {
        window.scrollTo(0, 0);
      }
    };
    window.addEventListener('scroll', handleWindowScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleWindowScroll);
  }, []);

  // SPA History & Popstate Navigation
  useEffect(() => {
    if (!window.history.state) {
      window.history.replaceState({ page: 'root' }, '');
    }

    const handlePopState = (e) => {
      const state = e.state;
      if (!state || state.page === 'root') {
        setEditingNote(null);
        setShowReminderModal(false);
        setShowEditorMenu(false);
      } else if (state.page === 'editor') {
        const found = notes.find(n => n.id === state.noteId);
        if (found && !found.deletedAt) {
          openEditingNote(found);
        } else {
          setEditingNote(null);
          window.history.replaceState({ page: 'root' }, '');
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [notes]);

  // NOTE: Periodic auto-purge of trash notes (>30 days) is handled exclusively in
  // useNotes.js (startup useEffect). Removed duplicate interval here to prevent
  // race conditions with simultaneous Supabase delete calls.

  // Global Outside Click Listener
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.three-dots-btn') && !e.target.closest('.glass-panel-menu')) {
        setActiveMenuNoteId(null);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  // Auto-clear Toast Notification after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);
};

export default useGlobalEventListeners;

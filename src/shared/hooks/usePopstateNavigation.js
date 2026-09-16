import { useEffect } from 'react';

/**
 * Handles SPA back-navigation via the browser/Android back button.
 * Closes editor or modals when the user navigates back.
 */
export const usePopstateNavigation = ({
  notes,
  setEditingNote,
  setShowReminderModal,
  setShowEditorMenu,
  openEditingNote,
}) => {
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
};
import React, { createContext, useContext } from 'react';
import useNotes from '../hooks/useNotes';
import { useAuthContext } from './AuthContext';
import { useLanguage } from './LanguageContext';
import { useModals } from './ModalContext';

const NotesContext = createContext(null);

export const NotesProvider = ({ children }) => {
  const auth = useAuthContext();
  const { t, lang } = useLanguage();
  const { setConfirmDialog } = useModals();

  const notesHook = useNotes({
    user: auth.user,
    notes: auth.notes,
    setNotes: auth.setNotes,
    reminders: auth.reminders,
    setReminders: auth.setReminders,
    setToast: auth.setToast,
    getUserScopedKey: auth.getUserScopedKey,
    t,
    setConfirmDialog,
    lang
  });

  return (
    <NotesContext.Provider value={notesHook}>
      {children}
    </NotesContext.Provider>
  );
};

export const useNotesContext = () => {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotesContext must be used within a NotesProvider');
  }
  return context;
};

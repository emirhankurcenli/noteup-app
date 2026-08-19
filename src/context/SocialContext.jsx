import React, { createContext, useContext } from 'react';
import useSharing from '../hooks/useSharing';
import { useAuthContext } from './AuthContext';
import { useNotesContext } from './NotesContext';
import { useModals } from './ModalContext';

const SocialContext = createContext(null);

export const SocialProvider = ({ children }) => {
  const auth = useAuthContext();
  const notesHook = useNotesContext();
  const { setShowPaywall, setShowRewardedAdModal } = useModals();

  const sharingHook = useSharing({
    user: auth.user,
    myCode: auth.myCode,
    profileName: auth.profileName,
    userPlan: auth.userPlan,
    setUserPlan: auth.setUserPlan,
    notes: auth.notes,
    saveNotes: notesHook.saveNotes,
    setToast: auth.setToast,
    setShowPaywall,
    setShowRewardedAdModal
  });

  return (
    <SocialContext.Provider value={sharingHook}>
      {children}
    </SocialContext.Provider>
  );
};

export const useSocialContext = () => {
  const context = useContext(SocialContext);
  if (!context) {
    throw new Error('useSocialContext must be used within a SocialProvider');
  }
  return context;
};

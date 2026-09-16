/**
 * SharingContext — arkadas listesi, paylasim davetleri ve paylasim islemleri.
 * useSharing hook'unu sararak tum paylasim state'ini context olarak sunar.
 */
import React, { createContext, useContext } from 'react';
import useSharing from '@features/sharing/hooks/useSharing';
import { useAuthContext } from './AuthContext';

const SharingContext = createContext(null);

export const SharingProvider = ({ children }) => {
  const { user, myCode, profileName, userPlan, setUserPlan, notes, setToast } = useAuthContext();

  // saveNotes NotesContext'ten gelecek — circular dep'i onlemek icin prop olarak alinir
  const sharing = useSharing({
    user,
    myCode,
    profileName,
    userPlan,
    setUserPlan,
    notes,
    setToast,
    // saveNotes: NotesProvider tarafindan SharingProviderBridge uzerinden inject edilir
  });

  return (
    <SharingContext.Provider value={sharing}>
      {children}
    </SharingContext.Provider>
  );
};

export const useSharingContext = () => {
  const ctx = useContext(SharingContext);
  if (!ctx) throw new Error('useSharingContext must be used inside SharingProvider');
  return ctx;
};

export default SharingContext;
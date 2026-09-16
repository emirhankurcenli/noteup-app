/**
 * AuthContext — kullanici kimlik dogrulamasi, profil ve temel veri cachesi.
 * user, notes, reminders ve tum auth handler'lari buradan okunur.
 */
import React, { createContext, useContext } from 'react';
import useAuth from '@features/auth/hooks/useAuth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children, options }) => {
  const auth = useAuth(options);
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used inside AuthProvider');
  return ctx;
};

export default AuthContext;
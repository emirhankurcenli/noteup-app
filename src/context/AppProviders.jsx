import React from 'react';
import { LanguageProvider } from './LanguageContext';
import { AuthProvider } from './AuthContext';
import { ModalProvider } from './ModalContext';
import { NotesProvider } from './NotesContext';
import { SocialProvider } from './SocialContext';

export const AppProviders = ({ children }) => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <ModalProvider>
          <NotesProvider>
            <SocialProvider>
              {children}
            </SocialProvider>
          </NotesProvider>
        </ModalProvider>
      </AuthProvider>
    </LanguageProvider>
  );
};

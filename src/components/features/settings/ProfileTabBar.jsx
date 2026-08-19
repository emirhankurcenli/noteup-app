import React from 'react';

const ProfileTabBar = ({ profileSubTab, setProfileSubTab, triggerHaptic, isLight, t }) => {
  return (
    <div style={{
      display: 'flex',
      background: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
      borderRadius: '16px',
      padding: '4px',
      marginBottom: '20px',
      border: isLight ? '1px solid rgba(0,0,0,0.06)' : '1px solid rgba(255,255,255,0.08)',
      backdropFilter: 'blur(12px)'
    }}>
      {/* Account Tab */}
      <button
        onClick={() => { if (triggerHaptic) triggerHaptic('light'); setProfileSubTab('account'); }}
        style={{
          flex: 1,
          padding: '10px 8px',
          borderRadius: '12px',
          border: 'none',
          fontSize: '0.8rem',
          fontWeight: '700',
          cursor: 'pointer',
          background: profileSubTab === 'account' ? (isLight ? '#FFFFFF' : 'linear-gradient(135deg, #3B82F6, #2563EB)') : 'transparent',
          color: profileSubTab === 'account' ? (isLight ? '#0F172A' : '#FFFFFF') : 'var(--text-secondary)',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: profileSubTab === 'account' ? '0 4px 12px rgba(0,0,0,0.12)' : 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px'
        }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <span>{t('tabAccount')}</span>
      </button>

      {/* Social Tab */}
      <button
        onClick={() => { if (triggerHaptic) triggerHaptic('light'); setProfileSubTab('social'); }}
        style={{
          flex: 1,
          padding: '10px 8px',
          borderRadius: '12px',
          border: 'none',
          fontSize: '0.8rem',
          fontWeight: '700',
          cursor: 'pointer',
          background: profileSubTab === 'social' ? (isLight ? '#FFFFFF' : 'linear-gradient(135deg, #3B82F6, #2563EB)') : 'transparent',
          color: profileSubTab === 'social' ? (isLight ? '#0F172A' : '#FFFFFF') : 'var(--text-secondary)',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: profileSubTab === 'social' ? '0 4px 12px rgba(0,0,0,0.12)' : 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px'
        }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        <span>{t('tabSocial')}</span>
      </button>

      {/* Settings Tab */}
      <button
        onClick={() => { if (triggerHaptic) triggerHaptic('light'); setProfileSubTab('settings'); }}
        style={{
          flex: 1,
          padding: '10px 8px',
          borderRadius: '12px',
          border: 'none',
          fontSize: '0.8rem',
          fontWeight: '700',
          cursor: 'pointer',
          background: profileSubTab === 'settings' ? (isLight ? '#FFFFFF' : 'linear-gradient(135deg, #3B82F6, #2563EB)') : 'transparent',
          color: profileSubTab === 'settings' ? (isLight ? '#0F172A' : '#FFFFFF') : 'var(--text-secondary)',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: profileSubTab === 'settings' ? '0 4px 12px rgba(0,0,0,0.12)' : 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px'
        }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
        <span>{t('tabSettings')}</span>
      </button>
    </div>
  );
};

export default ProfileTabBar;

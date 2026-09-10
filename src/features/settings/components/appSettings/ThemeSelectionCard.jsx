import React from 'react';

const ThemeSelectionCard = ({ theme, setTheme, triggerHaptic, isLight, lang, t }) => {
  return (
    <div style={{
      padding: '14px 16px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      background: isLight ? 'rgba(255,255,255,0.85)' : 'rgba(18, 24, 36, 0.85)',
      backdropFilter: 'blur(12px)',
      borderRadius: '16px',
      border: isLight ? '1px solid rgba(0,0,0,0.06)' : '1px solid rgba(255,255,255,0.08)',
      boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          background: isLight ? 'linear-gradient(135deg, #6366F1, #8B5CF6)' : 'rgba(99, 102, 241, 0.18)',
          border: isLight ? 'none' : '1px solid rgba(99, 102, 241, 0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: isLight ? '#FFF' : '#818CF8',
          boxShadow: isLight ? '0 2px 8px rgba(99, 102, 241, 0.3)' : 'none'
        }}>
          {isLight ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </div>
        <div>
          <span style={{ fontSize: '0.88rem', fontWeight: 800, color: isLight ? '#0F172A' : '#FFFFFF', display: 'block' }}>
            {t('themeMode')}
          </span>
          <span style={{ fontSize: '0.74rem', color: isLight ? '#475569' : '#CBD5E1', fontWeight: 600 }}>
            {isLight ? t('lightModeActive') : t('darkModeActive')}
          </span>
        </div>
      </div>

      <div style={{
        display: 'flex',
        background: isLight ? '#F1F5F9' : 'rgba(0, 0, 0, 0.3)',
        padding: '3px',
        borderRadius: '10px',
        border: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.08)'
      }}>
        <button
          onClick={() => {
            if (theme !== 'light') {
              if (triggerHaptic) triggerHaptic('light');
              setTheme('light');
            }
          }}
          style={{
            padding: '6px 12px',
            borderRadius: '8px',
            border: 'none',
            background: isLight ? 'linear-gradient(135deg, #6366F1, #4F46E5)' : 'transparent',
            color: isLight ? '#FFF' : '#94A3B8',
            fontSize: '0.78rem',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: isLight ? '0 2px 8px rgba(99, 102, 241, 0.3)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          {t('light')}
        </button>
        <button
          onClick={() => {
            if (theme !== 'dark') {
              if (triggerHaptic) triggerHaptic('light');
              setTheme('dark');
            }
          }}
          style={{
            padding: '6px 12px',
            borderRadius: '8px',
            border: 'none',
            background: !isLight ? 'linear-gradient(135deg, #6366F1, #4F46E5)' : 'transparent',
            color: !isLight ? '#FFF' : '#64748B',
            fontSize: '0.78rem',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: !isLight ? '0 2px 8px rgba(99, 102, 241, 0.3)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          {t('dark')}
        </button>
      </div>
    </div>
  );
};

export default ThemeSelectionCard;

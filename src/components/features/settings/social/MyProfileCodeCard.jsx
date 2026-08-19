import React from 'react';

const MyProfileCodeCard = ({ myCode, setToast, lang, isLight, t }) => {
  return (
    <div style={{
      padding: '16px 18px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      background: isLight 
        ? 'linear-gradient(135deg, rgba(239, 246, 255, 0.95), rgba(219, 234, 254, 0.7))'
        : 'linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(37, 99, 235, 0.05))',
      backdropFilter: 'blur(12px)',
      borderRadius: '16px',
      border: isLight ? '1.5px solid rgba(59, 130, 246, 0.3)' : '1.5px solid rgba(59, 130, 246, 0.25)',
      boxShadow: isLight ? '0 4px 15px rgba(59, 130, 246, 0.08)' : '0 4px 16px rgba(59, 130, 246, 0.08)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '34px',
          height: '34px',
          borderRadius: '10px',
          background: isLight ? 'linear-gradient(135deg, #3B82F6, #2563EB)' : 'linear-gradient(135deg, #1E40AF, #1E3A8A)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFFFFF',
          boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <span style={{ fontSize: '0.92rem', fontWeight: 800, color: isLight ? '#1E3A8A' : 'var(--text-primary)' }}>
          {t('myProfileCode')}
        </span>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: isLight ? '#FFFFFF' : 'rgba(0, 0, 0, 0.25)',
        padding: '8px 12px 8px 16px',
        borderRadius: '12px',
        border: isLight ? '1px solid #BFDBFE' : '1px solid rgba(255,255,255,0.1)',
        boxShadow: isLight ? '0 2px 8px rgba(0,0,0,0.04)' : 'none'
      }}>
        <span style={{ fontSize: '1.05rem', fontWeight: 800, fontFamily: 'monospace', letterSpacing: '1px', color: isLight ? '#1D4ED8' : '#60A5FA' }}>
          {myCode}
        </span>
        <button 
          onClick={() => {
            const codeToCopy = myCode ? myCode.replace(/^(HUB-?)+/i, '') : '';
            navigator.clipboard.writeText(codeToCopy);
            setToast({ title: `📋 ${t('copiedBtn')}`, msg: lang === 'tr' ? 'Profil kodunuz panoya kopyalandı.' : 'Profile code copied to clipboard.' });
          }}
          style={{
            padding: '7px 14px',
            borderRadius: '8px',
            border: 'none',
            background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
            color: '#FFF',
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          {t('copyBtn')}
        </button>
      </div>
    </div>
  );
};

export default MyProfileCodeCard;

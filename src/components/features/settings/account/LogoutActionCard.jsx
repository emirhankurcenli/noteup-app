import React, { useState } from 'react';

const LogoutActionCard = ({ handleLogout, triggerHaptic, isLight, lang }) => {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div style={{
      padding: '16px',
      borderRadius: '16px',
      background: isLight ? 'rgba(239, 68, 68, 0.05)' : 'rgba(239, 68, 68, 0.08)',
      border: '1px solid rgba(239, 68, 68, 0.2)',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    }}>
      {!showConfirm ? (
        <button
          onClick={() => {
            if (triggerHaptic) triggerHaptic('warning');
            setShowConfirm(true);
          }}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '12px',
            border: 'none',
            background: 'linear-gradient(135deg, #EF4444, #DC2626)',
            color: '#FFF',
            fontSize: '0.9rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 4px 14px rgba(239, 68, 68, 0.3)'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span>{lang === 'tr' ? 'Çıkış Yap' : 'Log Out'}</span>
        </button>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#EF4444', textAlign: 'center' }}>
            {lang === 'tr' ? 'Oturumu kapatmak istediğinize emin misiniz?' : 'Are you sure you want to log out?'}
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setShowConfirm(false)}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '10px',
                border: isLight ? '1px solid #CBD5E1' : '1px solid rgba(255,255,255,0.1)',
                background: isLight ? '#F8FAFC' : 'rgba(0,0,0,0.2)',
                color: isLight ? '#0F172A' : '#FFF',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {lang === 'tr' ? 'İptal' : 'Cancel'}
            </button>
            <button
              onClick={() => {
                if (triggerHaptic) triggerHaptic('medium');
                handleLogout();
              }}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '10px',
                border: 'none',
                background: '#EF4444',
                color: '#FFF',
                fontSize: '0.82rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              {lang === 'tr' ? 'Evet, Çıkış Yap' : 'Yes, Log Out'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogoutActionCard;

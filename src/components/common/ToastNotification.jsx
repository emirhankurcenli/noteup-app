import React from 'react';
import Icons from './Icons';

const stripEmojis = (str = '') => {
  if (typeof str !== 'string') return '';
  return str
    .replace(/[\u{1F000}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{D800}-\u{DBFF}][\u{DC00}-\u{DFFF}]/gu, '')
    .trim();
};

const ToastNotification = ({ toast, setToast }) => {
  if (!toast) return null;

  const rawTitle = toast.title || '';
  const rawMsg = toast.msg || '';

  const isPinToast = rawTitle.toLowerCase().includes('sabit') || rawTitle.includes('📌');
  const isProfileToast = rawTitle.toLowerCase().includes('profil') || rawMsg.toLowerCase().includes('profil');
  const isErrorToast = rawTitle.includes('❌') || rawTitle.toLowerCase().includes('hata') || rawTitle.toLowerCase().includes('error');
  const isSuccessToast = rawTitle.includes('✅') || rawTitle.includes('🎨') || rawTitle.toLowerCase().includes('başarılı') || rawTitle.toLowerCase().includes('kaydedildi');

  const renderIcon = () => {
    if (toast.icon) return toast.icon;

    // 📌 Pin / Sabitleme Bildirimi İkonu
    if (isPinToast) {
      return (
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(239, 68, 68, 0.25))',
          border: '1.5px solid rgba(245, 158, 11, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#F59E0B',
          boxShadow: '0 2px 10px rgba(245, 158, 11, 0.3)',
          flexShrink: 0
        }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="17" x2="12" y2="22" />
            <path d="M5 17h14l-1.5-6H19l-1.5-6h-11L5 11h1.5z" />
          </svg>
        </div>
      );
    }

    // 👤 Profil Güncelleme İkonu
    if (isProfileToast) {
      return (
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.25), rgba(16, 185, 129, 0.25))',
          border: '1.5px solid rgba(59, 130, 246, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#3B82F6',
          boxShadow: '0 2px 10px rgba(59, 130, 246, 0.3)',
          flexShrink: 0
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
            <path d="M16 11l2 2 4-4" stroke="#10B981" strokeWidth="2.5" />
          </svg>
        </div>
      );
    }

    // ❌ Hata İkonu
    if (isErrorToast) {
      return (
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: 'rgba(239, 68, 68, 0.18)',
          border: '1.5px solid rgba(239, 68, 68, 0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#EF4444',
          flexShrink: 0
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>
      );
    }

    // ✅ Başarı İkonu
    if (isSuccessToast) {
      return (
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: 'rgba(16, 185, 129, 0.18)',
          border: '1.5px solid rgba(16, 185, 129, 0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#10B981',
          flexShrink: 0
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      );
    }

    return (
      <div style={{
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        background: 'rgba(99, 102, 241, 0.18)',
        border: '1.5px solid rgba(99, 102, 241, 0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#818CF8',
        flexShrink: 0
      }}>
        <Icons.Reminder />
      </div>
    );
  };

  const cleanTitle = stripEmojis(rawTitle);
  const cleanMsg = stripEmojis(rawMsg);

  return (
    <div key={rawTitle + rawMsg} className="toast-notification">
      <div className="toast-icon">
        {renderIcon()}
      </div>
      <div className="toast-content animate-fade-in">
        <div className="toast-title">{cleanTitle || rawTitle}</div>
        {cleanMsg && <div className="toast-msg">{cleanMsg}</div>}
      </div>
      <button className="toast-close" onClick={() => setToast(null)}>×</button>
      <div className="toast-progress-bar"></div>
    </div>
  );
};

export default ToastNotification;

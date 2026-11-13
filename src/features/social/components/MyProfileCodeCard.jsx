import React, { useState } from 'react';

const MyProfileCodeCard = ({ myCode, setToast, lang, isLight, t }) => {
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const codeToCopy = myCode ? myCode.replace(/^(HUB-?)+/i, '') : '';
    navigator.clipboard.writeText(codeToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setToast?.({
      title: `📋 ${t('copiedBtn') || 'Kopyalandı'}`,
      msg: lang === 'tr' ? 'Profil kodunuz panoya kopyalandı.' : 'Profile code copied to clipboard.'
    });
  };

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
      borderRadius: '18px',
      border: isLight ? '1.5px solid rgba(59, 130, 246, 0.25)' : '1.5px solid rgba(59, 130, 246, 0.25)',
      boxShadow: isLight ? '0 4px 18px rgba(59, 130, 246, 0.08)' : '0 4px 18px rgba(0, 0, 0, 0.25)',
      boxSizing: 'border-box',
      width: '100%',
    }}>
      {/* ── Top Header Row ────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
            boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
            flexShrink: 0
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

        {/* Header QR Action Pill */}
        <button
          onClick={() => setShowQR(v => !v)}
          style={{
            padding: '6px 12px',
            borderRadius: '10px',
            border: showQR 
              ? 'none' 
              : isLight ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(255, 255, 255, 0.12)',
            background: showQR 
              ? 'linear-gradient(135deg, #3B82F6, #2563EB)' 
              : isLight ? '#FFFFFF' : 'rgba(255, 255, 255, 0.08)',
            color: showQR ? '#FFFFFF' : (isLight ? '#2563EB' : '#93C5FD'),
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: showQR ? '0 2px 10px rgba(59, 130, 246, 0.35)' : 'none',
            transition: 'all 0.2s ease',
            flexShrink: 0,
          }}
          title={showQR ? 'QR Gizle' : 'QR Kodunu Göster'}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
            <line x1="7" y1="7" x2="7.01" y2="7" strokeWidth="3" />
            <line x1="17" y1="7" x2="17.01" y2="7" strokeWidth="3" />
            <line x1="7" y1="17" x2="7.01" y2="17" strokeWidth="3" />
          </svg>
          {showQR ? (lang === 'tr' ? 'QR Gizle' : 'Hide QR') : (lang === 'tr' ? 'QR Göster' : 'Show QR')}
        </button>
      </div>

      {/* ── Main Code & Copy Bar ──────────────────────────────────── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: isLight ? '#FFFFFF' : 'rgba(0, 0, 0, 0.3)',
        padding: '10px 12px 10px 16px',
        borderRadius: '14px',
        border: isLight ? '1px solid #BFDBFE' : '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: isLight ? '0 2px 8px rgba(0, 0, 0, 0.04)' : 'none',
        gap: '12px',
        boxSizing: 'border-box',
        width: '100%',
        minWidth: 0,
      }}>
        {/* Single-line Monospace Code */}
        <span style={{ 
          fontSize: '0.96rem', 
          fontWeight: 800, 
          fontFamily: 'monospace', 
          letterSpacing: '1px', 
          color: isLight ? '#1D4ED8' : '#60A5FA',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          flex: 1,
        }}>
          {myCode}
        </span>

        {/* Copy Button */}
        <button 
          onClick={handleCopy}
          style={{
            padding: '8px 14px',
            borderRadius: '10px',
            border: 'none',
            background: copied 
              ? 'linear-gradient(135deg, #10B981, #059669)' 
              : 'linear-gradient(135deg, #3B82F6, #2563EB)',
            color: '#FFFFFF',
            fontSize: '0.78rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: copied 
              ? '0 2px 8px rgba(16, 185, 129, 0.35)' 
              : '0 2px 8px rgba(59, 130, 246, 0.3)',
            transition: 'all 0.2s ease',
            flexShrink: 0,
            whiteSpace: 'nowrap',
          }}
        >
          {copied ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {lang === 'tr' ? 'Kopyalandı' : 'Copied'}
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              {t('copyBtn') || 'Kopyala'}
            </>
          )}
        </button>
      </div>

      {/* ── Expandable QR Code Card ──────────────────────────────── */}
      {showQR && myCode && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px',
          padding: '16px',
          background: isLight ? '#FFFFFF' : 'rgba(0, 0, 0, 0.4)',
          borderRadius: '16px',
          border: isLight ? '1.5px solid #BFDBFE' : '1px solid rgba(59, 130, 246, 0.3)',
          boxShadow: isLight ? '0 6px 20px rgba(59, 130, 246, 0.1)' : '0 6px 20px rgba(0, 0, 0, 0.3)',
          boxSizing: 'border-box',
          width: '100%',
        }} className="animate-fade-in">
          <div style={{
            padding: '10px',
            background: '#FFFFFF',
            borderRadius: '12px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(myCode)}&margin=2&color=1D4ED8&bgcolor=FFFFFF`}
              alt="Profil QR Kodu"
              style={{ width: '150px', height: '150px', borderRadius: '8px', display: 'block' }}
            />
          </div>
          <span style={{ 
            fontSize: '0.76rem', 
            color: isLight ? '#475569' : '#94A3B8', 
            fontWeight: 600,
            textAlign: 'center',
            lineHeight: 1.4,
            maxWidth: '240px'
          }}>
            {lang === 'tr' 
              ? 'Arkadaşınız kamerasını veya NoteUp uygulamasını açarak bu kodu okutabilir.' 
              : 'Your friend can scan this code using their camera or NoteUp app.'}
          </span>
        </div>
      )}
    </div>
  );
};

export default MyProfileCodeCard;

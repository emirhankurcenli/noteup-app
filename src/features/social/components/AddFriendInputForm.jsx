import React, { useState, useRef, useCallback } from 'react';
import InAppQRScannerModal from './InAppQRScannerModal';

const AddFriendInputForm = ({
  partnerCodeInput,
  setPartnerCodeInput,
  formatFriendCode,
  handleSendFriendRequest,
  isSendingRequest,
  triggerHaptic,
  lang,
  isLight,
  t
}) => {
  const [inputError, setInputError] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const inputRef = useRef(null);

  const triggerInputError = (msg) => {
    setInputError(msg);
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 550);
    setTimeout(() => setInputError(''), 3500);
    if (inputRef.current) inputRef.current.focus();
  };

  const handleScanClick = () => {
    setShowScanner((prev) => !prev);
  };

  const handleScanSuccess = useCallback((scannedCode) => {
    setShowScanner(false);
    if (!scannedCode) return;
    const formatted = formatFriendCode(scannedCode);
    setPartnerCodeInput(formatted);
  }, [formatFriendCode, setPartnerCodeInput]);

  const hasCode = Boolean(partnerCodeInput && partnerCodeInput.trim().length > 3);

  return (
    <div style={{
      padding: '16px 18px',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
      background: isLight ? 'rgba(255,255,255,0.85)' : 'rgba(18, 24, 36, 0.85)',
      backdropFilter: 'blur(12px)',
      borderRadius: '18px',
      border: isLight ? '1px solid rgba(0,0,0,0.06)' : '1px solid rgba(255,255,255,0.08)',
      boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
      boxSizing: 'border-box',
      width: '100%',
      overflow: 'hidden'
    }}>
      {/* ── Header ────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '9px',
          background: isLight ? 'linear-gradient(135deg, #10B981, #059669)' : 'linear-gradient(135deg, #065F46, #064E3B)',
          border: isLight ? 'none' : '1px solid rgba(52, 211, 153, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFFFFF',
          boxShadow: isLight ? '0 2px 8px rgba(16, 185, 129, 0.25)' : '0 2px 8px rgba(6, 95, 70, 0.3)',
          flexShrink: 0
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="8.5" cy="7" r="4" />
            <line x1="20" y1="8" x2="20" y2="14" />
            <line x1="17" y1="11" x2="23" y2="11" />
          </svg>
        </div>
        <span style={{ fontSize: '0.9rem', fontWeight: 800, color: isLight ? '#0F172A' : 'var(--text-primary)' }}>
          {t('addFriendLabel')}
        </span>
      </div>

      {/* ── Inputs & Action Controls ───────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
        {/* Input Wrapper with Embedded Camera Button */}
        <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
          <input 
            ref={inputRef}
            type="text" 
            placeholder="HUB-XXXX-XXXX" 
            value={partnerCodeInput}
            onChange={(e) => {
              setPartnerCodeInput(formatFriendCode(e.target.value));
              if (inputError) setInputError('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isSendingRequest && hasCode) {
                handleSendFriendRequest(triggerInputError);
              }
            }}
            autoCapitalize="characters"
            autoCorrect="off"
            autoComplete="off"
            spellCheck="false"
            className={isShaking ? 'input-shake-error' : ''}
            style={{ 
              width: '100%',
              padding: '12px 48px 12px 14px',
              borderRadius: '12px',
              fontSize: '0.92rem',
              fontFamily: 'monospace',
              letterSpacing: '0.8px',
              background: isLight ? '#F8FAFC' : 'rgba(0,0,0,0.25)',
              border: inputError
                ? '1.5px solid #EF4444'
                : isLight ? '1.5px solid #CBD5E1' : '1.5px solid rgba(255,255,255,0.12)',
              color: inputError ? '#EF4444' : (isLight ? '#0F172A' : '#FFF'),
              transition: 'border-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />

          {/* Sleek Embedded Camera Scanner Button */}
          <button
            type="button"
            onClick={handleScanClick}
            style={{
              position: 'absolute',
              right: '6px',
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              border: 'none',
              background: showScanner
                ? '#10B981'
                : (isLight ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.15)'),
              color: showScanner ? '#FFFFFF' : '#10B981',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              padding: 0,
              boxShadow: showScanner ? '0 2px 8px rgba(16, 185, 129, 0.4)' : 'none',
            }}
            title={lang === 'tr' ? 'Kamera ile QR Kod Tara' : 'Scan QR code with camera'}
          >
            {/* Real Camera SVG Icon */}
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </button>
        </div>

        {/* Full-width "İstek Gönder" Action Button */}
        <button 
          onClick={() => handleSendFriendRequest(triggerInputError)}
          disabled={isSendingRequest || !hasCode}
          style={{
            width: '100%',
            height: '42px',
            borderRadius: '12px',
            border: 'none',
            background: isSendingRequest || !hasCode
              ? (isLight ? '#E2E8F0' : 'rgba(255, 255, 255, 0.08)')
              : 'linear-gradient(135deg, #10B981, #059669)',
            color: isSendingRequest || !hasCode ? (isLight ? '#94A3B8' : '#64748B') : '#FFFFFF',
            fontSize: '0.85rem',
            fontWeight: 800,
            cursor: isSendingRequest || !hasCode ? 'not-allowed' : 'pointer',
            boxShadow: isSendingRequest || !hasCode ? 'none' : '0 3px 12px rgba(16, 185, 129, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s ease',
            boxSizing: 'border-box',
          }}
        >
          {isSendingRequest ? (
            <>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              <span>{lang === 'tr' ? 'İstek Gönderiliyor...' : 'Sending Request...'}</span>
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
              <span>{t('sendInviteBtn') || 'İstek Gönder'}</span>
            </>
          )}
        </button>

        {/* Input Error Alert */}
        {inputError && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            borderRadius: '10px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            boxSizing: 'border-box',
            width: '100%',
          }} className="animate-fade-in">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#EF4444' }}>{inputError}</span>
          </div>
        )}
      </div>

      {/* ── In-App Live Camera QR Scanner Modal ─────────────────── */}
      <InAppQRScannerModal
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScanSuccess={handleScanSuccess}
        triggerHaptic={triggerHaptic}
        lang={lang}
      />
    </div>
  );
};

export default AddFriendInputForm;

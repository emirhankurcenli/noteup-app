import React, { useState, useRef } from 'react';

const AddFriendInputForm = ({
  partnerCodeInput,
  setPartnerCodeInput,
  formatFriendCode,
  handleSendFriendRequest,
  isSendingRequest,
  lang,
  isLight,
  t
}) => {
  const [inputError, setInputError] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const inputRef = useRef(null);

  const triggerInputError = (msg) => {
    setInputError(msg);
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 550);
    setTimeout(() => setInputError(''), 3000);
    if (inputRef.current) inputRef.current.focus();
  };

  return (
    <div style={{
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      background: isLight ? 'rgba(255,255,255,0.85)' : 'rgba(18, 24, 36, 0.85)',
      backdropFilter: 'blur(12px)',
      borderRadius: '16px',
      border: isLight ? '1px solid rgba(0,0,0,0.06)' : '1px solid rgba(255,255,255,0.08)',
      boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          background: isLight ? 'linear-gradient(135deg, #10B981, #059669)' : 'linear-gradient(135deg, #065F46, #064E3B)',
          border: isLight ? 'none' : '1px solid rgba(52, 211, 153, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFFFFF',
          boxShadow: isLight ? '0 2px 8px rgba(16, 185, 129, 0.25)' : '0 2px 8px rgba(6, 95, 70, 0.3)'
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="8.5" cy="7" r="4" />
            <line x1="20" y1="8" x2="20" y2="14" />
            <line x1="17" y1="11" x2="23" y2="11" />
          </svg>
        </div>
        <span style={{ fontSize: '0.88rem', fontWeight: 700, color: isLight ? '#0F172A' : 'var(--text-primary)' }}>{t('addFriendLabel')}</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
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
              if (e.key === 'Enter' && !isSendingRequest) {
                handleSendFriendRequest(triggerInputError);
              }
            }}
            autoCapitalize="characters"
            autoCorrect="off"
            autoComplete="off"
            spellCheck="false"
            className={isShaking ? 'input-shake-error' : ''}
            style={{ 
              flex: 1,
              padding: '10px 14px',
              borderRadius: '10px',
              fontSize: '0.85rem',
              fontFamily: 'monospace',
              letterSpacing: '0.5px',
              background: isLight ? '#F8FAFC' : 'rgba(0,0,0,0.2)',
              border: inputError
                ? '1.5px solid #EF4444'
                : isLight ? '1px solid #CBD5E1' : '1px solid rgba(255,255,255,0.1)',
              color: inputError ? '#EF4444' : (isLight ? '#0F172A' : '#FFF'),
              transition: 'border-color 0.2s ease, color 0.2s ease',
              outline: 'none'
            }}
          />
          <button 
            onClick={() => handleSendFriendRequest(triggerInputError)}
            disabled={isSendingRequest}
            style={{
              padding: '10px 16px',
              borderRadius: '10px',
              border: 'none',
              background: isSendingRequest
                ? 'rgba(148, 163, 184, 0.3)'
                : 'linear-gradient(135deg, #10B981, #059669)',
              color: isSendingRequest ? '#94A3B8' : '#FFF',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: isSendingRequest ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: isSendingRequest ? 'none' : '0 2px 8px rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            {isSendingRequest ? (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                {lang === 'tr' ? 'Kontrol...' : 'Checking...'}
              </>
            ) : t('sendInviteBtn')}
          </button>
        </div>

        {inputError && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 10px',
            borderRadius: '8px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.25)'
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#EF4444' }}>{inputError}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddFriendInputForm;

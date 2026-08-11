import React, { useState, useRef } from 'react';

const cleanText = (text) => {
  if (typeof text !== 'string') return text || '';
  return text.replace(/<[^>]*>/g, '').trim();
};

const SocialSubTab = ({
  myCode,
  setToast,
  partnerCodeInput,
  setPartnerCodeInput,
  formatFriendCode,
  handleSendFriendRequest,
  friendRequests = [],
  handleAcceptFriendRequest,
  handleRejectFriendRequest,
  friends = [],
  handleDisconnect,
  userPlan,
  grantedUltraFriendCode,
  ultraGrantRecord,
  ultraGiftFrom,
  isPrimaryUltra,
  isGiftedUltra,
  handleGrantUltraGift,
  isSendingRequest,
  lang,
  isLight,
  t,
}) => {
  const [inputError, setInputError] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const inputRef = useRef(null);

  const triggerInputError = (msg) => {
    setInputError(msg);
    setIsShaking(true);
    // Remove shake class after animation ends so it can be re-triggered
    setTimeout(() => setIsShaking(false), 550);
    // Clear error message after 3 seconds
    setTimeout(() => setInputError(''), 3000);
    if (inputRef.current) inputRef.current.focus();
  };

  const pendingRequests = friendRequests.filter(r => r.toCode === myCode && !r.processed && r.status === 'pending');

  return (
    <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* GIFTED ULTRA BANNER (If user received Ultra as a gift from a friend) */}
      {isGiftedUltra && ultraGiftFrom && (
        <div style={{
          padding: '14px 16px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(217, 119, 6, 0.08))',
          border: '1.5px solid rgba(245, 158, 11, 0.35)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #F59E0B, #D97706)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFF',
            fontSize: '1.1rem',
            boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)',
            flexShrink: 0
          }}>
            👑
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', fontWeight: 800, color: isLight ? '#92400E' : '#FBBF24', margin: 0 }}>
              {ultraGiftFrom.fromName} Tarafından Hediye Ultra!
            </p>
            <p style={{ fontSize: '0.72rem', color: isLight ? '#78350F' : '#FDE68A', margin: '3px 0 0 0', lineHeight: 1.35 }}>
              Arkadaşınızın satın aldığı abonelik dönemi boyunca ({ultraGiftFrom.expiresAt ? new Date(ultraGiftFrom.expiresAt).toLocaleDateString() : 'Dönem Sonu'}) tüm Ultra ayrıcalıklarından yararlanıyorsunuz.
            </p>
          </div>
        </div>
      )}

      {/* MY PROFILE CODE CARD */}
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
            border: isLight ? 'none' : '1px solid rgba(96, 165, 250, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: isLight ? '0 2px 8px rgba(59, 130, 246, 0.3)' : '0 2px 8px rgba(30, 64, 175, 0.3)'
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 800, color: isLight ? '#1E3A8A' : 'var(--text-primary)' }}>{t('myProfileCode')}</span>
            <span style={{ fontSize: '0.7rem', color: isLight ? '#475569' : 'var(--text-muted)' }}>{t('profileCodeHelp')}</span>
          </div>
        </div>

        {/* Code & Copy button */}
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
              navigator.clipboard.writeText(myCode);
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

      {/* ADD FRIEND CARD */}
      <div style={{
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        background: isLight ? 'rgba(255,255,255,0.85)' : 'rgba(24, 24, 37, 0.75)',
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

          {/* Error message under input */}
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

      {/* FRIEND REQUESTS SECTION */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', paddingLeft: '4px' }}>
          {cleanText(t('friendRequestsTitle'))} ({pendingRequests.length})
        </span>

        {pendingRequests.length > 0 ? (
          pendingRequests.map(req => (
            <div key={req.id} style={{
              padding: '14px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: isLight ? 'rgba(245, 158, 11, 0.12)' : 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '14px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {req.fromPhotoUrl ? (
                  <img 
                    src={req.fromPhotoUrl} 
                    alt={req.fromName} 
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '1.5px solid rgba(245, 158, 11, 0.5)'
                    }} 
                  />
                ) : (
                  <div style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                    color: '#FFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.85rem'
                  }}>
                    {(req.fromName || 'A').charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p style={{ fontSize: '0.85rem', fontWeight: 700, color: isLight ? '#0F172A' : 'var(--text-primary)', margin: 0 }}>{req.fromName}</p>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '2px 0 0 0', fontFamily: 'monospace' }}>Kod: {req.fromCode}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => handleRejectFriendRequest(req)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#EF4444',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {t('reject')}
                </button>
                <button 
                  onClick={() => handleAcceptFriendRequest(req)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #10B981, #059669)',
                    color: '#FFF',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  {t('accept')}
                </button>
              </div>
            </div>
          ))
        ) : (
          <p style={{
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
            textAlign: 'center',
            padding: '12px',
            background: isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)',
            borderRadius: '12px',
            border: isLight ? '1px dashed #CBD5E1' : '1px dashed var(--border-color)',
            margin: 0
          }}>
            {t('noPendingRequests')}
          </p>
        )}
      </div>

      {/* MY FRIENDS LIST */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', paddingLeft: '4px' }}>
          {cleanText(t('myFriendsTitle'))} ({friends.length})
        </span>

        {friends.length > 0 ? (
          friends.map(friend => {
            const isGrantedUltra = grantedUltraFriendCode === friend.code;
            const hasOtherGrantedInPeriod = !!grantedUltraFriendCode && !isGrantedUltra;

            return (
              <div key={friend.code} style={{
                padding: '12px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: isLight ? 'rgba(255,255,255,0.85)' : 'rgba(24, 24, 37, 0.75)',
                borderRadius: '14px',
                border: isGrantedUltra
                  ? '1.5px solid rgba(245, 158, 11, 0.5)'
                  : isLight ? '1px solid rgba(0,0,0,0.06)' : '1px solid rgba(255,255,255,0.06)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {friend.photo_url ? (
                    <img 
                      src={friend.photo_url} 
                      alt={friend.name} 
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: isGrantedUltra ? '2px solid #F59E0B' : '1.5px solid rgba(99, 102, 241, 0.4)'
                      }} 
                    />
                  ) : (
                    <div style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      background: isGrantedUltra
                        ? 'linear-gradient(135deg, #F59E0B, #D97706)'
                        : 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                      color: '#FFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      boxShadow: isGrantedUltra ? '0 2px 8px rgba(245, 158, 11, 0.3)' : 'none'
                    }}>
                      {isGrantedUltra ? '👑' : (friend.name ? friend.name.charAt(0).toUpperCase() : 'A')}
                    </div>
                  )}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <p style={{ fontSize: '0.85rem', fontWeight: 700, color: isLight ? '#0F172A' : 'var(--text-primary)', margin: 0 }}>
                        {friend.name}
                      </p>
                      {isGrantedUltra && (
                        <span style={{
                          fontSize: '0.65rem',
                          padding: '1px 6px',
                          borderRadius: '8px',
                          background: 'rgba(245, 158, 11, 0.15)',
                          color: '#F59E0B',
                          fontWeight: 800,
                          border: '1px solid rgba(245, 158, 11, 0.3)'
                        }}>
                          ULTRA AKTİF
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '2px 0 0 0', fontFamily: 'monospace' }}>
                      Kod: {friend.code}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {/* ULTRA GIFT BUTTON (Only shown for primary Ultra buyers) */}
                  {userPlan === 'ultra' && !isGiftedUltra && (
                    <button
                      onClick={() => handleGrantUltraGift && handleGrantUltraGift(friend.code, friend.name)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '8px',
                        border: isGrantedUltra ? '1px solid rgba(245, 158, 11, 0.4)' : 'none',
                        background: isGrantedUltra
                          ? 'rgba(245, 158, 11, 0.15)'
                          : hasOtherGrantedInPeriod
                          ? 'rgba(148, 163, 184, 0.2)'
                          : 'linear-gradient(135deg, #F59E0B, #D97706)',
                        color: isGrantedUltra
                          ? '#F59E0B'
                          : hasOtherGrantedInPeriod
                          ? '#94A3B8'
                          : '#FFF',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        cursor: hasOtherGrantedInPeriod ? 'default' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        boxShadow: isGrantedUltra || hasOtherGrantedInPeriod ? 'none' : '0 2px 8px rgba(245, 158, 11, 0.3)',
                        opacity: hasOtherGrantedInPeriod ? 0.6 : 1
                      }}
                      title={isGrantedUltra ? 'Ultra hediyesi bu dönem boyunca aktiftir ve geri alınamaz' : '1 arkadaşına Ultra plan hediye et'}
                    >
                      <span>👑</span>
                      {isGrantedUltra ? 'Ultra Aktif' : hasOtherGrantedInPeriod ? 'Hak Kullanıldı' : 'Ultra Hediye Et'}
                    </button>
                  )}

                  <button 
                    onClick={() => handleDisconnect(friend.code)}
                    style={{
                      padding: '5px 10px',
                      borderRadius: '8px',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      background: 'rgba(239, 68, 68, 0.05)',
                      color: '#EF4444',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {t('confirmDelete')}
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{
            padding: '16px',
            textAlign: 'center',
            background: isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)',
            borderRadius: '14px',
            border: isLight ? '1px dashed #CBD5E1' : '1px dashed var(--border-color)'
          }}>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
              {t('friendHelpMsg')}
            </p>
          </div>
        )}
      </div>

    </div>
  );
};

export default SocialSubTab;

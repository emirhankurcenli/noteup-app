import React, { useState, useEffect } from 'react';

const cleanText = (str) => {
  if (!str) return '';
  return str.replace(/^[\s\p{Extended_Pictographic}\u2300-\u23FF\u2600-\u27BF]+/gu, '').trim();
};

const PLAN_LIMITS = { lite: 1, pro: 8, ultra: 20, vip: 20 };

const SelectFriendsShareModal = ({
  activeShareNoteId,
  setActiveShareNoteId,
  friends = [],
  selectedFriendCodes = [],
  setSelectedFriendCodes,
  handleSendShareInvitation,
  notes = [],
  theme = 'dark',
  lang = 'tr',
  t,
  userPlan = 'lite',
  setShowPaywall,
  setShowRewardedAdModal,
  setPendingShareReward,
}) => {
  const [bonusSlots, setBonusSlots] = useState(0);

  useEffect(() => {
    if (activeShareNoteId) {
      setBonusSlots(0);
      if (Array.isArray(notes)) {
        const targetNote = notes.find(n => n.id === activeShareNoteId);
        if (targetNote && Array.isArray(targetNote.sharedWith)) {
          setSelectedFriendCodes(targetNote.sharedWith);
        }
      }
    }
  }, [activeShareNoteId, notes]);

  if (!activeShareNoteId) return null;

  const isLight = theme === 'light';
  const nativeLimit = PLAN_LIMITS[userPlan] || 1;
  const maxAllowed = nativeLimit + bonusSlots;

  const handleFriendToggle = (friendCode) => {
    const isSelected = selectedFriendCodes.includes(friendCode);
    if (isSelected) {
      setSelectedFriendCodes(prev => prev.filter(c => c !== friendCode));
    } else {
      if (selectedFriendCodes.length >= maxAllowed) {
        // Limit doldu! Seçimi engelle ve reklam/plan modalını aç
        if (setPendingShareReward && setShowRewardedAdModal) {
          setPendingShareReward({
            type: 'select_friend',
            codeToSelect: friendCode,
            onGranted: (targetCode) => {
              setBonusSlots(prev => prev + 1);
              setSelectedFriendCodes(prev => (prev.includes(targetCode) ? prev : [...prev, targetCode]));
            },
          });
          setShowRewardedAdModal(true);
        } else if (setShowPaywall) {
          setShowPaywall(true);
        }
        return;
      }
      setSelectedFriendCodes(prev => [...prev, friendCode]);
    }
  };

  const isPaylasDisabled = selectedFriendCodes.length === 0;

  return (
    <div
      className="modal-overlay animate-fade-in"
      onClick={() => {
        setActiveShareNoteId(null);
        setSelectedFriendCodes([]);
        setBonusSlots(0);
      }}
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 10000,
        background: isLight ? 'rgba(15, 23, 42, 0.45)' : 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        className="modal-content animate-pop"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '360px',
          padding: '24px 20px',
          borderRadius: '24px',
          background: isLight ? '#FFFFFF' : 'var(--bg-card, #1E293B)',
          border: isLight ? '1px solid rgba(226, 232, 240, 0.9)' : '1px solid var(--border-color, rgba(255,255,255,0.12))',
          boxShadow: isLight ? '0 20px 45px rgba(0, 0, 0, 0.14)' : '0 20px 50px rgba(0, 0, 0, 0.45)',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFF',
              boxShadow: '0 4px 14px rgba(59, 130, 246, 0.35)',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: isLight ? '#0F172A' : '#F8FAFC', margin: 0 }}>
                {cleanText(t?.('shareWithFriend')) || (lang === 'tr' ? 'Arkadaşınla Paylaş' : 'Share with Friend')}
              </h3>
              <p style={{ fontSize: '0.75rem', color: isLight ? '#64748B' : '#94A3B8', margin: '2px 0 0 0' }}>
                {lang === 'tr' ? 'Notu kimlerle paylaşmak istersiniz?' : 'Select friends to share this note'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setActiveShareNoteId(null);
              setSelectedFriendCodes([]);
              setBonusSlots(0);
            }}
            style={{
              background: isLight ? 'rgba(241, 245, 249, 0.9)' : 'rgba(255, 255, 255, 0.08)',
              border: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255, 255, 255, 0.12)',
              color: isLight ? '#475569' : '#94A3B8',
              cursor: 'pointer',
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Limit Status Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          borderRadius: '12px',
          background: isLight ? '#F1F5F9' : 'rgba(255, 255, 255, 0.04)',
          border: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255, 255, 255, 0.08)',
          fontSize: '0.75rem',
        }}>
          <span style={{ color: isLight ? '#64748B' : '#94A3B8', fontWeight: 600 }}>
            {lang === 'tr' ? 'Seçilen Davet:' : 'Selected Invites:'}
          </span>
          <span style={{
            fontWeight: 800,
            color: selectedFriendCodes.length >= maxAllowed
              ? '#F59E0B'
              : (isLight ? '#2563EB' : '#60A5FA'),
          }}>
            {selectedFriendCodes.length} / {maxAllowed} {bonusSlots > 0 && `(+${bonusSlots} 🎁)`}
          </span>
        </div>

        {/* Body: Friends List or Empty State */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '240px', overflowY: 'auto', paddingRight: '2px' }}>
          {(!friends || friends.length === 0) ? (
            <div style={{
              textAlign: 'center',
              padding: '24px 16px',
              borderRadius: '16px',
              background: isLight ? '#F8FAFC' : 'rgba(255, 255, 255, 0.04)',
              border: isLight ? '1px dashed #CBD5E1' : '1px dashed rgba(255, 255, 255, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
            }}>
              <span style={{ fontSize: '1.8rem' }}>👥</span>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: isLight ? '#1E293B' : '#F1F5F9' }}>
                {lang === 'tr' ? 'Henüz Arkadaşınız Yok' : 'No Friends Added Yet'}
              </p>
              <p style={{ margin: 0, fontSize: '0.78rem', color: isLight ? '#64748B' : '#94A3B8', lineHeight: 1.4 }}>
                {lang === 'tr'
                  ? 'Notu ortak paylaşabilmek için profil sayfasından arkadaş kodunu kullanarak arkadaş ekleyin.'
                  : 'Add friends using your friend code on the profile page to share notes together.'}
              </p>
            </div>
          ) : (
            friends.map(f => {
              const isSelected = selectedFriendCodes.includes(f.code);
              return (
                <div
                  key={f.code}
                  onClick={() => handleFriendToggle(f.code)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '16px',
                    background: isSelected
                      ? (isLight ? '#EFF6FF' : 'rgba(59, 130, 246, 0.16)')
                      : (isLight ? '#F8FAFC' : 'rgba(255, 255, 255, 0.05)'),
                    border: isSelected
                      ? '1.5px solid #3B82F6'
                      : (isLight ? '1px solid #E2E8F0' : '1px solid rgba(255, 255, 255, 0.08)'),
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {f.photo_url ? (
                      <img 
                        src={f.photo_url} 
                        alt={f.name} 
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: isSelected ? '2px solid #3B82F6' : '1px solid rgba(255, 255, 255, 0.2)',
                          flexShrink: 0
                        }} 
                      />
                    ) : (
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6366F1, #3B82F6)',
                        color: '#FFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.9rem',
                        flexShrink: 0,
                      }}>
                        {(f.name || 'A').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.88rem', color: isLight ? '#0F172A' : '#F8FAFC' }}>
                        {f.name}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: isLight ? '#64748B' : '#94A3B8' }}>
                        Kod: {f.code}
                      </span>
                    </div>
                  </div>

                  <div style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    border: isSelected ? 'none' : (isLight ? '2px solid #CBD5E1' : '2px solid rgba(255, 255, 255, 0.3)'),
                    background: isSelected ? '#3B82F6' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFF',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                  }}>
                    {isSelected && '✓'}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
          <button
            onClick={() => {
              setActiveShareNoteId(null);
              setSelectedFriendCodes([]);
              setBonusSlots(0);
            }}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '14px',
              border: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255, 255, 255, 0.12)',
              background: isLight ? '#F1F5F9' : 'rgba(255, 255, 255, 0.08)',
              color: isLight ? '#475569' : '#CBD5E1',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            {cleanText(t?.('cancelBtn')) || (lang === 'tr' ? 'Vazgeç' : 'Cancel')}
          </button>

          {friends && friends.length > 0 && (
            <button
              disabled={isPaylasDisabled}
              onClick={() => {
                if (isPaylasDisabled) return;
                handleSendShareInvitation(activeShareNoteId, selectedFriendCodes);
              }}
              style={{
                flex: 1.5,
                padding: '12px',
                borderRadius: '14px',
                border: 'none',
                background: isPaylasDisabled
                  ? (isLight ? '#CBD5E1' : 'rgba(255, 255, 255, 0.15)')
                  : 'linear-gradient(135deg, #3B82F6, #2563EB)',
                color: isPaylasDisabled ? (isLight ? '#94A3B8' : '#64748B') : '#FFFFFF',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: isPaylasDisabled ? 'not-allowed' : 'pointer',
                opacity: isPaylasDisabled ? 0.5 : 1,
                boxShadow: isPaylasDisabled ? 'none' : '0 4px 14px rgba(59, 130, 246, 0.35)',
                transition: 'all 0.2s ease',
              }}
            >
              {cleanText(t?.('shareWithFriends')) || (lang === 'tr' ? 'Paylaş' : 'Share')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SelectFriendsShareModal;

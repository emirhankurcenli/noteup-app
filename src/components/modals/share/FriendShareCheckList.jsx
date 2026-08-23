import React from 'react';

export const FriendShareCheckList = ({
  friends = [],
  selectedFriendCodes = [],
  handleFriendToggle,
  isLight,
  lang,
  t,
}) => {
  if (!friends || friends.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '24px 16px',
          borderRadius: '16px',
          background: isLight ? '#F8FAFC' : 'rgba(255, 255, 255, 0.04)',
          border: isLight ? '1px dashed #CBD5E1' : '1px dashed rgba(255, 255, 255, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <span style={{ fontSize: '1.8rem' }}>👥</span>
        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: isLight ? '#1E293B' : '#F1F5F9' }}>
          {t ? t('noFriendsShareTitle') : (lang === 'tr' ? 'Henüz Arkadaşınız Yok' : 'No Friends Added Yet')}
        </p>
        <p style={{ margin: 0, fontSize: '0.78rem', color: isLight ? '#64748B' : '#94A3B8', lineHeight: 1.4 }}>
          {t ? t('noFriendsShareSub') : (lang === 'tr'
            ? 'Notu ortak paylaşabilmek için profil sayfasından arkadaş kodunu kullanarak arkadaş ekleyin.'
            : 'Add friends using your friend code on the profile page to share notes together.')}
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '240px', overflowY: 'auto', paddingRight: '2px' }}>
      {friends.map((f) => {
        const isSelected = selectedFriendCodes.includes(f.code);
        return (
          <div
            key={f.code}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              borderRadius: '16px',
              background: isSelected
                ? isLight ? 'rgba(59, 130, 246, 0.08)' : 'rgba(59, 130, 246, 0.12)'
                : isLight ? '#F8FAFC' : 'rgba(255, 255, 255, 0.05)',
              border: isSelected
                ? isLight ? '1.5px solid rgba(59, 130, 246, 0.4)' : '1.5px solid rgba(59, 130, 246, 0.3)'
                : isLight ? '1px solid #E2E8F0' : '1px solid rgba(255, 255, 255, 0.08)',
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
                    flexShrink: 0,
                  }}
                />
              ) : (
                <div
                  style={{
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
                  }}
                >
                  {(f.name || 'A').charAt(0).toUpperCase()}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.88rem', color: isLight ? '#0F172A' : '#F8FAFC' }}>
                    {f.name}
                  </span>
                  {isSelected && (
                    <span
                      style={{
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        padding: '2px 6px',
                        borderRadius: '6px',
                        background: 'rgba(16, 185, 129, 0.15)',
                        color: '#10B981',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                      }}
                    >
                      {t ? t('sharedBadge') : (lang === 'tr' ? 'Paylaşıldı' : 'Shared')}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: '0.72rem', color: isLight ? '#64748B' : '#94A3B8' }}>
                  Kod: {f.code}
                </span>
              </div>
            </div>

            <button
              onClick={() => handleFriendToggle(f.code)}
              style={{
                padding: '6px 12px',
                borderRadius: '10px',
                border: isSelected ? '1px solid rgba(239, 68, 68, 0.3)' : 'none',
                background: isSelected
                  ? 'rgba(239, 68, 68, 0.1)'
                  : 'linear-gradient(135deg, #3B82F6, #2563EB)',
                color: isSelected ? '#EF4444' : '#FFFFFF',
                fontSize: '0.75rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: isSelected ? 'none' : '0 2px 8px rgba(59, 130, 246, 0.3)',
                transition: 'all 0.2s ease',
              }}
            >
              {isSelected ? (t ? t('removeShareBtn') : (lang === 'tr' ? '🚫 Çıkar' : '🚫 Remove')) : (t ? t('addShareBtn') : (lang === 'tr' ? '➕ Ekle' : '➕ Add'))}
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default FriendShareCheckList;

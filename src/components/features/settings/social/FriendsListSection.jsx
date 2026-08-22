import React from 'react';

const cleanText = (text) => {
  if (typeof text !== 'string') return text || '';
  return text.replace(/<[^>]*>/g, '').trim();
};

const FriendsListSection = ({
  friends = [],
  grantedUltraFriendCode,
  userPlan,
  isGiftedUltra,
  handleGrantUltraGift,
  handleDisconnect,
  lang,
  isLight,
  t
}) => {
  return (
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
              background: isLight ? 'rgba(255,255,255,0.85)' : 'rgba(18, 24, 36, 0.85)',
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
                    {/* [EARLY ACCESS] Arkadaşa Ultra Hediye rozeti geçici pasif */}
                    {/* {isGrantedUltra && ( ... )} */}
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '2px 0 0 0', fontFamily: 'monospace' }}>
                    Kod: {friend.code}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* [EARLY ACCESS] Ultra Hediye Et butonu geçici olarak pasif — herkes zaten Ultra */}
                {/* {userPlan === 'ultra' && !isGiftedUltra && (
                  <button ...>
                )} */}

                <button 
                  onClick={() => {
                    const confirmMsg = lang === 'tr'
                      ? `"${friend.name || friend.code}" kişisini arkadaş listenizden çıkarmak istediğinize emin misiniz?`
                      : `Are you sure you want to remove "${friend.name || friend.code}" from your friends list?`;
                    if (window.confirm(confirmMsg)) {
                      handleDisconnect(friend.code);
                    }
                  }}
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
                  {lang === 'tr' ? 'Sil' : 'Remove'}
                </button>
              </div>
            </div>
          );
        })
      ) : (
        <div style={{
          padding: '12px 14px',
          textAlign: 'center',
          background: isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)',
          borderRadius: '12px',
          border: isLight ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.05)'
        }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {lang === 'tr' ? 'Henüz arkadaş eklenmedi' : 'No friends added yet'}
          </span>
        </div>
      )}
    </div>
  );
};

export default FriendsListSection;

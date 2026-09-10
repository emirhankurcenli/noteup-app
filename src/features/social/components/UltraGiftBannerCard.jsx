import React from 'react';

const UltraGiftBannerCard = ({ isGiftedUltra, ultraGiftFrom, isLight }) => {
  // [EARLY ACCESS] Hediye Ultra banner'ı geçici pasif
  return null;
  // [EARLY ACCESS ORIGINAL] if (!isGiftedUltra || !ultraGiftFrom) return null;

  return (
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
  );
};

export default UltraGiftBannerCard;

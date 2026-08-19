import React from 'react';

const ShareQrCodeCard = ({ shareUrl, isLight }) => {
  if (!shareUrl) return null;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(shareUrl)}`;

  return (
    <div style={{
      padding: '16px',
      borderRadius: '16px',
      background: isLight ? '#F8FAFC' : 'rgba(255,255,255,0.04)',
      border: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.08)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '12px'
    }}>
      <div style={{
        background: '#FFFFFF',
        padding: '12px',
        borderRadius: '16px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
      }}>
        <img
          src={qrImageUrl}
          alt="QR Kodu"
          style={{ width: '150px', height: '150px', display: 'block' }}
        />
      </div>
      <span style={{ fontSize: '0.78rem', color: isLight ? '#64748B' : '#94A3B8', fontWeight: 600 }}>
        Kamera ile tara & notu aç
      </span>
    </div>
  );
};

export default ShareQrCodeCard;

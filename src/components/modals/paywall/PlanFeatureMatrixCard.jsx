import React from 'react';

const PlanFeatureMatrixCard = ({ isLight }) => {
  const features = [
    { title: 'Sınırsız Not & Eklenti', free: 'Sınırlı', ultra: 'Sınırsız ⚡' },
    { title: 'Gerçek Zamanlı Arkadaş Paylaşımı', free: '❌', ultra: '✅ Tam Erişim' },
    { title: 'Ses Kaydı & Yüksek Boyutlu Dosyalar', free: '50 MB', ultra: '5 GB 🚀' },
    { title: 'Uygulama İçi Reklamsız Deneyim', free: 'Reklamlı', ultra: 'Reklamsız 🛡️' }
  ];

  return (
    <div style={{
      borderRadius: '16px',
      overflow: 'hidden',
      border: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.08)',
      background: isLight ? '#F8FAFC' : 'rgba(255,255,255,0.03)'
    }}>
      {features.map((f, idx) => (
        <div
          key={idx}
          style={{
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: idx < features.length - 1 ? (isLight ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.05)') : 'none'
          }}
        >
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: isLight ? '#0F172A' : '#FFFFFF' }}>
            {f.title}
          </span>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#F59E0B' }}>
            {f.ultra}
          </span>
        </div>
      ))}
    </div>
  );
};

export default PlanFeatureMatrixCard;

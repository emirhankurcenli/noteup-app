import React from 'react';

const CategoryIcon = ({ id }) => {
  switch (id) {
    case 'feature':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="9" y1="18" x2="15" y2="18" />
          <line x1="10" y1="22" x2="14" y2="22" />
          <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
        </svg>
      );
    case 'bug':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
          <path d="M12 6v4M4 14h16M4 20h16M4 8l4 4M20 8l-4 4" />
        </svg>
      );
    case 'general':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      );
    case 'delete_account':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      );
    default:
      return null;
  }
};

const FeedbackTypeTabs = ({ type, setType, triggerHaptic, isLight }) => {
  const types = [
    { id: 'feature', label: 'İstek' },
    { id: 'bug', label: 'Hata' },
    { id: 'general', label: 'Görüş' },
    { id: 'delete_account', label: 'Hesap Sil' }
  ];

  return (
    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
      {types.map((t) => {
        const isActive = type === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              if (triggerHaptic) triggerHaptic('light');
              setType(t.id);
            }}
            style={{
              flex: 1,
              padding: '8px 4px',
              borderRadius: '12px',
              fontSize: '0.78rem',
              fontWeight: 700,
              border: isActive
                ? '1.5px solid #3B82F6'
                : isLight ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.08)',
              background: isActive
                ? 'linear-gradient(135deg, #3B82F6, #2563EB)'
                : isLight ? '#F8FAFC' : 'rgba(255,255,255,0.04)',
              color: isActive ? '#FFFFFF' : (isLight ? '#475569' : '#94A3B8'),
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              transition: 'all 0.2s ease'
            }}
          >
            <CategoryIcon id={t.id} />
            {t.label}
          </button>
        );
      })}
    </div>
  );
};

export default FeedbackTypeTabs;

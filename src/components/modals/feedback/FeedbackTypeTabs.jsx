import React from 'react';

const FeedbackTypeTabs = ({ type, setType, triggerHaptic, isLight }) => {
  const types = [
    { id: 'bug', label: '🐛 Hata Bildir' },
    { id: 'feature', label: '💡 Özellik İste' },
    { id: 'general', label: '💬 Genel Görüş' }
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
              transition: 'all 0.2s ease'
            }}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
};

export default FeedbackTypeTabs;

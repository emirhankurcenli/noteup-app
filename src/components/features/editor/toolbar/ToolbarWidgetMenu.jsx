import React from 'react';

const widgetOptions = [
  { id: 'todo', label: 'Yapılacaklar', icon: '☑️', desc: 'Görev listesi ve ilerleme çubuğu' },
  { id: 'debt', label: 'Borç / Alacak', icon: '💰', desc: 'Net alacak ve borç defteri' },
  { id: 'bill', label: 'Fatura Takibi', icon: '📄', desc: 'Aylık ödeme hatırlatıcısı' },
  { id: 'expense', label: 'Gider Takibi', icon: '📊', desc: 'Harcama kategorileri' },
  { id: 'split', label: 'Hesap Bölüşümü', icon: '👥', desc: 'Alman usulü harcama bölüşümü' },
  { id: 'exam', label: 'Sınav Takibi', icon: '🎓', desc: 'Geri sayım ve tarih alarmı' },
  { id: 'password', label: 'Şifre Kasası', icon: '🔐', desc: 'Güvenli şifre saklayıcı' },
  { id: 'parking', label: 'Arabam Nerede?', icon: '🚗', desc: 'Araç konum ve yol tarifi' },
];

export const ToolbarWidgetMenu = ({ onSelectWidget, onClose, isLight }) => {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: '100%',
        left: '0',
        right: '0',
        marginBottom: '10px',
        background: isLight ? '#FFFFFF' : '#1E293B',
        border: isLight ? '1.5px solid #CBD5E1' : '1.5px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '20px',
        padding: '12px',
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.3)',
        zIndex: 150,
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '8px',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {widgetOptions.map((w) => (
        <div
          key={w.id}
          onClick={() => {
            onSelectWidget(w.id);
            onClose();
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px',
            borderRadius: '12px',
            background: isLight ? '#F8FAFC' : 'rgba(255, 255, 255, 0.05)',
            border: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255, 255, 255, 0.08)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <span style={{ fontSize: '1.4rem' }}>{w.icon}</span>
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {w.label}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {w.desc}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ToolbarWidgetMenu;

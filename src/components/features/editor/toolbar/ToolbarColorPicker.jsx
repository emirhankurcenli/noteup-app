import React from 'react';

const colors = [
  { value: 'var(--text-primary)', label: 'Varsayılan' },
  { value: '#EF4444', label: 'Kırmızı' },
  { value: '#3B82F6', label: 'Mavi' },
  { value: '#10B981', label: 'Yeşil' },
  { value: '#F59E0B', label: 'Turuncu' },
  { value: '#8B5CF6', label: 'Mor' },
  { value: '#EC4899', label: 'Pembe' },
  { value: '#94A3B8', label: 'Gri' },
];

export const ToolbarColorPicker = ({ activeColor, applyFormatChange, isLight, focusActiveTextarea }) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        gap: '6px',
        padding: '6px 8px',
        borderRadius: '16px',
        background: isLight ? '#F8FAFC' : 'rgba(15, 23, 42, 0.6)',
        border: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', paddingLeft: '4px' }}>
          Renk:
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {colors.map((c) => {
          const isSelected = activeColor === c.value;
          return (
            <button
              key={c.value}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                applyFormatChange({ color: c.value });
                focusActiveTextarea();
              }}
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: c.value,
                border: isSelected ? '2px solid #3B82F6' : '1px solid rgba(0,0,0,0.15)',
                cursor: 'pointer',
                boxShadow: isSelected ? '0 0 8px rgba(59, 130, 246, 0.5)' : 'none',
                transform: isSelected ? 'scale(1.15)' : 'scale(1)',
                transition: 'all 0.15s ease',
              }}
              title={c.label}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ToolbarColorPicker;

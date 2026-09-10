import React from 'react';

export const COLORS = [
  { value: 'var(--text-primary)', label: 'Varsayılan' },
  { value: '#EF4444', label: 'Kırmızı' },
  { value: '#3B82F6', label: 'Mavi' },
  { value: '#10B981', label: 'Yeşil' },
  { value: '#F59E0B', label: 'Turuncu' },
  { value: '#8B5CF6', label: 'Mor' },
  { value: '#EC4899', label: 'Pembe' },
  { value: '#94A3B8', label: 'Gri' },
];

export const ToolbarColorPickerRow = ({
  activeColor,
  applyFormatChange,
  isSameColor,
  isLight,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '8px', borderTop: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.08)' }}>
      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: isLight ? '#64748B' : '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Yazı Rengi
      </span>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', overflowX: 'auto', paddingBottom: '4px' }}>
        {COLORS.map((c) => {
          const isSelected = isSameColor(activeColor, c.value);
          return (
            <button
              key={c.value}
              onClick={() => applyFormatChange({ color: c.value })}
              onMouseDown={(e) => e.preventDefault()}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: c.value === 'var(--text-primary)' ? (isLight ? '#0F172A' : '#FFF') : c.value,
                border: isSelected ? '2.5px solid #6366F1' : isLight ? '1px solid #CBD5E1' : '1px solid rgba(255,255,255,0.15)',
                boxShadow: isSelected ? '0 0 10px rgba(99, 102, 241, 0.5)' : 'none',
                cursor: 'pointer',
                flexShrink: 0,
              }}
              title={c.label}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ToolbarColorPickerRow;

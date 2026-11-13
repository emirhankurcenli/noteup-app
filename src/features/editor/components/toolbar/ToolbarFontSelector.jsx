import React from 'react';

export const FONTS = [
  { label: 'Varsayılan', value: 'inherit', description: 'Standart uygulama yazı tipi' },
  { label: 'Inter', value: 'Inter', description: 'Sade ve okunaklı' },
  { label: 'Playfair Display', value: 'Playfair Display', description: 'Klasik kitap ve dergi stili' },
  { label: 'Fira Code', value: 'Fira Code', description: 'Daktilo ve kod görünümü' },
  { label: 'Montserrat', value: 'Montserrat', description: 'Belirgin ve dengeli' },
];

export const ToolbarFontSelector = ({
  activeFont,
  setShowFontPickerModal,
  isLight,
}) => {
  const currentFontObj = FONTS.find((f) => f.value === activeFont) || FONTS[0];

  return (
    <button
      type="button"
      onClick={() => setShowFontPickerModal(true)}
      onMouseDown={(e) => e.preventDefault()}
      onTouchStart={(e) => e.preventDefault()}
      style={{
        flex: 1,
        minWidth: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '9px 12px',
        borderRadius: '10px',
        background: isLight ? '#F1F5F9' : 'rgba(255, 255, 255, 0.06)',
        border: isLight ? '1px solid #CBD5E1' : '1px solid rgba(255, 255, 255, 0.12)',
        color: isLight ? '#0F172A' : '#F8FAFC',
        fontSize: '0.86rem',
        fontWeight: 600,
        cursor: 'pointer',
      }}
    >
      <span style={{ fontFamily: currentFontObj.value, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {currentFontObj.label}
      </span>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.65, marginLeft: '6px', flexShrink: 0 }}>
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>
  );
};

export default ToolbarFontSelector;

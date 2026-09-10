import React from 'react';

export const FONTS = [
  { label: 'System UI', value: 'inherit', description: 'Standart Mobil Font', preview: 'Aa Bb Cc 123 — Harika Notlar' },
  { label: 'Inter', value: 'Inter', description: 'Modern & Temiz Sans-serif', preview: 'Aa Bb Cc 123 — Harika Notlar' },
  { label: 'Roboto', value: 'Roboto', description: 'Klasik Android Tipografisi', preview: 'Aa Bb Cc 123 — Harika Notlar' },
  { label: 'Playfair Display', value: 'Playfair Display', description: 'Şık & Zarif Serif', preview: 'Aa Bb Cc 123 — Harika Notlar' },
  { label: 'Fira Code', value: 'Fira Code', description: 'Yazılımcı & Daktilo Stili', preview: 'Aa Bb Cc 123 — Harika Notlar' },
  { label: 'Pacifico', value: 'Pacifico', description: 'Estetik El Yazısı', preview: 'Aa Bb Cc 123 — Harika Notlar' },
  { label: 'Montserrat', value: 'Montserrat', description: 'Güçlü & Geometrik', preview: 'Aa Bb Cc 123 — Harika Notlar' },
  { label: 'Outfit', value: 'Outfit', description: 'Futurist & Premium', preview: 'Aa Bb Cc 123 — Harika Notlar' },
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
        padding: '9px 14px',
        borderRadius: '12px',
        background: isLight ? '#F1F5F9' : 'rgba(255, 255, 255, 0.07)',
        border: isLight ? '1px solid #CBD5E1' : '1px solid rgba(255, 255, 255, 0.12)',
        color: isLight ? '#0F172A' : '#F8FAFC',
        fontSize: '0.88rem',
        fontWeight: 700,
        cursor: 'pointer',
      }}
    >
      <span style={{ fontFamily: currentFontObj.value, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {currentFontObj.label}
      </span>
      <span style={{ fontSize: '0.75rem', opacity: 0.6, marginLeft: '6px' }}>▼</span>
    </button>
  );
};

export default ToolbarFontSelector;

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
  showFontPickerModal,
  applyFormatChange,
  isLight,
}) => {
  const currentFontObj = FONTS.find((f) => f.value === activeFont) || FONTS[0];

  return (
    <>
      <button
        onClick={() => setShowFontPickerModal(true)}
        onMouseDown={(e) => e.preventDefault()}
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          borderRadius: '14px',
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

      {/* Font Picker Modal */}
      {showFontPickerModal && (
        <div
          onClick={() => setShowFontPickerModal(false)}
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 1000,
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '480px',
              maxHeight: '70vh',
              background: isLight ? '#FFFFFF' : '#1E293B',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              padding: '20px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontWeight: 800, fontSize: '1rem', color: isLight ? '#0F172A' : '#FFF' }}>
                Yazı Tipi Seçin
              </span>
              <button
                onClick={() => setShowFontPickerModal(false)}
                style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {FONTS.map((font) => (
              <div
                key={font.value}
                onClick={() => {
                  applyFormatChange({ fontFamily: font.value });
                  setShowFontPickerModal(false);
                }}
                style={{
                  padding: '12px 14px',
                  borderRadius: '14px',
                  background: activeFont === font.value ? 'rgba(99, 102, 241, 0.15)' : isLight ? '#F8FAFC' : 'rgba(255, 255, 255, 0.05)',
                  border: activeFont === font.value ? '1.5px solid #6366F1' : '1px solid transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.92rem', color: isLight ? '#0F172A' : '#FFF', fontFamily: font.value }}>
                    {font.label}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{font.description}</span>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: font.value }}>
                  {font.preview}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default ToolbarFontSelector;

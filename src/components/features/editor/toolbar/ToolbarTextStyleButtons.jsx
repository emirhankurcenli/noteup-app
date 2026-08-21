import React from 'react';

export const ToolbarTextStyleButtons = ({
  isBoldActive,
  applyFormatChange,
  isLight,
}) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      {/* BOLD */}
      <button
        onClick={() => applyFormatChange({ fontWeight: isBoldActive ? 'normal' : 'bold' })}
        onMouseDown={(e) => e.preventDefault()}
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '12px',
          border: isBoldActive ? 'none' : (isLight ? '1px solid #CBD5E1' : '1px solid rgba(255, 255, 255, 0.15)'),
          background: isBoldActive ? 'linear-gradient(135deg, #8B5CF6, #6D28D9)' : isLight ? '#F1F5F9' : 'rgba(255, 255, 255, 0.06)',
          color: isBoldActive ? '#FFF' : isLight ? '#0F172A' : '#F8FAFC',
          fontWeight: 900,
          fontSize: '1rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: isBoldActive ? '0 4px 12px rgba(139, 92, 246, 0.35)' : 'none',
        }}
        title="Kalın (Bold)"
      >
        B
      </button>
    </div>
  );
};

export default ToolbarTextStyleButtons;

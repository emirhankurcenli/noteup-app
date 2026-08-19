import React from 'react';

export const ToolbarTextStyleButtons = ({
  isBoldActive,
  applyFormatChange,
  activeBlock,
  handleUpdateBlock,
  activeFormatBlockId,
  isLight,
}) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      {/* BOLD */}
      <button
        onClick={() => applyFormatChange({ fontWeight: isBoldActive ? 'normal' : 'bold' })}
        onMouseDown={(e) => e.preventDefault()}
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          border: 'none',
          background: isBoldActive ? 'linear-gradient(135deg, #6366F1, #4F46E5)' : isLight ? '#F1F5F9' : 'rgba(255, 255, 255, 0.08)',
          color: isBoldActive ? '#FFF' : isLight ? '#0F172A' : '#F8FAFC',
          fontWeight: 900,
          fontSize: '0.95rem',
          cursor: 'pointer',
        }}
      >
        B
      </button>

      {/* BULLET LIST TOGGLE */}
      <button
        onClick={() => {
          const nextBullet = !activeBlock?.bullet;
          handleUpdateBlock(activeFormatBlockId, { bullet: nextBullet }, true);
        }}
        onMouseDown={(e) => e.preventDefault()}
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          border: 'none',
          background: activeBlock?.bullet ? 'linear-gradient(135deg, #6366F1, #4F46E5)' : isLight ? '#F1F5F9' : 'rgba(255, 255, 255, 0.08)',
          color: activeBlock?.bullet ? '#FFF' : isLight ? '#0F172A' : '#F8FAFC',
          fontWeight: 800,
          fontSize: '1rem',
          cursor: 'pointer',
        }}
      >
        •
      </button>
    </div>
  );
};

export default ToolbarTextStyleButtons;

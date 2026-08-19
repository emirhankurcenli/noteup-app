import React from 'react';

const TodoProgressBar = ({ doneCount, total, progress, isAllDone }) => {
  if (total === 0) return null;

  return (
    <div 
      style={{
        position: 'relative',
        minWidth: '64px',
        height: '24px',
        padding: '0 8px',
        borderRadius: '12px',
        background: 'rgba(6, 182, 212, 0.08)',
        border: '1px solid rgba(6, 182, 212, 0.25)',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        marginLeft: 'auto',
        boxShadow: isAllDone ? '0 0 10px rgba(16, 185, 129, 0.3)' : 'none'
      }}
    >
      <div 
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: `${progress}%`,
          background: isAllDone 
            ? 'linear-gradient(90deg, #10B981, #059669)' 
            : 'linear-gradient(90deg, #06B6D4, #0891B2)',
          transition: 'width 0.3s ease',
          zIndex: 1
        }}
      />
      <span 
        style={{
          position: 'relative',
          zIndex: 2,
          fontSize: '0.78rem',
          fontWeight: 800,
          color: '#FFF',
          textShadow: '0 1px 2px rgba(0,0,0,0.6)',
          lineHeight: 1,
          letterSpacing: '0.03em'
        }}
      >
        {doneCount}/{total}
      </span>
    </div>
  );
};

export default TodoProgressBar;

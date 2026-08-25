import React, { useEffect } from 'react';

/**
 * ModalWrapper (DRY & Single Responsibility)
 * Reusable modal backdrop and dialog container with keyboard escape handling and mobile safe-area paddings.
 */
export default function ModalWrapper({
  isOpen = true,
  onClose,
  children,
  maxWidth = '480px',
  isLight = false,
  className = '',
  zIndex = 1000,
  style = {},
}) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && typeof onClose === 'function') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backgroundColor: isLight ? 'rgba(0, 0, 0, 0.45)' : 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && typeof onClose === 'function') {
          onClose();
        }
      }}
    >
      <div
        className={`animate-pop ${className}`}
        style={{
          width: '100%',
          maxWidth,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: '24px',
          backgroundColor: isLight ? '#FFFFFF' : '#18181B',
          border: isLight ? '1.5px solid #E2E8F0' : '1.5px solid rgba(255, 255, 255, 0.1)',
          boxShadow: isLight ? '0 20px 40px rgba(0,0,0,0.12)' : '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          ...style,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

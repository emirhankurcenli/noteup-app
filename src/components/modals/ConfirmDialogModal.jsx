import React from 'react';

const ConfirmDialogModal = ({
  confirmDialog,
  setConfirmDialog,
  t,
}) => {
  if (!confirmDialog) return null;

  const getTr = (key, fallback) => {
    if (typeof t === 'function') {
      const val = t(key);
      if (val && val !== key) return val;
    }
    return fallback;
  };

  // Dynamic customization fallback defaults
  const confirmBg = confirmDialog.confirmBg || 'linear-gradient(135deg, #FF4B3A 0%, #CC2A1A 100%)';
  const confirmHoverBg = confirmDialog.confirmHoverBg || 'linear-gradient(135deg, #FF5F4F 0%, #DD3B2A 100%)';
  const confirmShadow = confirmDialog.confirmShadow || '0 4px 16px rgba(255,75,58,0.30)';
  
  const iconBg = confirmDialog.iconBg || 'radial-gradient(circle at 30% 30%, rgba(255,75,58,0.22) 0%, rgba(255,75,58,0.06) 100%)';
  const iconBorder = confirmDialog.iconBorder || '1.5px solid rgba(255,75,58,0.35)';
  const iconShadow = confirmDialog.iconShadow || '0 0 24px rgba(255,75,58,0.18), inset 0 0 12px rgba(255,75,58,0.06)';

  return (
    <div
      onClick={() => { confirmDialog.onCancel?.(); setConfirmDialog(null); }}
      style={{
        position: 'fixed', zIndex: 9999,
        top: 0, left: 0, right: 0, bottom: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.55)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        padding: '20px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '300px',
          background: 'var(--bg-surface-elevated)',
          border: '1px solid var(--glass-border)',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 24px 60px rgba(0,0,0,0.25), 0 0 0 1px var(--glass-border), inset 0 1px 0 rgba(255,255,255,0.06)',
          animation: 'confirmPop 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {/* Icon Area */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '32px 24px 20px',
          gap: '16px',
        }}>
          {/* Icon Circle */}
          <div style={{
            width: '72px', height: '72px',
            borderRadius: '50%',
            background: iconBg,
            border: iconBorder,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: iconShadow,
          }}>
            {confirmDialog.icon ? confirmDialog.icon : (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 6H5H21" stroke="#FF4B3A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6M19 6L18.0597 19.1277C17.9816 20.1671 17.1143 21 16.0716 21H7.92836C6.88571 21 6.01836 20.1671 5.94033 19.1277L5 6H19Z" stroke="#FF4B3A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 11V17" stroke="#FF4B3A" strokeWidth="2" strokeLinecap="round"/>
                <path d="M14 11V17" stroke="#FF4B3A" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            )}
          </div>

          {/* Title */}
          <div style={{ textAlign: 'center' }}>
            <h3 style={{
              margin: '0 0 8px',
              fontSize: '1.15rem',
              fontWeight: '700',
              color: 'var(--text-primary)',
              letterSpacing: '-0.01em',
            }}>
              {(typeof confirmDialog.title === 'string' ? confirmDialog.title : null) || getTr('confirmDeleteTitle', 'Silmeyi Onayla')}
            </h3>
            {(() => {
              const msgText = typeof confirmDialog.message === 'string'
                ? confirmDialog.message
                : typeof confirmDialog.msg === 'string'
                  ? confirmDialog.msg
                  : typeof confirmDialog.message === 'object' && confirmDialog.message !== null
                    ? (confirmDialog.message.msg || confirmDialog.message.message || '')
                    : '';
              if (!msgText) return null;
              return (
                <p style={{
                  margin: 0,
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.5',
                }}>
                  {msgText}
                </p>
              );
            })()}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'var(--border-color)', margin: '0 24px' }} />

        {/* Buttons */}
        <div style={{ padding: '16px 20px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Cancel/Secondary Button */}
          <button
            onClick={() => { confirmDialog.onCancel?.(); setConfirmDialog(null); }}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '14px',
              border: '1.5px solid var(--border-color-active)',
              background: 'var(--primary-glow)',
              color: 'var(--primary)',
              fontSize: '0.95rem',
              fontWeight: '600',
              cursor: 'pointer',
              fontFamily: 'inherit',
              letterSpacing: '0.01em',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--glass-active-bg)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--primary-glow)'}
          >
            {confirmDialog.cancelText || t('cancelBtn')}
          </button>

          {/* Confirm/Primary Button */}
          <button
            onClick={() => { confirmDialog.onConfirm(); setConfirmDialog(null); }}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '14px',
              border: 'none',
              background: confirmBg,
              color: '#fff',
              fontSize: '0.95rem',
              fontWeight: '700',
              cursor: 'pointer',
              fontFamily: 'inherit',
              letterSpacing: '0.01em',
              boxShadow: confirmShadow,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = confirmHoverBg; }}
            onMouseLeave={e => { e.currentTarget.style.background = confirmBg; }}
          >
            {confirmDialog.confirmText || t('confirmDelete')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialogModal;

import React from 'react';

const IncomingShareModal = ({
  incomingRequest,
  handleAcceptShare,
  handleRejectShare,
  lang,
  t,
  isLight,
  triggerHaptic,
}) => {
  if (!incomingRequest) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        zIndex: 9999,
      }}
      className="animate-fade-in"
      onClick={handleRejectShare}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '380px',
          background: isLight
            ? 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)'
            : 'linear-gradient(135deg, #181E2E 0%, #0F1420 100%)',
          borderRadius: '24px',
          padding: '24px 20px',
          border: isLight ? '1.5px solid #E2E8F0' : '1.5px solid rgba(99, 102, 241, 0.3)',
          boxShadow: isLight
            ? '0 20px 50px rgba(0, 0, 0, 0.15)'
            : '0 25px 60px rgba(0, 0, 0, 0.7), 0 0 30px rgba(99, 102, 241, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '14px',
          position: 'relative',
          overflow: 'hidden',
        }}
        className="animate-pop"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Ambient Accent */}
        <div
          style={{
            position: 'absolute',
            top: '-30px',
            right: '-30px',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: isLight
              ? 'radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, rgba(255,255,255,0) 70%)'
              : 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(0,0,0,0) 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* 3D Icon Badge */}
        <div
          style={{
            width: '54px',
            height: '54px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.6rem',
            boxShadow: '0 8px 20px rgba(59, 130, 246, 0.35)',
            flexShrink: 0,
          }}
        >
          🌐
        </div>

        {/* Title */}
        <div style={{ textAlign: 'center' }}>
          <h3
            style={{
              fontSize: '1.15rem',
              fontWeight: 800,
              color: isLight ? '#0F172A' : '#F8FAFC',
              margin: '0 0 4px 0',
              letterSpacing: '-0.3px',
            }}
          >
            {t('collabNoteInvite') || 'Ortak Not Daveti'}
          </h3>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 10px',
              borderRadius: '12px',
              background: isLight ? 'rgba(59, 130, 246, 0.08)' : 'rgba(99, 102, 241, 0.15)',
              marginTop: '4px',
            }}
          >
            <span style={{ fontSize: '0.85rem' }}>👤</span>
            <span
              style={{
                fontSize: '0.82rem',
                fontWeight: 700,
                color: isLight ? '#2563EB' : '#93C5FD',
              }}
            >
              {incomingRequest.fromName}
            </span>
          </div>
        </div>

        {/* Note title & invite description */}
        <p
          style={{
            fontSize: '0.86rem',
            color: isLight ? '#475569' : '#94A3B8',
            textAlign: 'center',
            margin: 0,
            lineHeight: 1.45,
          }}
        >
          {lang === 'tr' ? (
            <>
              sizinle <strong style={{ color: isLight ? '#0F172A' : '#F1F5F9' }}>"{incomingRequest.noteTitle}"</strong> notunu ortak kullanmak istiyor.
            </>
          ) : (
            <>
              wants to collaborate with you on <strong style={{ color: isLight ? '#0F172A' : '#F1F5F9' }}>"{incomingRequest.noteTitle}"</strong>.
            </>
          )}
        </p>

        {/* Note Preview Snippet */}
        <div
          style={{
            width: '100%',
            background: isLight ? 'rgba(241, 245, 249, 0.7)' : 'rgba(255, 255, 255, 0.03)',
            padding: '12px 14px',
            borderRadius: '14px',
            fontSize: '0.78rem',
            color: isLight ? '#64748B' : '#94A3B8',
            textAlign: 'left',
            maxHeight: '90px',
            overflowY: 'auto',
            border: isLight ? '1px solid #E2E8F0' : '1px dashed rgba(255, 255, 255, 0.1)',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px', opacity: 0.7 }}>
            <span>📝</span>
            <span style={{ fontSize: '0.72rem', fontWeight: 600 }}>Önizleme:</span>
          </div>
          <p style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {incomingRequest.noteContent || (lang === 'tr' ? '(Boş not içeriği)' : '(Empty note content)')}
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', width: '100%', marginTop: '6px' }}>
          <button
            onClick={() => {
              triggerHaptic?.('light');
              handleRejectShare();
            }}
            style={{
              flex: 1,
              padding: '12px 14px',
              borderRadius: '14px',
              border: isLight ? '1.5px solid #FCA5A5' : '1.5px solid rgba(239, 68, 68, 0.35)',
              background: isLight ? 'rgba(254, 242, 242, 0.8)' : 'rgba(239, 68, 68, 0.1)',
              color: '#EF4444',
              fontSize: '0.88rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {t('reject') || 'Reddet'}
          </button>
          <button
            onClick={() => {
              triggerHaptic?.('medium');
              handleAcceptShare();
            }}
            style={{
              flex: 1.2,
              padding: '12px 14px',
              borderRadius: '14px',
              border: 'none',
              background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 50%, #1D4ED8 100%)',
              color: '#FFFFFF',
              fontSize: '0.88rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
              transition: 'all 0.15s ease',
            }}
          >
            {t('accept') || 'Kabul Et'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingShareModal;


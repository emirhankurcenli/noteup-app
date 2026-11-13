import React, { useState, useEffect } from 'react';

/**
 * NudgeModal — "Bildirim Gönder" modal
 *
 * Opens when nudgeTargetNote is set.
 * Lists shared contacts (sharedWith + sharedFrom) and lets the user
 * add an optional custom message before sending the nudge.
 */
const NudgeModal = ({
  nudgeTargetNote,
  setNudgeTargetNote,
  handleSendNudge,
  theme = 'dark',
}) => {
  const [customMessage, setCustomMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Reset message field whenever a new note is targeted
  useEffect(() => {
    if (nudgeTargetNote) {
      setCustomMessage('');
      setIsSending(false);
    }
  }, [nudgeTargetNote?.id]);

  if (!nudgeTargetNote) return null;

  const isLight = theme === 'light';

  // Build recipient display list
  const recipients = [];
  if (Array.isArray(nudgeTargetNote.sharedWith)) {
    nudgeTargetNote.sharedWith.forEach((code) => {
      if (code) recipients.push(String(code).trim().toUpperCase());
    });
  }
  if (nudgeTargetNote.sharedFrom) {
    const sf = String(nudgeTargetNote.sharedFrom).trim().toUpperCase();
    if (!recipients.includes(sf)) recipients.push(sf);
  }

  const hasRecipients = recipients.length > 0;
  const noteTitle = nudgeTargetNote.title || 'Başlıksız Not';

  const handleClose = () => {
    setNudgeTargetNote(null);
  };

  const handleSend = async () => {
    if (isSending) return;
    setIsSending(true);
    try {
      await handleSendNudge(nudgeTargetNote, customMessage);
    } finally {
      setIsSending(false);
      setNudgeTargetNote(null);
    }
  };

  // ── Styles ────────────────────────────────────────────────────────────────
  const overlayStyle = {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 10000,
    background: isLight ? 'rgba(15, 23, 42, 0.45)' : 'rgba(0, 0, 0, 0.75)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  };

  const cardStyle = {
    width: '100%',
    maxWidth: '380px',
    padding: '24px 20px',
    borderRadius: '24px',
    background: isLight ? '#FFFFFF' : 'var(--bg-card, #1E293B)',
    border: isLight
      ? '1px solid rgba(226, 232, 240, 0.9)'
      : '1px solid var(--border-color, rgba(255,255,255,0.12))',
    boxShadow: isLight
      ? '0 20px 45px rgba(0, 0, 0, 0.14)'
      : '0 20px 50px rgba(0, 0, 0, 0.45)',
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  };

  const closeButtonStyle = {
    background: isLight ? 'rgba(241, 245, 249, 0.9)' : 'rgba(255, 255, 255, 0.08)',
    border: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255, 255, 255, 0.12)',
    color: isLight ? '#475569' : '#94A3B8',
    cursor: 'pointer',
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    padding: 0,
  };

  const textareaStyle = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '14px',
    border: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255, 255, 255, 0.12)',
    background: isLight ? '#F8FAFC' : 'rgba(255, 255, 255, 0.04)',
    color: isLight ? '#0F172A' : '#F8FAFC',
    fontSize: '0.875rem',
    fontFamily: 'inherit',
    resize: 'none',
    outline: 'none',
    lineHeight: 1.5,
    boxSizing: 'border-box',
  };

  const cancelBtnStyle = {
    flex: 1,
    padding: '12px',
    borderRadius: '14px',
    border: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255, 255, 255, 0.12)',
    background: isLight ? '#F1F5F9' : 'rgba(255, 255, 255, 0.08)',
    color: isLight ? '#475569' : '#CBD5E1',
    fontWeight: 700,
    fontSize: '0.85rem',
    cursor: 'pointer',
  };

  const sendBtnStyle = {
    flex: 1.5,
    padding: '12px',
    borderRadius: '14px',
    border: 'none',
    background: hasRecipients
      ? 'linear-gradient(135deg, #F59E0B, #D97706)'
      : (isLight ? '#E2E8F0' : 'rgba(255,255,255,0.08)'),
    color: hasRecipients ? '#FFFFFF' : (isLight ? '#94A3B8' : '#64748B'),
    fontWeight: 800,
    fontSize: '0.85rem',
    cursor: hasRecipients && !isSending ? 'pointer' : 'not-allowed',
    boxShadow: hasRecipients ? '0 4px 14px rgba(245, 158, 11, 0.35)' : 'none',
    transition: 'all 0.2s ease',
    opacity: isSending ? 0.7 : 1,
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      className="modal-overlay animate-fade-in"
      onClick={handleClose}
      style={overlayStyle}
    >
      <div
        className="modal-content animate-pop"
        onClick={(e) => e.stopPropagation()}
        style={cardStyle}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Bell icon with amber/purple gradient */}
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #F59E0B, #8B5CF6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFF',
              boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)',
              flexShrink: 0,
            }}>
              {/* Bell SVG */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: isLight ? '#0F172A' : '#F8FAFC', margin: 0 }}>
                Bildirim Gönder
              </h3>
              <p style={{
                fontSize: '0.75rem',
                color: isLight ? '#64748B' : '#94A3B8',
                margin: '2px 0 0 0',
                maxWidth: '200px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {noteTitle}
              </p>
            </div>
          </div>

          <button onClick={handleClose} style={closeButtonStyle} aria-label="Kapat">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Subtitle */}
        <div style={{
          fontSize: '0.8rem',
          fontWeight: 700,
          color: isLight ? '#475569' : '#94A3B8',
          letterSpacing: '0.03em',
          textTransform: 'uppercase',
        }}>
          Kimlere bildirim gönderilsin?
        </div>

        {/* Recipients list or empty state */}
        {hasRecipients ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            maxHeight: '160px',
            overflowY: 'auto',
          }}>
            {recipients.map((code) => (
              <div
                key={code}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  background: isLight ? '#F1F5F9' : 'rgba(255, 255, 255, 0.05)',
                  border: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {/* Avatar placeholder */}
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontSize: '0.7rem',
                  color: '#FFF',
                  fontWeight: 800,
                }}>
                  {code.substring(0, 2)}
                </div>
                <span style={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: isLight ? '#1E293B' : '#E2E8F0',
                  fontFamily: 'monospace',
                }}>
                  {code}
                </span>
              </div>
            ))}
          </div>
        ) : (
          /* Empty state */
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            padding: '20px 12px',
            borderRadius: '14px',
            background: isLight ? '#F8FAFC' : 'rgba(255,255,255,0.03)',
            border: isLight ? '1px dashed #CBD5E1' : '1px dashed rgba(255,255,255,0.1)',
            textAlign: 'center',
          }}>
            <span style={{ fontSize: '1.6rem' }}>🔒</span>
            <p style={{
              fontSize: '0.85rem',
              color: isLight ? '#64748B' : '#94A3B8',
              margin: 0,
              lineHeight: 1.5,
            }}>
              Bu not kimseyle paylaşılmamış.
            </p>
          </div>
        )}

        {/* Optional custom message input */}
        <textarea
          rows={2}
          placeholder="İsteğe bağlı mesaj..."
          value={customMessage}
          onChange={(e) => setCustomMessage(e.target.value)}
          style={textareaStyle}
          maxLength={200}
        />

        {/* Footer actions */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '2px' }}>
          <button onClick={handleClose} style={cancelBtnStyle}>
            İptal
          </button>
          <button
            onClick={handleSend}
            disabled={!hasRecipients || isSending}
            style={sendBtnStyle}
          >
            {isSending ? 'Gönderiliyor…' : '📣 Gönder'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NudgeModal;

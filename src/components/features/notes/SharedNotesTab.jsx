import React, { useMemo } from 'react';
import NotesGrid from './NotesGrid';
import { sanitizeText } from '../../../utils/securityUtils';

const SharedNotesTab = ({
  notes = [],
  reminders = [],
  activeMenuNoteId,
  setActiveMenuNoteId,
  requestBiometricAuth,
  setNotes,
  persistNotes,
  setToast,
  getRemainingTimeText,
  handleMoveToTrash,
  openEditingNote,
  setReminderNoteId,
  setShowReminderModal,
  handleCancelReminder,
  setActiveShareNoteId,
  setNudgeTargetNote,
  checkAndRequestNotificationPermission,
  theme,
  lang,
  t,
  myCode,
  handleLeaveShare,
  pendingShareRequests = [],
  handleAcceptShare,
  handleRejectShare,
}) => {
  const isLight = theme === 'light';

  // All active and pending shared notes
  const allSharedNotes = useMemo(() => {
    return (notes || []).filter(n => n && !n.deletedAt && (
      n.isShared ||
      Boolean(n.sharedFrom) ||
      (Array.isArray(n.sharedWith) && n.sharedWith.length > 0) ||
      (Array.isArray(n.pendingShares) && n.pendingShares.length > 0)
    ));
  }, [notes]);

  const getFirstLinePreview = (req) => {
    if (!req) return '';
    let blocks = req.noteBlocks;
    if (typeof blocks === 'string') {
      try {
        blocks = JSON.parse(blocks);
      } catch (_) {
        blocks = [];
      }
    }
    if (Array.isArray(blocks) && blocks.length > 0) {
      for (const b of blocks) {
        if (!b) continue;
        if (b.type === 'text' && typeof b.content === 'string') {
          const plain = sanitizeText(b.content)
            .replace(/&nbsp;/gi, ' ')
            .replace(/[\u200B\u8203\r\n]/g, ' ')
            .trim();
          if (plain) return plain;
        } else if (b.type === 'todo' && Array.isArray(b.items) && b.items.length > 0) {
          const first = b.items.find(i => i && i.text && i.text.trim());
          if (first) return `${sanitizeText(first.text).trim()}`;
        } else if (b.type === 'bill' && b.name) {
          return `${sanitizeText(b.name)}: ${b.amount || ''}₺`;
        } else if (b.type === 'debt' && Array.isArray(b.items) && b.items.length > 0) {
          const first = b.items.find(d => d && d.name);
          if (first) return `${sanitizeText(first.name)}: ${first.amount || ''}₺`;
        }
      }
    }

    if (typeof req.noteContent === 'string' && req.noteContent.trim()) {
      const clean = sanitizeText(req.noteContent)
        .replace(/&nbsp;/gi, ' ')
        .replace(/[\u200B\u8203\r\n]/g, ' ')
        .trim();
      if (clean) return clean;
    }

    return '';
  };

  const hasPending = pendingShareRequests && pendingShareRequests.length > 0;

  return (
    <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
          {t('sharedNotesTab') || 'Paylaşılan Notlar'}
        </h2>
      </div>

      {/* ── Pending Share Invitations Section ─────────────────────────────────── */}
      {hasPending && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {t('pendingShareRequests') || 'Gelen Davetler'}
            </span>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '10px',
                background: '#3B82F6',
                color: '#FFFFFF'
              }}
            >
              {pendingShareRequests.length}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {pendingShareRequests.map((req) => {
              const firstLine = getFirstLinePreview(req);
              return (
                <div
                  key={req.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    padding: '14px 16px',
                    borderRadius: '18px',
                    background: isLight ? '#FFFFFF' : 'rgba(255, 255, 255, 0.04)',
                    border: isLight ? '1.5px solid #E2E8F0' : '1.5px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: isLight ? '0 4px 14px rgba(0,0,0,0.03)' : '0 4px 20px rgba(0,0,0,0.2)',
                  }}
                  className="animate-slide-up"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '12px',
                        background: isLight ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#3B82F6',
                        flexShrink: 0
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                      </svg>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0, flex: 1 }}>
                      <span style={{ fontSize: '0.94rem', fontWeight: 800, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {req.noteTitle || (lang === 'tr' ? 'Başlıksız Not' : 'Untitled Note')}
                      </span>
                      <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        {req.fromName || 'Arkadaş'}
                      </span>
                    </div>
                  </div>

                  {firstLine ? (
                    <p
                      style={{
                        margin: 0,
                        fontSize: '0.82rem',
                        color: 'var(--text-muted)',
                        lineHeight: 1.35,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {firstLine}
                    </p>
                  ) : null}

                  <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
                    <button
                      onClick={() => handleRejectShare?.(req)}
                      style={{
                        flex: 1,
                        padding: '9px 12px',
                        borderRadius: '12px',
                        border: isLight ? '1px solid #FECACA' : '1px solid rgba(239, 68, 68, 0.3)',
                        background: isLight ? '#FEF2F2' : 'rgba(239, 68, 68, 0.1)',
                        color: '#EF4444',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {t('reject') || 'Reddet'}
                    </button>
                    <button
                      onClick={() => handleAcceptShare?.(req)}
                      style={{
                        flex: 1.2,
                        padding: '9px 12px',
                        borderRadius: '12px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                        color: '#FFFFFF',
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
                      }}
                    >
                      {t('accept') || 'Kabul Et'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Notes List or Empty State ─────────────────────────────────────────── */}
      {allSharedNotes.length === 0 && !hasPending ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '56px 20px',
            textAlign: 'center',
            gap: '14px',
            background: isLight ? '#FFFFFF' : 'rgba(255, 255, 255, 0.02)',
            borderRadius: '20px',
            border: isLight ? '1px dashed #CBD5E1' : '1px dashed rgba(255, 255, 255, 0.12)'
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              background: isLight ? 'rgba(59, 130, 246, 0.08)' : 'rgba(59, 130, 246, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#3B82F6'
            }}
          >
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            {t('noSharedNotesTitle') || 'Paylaşılan not bulunamadı'}
          </h3>
        </div>
      ) : (
        <NotesGrid
          visibleNotes={allSharedNotes}
          reminders={reminders}
          activeMenuNoteId={activeMenuNoteId}
          setActiveMenuNoteId={setActiveMenuNoteId}
          requestBiometricAuth={requestBiometricAuth}
          setNotes={setNotes}
          persistNotes={persistNotes}
          setToast={setToast}
          getRemainingTimeText={getRemainingTimeText}
          handleMoveToTrash={handleMoveToTrash}
          openEditingNote={openEditingNote}
          setReminderNoteId={setReminderNoteId}
          setShowReminderModal={setShowReminderModal}
          handleCancelReminder={handleCancelReminder}
          setActiveShareNoteId={setActiveShareNoteId}
          setNudgeTargetNote={setNudgeTargetNote}
          checkAndRequestNotificationPermission={checkAndRequestNotificationPermission}
          lang={lang}
          t={t}
        />
      )}
    </div>
  );
};

export default SharedNotesTab;

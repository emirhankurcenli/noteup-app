import React from 'react';

const IncomingShareModal = ({
  incomingRequest,
  handleAcceptShare,
  handleRejectShare,
  lang,
  t,
}) => {
  if (!incomingRequest) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel" style={{ borderTopColor: 'var(--primary)' }}>
        <div className="modal-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            🌐 {t('collabNoteInvite')}
          </h3>
        </div>
        <div className="modal-body" style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '8px' }}>
            {incomingRequest.fromName}
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            {lang === 'tr'
              ? `sizinle "${incomingRequest.noteTitle}" notunu ortak kullanmak istiyor.`
              : `wants to collaborate with you on the note "${incomingRequest.noteTitle}".`}
          </p>
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            padding: '12px',
            borderRadius: '10px',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            textAlign: 'left',
            maxHeight: '100px',
            overflowY: 'auto',
            border: '1px dashed var(--border-color)'
          }}>
            {incomingRequest.noteContent || (lang === 'tr' ? '(Boş not)' : '(Empty note)')}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
          <button
            className="btn-secondary"
            style={{ flex: 1, borderColor: 'rgba(239, 68, 68, 0.3)', color: 'var(--danger)' }}
            onClick={handleRejectShare}
          >
            {t('reject')}
          </button>
          <button
            className="btn-primary"
            style={{ flex: 1 }}
            onClick={handleAcceptShare}
          >
            {t('accept')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingShareModal;

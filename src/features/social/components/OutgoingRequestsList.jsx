import React from 'react';

const OutgoingRequestsList = ({
  outgoingRequests = [],
  handleCancelFriendRequest,
  lang,
  isLight
}) => {
  if (outgoingRequests.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', paddingLeft: '4px' }}>
        {lang === 'tr' ? 'Gönderilen İstekler' : 'Sent Invites'} ({outgoingRequests.length})
      </span>
      {outgoingRequests.map(req => (
        <div key={req.id} style={{
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: isLight ? 'rgba(59, 130, 246, 0.08)' : 'rgba(59, 130, 246, 0.05)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          borderRadius: '14px'
        }}>
          <div>
            <p style={{ fontSize: '0.85rem', fontWeight: 700, color: isLight ? '#0F172A' : 'var(--text-primary)', margin: 0 }}>
              {req.toName || req.toCode}
            </p>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '2px 0 0 0', fontFamily: 'monospace' }}>
              {lang === 'tr' ? 'Onay bekleniyor...' : 'Awaiting confirmation...'}
            </p>
          </div>
          <button
            onClick={() => handleCancelFriendRequest && handleCancelFriendRequest(req.id, req.toCode)}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#EF4444',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {lang === 'tr' ? 'İptal Et' : 'Cancel'}
          </button>
        </div>
      ))}
    </div>
  );
};

export default OutgoingRequestsList;

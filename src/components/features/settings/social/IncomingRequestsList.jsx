import React from 'react';

const cleanText = (text) => {
  if (typeof text !== 'string') return text || '';
  return text.replace(/<[^>]*>/g, '').trim();
};

const IncomingRequestsList = ({
  pendingRequests = [],
  handleAcceptFriendRequest,
  handleRejectFriendRequest,
  lang,
  isLight,
  t
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', paddingLeft: '4px' }}>
        {cleanText(t('friendRequestsTitle'))} ({pendingRequests.length})
      </span>

      {pendingRequests.length > 0 ? (
        pendingRequests.map(req => (
          <div key={req.id} style={{
            padding: '14px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: isLight ? 'rgba(245, 158, 11, 0.12)' : 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {req.fromPhotoUrl ? (
                <img 
                  src={req.fromPhotoUrl} 
                  alt={req.fromName} 
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '1.5px solid rgba(245, 158, 11, 0.5)'
                  }} 
                />
              ) : (
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                  color: '#FFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.85rem'
                }}>
                  {(req.fromName || 'A').charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p style={{ fontSize: '0.85rem', fontWeight: 700, color: isLight ? '#0F172A' : 'var(--text-primary)', margin: 0 }}>{req.fromName}</p>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '2px 0 0 0', fontFamily: 'monospace' }}>Kod: {req.fromCode}</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => handleRejectFriendRequest(req)}
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
                {t('reject')}
              </button>
              <button 
                onClick={() => handleAcceptFriendRequest(req)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #10B981, #059669)',
                  color: '#FFF',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                }}
              >
                {t('accept')}
              </button>
            </div>
          </div>
        ))
      ) : (
        <div style={{
          fontSize: '0.78rem',
          color: 'var(--text-muted)',
          textAlign: 'center',
          padding: '10px 14px',
          background: isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)',
          borderRadius: '12px',
          border: isLight ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.05)',
          margin: 0
        }}>
          {lang === 'tr' ? 'Bekleyen istek yok' : 'No pending requests'}
        </div>
      )}
    </div>
  );
};

export default IncomingRequestsList;

import React from 'react';

const TrashNoteCard = ({
  note,
  isSelected,
  isSelectMode,
  toggleSelectNote,
  enterSelectMode,
  openEditingNote,
  handleRestoreNote,
  handlePermanentDelete,
  isLight,
  t
}) => {
  const daysLeft = 30 - Math.floor((Date.now() - note.deletedAt) / (1000 * 60 * 60 * 24));

  const handleCardClick = () => {
    if (isSelectMode) {
      toggleSelectNote(note.id);
    } else {
      window.history.pushState({ page: 'editor', noteId: note.id }, ''); 
      openEditingNote(note); 
    }
  };

  let pressTimer;
  const startPress = () => {
    if (isSelectMode) return;
    pressTimer = setTimeout(() => {
      enterSelectMode(note.id);
    }, 500);
  };
  const endPress = () => {
    clearTimeout(pressTimer);
  };

  return (
    <div 
      className={`trash-card ${isSelected ? 'selected' : ''}`}
      onClick={handleCardClick}
      onTouchStart={startPress}
      onTouchEnd={endPress}
      onMouseDown={startPress}
      onMouseUp={endPress}
      onMouseLeave={endPress}
      style={{ 
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        textAlign: 'left',
        gap: '14px',
        border: isSelected 
          ? '2px solid #3B82F6' 
          : isLight ? '1px solid rgba(0, 0, 0, 0.06)' : '1px solid rgba(255, 255, 255, 0.08)',
        background: isSelected 
          ? (isLight ? '#EFF6FF' : 'rgba(59, 130, 246, 0.12)') 
          : (isLight ? 'rgba(255, 255, 255, 0.9)' : 'rgba(18, 24, 36, 0.85)'),
        backdropFilter: 'blur(12px)',
        padding: '16px',
        borderRadius: '16px',
        marginBottom: '12px',
        position: 'relative',
        transition: 'all 0.2s ease',
        boxShadow: isSelected 
          ? '0 4px 16px rgba(59, 130, 246, 0.2)' 
          : (isLight ? '0 4px 16px rgba(0,0,0,0.03)' : '0 4px 16px rgba(0,0,0,0.2)'),
        userSelect: 'none'
      }}
    >
      <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <h3 style={{ 
            fontSize: '1rem', 
            fontWeight: 800, 
            margin: 0, 
            color: isLight ? '#0F172A' : '#FFFFFF',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1
          }}>
            {note.title || t('untitledNote')}
          </h3>
          <span style={{ 
            fontSize: '0.72rem', 
            fontWeight: 700, 
            padding: '3px 9px',
            borderRadius: '12px',
            background: daysLeft <= 3 
              ? (isLight ? '#FEE2E2' : 'rgba(239, 68, 68, 0.2)') 
              : (isLight ? '#F1F5F9' : 'rgba(255, 255, 255, 0.08)'),
            color: daysLeft <= 3 
              ? (isLight ? '#DC2626' : '#FCA5A5') 
              : (isLight ? '#64748B' : '#94A3B8'),
            flexShrink: 0
          }}>
            {daysLeft > 0 ? `${daysLeft} ${t('daysRemaining')}` : t('willBeDeletedToday')}
          </span>
        </div>

        {note.blocks && note.blocks.length > 0 ? (() => {
          const textBlock = note.blocks.find(b => b.type === 'text');
          return (
            <p style={{ 
              fontSize: '0.82rem', 
              color: isLight ? '#475569' : 'rgba(255, 255, 255, 0.6)', 
              overflow: 'hidden', 
              textOverflow: 'ellipsis', 
              display: '-webkit-box', 
              WebkitLineClamp: 2, 
              WebkitBoxOrient: 'vertical', 
              margin: 0,
              lineHeight: '1.4'
            }}>
              {textBlock ? textBlock.content : ''}
            </p>
          );
        })() : (
          <p style={{ fontSize: '0.82rem', color: isLight ? '#475569' : 'rgba(255, 255, 255, 0.6)', margin: 0, lineHeight: '1.4' }}>{note.content}</p>
        )}

        {!isSelectMode && (
          <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                handleRestoreNote(note.id); 
              }}
              style={{
                padding: '7px 14px',
                borderRadius: '10px',
                border: isLight ? '1px solid #A7F3D0' : '1px solid rgba(52, 211, 153, 0.3)',
                background: isLight ? '#ECFDF5' : 'rgba(16, 185, 129, 0.15)',
                color: isLight ? '#047857' : '#34D399',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
              </svg>
              {t('restoreBtn')}
            </button>
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                handlePermanentDelete(note.id); 
              }}
              style={{
                padding: '7px 14px',
                borderRadius: '10px',
                border: isLight ? '1px solid #FECACA' : '1px solid rgba(248, 113, 113, 0.3)',
                background: isLight ? '#FEF2F2' : 'rgba(239, 68, 68, 0.15)',
                color: isLight ? '#B91C1C' : '#FCA5A5',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              {t('deletePermanentlyBtn')}
            </button>
          </div>
        )}
      </div>

      {isSelectMode && (
        <div style={{
          width: '26px',
          height: '26px',
          borderRadius: '50%',
          border: isSelected ? 'none' : (isLight ? '2.5px solid #94A3B8' : '2.5px solid rgba(255, 255, 255, 0.3)'),
          background: isSelected ? 'linear-gradient(135deg, #3B82F6, #1D4ED8)' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          alignSelf: 'center',
          boxShadow: isSelected ? '0 3px 10px rgba(59, 130, 246, 0.35)' : 'none',
          transition: 'all 0.15s ease'
        }}>
          {isSelected && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </div>
      )}
    </div>
  );
};

export default TrashNoteCard;

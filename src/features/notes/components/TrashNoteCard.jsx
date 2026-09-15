import React, { useRef } from 'react';
import { htmlToPlainText, getDaysLeft } from '@shared/utils/textUtils';

const TrashNoteCard = ({
  note,
  isSelected,
  isSelectMode,
  toggleSelectNote,
  enterSelectMode,
  openPreviewNote,
  handleRestoreNote,
  handlePermanentDelete,
  isLight,
  lang,
  t
}) => {
  // FIX: pressTimer as a stable ref — persists across renders so endPress can reliably cancel it
  const pressTimerRef = useRef(null);

  // FIX: use shared getDaysLeft utility instead of duplicating the formula here
  const daysLeft = getDaysLeft(note.deletedAt);

  const plainSnippet = (() => {
    if (note.blocks && note.blocks.length > 0) {
      const textBlock = note.blocks.find(b => b && b.type === 'text' && b.content);
      if (textBlock) return htmlToPlainText(textBlock.content);
    }
    return htmlToPlainText(note.content || '');
  })();

  const handleCardClick = (e) => {
    if (isSelectMode) {
      toggleSelectNote(note.id);
    } else if (typeof openPreviewNote === 'function') {
      openPreviewNote(note);
    }
  };

  const startPress = () => {
    if (isSelectMode) return;
    // FIX: clear any existing timer before starting a new one
    clearTimeout(pressTimerRef.current);
    pressTimerRef.current = setTimeout(() => {
      enterSelectMode(note.id);
    }, 450);
  };
  const endPress = () => {
    // FIX: reliably cancel via stable ref
    clearTimeout(pressTimerRef.current);
  };

  const isUrgent = daysLeft <= 3;

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
        flexDirection: 'column',
        textAlign: 'left',
        gap: '10px',
        border: isSelected 
          ? '2px solid #3B82F6' 
          : isLight ? '1px solid rgba(0, 0, 0, 0.06)' : '1px solid rgba(255, 255, 255, 0.08)',
        background: isSelected 
          ? (isLight ? '#EFF6FF' : 'rgba(59, 130, 246, 0.12)') 
          : (isLight ? '#FFFFFF' : 'rgba(23, 29, 44, 0.85)'),
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        padding: '16px 18px',
        borderRadius: '18px',
        marginBottom: '12px',
        position: 'relative',
        transition: 'all 0.2s ease',
        boxShadow: isSelected 
          ? '0 4px 18px rgba(59, 130, 246, 0.25)' 
          : (isLight ? '0 4px 16px rgba(0,0,0,0.03)' : '0 4px 16px rgba(0,0,0,0.2)'),
        userSelect: 'none'
      }}
    >
      {/* Top Row: Checkbox (in select mode) + Title + Days Left Badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
          {isSelectMode && (
            <div style={{
              width: '22px',
              height: '22px',
              borderRadius: '50%',
              border: isSelected ? 'none' : (isLight ? '2px solid #94A3B8' : '2px solid rgba(255, 255, 255, 0.3)'),
              background: isSelected ? 'linear-gradient(135deg, #3B82F6, #1D4ED8)' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: isSelected ? '0 2px 8px rgba(59, 130, 246, 0.4)' : 'none',
              transition: 'all 0.15s ease'
            }}>
              {isSelected && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
          )}

          <h3 style={{ 
            fontSize: '0.98rem', 
            fontWeight: 700, 
            margin: 0, 
            color: isLight ? '#0F172A' : '#FFFFFF',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1
          }}>
            {note.title || t('untitledNote') || 'Başlıksız Not'}
          </h3>
        </div>

        <span style={{ 
          fontSize: '0.72rem', 
          fontWeight: 700, 
          padding: '3px 9px',
          borderRadius: '10px',
          background: isUrgent 
            ? (isLight ? '#FEE2E2' : 'rgba(239, 68, 68, 0.2)') 
            : (isLight ? '#F1F5F9' : 'rgba(255, 255, 255, 0.08)'),
          color: isUrgent 
            ? (isLight ? '#DC2626' : '#FCA5A5') 
            : (isLight ? '#64748B' : '#94A3B8'),
          flexShrink: 0,
          whiteSpace: 'nowrap'
        }}>
          {daysLeft > 0 ? `${daysLeft} ${t('daysRemaining') || 'gün kaldı'}` : (t('willBeDeletedToday') || 'Bugün silinecek')}
        </span>
      </div>

      {/* Snippet Row */}
      {plainSnippet ? (
        <p style={{ 
          fontSize: '0.83rem', 
          color: isLight ? '#475569' : 'rgba(255, 255, 255, 0.65)', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          display: '-webkit-box', 
          WebkitLineClamp: 2, 
          WebkitBoxOrient: 'vertical', 
          margin: 0,
          lineHeight: '1.45'
        }}>
          {plainSnippet}
        </p>
      ) : (
        <p style={{ 
          fontSize: '0.8rem', 
          color: isLight ? '#94A3B8' : 'rgba(255, 255, 255, 0.35)', 
          margin: 0,
          fontStyle: 'italic'
        }}>
          {/* FIX: was hard-coded Turkish — now uses translation system */}
          {t('emptyNoteContent') || (lang === 'tr' ? '(Metin içeriği yok)' : '(No text content)')}
        </p>
      )}

      {/* Footer Row: Metadata + Action Buttons */}
      {!isSelectMode && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          marginTop: '4px',
          paddingTop: '8px',
          borderTop: isLight ? '1px solid #F1F5F9' : '1px solid rgba(255, 255, 255, 0.06)'
        }}>
          <span style={{
            fontSize: '0.72rem',
            color: isLight ? '#94A3B8' : 'rgba(255, 255, 255, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {note.deletedAt 
              ? new Date(note.deletedAt).toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US', { day: 'numeric', month: 'short' })
              : ''}
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                handleRestoreNote(note.id); 
              }}
              style={{
                padding: '6px 12px',
                borderRadius: '10px',
                border: isLight ? '1px solid #A7F3D0' : '1px solid rgba(52, 211, 153, 0.25)',
                background: isLight ? '#ECFDF5' : 'rgba(16, 185, 129, 0.15)',
                color: isLight ? '#047857' : '#34D399',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all 0.15s ease'
              }}
              title={t('restoreBtn') || 'Geri Yükle'}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
              </svg>
              {t('restoreBtn') || 'Geri Yükle'}
            </button>

            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                handlePermanentDelete(note.id); 
              }}
              style={{
                padding: '6px 12px',
                borderRadius: '10px',
                border: isLight ? '1px solid #FECACA' : '1px solid rgba(248, 113, 113, 0.25)',
                background: isLight ? '#FEF2F2' : 'rgba(239, 68, 68, 0.15)',
                color: isLight ? '#B91C1C' : '#FCA5A5',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all 0.15s ease'
              }}
              title={t('deletePermanentlyBtn') || 'Kalıcı Olarak Sil'}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              {lang === 'tr' ? 'Kalıcı Sil' : (t('deletePermanentlyBtn') || 'Delete')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrashNoteCard;

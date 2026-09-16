import React, { useRef } from 'react';
import { getDaysLeft } from '@shared/utils/textUtils';
import { getNoteSnippet } from './NoteCard';

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
  const pressTimerRef = useRef(null);
  const daysLeft = getDaysLeft(note.deletedAt);
  const snippet = getNoteSnippet(note, t);
  const isUrgent = daysLeft <= 3;

  const handleCardClick = () => {
    if (isSelectMode) {
      toggleSelectNote(note.id);
    } else if (typeof openPreviewNote === 'function') {
      openPreviewNote(note);
    }
  };

  const startPress = () => {
    if (isSelectMode) return;
    clearTimeout(pressTimerRef.current);
    pressTimerRef.current = setTimeout(() => {
      enterSelectMode(note.id);
    }, 450);
  };

  const endPress = () => {
    clearTimeout(pressTimerRef.current);
  };

  // Day badge label
  const dayLabel = daysLeft > 0
    ? `${daysLeft}${lang === 'tr' ? 'g' : 'd'}`
    : (lang === 'tr' ? '0g' : '0d');

  return (
    <div
      onClick={handleCardClick}
      onTouchStart={startPress}
      onTouchEnd={endPress}
      onTouchMove={endPress}
      onMouseDown={startPress}
      onMouseUp={endPress}
      onMouseLeave={endPress}
      style={{
        position: 'relative',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        boxSizing: 'border-box',
        padding: '12px 12px 10px',
        borderRadius: '16px',
        background: isSelected
          ? (isLight ? '#EFF6FF' : 'rgba(59, 130, 246, 0.16)')
          : (isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(22, 28, 42, 0.88)'),
        border: isSelected
          ? '1.5px solid #3B82F6'
          : isUrgent
            ? isLight ? '1px solid rgba(239, 68, 68, 0.25)' : '1px solid rgba(239, 68, 68, 0.2)'
            : isLight ? '1px solid rgba(0, 0, 0, 0.07)' : '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: isSelected
          ? '0 4px 18px rgba(59, 130, 246, 0.2)'
          : isUrgent
            ? isLight ? '0 2px 10px rgba(239, 68, 68, 0.08)' : '0 4px 14px rgba(0,0,0,0.28)'
            : isLight ? '0 2px 8px rgba(0,0,0,0.04)' : '0 4px 14px rgba(0,0,0,0.28)',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
        userSelect: 'none',
        touchAction: 'manipulation',
        breakInside: 'avoid',
        marginBottom: '10px',
      }}
    >
      {/* Selection Circle (select mode only) */}
      {isSelectMode && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          border: isSelected ? 'none' : (isLight ? '2px solid #94A3B8' : '2px solid rgba(255,255,255,0.3)'),
          background: isSelected ? 'linear-gradient(135deg, #3B82F6, #1D4ED8)' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: isSelected ? '0 2px 6px rgba(59,130,246,0.4)' : 'none',
          transition: 'all 0.15s ease',
          zIndex: 2,
        }}>
          {isSelected && (
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </div>
      )}

      {/* Day Badge — top right corner */}
      <div style={{
        position: 'absolute',
        top: '9px',
        right: '9px',
        fontSize: '0.65rem',
        fontWeight: 800,
        padding: '2px 7px',
        borderRadius: '8px',
        background: isUrgent
          ? (isLight ? 'rgba(239, 68, 68, 0.12)' : 'rgba(239, 68, 68, 0.22)')
          : (isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.1)'),
        color: isUrgent
          ? (isLight ? '#DC2626' : '#FCA5A5')
          : (isLight ? '#64748B' : '#94A3B8'),
        letterSpacing: '-0.01em',
        lineHeight: 1.2,
        zIndex: 2,
      }}>
        {dayLabel}
      </div>

      {/* Note Title */}
      <h3 style={{
        fontSize: '0.88rem',
        fontWeight: 700,
        margin: '0 0 5px 0',
        color: isLight ? '#0F172A' : '#F1F5F9',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        lineHeight: '1.35',
        paddingRight: '36px', // make room for badge
        minHeight: '1.35rem',
      }}>
        {note.title || (lang === 'tr' ? 'Başlıksız Not' : 'Untitled Note')}
      </h3>

      {/* Snippet Preview */}
      {snippet && (
        <p style={{
          fontSize: '0.76rem',
          color: isLight ? '#64748B' : 'rgba(255,255,255,0.5)',
          margin: '0 0 8px 0',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          lineHeight: '1.4',
        }}>
          {snippet}
        </p>
      )}

      {/* Bottom Row: Deletion Date */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        marginTop: 'auto',
        paddingTop: snippet ? '0' : '4px',
      }}>
        <svg
          width="11" height="11" viewBox="0 0 24 24"
          fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ color: isLight ? '#94A3B8' : 'rgba(255,255,255,0.3)', flexShrink: 0 }}
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <span style={{
          fontSize: '0.68rem',
          color: isLight ? '#94A3B8' : 'rgba(255,255,255,0.35)',
          letterSpacing: '0.01em',
        }}>
          {note.deletedAt
            ? new Date(note.deletedAt).toLocaleDateString(
                lang === 'tr' ? 'tr-TR' : 'en-US',
                { day: 'numeric', month: 'short' }
              )
            : ''}
        </span>
      </div>
    </div>
  );
};

export default TrashNoteCard;

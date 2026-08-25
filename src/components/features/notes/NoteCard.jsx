import React from 'react';

const cleanText = (str) => {
  if (!str) return '';
  return str.replace(/^[\s\p{Extended_Pictographic}\u2300-\u23FF\u2600-\u27BF]+/gu, '').trim();
};

const LockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginRight: '4px' }}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const OwnerIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginRight: '4px' }}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const CollabIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginRight: '4px' }}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const PendingShareIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginRight: '4px' }}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const SnippetIcon = ({ type }) => {
  const style = { flexShrink: 0, marginRight: '6px', verticalAlign: '-2px' };
  switch (type) {
    case 'debt':
      return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={style}><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2" /></svg>;
    case 'todo':
      return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#06B6D4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={style}><polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>;
    case 'bill':
      return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={style}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>;
    case 'split':
      return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={style}><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><polyline points="17 8 20 11 23 8" /></svg>;
    case 'password':
      return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EAB308" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={style}><circle cx="7.5" cy="15.5" r="5.5" /><path d="M21 2l-9.6 9.6" /><path d="M15.5 7.5l3 3" /></svg>;
    case 'parking':
      return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={style}><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C2.0 10.9 2 11.5 2 11.5V16c0 .6.4 1 1 1h2" /><circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" /></svg>;
    case 'exam':
      return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={style}><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
    case 'image':
      return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0EA5E9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={style}><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>;
    case 'audio':
      return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={style}><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /></svg>;
    case 'file':
      return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={style}><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>;
    default:
      return null;
  }
};

export const getNoteSnippet = (note, t = (k) => k) => {
  if (note.isLocked) {
    return (
      <span style={{ fontStyle: 'italic', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center' }}>
        <LockIcon /> {cleanText(t('lockedContent'))}
      </span>
    );
  }

  const blocks = note.blocks || [];
  
  const textBlock = blocks.find(b => {
    if (!b || b.type !== 'text') return false;
    const clean = (b.content || '')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/gi, ' ')
      .replace(/[\u200B\u8203\r\n]/g, '')
      .trim();
    return clean.length > 0;
  });

  if (textBlock && textBlock.content) {
    const cleanTextStr = textBlock.content
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/gi, ' ')
      .replace(/[\u200B\u8203\r\n]/g, '')
      .trim();
    if (cleanTextStr) return cleanTextStr;
  }

  const firstWidget = blocks.find(b => b && b.type && b.type !== 'text');
  if (firstWidget) {
    let label = '';
    switch (firstWidget.type) {
      case 'debt':
        label = `${cleanText(t('debtTracking'))}${firstWidget.name ? `: ${firstWidget.name}` : ''}`;
        break;
      case 'todo':
        label = `${cleanText(t('todoList'))}${firstWidget.title ? `: ${firstWidget.title}` : ''}`;
        break;
      case 'bill':
        label = `${cleanText(t('billTracking'))}${firstWidget.name ? `: ${firstWidget.name}` : ''}`;
        break;
      case 'split':
        label = cleanText(t('billSplitter'));
        break;
      case 'password':
        label = `${cleanText(t('myPasswords'))}${firstWidget.title ? `: ${firstWidget.title}` : ''}`;
        break;
      case 'parking':
        label = cleanText(t('whereIsMyCar'));
        break;
      case 'exam':
        label = `${cleanText(t('examTracking'))}${firstWidget.course ? `: ${firstWidget.course}` : ''}`;
        break;
      case 'image':
        label = 'Görsel';
        break;
      case 'audio':
        label = 'Ses Kaydı';
        break;
      case 'file':
        label = firstWidget.name || 'Dosya';
        break;
      default:
        label = cleanText(t('emptyContent'));
        break;
    }

    return (
      <span style={{ display: 'inline-flex', alignItems: 'center' }}>
        <SnippetIcon type={firstWidget.type} />
        {label}
      </span>
    );
  }

  return cleanText(t('emptyContent')) || 'İçerik yok';
};

const NoteCard = ({
  note,
  openEditingNote,
  handleTogglePin,
  isLight,
  t
}) => {
  const snippet = getNoteSnippet(note, t);

  return (
    <div
      onClick={() => {
        window.history.pushState({ page: 'editor', noteId: note.id }, '');
        openEditingNote(note);
      }}
      style={{
        padding: '16px',
        borderRadius: '16px',
        background: isLight ? 'rgba(255,255,255,0.90)' : 'rgba(18, 24, 36, 0.85)',
        backdropFilter: 'blur(16px)',
        border: note.isPinned 
          ? '1.5px solid rgba(59, 130, 246, 0.5)' 
          : isLight ? '1px solid rgba(0,0,0,0.06)' : '1px solid rgba(255,255,255,0.09)',
        boxShadow: isLight ? '0 4px 16px rgba(0,0,0,0.04)' : '0 8px 24px rgba(0,0,0,0.35)',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        position: 'relative',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
        <h3 style={{
          fontSize: '0.98rem',
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

        {/* Pin Toggle Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (typeof handleTogglePin === 'function') handleTogglePin(note.id);
          }}
          style={{
            background: 'transparent',
            border: 'none',
            color: note.isPinned ? '#3B82F6' : 'var(--text-muted)',
            cursor: 'pointer',
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: note.isPinned ? 1 : 0.4
          }}
          title={note.isPinned ? 'Sabitlemeyi Kaldır' : 'Sabitle'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill={note.isPinned ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="17" x2="12" y2="22" />
            <path d="M5 17h14l-1.5-6H6.5L5 17z" />
            <path d="M9 11V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v7" />
          </svg>
        </button>
      </div>

      <p style={{
        fontSize: '0.82rem',
        color: isLight ? '#475569' : 'rgba(255, 255, 255, 0.6)',
        margin: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        lineHeight: 1.4
      }}>
        {snippet}
      </p>

      {/* Share / Collab Status Badge */}
      {note.hasPendingShare && !note.isShared && !note.sharedFrom ? (
        <div style={{ display: 'flex', alignItems: 'center', marginTop: '2px' }}>
          <span style={{
            fontSize: '0.68rem',
            fontWeight: 800,
            color: isLight ? '#B45309' : '#FCD34D',
            background: isLight ? '#FEF3C7' : 'rgba(245, 158, 11, 0.15)',
            padding: '2px 8px',
            borderRadius: '6px',
            border: isLight ? '1px solid #FDE68A' : '1px solid rgba(245, 158, 11, 0.3)',
            display: 'inline-flex',
            alignItems: 'center',
          }}>
            <PendingShareIcon /> {t ? (t('pendingApproval') || 'Onay Bekleniyor') : 'Onay Bekleniyor'}
          </span>
        </div>
      ) : (note.isShared || Boolean(note.sharedFrom)) ? (
        <div style={{ display: 'flex', alignItems: 'center', marginTop: '2px' }}>
          <span style={{
            fontSize: '0.68rem',
            fontWeight: 800,
            color: isLight ? '#047857' : '#6EE7B7',
            background: isLight ? '#ECFDF5' : 'rgba(16, 185, 129, 0.15)',
            padding: '2px 8px',
            borderRadius: '6px',
            border: isLight ? '1px solid #A7F3D0' : '1px solid rgba(16, 185, 129, 0.3)',
            display: 'inline-flex',
            alignItems: 'center',
          }}>
            <CollabIcon /> {note.sharedFrom ? (cleanText(t('sharedWithMe') || 'Gelen Not')) : (cleanText(t('ownerBadge') || 'Not Sahibi'))}
          </span>
        </div>
      ) : null}
    </div>
  );
};

export default NoteCard;

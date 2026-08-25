import React from 'react';
import NoteCard from './NoteCard';

const cleanText = (str) => {
  if (!str) return '';
  return str.replace(/^[\s\p{Extended_Pictographic}\u2300-\u23FF\u2600-\u27BF]+/gu, '').trim();
};

const PinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', verticalAlign: '-2px' }}>
    <line x1="12" y1="17" x2="12" y2="22" />
    <path d="M5 17h14l-1.5-6H6.5L5 17z" />
    <path d="M9 11V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v7" />
  </svg>
);

export const PinnedNotesSection = ({
  pinnedNotes,
  activeMenuNoteId,
  setActiveMenuNoteId,
  requestBiometricAuth,
  setNotes,
  persistNotes,
  setToast,
  handleMoveToTrash,
  openEditingNote,
  reminders,
  now,
  lang,
  t,
}) => {
  if (!pinnedNotes || pinnedNotes.length === 0) return null;

  return (
    <div style={{ marginBottom: '20px' }}>
      <div className="section-title" style={{ marginBottom: '10px' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', margin: 0 }}>
          <PinIcon /> {cleanText(t('pinnedBadge') || 'Sabitlenenler')}
        </h2>
        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          {pinnedNotes.length} {t('notes')}
        </span>
      </div>

      <div className="note-list">
        {pinnedNotes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            activeMenuNoteId={activeMenuNoteId}
            setActiveMenuNoteId={setActiveMenuNoteId}
            requestBiometricAuth={requestBiometricAuth}
            setNotes={setNotes}
            persistNotes={persistNotes}
            setToast={setToast}
            handleMoveToTrash={handleMoveToTrash}
            openEditingNote={openEditingNote}
            reminders={reminders}
            now={now}
            lang={lang}
            t={t}
          />
        ))}
      </div>
    </div>
  );
};

export default PinnedNotesSection;

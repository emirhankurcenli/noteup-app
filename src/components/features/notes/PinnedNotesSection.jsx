import React from 'react';
import NoteCard from './NoteCard';

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
        <h2>📌 {t('pinnedBadge') || 'Sabitlenenler'}</h2>
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

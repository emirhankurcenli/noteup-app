import React from 'react';
import NoteCard from './NoteCard';
import { PinIcon } from '@shared/components/Icons';
import { cleanText } from '@shared/utils/textUtils';

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
  setReminderNoteId,
  setShowReminderModal,
  handleCancelReminder,
  setActiveShareNoteId,
  setNudgeTargetNote,
  checkAndRequestNotificationPermission,
  reminders,
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
            setReminderNoteId={setReminderNoteId}
            setShowReminderModal={setShowReminderModal}
            handleCancelReminder={handleCancelReminder}
            setActiveShareNoteId={setActiveShareNoteId}
            setNudgeTargetNote={setNudgeTargetNote}
            checkAndRequestNotificationPermission={checkAndRequestNotificationPermission}
            reminders={reminders}
            lang={lang}
            t={t}
          />
        ))}
      </div>
    </div>
  );
};

export default PinnedNotesSection;

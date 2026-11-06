import React, { useState, useEffect, useMemo } from 'react';
import NoteCard from './NoteCard';
import { cleanText } from '@shared/utils/textUtils';

const NotesGrid = ({
  visibleNotes,
  reminders,
  activeMenuNoteId,
  setActiveMenuNoteId,
  requestBiometricAuth,
  setNotes,
  persistNotes,
  setToast,
  getRemainingTimeText,
  handleMoveToTrash,
  openEditingNote,
  setReminderNoteId,
  setShowReminderModal,
  handleCancelReminder,
  setActiveShareNoteId,
  setNudgeTargetNote,
  checkAndRequestNotificationPermission,
  theme = 'light',
  lang = 'tr',
  t = (k) => k,
}) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const reminderEntries = reminders ? Object.values(reminders) : [];
    const hasUpcoming = reminderEntries.some((r) => r && r.time > Date.now());
    if (!hasUpcoming) return;

    const checkAndUpdate = () => {
      const curTime = Date.now();
      const currentUpcoming = reminderEntries.filter((r) => r && r.time > curTime);
      if (currentUpcoming.length > 0) {
        setNow(curTime);
      }
    };

    const minDiff = Math.min(
      ...reminderEntries.filter((r) => r && r.time > Date.now()).map((r) => r.time - Date.now())
    );
    const intervalMs = minDiff <= 60_000 ? 1000 : 15_000;

    const timer = setInterval(checkAndUpdate, intervalMs);
    return () => clearInterval(timer);
  }, [reminders]);

  useEffect(() => {
    if (!activeMenuNoteId) return;
    const handleScroll = () => setActiveMenuNoteId(null);
    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, [activeMenuNoteId, setActiveMenuNoteId]);

  const sortedNotes = useMemo(() => {
    return [...(visibleNotes || [])].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return (b.updatedAt || 0) - (a.updatedAt || 0);
    });
  }, [visibleNotes]);

  return (
    <div className="animate-slide-up">
      <div className="section-title">
        <h2>{t('allNotes')}</h2>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {sortedNotes.length} {t('notes')}
        </span>
      </div>

      <div className="note-list">
        {sortedNotes.length > 0 ? (
          sortedNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              activeMenuNoteId={activeMenuNoteId}
              setActiveMenuNoteId={setActiveMenuNoteId}
              requestBiometricAuth={requestBiometricAuth}
              setNotes={setNotes}
              persistNotes={persistNotes}
              setToast={setToast}
              getRemainingTimeText={getRemainingTimeText}
              handleMoveToTrash={handleMoveToTrash}
              openEditingNote={openEditingNote}
              setReminderNoteId={setReminderNoteId}
              setShowReminderModal={setShowReminderModal}
              handleCancelReminder={handleCancelReminder}
              setActiveShareNoteId={setActiveShareNoteId}
              setNudgeTargetNote={setNudgeTargetNote}
              checkAndRequestNotificationPermission={checkAndRequestNotificationPermission}
              reminders={reminders}
              now={now}
              theme={theme}
              lang={lang}
              t={t}
            />
          ))
        ) : (
          <p style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {cleanText(t('noNotesYet'))}
          </p>
        )}
      </div>
    </div>
  );
};

export default NotesGrid;

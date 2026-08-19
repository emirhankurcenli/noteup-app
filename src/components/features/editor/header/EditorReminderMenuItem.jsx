import React from 'react';

export const EditorReminderMenuItem = ({
  editingNote,
  reminders = [],
  setShowEditorMenu,
  checkAndRequestNotificationPermission,
  setReminderNoteId,
  setReminderTime,
  setShowReminderModal,
  handleCancelReminder,
  setToast,
  lang,
  t,
  isLight,
}) => {
  const activeRem = (reminders || []).find(
    (r) => r.noteId === editingNote?.id && r.active && new Date(r.time).getTime() > Date.now()
  );

  return (
    <button
      style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '9px 12px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600 }}
      onClick={async () => {
        setShowEditorMenu(false);
        if (activeRem) {
          if (typeof handleCancelReminder === 'function') {
            handleCancelReminder(activeRem.id);
            setToast?.({
              title: '🔔',
              msg: lang === 'tr' ? 'Hatırlatıcı iptal edildi.' : 'Reminder cancelled.',
            });
          }
          return;
        }

        if (checkAndRequestNotificationPermission) {
          const granted = await checkAndRequestNotificationPermission();
          if (!granted) return;
        }

        setReminderNoteId(editingNote.id);
        const d = new Date();
        d.setHours(d.getHours() + 1);
        const formatLocal = (date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          return `${year}-${month}-${day}T${hours}:${minutes}`;
        };
        setReminderTime(formatLocal(d));
        setShowReminderModal(true);
      }}
    >
      <div
        style={{
          width: '28px',
          height: '28px',
          borderRadius: '8px',
          background: isLight ? 'linear-gradient(135deg, #6366F1, #4F46E5)' : 'rgba(99, 102, 241, 0.18)',
          border: isLight ? 'none' : '1px solid rgba(99, 102, 241, 0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: isLight ? '#FFF' : '#818CF8',
          flexShrink: 0,
        }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      </div>
      <span>{activeRem ? (lang === 'tr' ? 'Hatırlatıcıyı Kaldır' : 'Remove Reminder') : t('remind')}</span>
    </button>
  );
};

export default EditorReminderMenuItem;

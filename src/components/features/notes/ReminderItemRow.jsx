import React from 'react';

const ReminderItemRow = ({
  reminder,
  note,
  openEditingNote,
  handleCancelReminder,
  formatReminderDate,
  getRemainingTimeText,
  isLight,
  t
}) => {
  return (
    <div style={{
      padding: '14px 16px',
      borderRadius: '16px',
      background: isLight ? 'rgba(255,255,255,0.90)' : 'rgba(18, 24, 36, 0.85)',
      backdropFilter: 'blur(12px)',
      border: isLight ? '1px solid rgba(0,0,0,0.06)' : '1px solid rgba(255,255,255,0.08)',
      boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px'
    }}>
      <div 
        onClick={() => {
          if (note) {
            window.history.pushState({ page: 'editor', noteId: note.id }, '');
            openEditingNote(note);
          }
        }}
        style={{ flex: 1, minWidth: 0, cursor: note ? 'pointer' : 'default' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span style={{ fontSize: '0.92rem', fontWeight: 800, color: isLight ? '#0F172A' : '#FFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {reminder.title || note?.title || t('untitledNote')}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.75rem', color: '#3B82F6', fontWeight: 700 }}>
            ⏰ {formatReminderDate(reminder.time)}
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            ({getRemainingTimeText(reminder.time)})
          </span>
        </div>
      </div>

      <button
        onClick={() => handleCancelReminder(reminder.id)}
        style={{
          padding: '6px 12px',
          borderRadius: '8px',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          background: 'rgba(239, 68, 68, 0.1)',
          color: '#EF4444',
          fontSize: '0.75rem',
          fontWeight: 700,
          cursor: 'pointer',
          flexShrink: 0
        }}
      >
        {t('cancel')}
      </button>
    </div>
  );
};

export default ReminderItemRow;

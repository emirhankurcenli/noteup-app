import React from 'react';

const getNowLocalDateTimeString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const ExamWidget = ({
  block,
  blockFormStates,
  updateBlockForm,
  handleDeleteExamBlock,
  checkAndRequestNotificationPermission,
  setToast,
  setQuickReminderTitle,
  setQuickReminderTime,
  setPendingWidgetAlarmCtx,
  reminders,
  editingNote,
  now,
  lang,
  triggerHaptic,
  theme = 'dark',
  t
}) => {
  const isLight = theme === 'light';
  const efs = blockFormStates[block.id] || {};
  const course = efs.tempCourse !== undefined ? efs.tempCourse : (block.course || '');
  const isEditing = efs.isEditing || !block.setupDone;

  const getExamStatus = () => {
    if (!block.examMs) return null;
    const diffMs = block.examMs - Date.now();
    if (diffMs < 0) return { text: t('examPassed'), color: 'var(--text-muted)', urgent: false };
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffHours < 1) return { text: `${Math.ceil(diffMs / 60000)} dk kaldı ⚡`, color: '#EF4444', urgent: true };
    if (diffHours < 24) return { text: `${Math.floor(diffHours)} ${t('examHoursLeft')} ⚡`, color: '#EF4444', urgent: true };
    if (diffDays === 0) return { text: t('examToday'), color: '#EF4444', urgent: true };
    return { text: `${diffDays} ${t('examDaysLeft')}`, color: diffDays <= 3 ? '#F59E0B' : '#6366F1', urgent: diffDays <= 3 };
  };

  const status = getExamStatus();

  if (isEditing) {
    return (
      <div className="split-widget" style={{ borderRadius: '18px', border: '1.5px solid rgba(99, 102, 241, 0.35)', background: 'var(--bg-card)', padding: '16px' }} onClick={(e) => e.stopPropagation()}>
        <div className="split-header" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366F1, #4F46E5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{t('examTracking')}</span>
          <button
            style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#EF4444', cursor: 'pointer', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: 'auto' }}
            onClick={() => handleDeleteExamBlock(block.id)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="debt-form animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input
            id={`exam-course-${block.id}`}
            type="text"
            className="input-field"
            style={{ padding: '10px 14px', borderRadius: '12px', fontSize: '0.85rem' }}
            placeholder={t('examCourse')}
            value={course}
            onChange={(e) => updateBlockForm(block.id, { tempCourse: e.target.value })}
          />
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.15)', borderRadius: '12px', padding: '10px 12px', lineHeight: 1.5, display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <span>{t('alarmHintText')}</span>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            {block.setupDone && (
              <button
                className="btn-secondary"
                style={{ flex: 1, padding: '10px', borderRadius: '12px', fontWeight: 600, fontSize: '0.82rem' }}
                onClick={() => updateBlockForm(block.id, { isEditing: false, tempCourse: undefined })}
              >{t('cancelBtn')}</button>
            )}
            <button
              className="btn-primary"
              style={{ flex: 2, padding: '12px', fontSize: '0.9rem', fontWeight: 700, borderRadius: '12px', background: 'linear-gradient(135deg, #6366F1, #4F46E5)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: 'none', color: '#FFF', boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)', cursor: 'pointer' }}
              onClick={async () => {
                if (!course.trim()) {
                  if (triggerHaptic) triggerHaptic('warning');
                  const el = document.getElementById(`exam-course-${block.id}`);
                  if (el) {
                    el.focus();
                    el.style.borderColor = '#F59E0B';
                    el.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.4)';
                    el.style.backgroundColor = 'rgba(245, 158, 11, 0.08)';
                    setTimeout(() => {
                      el.style.borderColor = '';
                      el.style.boxShadow = '';
                      el.style.backgroundColor = '';
                    }, 1200);
                  }
                  return;
                }
                try {
                  await checkAndRequestNotificationPermission();
                } catch (e) {}

                updateBlockForm(block.id, { tempCourse: course, isEditing: false });
                setQuickReminderTitle(`${course.trim()}`);
                setQuickReminderTime(getNowLocalDateTimeString());
                setPendingWidgetAlarmCtx({
                  blockId: block.id,
                  noteId: editingNote ? editingNote.id : null,
                  widgetType: 'exam',
                  course: course.trim()
                });
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="13" r="8" />
                <polyline points="12 9 12 13 15 15" />
                <line x1="5" y1="3" x2="2" y2="6" />
                <line x1="19" y1="3" x2="22" y2="6" />
              </svg>
              {lang === 'tr' ? 'Alarm Kur' : 'Set Alarm'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const examLabel = block.examMs
    ? new Date(block.examMs).toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  return (
    <div className="split-widget" style={{ borderRadius: '18px', border: `1.5px solid ${status?.urgent ? status.color : '#6366F1'}`, background: 'var(--bg-card)', padding: '16px' }} onClick={(e) => e.stopPropagation()}>
      <div className="split-header" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366F1, #4F46E5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', flexShrink: 0, boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </div>
        <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{block.course}</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px', alignItems: 'center' }}>
          <button
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', cursor: 'pointer', width: '28px', height: '28px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => updateBlockForm(block.id, { isEditing: true, tempCourse: block.course, tempDate: block.examDate, tempTime: block.examTime })}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </button>
          <button
            style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#EF4444', cursor: 'pointer', width: '28px', height: '28px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => handleDeleteExamBlock(block.id)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{examLabel}</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {new Date(block.examMs).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
            </span>
          </div>
          {status && (
            <span style={{
              fontSize: '0.85rem',
              fontWeight: 800,
              color: status.color,
              background: `${status.color}18`,
              borderRadius: '10px',
              padding: '6px 12px',
              border: `1.5px solid ${status.color}40`
            }}>{status.text}</span>
          )}
        </div>
        {(() => {
          const activeCount = (block.examReminderIds || []).filter(rid => {
            const rem = reminders.find(r => r.id === rid);
            return rem && rem.active && new Date(rem.time).getTime() > now;
          }).length;
          return activeCount > 0 ? (
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
              ✓ {activeCount} alarm kurulu
            </div>
          ) : null;
        })()}
      </div>
    </div>
  );
};

export default ExamWidget;

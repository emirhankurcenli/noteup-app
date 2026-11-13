import React, { useMemo } from 'react';
import { getNowLocalDateTimeString } from '@shared/utils/dateUtils';

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

  const getTr = (key, fallback) => {
    if (typeof t === 'function') {
      const val = t(key);
      if (val && val !== key) return val;
    }
    return fallback;
  };

  const status = useMemo(() => {
    if (!block.examMs) return null;
    const diffMs = block.examMs - Date.now();
    if (diffMs < 0) {
      return {
        text: getTr('examPassed', lang === 'tr' ? 'Süresi Geçti' : 'Passed'),
        color: '#64748B',
        bg: 'rgba(100, 116, 139, 0.12)',
        border: 'rgba(100, 116, 139, 0.25)',
        urgent: false
      };
    }
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffHours < 1) {
      return {
        text: `${Math.ceil(diffMs / 60000)} ${getTr('examMinsLeft', lang === 'tr' ? 'dk kaldı' : 'min left')}`,
        color: '#EF4444',
        bg: 'rgba(239, 68, 68, 0.12)',
        border: 'rgba(239, 68, 68, 0.28)',
        urgent: true
      };
    }
    if (diffHours < 24) {
      return {
        text: `${Math.floor(diffHours)} ${getTr('examHoursLeft', lang === 'tr' ? 'saat kaldı' : 'hours left')}`,
        color: '#EF4444',
        bg: 'rgba(239, 68, 68, 0.12)',
        border: 'rgba(239, 68, 68, 0.28)',
        urgent: true
      };
    }
    if (diffDays === 0) {
      return {
        text: getTr('examToday', lang === 'tr' ? 'Bugün' : 'Today'),
        color: '#EF4444',
        bg: 'rgba(239, 68, 68, 0.12)',
        border: 'rgba(239, 68, 68, 0.28)',
        urgent: true
      };
    }
    const isSoon = diffDays <= 3;
    return {
      text: `${diffDays} ${getTr('examDaysLeft', lang === 'tr' ? 'gün kaldı' : 'days left')}`,
      color: isSoon ? '#F59E0B' : '#6366F1',
      bg: isSoon ? 'rgba(245, 158, 11, 0.12)' : 'rgba(99, 102, 241, 0.12)',
      border: isSoon ? 'rgba(245, 158, 11, 0.28)' : 'rgba(99, 102, 241, 0.25)',
      urgent: isSoon
    };
  }, [block.examMs, t, lang]);

  if (isEditing) {
    return (
      <div className="split-widget" style={{ borderRadius: '16px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', padding: '16px' }} onClick={(e) => e.stopPropagation()}>
        <div className="split-header" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: 'rgba(99, 102, 241, 0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366F1' }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>{t('examTracking')}</span>
          <button
            style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#EF4444', cursor: 'pointer', width: '28px', height: '28px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: 'auto' }}
            onClick={() => handleDeleteExamBlock(block.id)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className=" animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input
            id={`exam-course-${block.id}`}
            type="text"
            className="input-field"
            style={{ padding: '10px 14px', borderRadius: '10px', fontSize: '0.88rem', fontWeight: 500 }}
            placeholder={t('examCourse')}
            value={course}
            onChange={(e) => updateBlockForm(block.id, { tempCourse: e.target.value })}
          />
          <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
            {block.setupDone && (
              <button
                className="btn-secondary"
                style={{ flex: 1, padding: '10px', borderRadius: '10px', fontWeight: 600, fontSize: '0.84rem' }}
                onClick={() => updateBlockForm(block.id, { isEditing: false, tempCourse: undefined })}
              >{t('cancelBtn')}</button>
            )}
            <button
              className="btn-primary"
              style={{ flex: 2, padding: '10px 14px', fontSize: '0.86rem', fontWeight: 600, borderRadius: '10px', background: '#6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: 'none', color: '#FFF', boxShadow: 'none', cursor: 'pointer' }}
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
              {t ? t('setReminderBtn') : (lang === 'tr' ? 'Alarm Kur' : 'Set Alarm')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const BCP47_LOCALES = { tr: 'tr-TR', en: 'en-US', de: 'de-DE', es: 'es-ES', fr: 'fr-FR', it: 'it-IT', ru: 'ru-RU', ar: 'ar-SA', ja: 'ja-JP', zh: 'zh-CN' };
  const currentLocale = BCP47_LOCALES[lang] || 'en-US';
  const examLabel = block.examMs
    ? new Date(block.examMs).toLocaleDateString(currentLocale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  return (
    <div className="split-widget" style={{ borderRadius: '16px', border: `1px solid ${status?.urgent ? status.border : 'var(--border-color)'}`, background: 'var(--bg-card)', padding: '16px' }} onClick={(e) => e.stopPropagation()}>
      <div className="split-header" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: 'rgba(99, 102, 241, 0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366F1', flexShrink: 0 }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </div>
        <span style={{ fontWeight: 700, fontSize: '0.94rem', color: 'var(--text-primary)' }}>{block.course}</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px', alignItems: 'center' }}>
          <button
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', cursor: 'pointer', width: '28px', height: '28px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
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
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{examLabel}</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {new Date(block.examMs).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
            </span>
          </div>
          {status && (
            <span style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              color: status.color,
              background: status.bg,
              borderRadius: '8px',
              padding: '5px 10px',
              border: `1px solid ${status.border}`,
              whiteSpace: 'nowrap'
            }}>{status.text}</span>
          )}
        </div>
        {(() => {
          const activeCount = (block.examReminderIds || []).filter(rid => {
            const rem = reminders.find(r => r.id === rid);
            return rem && rem.active && new Date(rem.time).getTime() > now;
          }).length;
          return activeCount > 0 ? (
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 500 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>{activeCount} {getTr('alarmsSetCount', lang === 'tr' ? 'alarm kurulu' : 'alarms set')}</span>
            </div>
          ) : null;
        })()}
      </div>
    </div>
  );
};

export default React.memo(ExamWidget);

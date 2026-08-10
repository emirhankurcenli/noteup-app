import React from 'react';
import { DrumPicker, getNowLocalDateTimeString } from '../common/AppModals';

const cleanText = (str) => {
  if (!str) return '';
  return str.replace(/^[\s\p{Extended_Pictographic}\u2300-\u23FF\u2600-\u27BF]+/gu, '').trim();
};

const WidgetAlarmModal = ({
  pendingWidgetAlarmCtx,
  handleCancelWidgetAlarm,
  quickReminderTitle,
  setQuickReminderTitle,
  quickReminderTime,
  setQuickReminderTime,
  quickReminderModes,
  setQuickReminderModes,
  handleCreateWidgetAlarm,
  lang,
  theme,
  t,
  triggerHaptic,
}) => {
  if (!pendingWidgetAlarmCtx) return null;

  const isLight = theme === 'light';

  return (
    <div
      onClick={handleCancelWidgetAlarm}
      className="modal-overlay animate-fade-in"
      style={{
        position: 'fixed', zIndex: 9999,
        top: 0, left: 0, right: 0, bottom: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: isLight ? 'rgba(15, 23, 42, 0.45)' : 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        padding: '20px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="modal-content animate-pop"
        style={{
          width: '100%',
          maxWidth: '360px',
          background: isLight ? '#FFFFFF' : 'var(--bg-card, #1E293B)',
          border: isLight ? '1px solid rgba(226, 232, 240, 0.9)' : '1px solid var(--border-color, rgba(255,255,255,0.12))',
          borderRadius: '24px',
          padding: '24px 20px',
          boxShadow: isLight ? '0 20px 45px rgba(0,0,0,0.14)' : '0 24px 60px rgba(0,0,0,0.45)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFF',
              boxShadow: '0 4px 14px rgba(59, 130, 246, 0.35)'
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="13" r="8" />
                <polyline points="12 9 12 13 15 15" />
                <line x1="5" y1="3" x2="2" y2="6" />
                <line x1="19" y1="3" x2="22" y2="6" />
              </svg>
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: isLight ? '#0F172A' : '#F8FAFC', margin: 0 }}>
              {cleanText(lang === 'tr' ? 'Alarm Ayarla' : 'Set Alarm')}
            </h3>
          </div>

          <button
            onClick={handleCancelWidgetAlarm}
            style={{
              background: isLight ? 'rgba(241, 245, 249, 0.9)' : 'rgba(255, 255, 255, 0.08)',
              border: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255, 255, 255, 0.12)',
              color: isLight ? '#475569' : '#94A3B8',
              cursor: 'pointer',
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <input
          type="text"
          className="input-field"
          style={{ padding: '10px 14px', borderRadius: '12px', fontSize: '0.88rem', fontWeight: 600 }}
          placeholder={t('alarmTitlePlaceholder')}
          value={quickReminderTitle}
          onChange={(e) => setQuickReminderTitle(e.target.value)}
        />

        <div style={{ background: isLight ? '#F8FAFC' : 'rgba(15, 23, 42, 0.5)', borderRadius: '16px', padding: '8px', border: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.06)' }}>
          <DrumPicker
            value={quickReminderTime || getNowLocalDateTimeString()}
            onChange={(v) => setQuickReminderTime(v)}
            lang={lang}
            triggerHaptic={triggerHaptic}
          />
        </div>

        {/* Mode selector (Single Choice - No Subtext Header) */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => {
              if (triggerHaptic) triggerHaptic('light');
              setQuickReminderModes({ notification: true, alarm: false });
            }}
            style={{
              flex: 1,
              padding: '14px 10px',
              borderRadius: '16px',
              border: quickReminderModes.notification ? '2px solid #3B82F6' : (isLight ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.1)'),
              background: quickReminderModes.notification ? (isLight ? '#EFF6FF' : 'rgba(59, 130, 246, 0.15)') : (isLight ? '#F8FAFC' : 'rgba(255,255,255,0.03)'),
              color: quickReminderModes.notification ? '#3B82F6' : (isLight ? '#475569' : 'var(--text-secondary)'),
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {cleanText(t('notificationType')) || 'Bildirim'}
          </button>

          <button
            onClick={() => {
              if (triggerHaptic) triggerHaptic('light');
              setQuickReminderModes({ notification: false, alarm: true });
            }}
            style={{
              flex: 1,
              padding: '14px 10px',
              borderRadius: '16px',
              border: quickReminderModes.alarm ? '2px solid #EF4444' : (isLight ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.1)'),
              background: quickReminderModes.alarm ? (isLight ? '#FEF2F2' : 'rgba(239, 68, 68, 0.15)') : (isLight ? '#F8FAFC' : 'rgba(255,255,255,0.03)'),
              color: quickReminderModes.alarm ? '#EF4444' : (isLight ? '#475569' : 'var(--text-secondary)'),
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="13" r="8" />
              <polyline points="12 9 12 13 15 15" />
              <line x1="5" y1="3" x2="2" y2="6" />
              <line x1="19" y1="3" x2="22" y2="6" />
            </svg>
            {cleanText(t('alarmType')) || 'Alarm'}
          </button>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
          <button
            onClick={handleCancelWidgetAlarm}
            className="btn-secondary"
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '14px',
              fontWeight: 700,
              fontSize: '0.85rem',
            }}
          >
            {t('cancelBtn')}
          </button>
          <button
            onClick={() => {
              if (triggerHaptic) triggerHaptic('success');
              handleCreateWidgetAlarm();
            }}
            className="btn-primary"
            style={{
              flex: 1.5,
              padding: '12px',
              borderRadius: '14px',
              border: 'none',
              background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
              color: '#fff',
              fontSize: '0.88rem',
              fontWeight: '800',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(59, 130, 246, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {t('saveBtn') || 'Kaydet'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WidgetAlarmModal;

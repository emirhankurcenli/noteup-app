import React from 'react';

const BellIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const AlarmIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="13" r="8" />
    <path d="M12 9v4l2 2" />
    <path d="M5 3 2 6" />
    <path d="m22 6-3-3" />
  </svg>
);

const ReminderModeSelector = ({ mode, setMode, triggerHaptic, isLight, t = (k) => k }) => {
  return (
    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
      <button
        type="button"
        onClick={() => {
          if (triggerHaptic) triggerHaptic('light');
          setMode('notification');
        }}
        style={{
          flex: 1,
          padding: '10px 8px',
          borderRadius: '12px',
          fontSize: '0.82rem',
          fontWeight: 700,
          border: mode === 'notification'
            ? '1.5px solid #3B82F6'
            : isLight ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.08)',
          background: mode === 'notification'
            ? 'linear-gradient(135deg, #3B82F6, #2563EB)'
            : isLight ? '#F8FAFC' : 'rgba(255,255,255,0.04)',
          color: mode === 'notification' ? '#FFFFFF' : (isLight ? '#475569' : '#94A3B8'),
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          transition: 'all 0.2s ease'
        }}
      >
        <BellIcon /> Bildirim
      </button>

      <button
        type="button"
        onClick={() => {
          if (triggerHaptic) triggerHaptic('light');
          setMode('alarm');
        }}
        style={{
          flex: 1,
          padding: '10px 8px',
          borderRadius: '12px',
          fontSize: '0.82rem',
          fontWeight: 700,
          border: mode === 'alarm'
            ? '1.5px solid #EF4444'
            : isLight ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.08)',
          background: mode === 'alarm'
            ? 'linear-gradient(135deg, #EF4444, #DC2626)'
            : isLight ? '#F8FAFC' : 'rgba(255,255,255,0.04)',
          color: mode === 'alarm' ? '#FFFFFF' : (isLight ? '#475569' : '#94A3B8'),
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          transition: 'all 0.2s ease'
        }}
      >
        <AlarmIcon /> Sesli Alarm
      </button>
    </div>
  );
};

export default ReminderModeSelector;

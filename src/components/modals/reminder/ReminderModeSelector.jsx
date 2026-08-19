import React from 'react';

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
          transition: 'all 0.2s ease'
        }}
      >
        🔔 Bildirim
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
          transition: 'all 0.2s ease'
        }}
      >
        ⏰ Sesli Alarm
      </button>
    </div>
  );
};

export default ReminderModeSelector;

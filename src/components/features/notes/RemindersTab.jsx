import React, { useState, useEffect } from 'react';

const RemindersTab = ({
  notes,
  reminders,
  permissionStates,
  checkAndRequestNotificationPermission,
  handleCancelReminder,
  lang,
  t
}) => {
  // Local state for live countdown ticking
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, []);

  const formatReminderDate = (dateStr) => {
    const date = new Date(dateStr);
    const todayNow = new Date();
    
    const timeOptions = { hour: '2-digit', minute: '2-digit' };
    const formattedTime = date.toLocaleTimeString(lang === 'tr' ? 'tr-TR' : 'en-US', timeOptions);
    
    const isToday = date.toDateString() === todayNow.toDateString();
    const tomorrow = new Date(todayNow);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = date.toDateString() === tomorrow.toDateString();
    
    if (isToday) {
      return `${t('today')}, ${formattedTime}`;
    } else if (isTomorrow) {
      return `${t('tomorrow')}, ${formattedTime}`;
    } else {
      return `${date.toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })} ${formattedTime}`;
    }
  };

  return (
    <div className="animate-slide-up">
      <div className="section-title">
        <h2>{t('reminders')}</h2>
      </div>

      {permissionStates.notification !== 'granted' ? (
        <div className="glass-panel" style={{ padding: '32px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginTop: '16px' }}>
          <span style={{ fontSize: '3rem' }}>🔕</span>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>{t('alarmPermissionDisabled')}</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: '280px', lineHeight: '1.4' }}>
            {t('alarmPermissionMsg')}
          </p>
          <button className="btn-primary" style={{ padding: '10px 24px', fontSize: '0.85rem', marginTop: '8px' }} onClick={checkAndRequestNotificationPermission}>
            {t('enablePermissions')}
          </button>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            {t('permissionSettingsGuide')}
          </p>
        </div>
      ) : (
        <>
          {(() => {
            // Only show active (future) reminders for active (non-deleted) notes
            const activeNoteIds = new Set(notes.filter(n => !n.deletedAt).map(n => n.id));
            const visibleReminders = reminders.filter(r => {
              const isNoteActive = !r.noteId || activeNoteIds.has(r.noteId);
              const targetMs = new Date(r.time).getTime();
              return isNoteActive && (targetMs - now > 0);
            });
            
            if (visibleReminders.length === 0) {
              return (
                <div className="reminder-empty">
                  <div style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '22px',
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                  }}>
                    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                    </svg>
                  </div>
                  <p>{t('noAlarms')}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {lang === 'tr' ? 'Notlarınızın içinden alarm ve hatırlatıcı kurabilirsiniz.' : 'You can set alarms and reminders from within your notes.'}
                  </p>
                </div>
              );
            }

            return visibleReminders.map(reminder => {
              const targetMs = new Date(reminder.time).getTime();
              const diffMs = targetMs - now;

              // Live countdown breakdown
              const totalSec = Math.max(0, Math.floor(diffMs / 1000));
              const days = Math.floor(totalSec / 86400);
              const hrs  = Math.floor((totalSec % 86400) / 3600);
              const mins = Math.floor((totalSec % 3600) / 60);
              const secs = totalSec % 60;

              // Countdown label
              let countdownLabel;
              if (days > 0) {
                countdownLabel = lang === 'tr' ? `${days}g ${hrs}s ${mins}d` : `${days}d ${hrs}h ${mins}m`;
              } else if (hrs > 0) {
                countdownLabel = lang === 'tr' ? `${hrs}s ${mins}d ${secs}sn` : `${hrs}h ${mins}m ${secs}s`;
              } else if (mins > 0) {
                countdownLabel = lang === 'tr' ? `${mins}d ${secs}sn` : `${mins}m ${secs}s`;
              } else {
                countdownLabel = lang === 'tr' ? `${secs}sn` : `${secs}s`;
              }

              // Urgency color
              const urgencyColor = diffMs < 5 * 60 * 1000   ? '#ef4444'   // < 5 min  → red
                : diffMs < 60 * 60 * 1000  ? '#E8501A'   // < 1 hour → amber
                : diffMs < 24 * 60 * 60 * 1000 ? '#2E5B80' // < 1 day  → cyan
                : 'var(--primary)';                          // > 1 day  → purple

              // Circular ring progress (max window = 24h)
              const windowMs = 24 * 60 * 60 * 1000;
              const ringPct = Math.min(100, Math.max(0, (1 - diffMs / windowMs) * 100));
              const R = 18; const C = 2 * Math.PI * R;
              const dash = (ringPct / 100) * C;

              return (
                <div key={reminder.id} className="reminder-card-v2">
                  {/* Left: ring + countdown */}
                  <div className="reminder-ring-wrap">
                    <svg width="44" height="44" viewBox="0 0 44 44">
                      <circle cx="22" cy="22" r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
                      <circle
                        cx="22" cy="22" r={R}
                        fill="none"
                        stroke={urgencyColor}
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray={`${dash} ${C}`}
                        strokeDashoffset="0"
                        transform="rotate(-90 22 22)"
                        style={{ transition: 'stroke-dasharray 1s linear, stroke 0.5s' }}
                      />
                    </svg>
                    <div className="reminder-ring-inner">
                      <span style={{ fontSize: '1rem' }}>⏰</span>
                    </div>
                  </div>
                  {/* Center: title + date */}
                  <div className="reminder-center">
                    <span className="reminder-title-v2">{reminder.title}</span>
                    <span className="reminder-date-v2">{formatReminderDate(reminder.time)}</span>
                    <span className="reminder-countdown" style={{ color: urgencyColor }}>
                      {countdownLabel + ' ' + t('remainedText')}
                    </span>
                  </div>

                  {/* Right: cancel */}
                  <button
                    className="reminder-cancel-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCancelReminder(reminder);
                    }}
                    title={t('cancelBtn')}
                  >
                    &times;
                  </button>
                </div>
              );
            });
          })()}
        </>
      )}
    </div>
  );
};

export default RemindersTab;

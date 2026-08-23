import React, { useState, useMemo } from 'react';
import NotesGrid from './NotesGrid';

const SharedNotesTab = ({
  notes = [],
  reminders = [],
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
  theme,
  lang,
  t,
  myCode,
  handleLeaveShare
}) => {
  const [filter, setFilter] = useState('all'); // 'all' | 'mine' | 'withMe'
  const isLight = theme === 'light';

  // 1. All active shared notes
  const allSharedNotes = useMemo(() => {
    return (notes || []).filter(n => n && !n.deletedAt && (n.isShared || Boolean(n.sharedFrom) || (n.sharedWith && n.sharedWith.length > 0)));
  }, [notes]);

  // 2. Filtered list based on segmented selection
  const filteredNotes = useMemo(() => {
    if (filter === 'mine') {
      return allSharedNotes.filter(n => !n.sharedFrom);
    }
    if (filter === 'withMe') {
      return allSharedNotes.filter(n => Boolean(n.sharedFrom));
    }
    return allSharedNotes;
  }, [allSharedNotes, filter]);

  const mineCount = useMemo(() => allSharedNotes.filter(n => !n.sharedFrom).length, [allSharedNotes]);
  const withMeCount = useMemo(() => allSharedNotes.filter(n => Boolean(n.sharedFrom)).length, [allSharedNotes]);

  return (
    <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
          🤝 {t('sharedNotesTab') || 'Paylaşılan Notlar'}
        </h2>
        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 500 }}>
          {t('sharedNotesSub') || 'Arkadaşlarınızla ortaklaşa çalıştığınız tüm notlar'}
        </span>
      </div>

      {/* ── Segmented Control Filter Chips ────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px',
          background: isLight ? '#F1F5F9' : 'rgba(255, 255, 255, 0.05)',
          borderRadius: '16px',
          border: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255, 255, 255, 0.08)',
          width: '100%',
          boxSizing: 'border-box',
          overflowX: 'auto'
        }}
      >
        <button
          onClick={() => setFilter('all')}
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: '12px',
            border: 'none',
            fontSize: '0.82rem',
            fontWeight: filter === 'all' ? 800 : 600,
            cursor: 'pointer',
            background: filter === 'all'
              ? (isLight ? '#FFFFFF' : 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)')
              : 'transparent',
            color: filter === 'all'
              ? (isLight ? '#1D4ED8' : '#FFFFFF')
              : 'var(--text-muted)',
            boxShadow: filter === 'all' ? (isLight ? '0 2px 8px rgba(0,0,0,0.06)' : '0 2px 10px rgba(59, 130, 246, 0.3)') : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            whiteSpace: 'nowrap',
            transition: 'all 0.15s ease'
          }}
        >
          <span>{t('allShared') || 'Tümü'}</span>
          <span
            style={{
              fontSize: '0.72rem',
              padding: '1px 6px',
              borderRadius: '8px',
              background: filter === 'all' ? (isLight ? '#EFF6FF' : 'rgba(255,255,255,0.25)') : 'rgba(0,0,0,0.06)',
              color: filter === 'all' ? (isLight ? '#2563EB' : '#FFFFFF') : 'var(--text-muted)'
            }}
          >
            {allSharedNotes.length}
          </span>
        </button>

        <button
          onClick={() => setFilter('mine')}
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: '12px',
            border: 'none',
            fontSize: '0.82rem',
            fontWeight: filter === 'mine' ? 800 : 600,
            cursor: 'pointer',
            background: filter === 'mine'
              ? (isLight ? '#FFFFFF' : 'linear-gradient(135deg, #10B981 0%, #059669 100%)')
              : 'transparent',
            color: filter === 'mine'
              ? (isLight ? '#047857' : '#FFFFFF')
              : 'var(--text-muted)',
            boxShadow: filter === 'mine' ? (isLight ? '0 2px 8px rgba(0,0,0,0.06)' : '0 2px 10px rgba(16, 185, 129, 0.3)') : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            whiteSpace: 'nowrap',
            transition: 'all 0.15s ease'
          }}
        >
          <span>📤 {t('sharedByMe') || 'Paylaştıklarım'}</span>
          <span
            style={{
              fontSize: '0.72rem',
              padding: '1px 6px',
              borderRadius: '8px',
              background: filter === 'mine' ? (isLight ? '#ECFDF5' : 'rgba(255,255,255,0.25)') : 'rgba(0,0,0,0.06)',
              color: filter === 'mine' ? (isLight ? '#059669' : '#FFFFFF') : 'var(--text-muted)'
            }}
          >
            {mineCount}
          </span>
        </button>

        <button
          onClick={() => setFilter('withMe')}
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: '12px',
            border: 'none',
            fontSize: '0.82rem',
            fontWeight: filter === 'withMe' ? 800 : 600,
            cursor: 'pointer',
            background: filter === 'withMe'
              ? (isLight ? '#FFFFFF' : 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)')
              : 'transparent',
            color: filter === 'withMe'
              ? (isLight ? '#6D28D9' : '#FFFFFF')
              : 'var(--text-muted)',
            boxShadow: filter === 'withMe' ? (isLight ? '0 2px 8px rgba(0,0,0,0.06)' : '0 2px 10px rgba(139, 92, 246, 0.3)') : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            whiteSpace: 'nowrap',
            transition: 'all 0.15s ease'
          }}
        >
          <span>📥 {t('sharedWithMe') || 'Benimle Paylaşılanlar'}</span>
          <span
            style={{
              fontSize: '0.72rem',
              padding: '1px 6px',
              borderRadius: '8px',
              background: filter === 'withMe' ? (isLight ? '#F5F3FF' : 'rgba(255,255,255,0.25)') : 'rgba(0,0,0,0.06)',
              color: filter === 'withMe' ? (isLight ? '#7C3AED' : '#FFFFFF') : 'var(--text-muted)'
            }}
          >
            {withMeCount}
          </span>
        </button>
      </div>

      {/* ── Notes List or Empty State ─────────────────────────────────────────── */}
      {filteredNotes.length === 0 ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '48px 20px',
            textAlign: 'center',
            gap: '12px',
            background: isLight ? '#FFFFFF' : 'rgba(255, 255, 255, 0.02)',
            borderRadius: '20px',
            border: isLight ? '1px dashed #CBD5E1' : '1px dashed rgba(255, 255, 255, 0.12)'
          }}
        >
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '20px',
              background: isLight ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.8rem'
            }}
          >
            {filter === 'mine' ? '📤' : (filter === 'withMe' ? '📥' : '🤝')}
          </div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            {filter === 'mine'
              ? (t('noSharedByMeTitle') || 'Henüz paylaştığınız bir not yok')
              : filter === 'withMe'
              ? (t('noSharedWithMeTitle') || 'Sizinle paylaşılan bir not yok')
              : (t('noSharedNotesTitle') || 'Paylaşılan not bulunamadı')}
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0, maxWidth: '280px', lineHeight: 1.4 }}>
            {filter === 'mine'
              ? (t('noSharedByMeSub') || 'Bir notu açıp menüden "Arkadaşınla Paylaş" seçeneğini kullanarak arkadaşlarınızı davet edebilirsiniz.')
              : filter === 'withMe'
              ? (t('noSharedWithMeSub') || 'Arkadaşlarınız sizinle bir not paylaştığında burada görünecektir.')
              : (t('noSharedNotesSub') || 'Notlarınızı arkadaşlarınızla paylaşarak birlikte eş zamanlı çalışabilirsiniz.')}
          </p>
        </div>
      ) : (
        <NotesGrid
          visibleNotes={filteredNotes}
          reminders={reminders}
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
          lang={lang}
          t={t}
        />
      )}
    </div>
  );
};

export default SharedNotesTab;

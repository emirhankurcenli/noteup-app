import React from 'react';
import { Capacitor } from '@capacitor/core';
import { PLAN_LIMITS } from '../../../constants/paywallPlans';

const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '1.25rem', height: '1.25rem' }}>
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

const getNowLocalDateTimeString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Helper to strip raw emojis from text strings
const cleanText = (str) => {
  if (!str) return '';
  return str.replace(/^[\s\p{Extended_Pictographic}\u2300-\u23FF\u2600-\u27BF]+/gu, '').trim();
};

const MenuBadge = ({ bgLight = '#3B82F6', bgDark = 'rgba(59, 130, 246, 0.18)', borderDark = 'rgba(59, 130, 246, 0.35)', colorDark = '#60A5FA', colorLight = '#FFF', isLight = true, children }) => (
  <div style={{
    width: '28px',
    height: '28px',
    borderRadius: '8px',
    background: isLight ? bgLight : bgDark,
    border: isLight ? 'none' : `1px solid ${borderDark}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: isLight ? colorLight : colorDark,
    flexShrink: 0,
    boxShadow: isLight ? `0 2px 6px ${bgLight}40` : 'none'
  }}>
    {children}
  </div>
);

const NoteEditorHeader = ({
  editingNote,
  setEditingNote,
  handleCloseEditor,
  editorUndoStack = [],
  editorRedoStack = [],
  handleUndo,
  handleRedo,
  showFormatToolbar,
  setShowFormatToolbar,
  activeFormatBlockId,
  setActiveFormatBlockId,
  showEditorMenu,
  setShowEditorMenu,
  lang,
  t,
  requestBiometricAuth,
  setNotes,
  persistNotes,
  setToast,
  checkAndRequestNotificationPermission,
  setReminderNoteId,
  setReminderTime,
  setShowReminderModal,
  handleInsertWidget,
  permissionStates,
  checkAndRequestPermission,
  fileInputRef,
  startRecording,
  setShowShareModal,
  handleMoveToTrash,
  userPlan = 'lite',
  notes = [],
  setShowPaywall,
  theme = 'dark',
  reminders = [],
  handleCancelReminder,
}) => {
  const isLight = theme === 'light';
  return (
    <div className="editor-header">
      <button className="btn-secondary" style={{ padding: '8px 12px' }} onClick={handleCloseEditor}>
        <BackIcon />
      </button>
      {!editingNote.deletedAt && (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* Undo Button */}
          <button
            className="btn-secondary"
            style={{
              padding: '8px 10px',
              fontSize: '1.05rem',
              opacity: (editorUndoStack || []).length === 0 ? 0.35 : 1,
              pointerEvents: (editorUndoStack || []).length === 0 ? 'none' : 'auto',
              height: '38px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '38px',
              background: 'rgba(255,255,255,0.04)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)',
            }}
            onClick={(e) => { e.stopPropagation(); handleUndo(); }}
            title="Geri Al"
          >
            ↩️
          </button>

          {/* Redo Button */}
          <button
            className="btn-secondary"
            style={{
              padding: '8px 10px',
              fontSize: '1.05rem',
              opacity: (editorRedoStack || []).length === 0 ? 0.35 : 1,
              pointerEvents: (editorRedoStack || []).length === 0 ? 'none' : 'auto',
              height: '38px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '38px',
              background: 'rgba(255,255,255,0.04)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)',
            }}
            onClick={(e) => { e.stopPropagation(); handleRedo(); }}
            title="İleri Al"
          >
            ↪️
          </button>

          <button
            className="btn-secondary"
            style={{
              padding: '8px 12px',
              fontWeight: 'bold',
              fontSize: '1rem',
              background: showFormatToolbar ? 'rgba(139,92,246,0.18)' : 'rgba(255,255,255,0.04)',
              borderColor: showFormatToolbar ? 'var(--primary)' : 'var(--border-color)',
              color: showFormatToolbar ? 'var(--primary)' : 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '40px',
              height: '38px',
              borderRadius: '12px'
            }}
            onMouseDown={(e) => e.preventDefault()}
            onTouchStart={(e) => e.preventDefault()}
            onClick={(e) => {
              e.stopPropagation();
              setShowFormatToolbar(v => !v);
              let targetBlockId = activeFormatBlockId;
              if (!targetBlockId && editingNote?.blocks?.length > 0) {
                const firstText = editingNote.blocks?.find(b => b.type === 'text');
                if (firstText) {
                  targetBlockId = firstText.id;
                  setActiveFormatBlockId(firstText.id);
                }
              }
              if (targetBlockId) {
                const focusTarget = () => {
                  const el = document.querySelector(`textarea[data-block-id="${targetBlockId}"]`);
                  if (el) try { el.focus({ preventScroll: true }); } catch (err) { el.focus(); }
                };
                focusTarget();
                queueMicrotask(focusTarget);
                setTimeout(focusTarget, 0);
                setTimeout(focusTarget, 30);
              }
            }}
            title="Yazı Biçimi"
          >
            Aa
          </button>
          <div style={{ position: 'relative' }}>
            <button
              className="btn-secondary"
              style={{ padding: '8px 16px', fontSize: '1.1rem', letterSpacing: '3px', lineHeight: 1 }}
              onMouseDown={(e) => e.preventDefault()}
              onTouchStart={(e) => e.preventDefault()}
              onClick={(e) => { e.stopPropagation(); setShowEditorMenu(v => !v); }}
            >⋯</button>
            {showEditorMenu && (
              <div 
                className="editor-menu-dropdown animate-fade-in" 
                onClick={(e) => e.stopPropagation()}
                style={{
                  minWidth: '230px',
                  padding: '8px',
                  borderRadius: '18px',
                  background: 'var(--bg-card)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid var(--border-color)',
                  boxShadow: '0 12px 32px rgba(0,0,0,0.25)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                {/* 1. Lock/Unlock */}
                <button 
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600 }}
                  onClick={async () => {
                    setShowEditorMenu(false);
                    const isLocking = !editingNote.isLocked;

                    if (isLocking) {
                      const limits = PLAN_LIMITS[userPlan] || PLAN_LIMITS.lite;
                      const currentLockedCount = (notes || []).filter(n => n.isLocked && !n.deletedAt && n.id !== editingNote.id).length;
                      if (currentLockedCount >= limits.maxEncryptedNotes) {
                        setToast({
                          title: '⭐ Plan Limiti Aşıldı',
                          msg: `Lite planında en fazla ${limits.maxEncryptedNotes} adet not kilitleyebilirsiniz. Sınırsız şifreleme için Pro'ya geçin!`
                        });
                        if (typeof setShowPaywall === 'function') setShowPaywall(true);
                        return;
                      }
                    }

                    const title = isLocking
                      ? (lang === 'tr' ? 'Notu Kilitle' : 'Lock Note')
                      : (lang === 'tr' ? 'Kilidi Kaldır' : 'Unlock Note');
                    const subtitle = isLocking
                      ? (lang === 'tr' ? 'Notu kilitlemek için parmak izi, yüz tanıma veya telefon şifrenizi girin' : 'Use Face ID, fingerprint or phone password to lock')
                      : (lang === 'tr' ? 'Kilidi kaldırmak için parmak izi, yüz tanıma veya telefon şifrenizi girin' : 'Use Face ID, fingerprint or phone password to unlock');

                    const ok = await requestBiometricAuth(title, subtitle);
                    if (ok) {
                      const updated = { ...editingNote, isLocked: isLocking, updatedAt: Date.now() };
                      setEditingNote(updated);
                      setNotes(prev => {
                        const upd = prev.map(n => n.id === editingNote.id ? updated : n);
                        persistNotes(upd);
                        return upd;
                      });
                      setToast({
                        title: isLocking ? '🔒' : '🔓',
                        msg: isLocking
                          ? (lang === 'tr' ? 'Not kilitlendi.' : 'Note locked.')
                          : (lang === 'tr' ? 'Notun kilidi kaldırıldı.' : 'Note unlocked.')
                      });
                    } else {
                      setToast({ title: '⚠️', msg: t('authFailed') });
                    }
                  }}
                >
                  <MenuBadge bgLight="linear-gradient(135deg, #F59E0B, #D97706)" bgDark="rgba(245, 158, 11, 0.18)" borderDark="rgba(245, 158, 11, 0.35)" colorDark="#FBBF24" isLight={isLight}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      {editingNote.isLocked ? (
                        <>
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                        </>
                      ) : (
                        <>
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </>
                      )}
                    </svg>
                  </MenuBadge>
                  <span>{cleanText(editingNote.isLocked ? t('unlockNote') : t('lockNote'))}</span>
                </button>

                {/* 2. Remind */}
                {(() => {
                  const activeRem = (reminders || []).find(r => r.noteId === editingNote?.id && r.active && new Date(r.time).getTime() > Date.now());
                  return (
                    <button 
                      style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600 }}
                      onClick={async () => {
                        if (activeRem) {
                          if (typeof handleCancelReminder === 'function') {
                            handleCancelReminder(activeRem);
                          }
                          setShowEditorMenu(false);
                        } else {
                          try {
                            await checkAndRequestNotificationPermission();
                          } catch (e) {}
                          if (editingNote) setReminderNoteId(editingNote.id);
                          setReminderTime(getNowLocalDateTimeString());
                          setShowReminderModal(true);
                          setShowEditorMenu(false);
                        }
                      }}
                    >
                      <MenuBadge bgLight="linear-gradient(135deg, #3B82F6, #2563EB)" bgDark="rgba(59, 130, 246, 0.18)" borderDark="rgba(59, 130, 246, 0.35)" colorDark="#60A5FA" isLight={isLight}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="13" r="8" />
                          <polyline points="12 9 12 13 15 15" />
                          <line x1="5" y1="3" x2="2" y2="6" />
                          <line x1="19" y1="3" x2="22" y2="6" />
                        </svg>
                      </MenuBadge>
                      <span>{activeRem ? (lang === 'tr' ? 'Hatırlatıcıyı Kaldır' : 'Remove Reminder') : cleanText(t('remind'))}</span>
                    </button>
                  );
                })()}

                <div className="editor-menu-divider" style={{ margin: '4px 0', opacity: 0.15 }} />
                <div className="editor-menu-section-label" style={{ padding: '4px 12px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {t('addWidget')}
                </div>

                {/* Widgets */}
                <button style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '9px 12px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600 }} onClick={() => handleInsertWidget('debt')}>
                  <MenuBadge bgLight="linear-gradient(135deg, #10B981, #059669)" bgDark="rgba(16, 185, 129, 0.18)" borderDark="rgba(16, 185, 129, 0.35)" colorDark="#34D399" isLight={isLight}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="6" width="20" height="12" rx="2" />
                      <circle cx="12" cy="12" r="2" />
                      <path d="M6 12h.01M18 12h.01" />
                    </svg>
                  </MenuBadge>
                  <span>{cleanText(t('debtTracking'))}</span>
                </button>

                <button style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '9px 12px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600 }} onClick={() => handleInsertWidget('expense', { items: [] })}>
                  <MenuBadge bgLight="linear-gradient(135deg, #F43F5E, #E11D48)" bgDark="rgba(244, 63, 94, 0.18)" borderDark="rgba(244, 63, 94, 0.35)" colorDark="#FB7185" isLight={isLight}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                      <path d="M18 12a2 2 0 0 0 0 4h3v-4z" />
                    </svg>
                  </MenuBadge>
                  <span>{cleanText(t('expenseTracking'))}</span>
                </button>

                <button style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '9px 12px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600 }} onClick={() => handleInsertWidget('todo')}>
                  <MenuBadge bgLight="linear-gradient(135deg, #06B6D4, #0891B2)" bgDark="rgba(6, 182, 212, 0.18)" borderDark="rgba(6, 182, 212, 0.35)" colorDark="#38BDF8" isLight={isLight}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 11 12 14 22 4" />
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                    </svg>
                  </MenuBadge>
                  <span>{cleanText(t('todoList'))}</span>
                </button>

                <button style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '9px 12px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600 }} onClick={() => handleInsertWidget('bill', { name: '', day: new Date().getDate(), time: '12:00', mode: 'notification', history: [], setupDone: false })}>
                  <MenuBadge bgLight="linear-gradient(135deg, #8B5CF6, #7C3AED)" bgDark="rgba(139, 92, 246, 0.18)" borderDark="rgba(139, 92, 246, 0.35)" colorDark="#C084FC" isLight={isLight}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                  </MenuBadge>
                  <span>{cleanText(t('billTracking'))}</span>
                </button>

                <button style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '9px 12px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600 }} onClick={() => handleInsertWidget('split', { participants: [], expenses: [] })}>
                  <MenuBadge bgLight="linear-gradient(135deg, #F97316, #EA580C)" bgDark="rgba(249, 115, 22, 0.18)" borderDark="rgba(249, 115, 22, 0.35)" colorDark="#FB923C" isLight={isLight}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="8.5" cy="7" r="4" />
                      <polyline points="17 8 20 11 23 8" />
                    </svg>
                  </MenuBadge>
                  <span>{cleanText(t('billSplitter'))}</span>
                </button>

                <button style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '9px 12px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600 }} onClick={() => handleInsertWidget('password', { title: '', username: '', passwordVal: '' })}>
                  <MenuBadge bgLight="linear-gradient(135deg, #EAB308, #CA8A04)" bgDark="rgba(234, 179, 8, 0.18)" borderDark="rgba(234, 179, 8, 0.35)" colorDark="#FACC15" isLight={isLight}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="7.5" cy="15.5" r="5.5" />
                      <path d="M21 2l-9.6 9.6" />
                      <path d="M15.5 7.5l3 3" />
                    </svg>
                  </MenuBadge>
                  <span>{cleanText(t('myPasswords'))}</span>
                </button>

                <button style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '9px 12px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600 }} onClick={() => handleInsertWidget('parking', { lat: null, lng: null, floor: '', slot: '', note: '' })}>
                  <MenuBadge bgLight="linear-gradient(135deg, #EF4444, #DC2626)" bgDark="rgba(239, 68, 68, 0.18)" borderDark="rgba(239, 68, 68, 0.35)" colorDark="#FCA5A5" isLight={isLight}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C2.0 10.9 2 11.2 2 11.5V16c0 .6.4 1 1 1h2" />
                      <circle cx="7" cy="17" r="2" />
                      <circle cx="17" cy="17" r="2" />
                    </svg>
                  </MenuBadge>
                  <span>{cleanText(t('whereIsMyCar'))}</span>
                </button>

                <button style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '9px 12px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600 }} onClick={() => handleInsertWidget('exam', { course: '', examDate: '', examTime: '09:00', setupDone: false })}>
                  <MenuBadge bgLight="linear-gradient(135deg, #6366F1, #4F46E5)" bgDark="rgba(99, 102, 241, 0.18)" borderDark="rgba(99, 102, 241, 0.35)" colorDark="#818CF8" isLight={isLight}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </MenuBadge>
                  <span>{cleanText(t('examTracking'))}</span>
                </button>

                <button 
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '9px 12px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600 }}
                  onClick={async () => {
                    if (checkAndRequestPermission) {
                      const grantedStorage = await checkAndRequestPermission('storage');
                      if (!grantedStorage) {
                        setShowEditorMenu(false);
                        return;
                      }
                      const grantedAudio = await checkAndRequestPermission('audio');
                      if (!grantedAudio) {
                        setShowEditorMenu(false);
                        return;
                      }
                    }
                    if (fileInputRef?.current) fileInputRef.current.click();
                    setShowEditorMenu(false);
                  }}
                >
                  <MenuBadge bgLight="linear-gradient(135deg, #0EA5E9, #0284C7)" bgDark="rgba(14, 165, 233, 0.18)" borderDark="rgba(14, 165, 233, 0.35)" colorDark="#38BDF8" isLight={isLight}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                    </svg>
                  </MenuBadge>
                  <span>{cleanText(t('addFileImage'))}</span>
                </button>

                <button style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '9px 12px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600 }} onClick={() => { startRecording(); setShowEditorMenu(false); }}>
                  <MenuBadge bgLight="linear-gradient(135deg, #EC4899, #DB2777)" bgDark="rgba(236, 72, 153, 0.18)" borderDark="rgba(236, 72, 153, 0.35)" colorDark="#F472B6" isLight={isLight}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    </svg>
                  </MenuBadge>
                  <span>{cleanText(t('recordAudio'))}</span>
                </button>

                <div className="editor-menu-divider" style={{ margin: '4px 0', opacity: 0.15 }} />

                {/* Share */}
                <button style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '9px 12px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600 }} onClick={() => { setShowShareModal(true); setShowEditorMenu(false); }}>
                  <MenuBadge bgLight="linear-gradient(135deg, #3B82F6, #0D9488)" bgDark="rgba(59, 130, 246, 0.18)" borderDark="rgba(59, 130, 246, 0.35)" colorDark="#60A5FA" isLight={isLight}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="18" cy="5" r="3" />
                      <circle cx="6" cy="12" r="3" />
                      <circle cx="18" cy="19" r="3" />
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                    </svg>
                  </MenuBadge>
                  <span>{cleanText(t('shareNoteLabel'))}</span>
                </button>

                <div className="editor-menu-divider" style={{ margin: '4px 0', opacity: 0.15 }} />

                {/* Move to Trash */}
                <button
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '9px 12px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600, color: '#EF4444' }}
                  onClick={() => {
                    setShowEditorMenu(false);
                    handleMoveToTrash(editingNote.id);
                  }}
                >
                  <MenuBadge bgLight="rgba(239, 68, 68, 0.15)" bgDark="rgba(239, 68, 68, 0.18)" borderDark="rgba(239, 68, 68, 0.35)" colorDark="#FCA5A5" colorLight="#EF4444" isLight={isLight}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </MenuBadge>
                  <span>{cleanText(t('moveToTrash'))}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NoteEditorHeader;

import React from 'react';
import { useEditorContext } from '../../../../context/EditorContext';
import { EditorLockStatusBadge } from './EditorLockStatusBadge';
import { EditorReminderMenuItem } from './EditorReminderMenuItem';
import { EditorShareMenuItem } from './EditorShareMenuItem';
import { EditorDeleteMenuItem } from './EditorDeleteMenuItem';

export const EditorOptionsMenuDropdown = (props) => {
  const ctx = useEditorContext();

  const {
    showEditorMenu = props.showEditorMenu,
    setShowEditorMenu = props.setShowEditorMenu,
    editingNote = props.editingNote,
    setEditingNote = props.setEditingNote,
    userPlan = props.userPlan,
    notes = props.notes,
    setToast = props.setToast,
    setShowPaywall = props.setShowPaywall,
    lang = props.lang,
    t = props.t,
    requestBiometricAuth = props.requestBiometricAuth,
    setNotes = props.setNotes,
    persistNotes = props.persistNotes,
    reminders = props.reminders,
    checkAndRequestNotificationPermission = props.checkAndRequestNotificationPermission,
    setReminderNoteId = props.setReminderNoteId,
    setReminderTime = props.setReminderTime,
    setShowReminderModal = props.setShowReminderModal,
    handleCancelReminder = props.handleCancelReminder,
    handleInsertWidget = props.handleInsertWidget,
    checkAndRequestPermission = props.checkAndRequestPermission,
    fileInputRef = props.fileInputRef,
    startRecording = props.startRecording,
    setShowShareModal = props.setShowShareModal,
    handleMoveToTrash = props.handleMoveToTrash,
    isLight = props.isLight,
  } = { ...props, ...ctx };
  if (!showEditorMenu) return null;

  return (
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
        gap: '4px',
        position: 'absolute',
        right: 0,
        top: '100%',
        zIndex: 200,
      }}
    >
      {/* 1. Lock / Unlock Option */}
      <EditorLockStatusBadge
        editingNote={editingNote}
        setEditingNote={setEditingNote}
        setShowEditorMenu={setShowEditorMenu}
        userPlan={userPlan}
        notes={notes}
        setToast={setToast}
        setShowPaywall={setShowPaywall}
        lang={lang}
        t={t}
        requestBiometricAuth={requestBiometricAuth}
        setNotes={setNotes}
        persistNotes={persistNotes}
        isLight={isLight}
      />

      {/* 2. Reminder Option */}
      <EditorReminderMenuItem
        editingNote={editingNote}
        reminders={reminders}
        setShowEditorMenu={setShowEditorMenu}
        checkAndRequestNotificationPermission={checkAndRequestNotificationPermission}
        setReminderNoteId={setReminderNoteId}
        setReminderTime={setReminderTime}
        setShowReminderModal={setShowReminderModal}
        handleCancelReminder={handleCancelReminder}
        setToast={setToast}
        lang={lang}
        t={t}
        isLight={isLight}
      />

      <div className="editor-menu-divider" style={{ margin: '4px 0', opacity: 0.15 }} />

      {/* 3. Share Option */}
      <EditorShareMenuItem
        setShowShareModal={setShowShareModal}
        setShowEditorMenu={setShowEditorMenu}
        t={t}
        isLight={isLight}
      />

      <div className="editor-menu-divider" style={{ margin: '4px 0', opacity: 0.15 }} />

      {/* 4. EKLENTİLER (WIDGETS & ATTACHMENTS SECTION) */}
      <div style={{ fontSize: '0.70rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '4px 10px 2px 10px' }}>
        {t('addWidget')}
      </div>

      {/* 4a. Yapılacaklar Listesi */}
      <button
        onClick={() => {
          if (typeof handleInsertWidget === 'function') handleInsertWidget('todo');
          setShowEditorMenu(false);
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 10px',
          background: 'none',
          border: 'none',
          borderRadius: '10px',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          fontSize: '0.86rem',
          fontWeight: 600,
          textAlign: 'left',
          width: '100%'
        }}
      >
        <div style={{ width: '26px', height: '26px', borderRadius: '7px', background: isLight ? '#0891B2' : 'rgba(6, 182, 212, 0.18)', border: isLight ? 'none' : '1px solid rgba(6, 182, 212, 0.35)', color: isLight ? '#FFF' : '#22D3EE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: isLight ? '0 2px 6px rgba(8, 145, 178, 0.4)' : 'none' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
        </div>
        <span>{t('todoListWidget')}</span>
      </button>

      {/* 4b. Borç Takibi */}
      <button
        onClick={() => {
          if (typeof handleInsertWidget === 'function') handleInsertWidget('debt');
          setShowEditorMenu(false);
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 10px',
          background: 'none',
          border: 'none',
          borderRadius: '10px',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          fontSize: '0.86rem',
          fontWeight: 600,
          textAlign: 'left',
          width: '100%'
        }}
      >
        <div style={{ width: '26px', height: '26px', borderRadius: '7px', background: isLight ? '#059669' : 'rgba(16, 185, 129, 0.18)', border: isLight ? 'none' : '1px solid rgba(16, 185, 129, 0.35)', color: isLight ? '#FFF' : '#34D399', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: isLight ? '0 2px 6px rgba(5, 150, 105, 0.4)' : 'none' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/></svg>
        </div>
        <span>{t('debtTrackerWidget')}</span>
      </button>

      {/* 4c. Fatura Takibi */}
      <button
        onClick={() => {
          if (typeof handleInsertWidget === 'function') handleInsertWidget('bill');
          setShowEditorMenu(false);
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 10px',
          background: 'none',
          border: 'none',
          borderRadius: '10px',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          fontSize: '0.86rem',
          fontWeight: 600,
          textAlign: 'left',
          width: '100%'
        }}
      >
        <div style={{ width: '26px', height: '26px', borderRadius: '7px', background: isLight ? '#7C3AED' : 'rgba(139, 92, 246, 0.18)', border: isLight ? 'none' : '1px solid rgba(139, 92, 246, 0.35)', color: isLight ? '#FFF' : '#C084FC', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: isLight ? '0 2px 6px rgba(124, 58, 237, 0.4)' : 'none' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
        </div>
        <span>{t('billTrackerWidget')}</span>
      </button>

      {/* 4d. Şifre Kasası */}
      <button
        onClick={() => {
          if (typeof handleInsertWidget === 'function') handleInsertWidget('password');
          setShowEditorMenu(false);
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 10px',
          background: 'none',
          border: 'none',
          borderRadius: '10px',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          fontSize: '0.86rem',
          fontWeight: 600,
          textAlign: 'left',
          width: '100%'
        }}
      >
        <div style={{ width: '26px', height: '26px', borderRadius: '7px', background: isLight ? '#D97706' : 'rgba(234, 179, 8, 0.18)', border: isLight ? 'none' : '1px solid rgba(234, 179, 8, 0.35)', color: isLight ? '#FFF' : '#FACC15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: isLight ? '0 2px 6px rgba(217, 119, 6, 0.4)' : 'none' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="7.5" cy="15.5" r="5.5"/><path d="M21 2l-9.6 9.6"/><path d="M15.5 7.5l3 3"/></svg>
        </div>
        <span>{t('passwordVaultWidget')}</span>
      </button>

      {/* 4e. Araç / Otopark Konumu */}
      <button
        onClick={() => {
          if (typeof handleInsertWidget === 'function') handleInsertWidget('parking');
          setShowEditorMenu(false);
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 10px',
          background: 'none',
          border: 'none',
          borderRadius: '10px',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          fontSize: '0.86rem',
          fontWeight: 600,
          textAlign: 'left',
          width: '100%'
        }}
      >
        <div style={{ width: '26px', height: '26px', borderRadius: '7px', background: isLight ? '#DC2626' : 'rgba(239, 68, 68, 0.18)', border: isLight ? 'none' : '1px solid rgba(239, 68, 68, 0.35)', color: isLight ? '#FFF' : '#F87171', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: isLight ? '0 2px 6px rgba(220, 38, 38, 0.4)' : 'none' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C2.0 10.9 2 11.5 2 11.5V16c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>
        </div>
        <span>{t('parkingGpsWidget')}</span>
      </button>

      {/* 4f. Sınav Sayacı */}
      <button
        onClick={() => {
          if (typeof handleInsertWidget === 'function') handleInsertWidget('exam');
          setShowEditorMenu(false);
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 10px',
          background: 'none',
          border: 'none',
          borderRadius: '10px',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          fontSize: '0.86rem',
          fontWeight: 600,
          textAlign: 'left',
          width: '100%'
        }}
      >
        <div style={{ width: '26px', height: '26px', borderRadius: '7px', background: isLight ? '#4F46E5' : 'rgba(99, 102, 241, 0.18)', border: isLight ? 'none' : '1px solid rgba(99, 102, 241, 0.35)', color: isLight ? '#FFF' : '#818CF8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: isLight ? '0 2px 6px rgba(79, 70, 229, 0.4)' : 'none' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        </div>
        <span>{t('examCountdownWidget')}</span>
      </button>

      {/* 4g. Hesap Bölüşücü */}
      <button
        onClick={() => {
          if (typeof handleInsertWidget === 'function') handleInsertWidget('split');
          setShowEditorMenu(false);
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 10px',
          background: 'none',
          border: 'none',
          borderRadius: '10px',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          fontSize: '0.86rem',
          fontWeight: 600,
          textAlign: 'left',
          width: '100%'
        }}
      >
        <div style={{ width: '26px', height: '26px', borderRadius: '7px', background: isLight ? '#EA580C' : 'rgba(249, 115, 22, 0.18)', border: isLight ? 'none' : '1px solid rgba(249, 115, 22, 0.35)', color: isLight ? '#FFF' : '#FB923C', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: isLight ? '0 2px 6px rgba(234, 88, 12, 0.4)' : 'none' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 8 20 11 23 8"/></svg>
        </div>
        <span>{t('billSplitterWidget')}</span>
      </button>

      {/* 4h. Gider Takibi */}
      <button
        onClick={() => {
          if (typeof handleInsertWidget === 'function') handleInsertWidget('expense');
          setShowEditorMenu(false);
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 10px',
          background: 'none',
          border: 'none',
          borderRadius: '10px',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          fontSize: '0.86rem',
          fontWeight: 600,
          textAlign: 'left',
          width: '100%'
        }}
      >
        <div style={{ width: '26px', height: '26px', borderRadius: '7px', background: isLight ? '#E11D48' : 'rgba(244, 63, 94, 0.18)', border: isLight ? 'none' : '1px solid rgba(244, 63, 94, 0.35)', color: isLight ? '#FFF' : '#FB7185', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: isLight ? '0 2px 6px rgba(225, 29, 72, 0.4)' : 'none' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
            <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
            <path d="M18 12a2 2 0 0 0 0 4h3v-4z" />
          </svg>
        </div>
        <span>{t('expenseTrackerWidget')}</span>
      </button>

      {/* 4h. Görsel Ekle */}
      <button
        onClick={() => {
          if (fileInputRef?.current) fileInputRef.current.click();
          setShowEditorMenu(false);
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 10px',
          background: 'none',
          border: 'none',
          borderRadius: '10px',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          fontSize: '0.86rem',
          fontWeight: 600,
          textAlign: 'left',
          width: '100%'
        }}
      >
        <div style={{ width: '26px', height: '26px', borderRadius: '7px', background: isLight ? '#0284C7' : 'rgba(14, 165, 233, 0.18)', border: isLight ? 'none' : '1px solid rgba(14, 165, 233, 0.35)', color: isLight ? '#FFF' : '#38BDF8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: isLight ? '0 2px 6px rgba(2, 132, 199, 0.4)' : 'none' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        </div>
        <span>{t('attachPhotoFile')}</span>
      </button>

      {/* 4i. Ses Kaydı */}
      <button
        onClick={() => {
          if (typeof startRecording === 'function') startRecording();
          setShowEditorMenu(false);
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 10px',
          background: 'none',
          border: 'none',
          borderRadius: '10px',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          fontSize: '0.86rem',
          fontWeight: 600,
          textAlign: 'left',
          width: '100%'
        }}
      >
        <div style={{ width: '26px', height: '26px', borderRadius: '7px', background: isLight ? '#DC2626' : 'rgba(239, 68, 68, 0.18)', border: isLight ? 'none' : '1px solid rgba(239, 68, 68, 0.35)', color: isLight ? '#FFF' : '#F87171', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: isLight ? '0 2px 6px rgba(220, 38, 38, 0.4)' : 'none' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>
        </div>
        <span>{t('startAudioRecord')}</span>
      </button>

      <div className="editor-menu-divider" style={{ margin: '4px 0', opacity: 0.15 }} />

      {/* 5. Delete / Trash Option */}
      <EditorDeleteMenuItem
        editingNote={editingNote}
        setShowEditorMenu={setShowEditorMenu}
        handleMoveToTrash={handleMoveToTrash}
        t={t}
        isLight={isLight}
      />
    </div>
  );
};

export default EditorOptionsMenuDropdown;

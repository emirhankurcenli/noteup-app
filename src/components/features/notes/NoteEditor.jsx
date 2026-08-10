import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';
import { formatTurkishMoneyInput, parseTurkishMoneyToFloat, formatTurkishMoneyDisplay } from '../../../utils/money';
import DebtWidget from '../editor/widgets/DebtWidget';
import TodoWidget from '../editor/widgets/TodoWidget';
import SplitWidget from '../editor/widgets/SplitWidget';
import BillWidget from '../editor/widgets/BillWidget';
import PasswordWidget from '../editor/widgets/PasswordWidget';
import ParkingWidget from '../editor/widgets/ParkingWidget';
import ExamWidget from '../editor/widgets/ExamWidget';
import NoteEditorHeader from '../editor/NoteEditorHeader';
import NoteFormatToolbar from '../editor/NoteFormatToolbar';
import BlockListRenderer from '../editor/BlockListRenderer';
import { mergeConsecutiveTextBlocks } from '../../../utils/editorKeyboardUtils';

// local SVGs and helpers
const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '1.25rem', height: '1.25rem' }}>
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

const getFileIconInfo = (filename = '') => {
  const ext = filename.includes('.') ? filename.split('.').pop()?.toLowerCase() || '' : '';
  if (['pdf'].includes(ext)) {
    return {
      typeLabel: 'PDF',
      bgColor: 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)',
      glowColor: 'rgba(239, 68, 68, 0.35)',
      badgeColor: '#EF4444',
      svg: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="file-card-svg">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="9" y1="13" x2="15" y2="13"></line>
          <line x1="9" y1="17" x2="13" y2="17"></line>
        </svg>
      )
    };
  }
  if (['doc', 'docx', 'rtf'].includes(ext)) {
    return {
      typeLabel: 'DOC',
      bgColor: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
      glowColor: 'rgba(59, 130, 246, 0.35)',
      badgeColor: '#3B82F6',
      svg: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="file-card-svg">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <line x1="10" y1="9" x2="8" y2="9"></line>
        </svg>
      )
    };
  }
  if (['xls', 'xlsx', 'csv'].includes(ext)) {
    return {
      typeLabel: 'EXCEL',
      bgColor: 'linear-gradient(135deg, #10B981 0%, #047857 100%)',
      glowColor: 'rgba(16, 185, 129, 0.35)',
      badgeColor: '#10B981',
      svg: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="file-card-svg">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <rect x="8" y="12" width="8" height="6" rx="1"></rect>
          <line x1="12" y1="12" x2="12" y2="18"></line>
        </svg>
      )
    };
  }
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
    return {
      typeLabel: 'ZIP',
      bgColor: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
      glowColor: 'rgba(245, 158, 11, 0.35)',
      badgeColor: '#F59E0B',
      svg: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="file-card-svg">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
          <line x1="12" y1="22.08" x2="12" y2="12"></line>
        </svg>
      )
    };
  }
  if (['txt'].includes(ext)) {
    return {
      typeLabel: 'TXT',
      bgColor: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)',
      glowColor: 'rgba(6, 182, 212, 0.35)',
      badgeColor: '#06B6D4',
      svg: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="file-card-svg">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
        </svg>
      )
    };
  }
  return {
    typeLabel: ext.toUpperCase() || 'FILE',
    bgColor: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
    glowColor: 'rgba(139, 92, 246, 0.35)',
    badgeColor: '#8B5CF6',
    svg: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="file-card-svg">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
      </svg>
    )
  };
};

// Money helper functions imported from utils/money.js

const getNowLocalDateTimeString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// calculateSettlements function migrated to SplitWidget.jsx

const NoteEditor = ({
  editingNote,
  setEditingNote,
  friends = [],
  reminders = [],
  handleCancelReminder,
  theme,
  lang,
  t,
  showEditorMenu,
  setShowEditorMenu,
  activeFormatBlockId,
  setActiveFormatBlockId,
  showFormatToolbar,
  setShowFormatToolbar,
  blockFormStates,
  setBlockFormStates,
  activeTodoItemId,
  setActiveTodoItemId,
  activeAudioPlayingId,
  setActiveAudioPlayingId,
  activeAudioProgress,
  setLightboxUrl,
  fileInputRef,
  focusedBlockRef,
  currentAudioRef,
  permissionStates,
  editorUndoStack = [],
  editorRedoStack = [],
  isRecording,
  recordingSeconds,
  setToast,
  setReminderTime,
  setReminderNoteId,
  setShowReminderModal,
  setQuickReminderTitle,
  setQuickReminderTime,
  setPendingWidgetAlarmCtx,
  setShowShareModal,
  userPlan,
  notes = [],
  setShowPaywall,
  triggerHaptic,
  checkAndRequestNotificationPermission,
  checkAndRequestPermission,
  requestBiometricAuth,
  persistNotes,
  setNotes,
  handleCloseEditor,
  handleFileChange,
  handleUndo,
  handleRedo,
  handleRestoreNote,
  handlePermanentDelete,
  handleMoveToTrash,
  handleUpdateNote,
  handleUpdateBlock,
  handleDeleteBlock,
  handleTextareaKeyDown,
  handleOpenFile,
  handlePlayPauseAudio,
  handleAddDebtItem,
  handleDeleteDebtItem,
  handleAddExpenseItem,
  handleDeleteExpenseItem,
  handleExpenseTitleChange,
  handleTodoTitleChange,
  handleToggleTodoItem,
  handleDeleteTodoItem,
  handleAddTodoItem,
  handleSetupSplit,
  handleAddSplitExpense,
  handleDeleteSplitExpense,
  handleDeleteExamBlock,
  handleDeleteBillBlock,
  handlePayBill,
  handleInsertWidget,
  handleSendNudge,
  startRecording,
  cancelRecording,
  stopRecording,
  ensureElementVisible,
  setConfirmDialog,
  showPermissionDialog
}) => {
  const now = new Date().getTime();
  const editorBodyRef = useRef(null);
  // pendingFormatRef: seçim yokken toolbar'dan format seçildiğinde buraya yazılır.
  // Bir sonraki klavye tuşuna basıldığında uygulanır ve temizlenir.
  const pendingFormatRef = useRef(null);

  // Şifre Kasası: not oturumu boyunca tek seferlik biyometrik doğrulama (Google Şifre Yöneticisi mantığı)
  const [vaultUnlocked, setVaultUnlocked] = useState(false);

  // Not değiştiğinde (farklı nota geçilirse) kilidi sıfırla + görünür şifreleri gizle
  useEffect(() => {
    setVaultUnlocked(false);
    // Tüm şifre kasası bloklarının görünürlüğünü sıfırla
    if (editingNote?.blocks) {
      const passwordBlockIds = editingNote.blocks
        .filter(b => b.type === 'password')
        .map(b => b.id);
      if (passwordBlockIds.length > 0) {
        setBlockFormStates(prev => {
          const next = { ...prev };
          passwordBlockIds.forEach(id => {
            next[id] = { ...(next[id] || {}), passwordVisible: false };
          });
          return next;
        });
      }
    }
  }, [editingNote?.id]);

  useEffect(() => {
    if (editingNote && Array.isArray(editingNote.blocks) && editingNote.blocks.length > 1) {
      const merged = mergeConsecutiveTextBlocks(editingNote.blocks);
      if (merged.length !== editingNote.blocks.length) {
        handleUpdateNote('blocks', merged, false);
      }
    }
  }, [editingNote?.id]);

  const totalChars = (editingNote.blocks || [])
    .filter(b => b && b.type === 'text')
    .reduce((acc, b) => {
      const rawHtml = b.content || '';
      const cleanText = rawHtml
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/gi, ' ')
        .replace(/[\u200B\u8203\r\n]/g, '');
      return acc + cleanText.length;
    }, 0);

  const updateBlockForm = (blockId, fields) => {
    setBlockFormStates(prev => ({
      ...prev,
      [blockId]: { ...(prev[blockId] || {}), ...fields }
    }));
  };

  return (
    <div className="editor-container" onClick={() => { setShowEditorMenu(false); }}>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept="image/*,application/pdf,audio/*"
        multiple
        onChange={handleFileChange}
      />
      <NoteEditorHeader
        editingNote={editingNote}
        setEditingNote={setEditingNote}
        handleCloseEditor={handleCloseEditor}
        editorUndoStack={editorUndoStack}
        editorRedoStack={editorRedoStack}
        handleUndo={handleUndo}
        handleRedo={handleRedo}
        showFormatToolbar={showFormatToolbar}
        setShowFormatToolbar={setShowFormatToolbar}
        activeFormatBlockId={activeFormatBlockId}
        setActiveFormatBlockId={setActiveFormatBlockId}
        showEditorMenu={showEditorMenu}
        setShowEditorMenu={setShowEditorMenu}
        lang={lang}
        t={t}
        requestBiometricAuth={requestBiometricAuth}
        setNotes={setNotes}
        persistNotes={persistNotes}
        setToast={setToast}
        friends={friends}
        handleSendNudge={handleSendNudge}
        checkAndRequestNotificationPermission={checkAndRequestNotificationPermission}
        setReminderNoteId={setReminderNoteId}
        setReminderTime={setReminderTime}
        setShowReminderModal={setShowReminderModal}
        handleInsertWidget={handleInsertWidget}
        permissionStates={permissionStates}
        checkAndRequestPermission={checkAndRequestPermission}
        fileInputRef={fileInputRef}
        startRecording={startRecording}
        setShowShareModal={setShowShareModal}
        handleMoveToTrash={handleMoveToTrash}
        userPlan={userPlan}
        notes={notes}
        setShowPaywall={setShowPaywall}
        theme={theme}
        reminders={reminders}
        handleCancelReminder={handleCancelReminder}
        setConfirmDialog={setConfirmDialog}
      />

      {editingNote.deletedAt && (
        <div className="trash-banner animate-fade-in">
          <span className="trash-banner-text">{t('trashBannerText')}</span>
          <div className="trash-banner-actions">
            <button className="trash-banner-btn restore-btn" onClick={() => handleRestoreNote(editingNote.id)}>{t('restoreBtn')}</button>
            <button className="trash-banner-btn delete-btn" onClick={() => {
              handlePermanentDelete(editingNote.id);
            }}>{t('deletePermanentlyBtn')}</button>
          </div>
        </div>
      )}

      <div 
        ref={editorBodyRef}
        className="editor-body" 
        style={{ position: 'relative', cursor: 'text' }}
        onClick={(e) => {
          if (e.target.classList.contains('editor-body') || e.target.classList.contains('blocks-container')) {
            const textareas = document.querySelectorAll('.blocks-container .block-textarea');
            if (textareas.length > 0) {
              const lastTextarea = textareas[textareas.length - 1];
              try { lastTextarea.focus({ preventScroll: true }); } catch (err) { lastTextarea.focus(); }
              const len = lastTextarea.value.length;
              lastTextarea.setSelectionRange(len, len);
            }
          }
        }}
      >
        {editingNote.deletedAt && (
          <div 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999,
              background: 'rgba(255, 255, 255, 0.01)',
              cursor: 'not-allowed'
            }} 
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setToast({ title: t('readOnlyNote'), msg: t('readOnlyNoteMsg') });
            }} 
          />
        )}
        {/* Note Title */}
        <input 
          type="text" 
          className="editor-title-input" 
          placeholder={t('noteTitlePlaceholder')}
          value={editingNote.title}
          maxLength={100}
          onChange={(e) => handleUpdateNote('title', e.target.value.slice(0, 100))}
          onFocus={(e) => {
            const currentVal = e.target.value;
            if (currentVal === 'Yeni Not' || currentVal === 'New Note' || currentVal === t('noteTitlePlaceholder')) {
              handleUpdateNote('title', '');
            }
          }}
        />

        {/* Metin Biçimlendirme Araç Çubuğu */}
        <NoteFormatToolbar
          showFormatToolbar={showFormatToolbar}
          setShowFormatToolbar={setShowFormatToolbar}
          activeFormatBlockId={activeFormatBlockId}
          setActiveFormatBlockId={setActiveFormatBlockId}
          editingNote={editingNote}
          handleUpdateBlock={handleUpdateBlock}
          handleUpdateNote={handleUpdateNote}
          focusedBlockRef={focusedBlockRef}
          pendingFormatRef={pendingFormatRef}
          theme={theme}
        />



        {/* Block List */}
        <BlockListRenderer
          editingNote={editingNote}
          t={t}
          lang={lang}
          focusedBlockRef={focusedBlockRef}
          setActiveFormatBlockId={setActiveFormatBlockId}
          ensureElementVisible={ensureElementVisible}
          handleTextareaKeyDown={handleTextareaKeyDown}
          handleUpdateBlock={handleUpdateBlock}
          handleUpdateNote={handleUpdateNote}
          pendingFormatRef={pendingFormatRef}
          setLightboxUrl={setLightboxUrl}
          handleDeleteBlock={handleDeleteBlock}
          handleOpenFile={handleOpenFile}
          handlePlayPauseAudio={handlePlayPauseAudio}
          activeAudioPlayingId={activeAudioPlayingId}
          setActiveAudioPlayingId={setActiveAudioPlayingId}
          activeAudioProgress={activeAudioProgress}
          currentAudioRef={currentAudioRef}
          blockFormStates={blockFormStates}
          setBlockFormStates={setBlockFormStates}
          updateBlockForm={updateBlockForm}
          handleAddDebtItem={handleAddDebtItem}
          handleDeleteDebtItem={handleDeleteDebtItem}
          handleAddExpenseItem={handleAddExpenseItem}
          handleDeleteExpenseItem={handleDeleteExpenseItem}
          handleExpenseTitleChange={handleExpenseTitleChange}
          handleTodoTitleChange={handleTodoTitleChange}
          activeTodoItemId={activeTodoItemId}
          setActiveTodoItemId={setActiveTodoItemId}
          handleToggleTodoItem={handleToggleTodoItem}
          handleDeleteTodoItem={handleDeleteTodoItem}
          handleAddTodoItem={handleAddTodoItem}
          handleSetupSplit={handleSetupSplit}
          handleAddSplitExpense={handleAddSplitExpense}
          handleDeleteSplitExpense={handleDeleteSplitExpense}
          triggerHaptic={triggerHaptic}
          setToast={setToast}
          handleDeleteExamBlock={handleDeleteExamBlock}
          checkAndRequestNotificationPermission={checkAndRequestNotificationPermission}
          setQuickReminderTitle={setQuickReminderTitle}
          setQuickReminderTime={setQuickReminderTime}
          setPendingWidgetAlarmCtx={setPendingWidgetAlarmCtx}
          reminders={reminders}
          now={now}
          handleDeleteBillBlock={handleDeleteBillBlock}
          handlePayBill={handlePayBill}
          isRecording={isRecording}
          recordingSeconds={recordingSeconds}
          cancelRecording={cancelRecording}
          stopRecording={stopRecording}
          theme={theme}
          vaultUnlocked={vaultUnlocked}
          setVaultUnlocked={setVaultUnlocked}
          requestBiometricAuth={requestBiometricAuth}
          checkAndRequestPermission={checkAndRequestPermission}
          showPermissionDialog={showPermissionDialog}
        />
      </div>

      {/* Note Footer */}
      <div className="editor-meta-bar">
        <span style={{ fontSize: '0.75rem' }}>{t('lastUpdated')}: {editingNote?.updatedAt ? new Date(editingNote.updatedAt).toLocaleTimeString() : ''}</span>
        <div className="editor-word-count">
          <span>{totalChars} {t('characters')}</span>
        </div>
      </div>
    </div>
  );
};

export default NoteEditor;

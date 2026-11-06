import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';
import { formatTurkishMoneyInput, parseTurkishMoneyToFloat, formatTurkishMoneyDisplay } from '@shared/utils/money';
import DebtWidget from '@features/widgets/components/DebtWidget';
import TodoWidget from '@features/widgets/components/TodoWidget';
import SplitWidget from '@features/widgets/components/SplitWidget';
import BillWidget from '@features/widgets/components/BillWidget';
import PasswordWidget from '@features/widgets/components/PasswordWidget';
import ParkingWidget from '@features/widgets/components/ParkingWidget';
import ExamWidget from '@features/widgets/components/ExamWidget';
import NoteEditorHeader from '@features/editor/components/NoteEditorHeader';
import NoteFormatToolbar from '@features/editor/components/NoteFormatToolbar';
import BlockListRenderer from '@features/editor/components/BlockListRenderer';
import { mergeConsecutiveTextBlocks, ensureElementVisible as ensureElementVisibleUtil } from '@shared/utils/editorKeyboardUtils';

import { EditorProvider } from '@features/editor/context/EditorContext';

// local SVGs and helpers
const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '1.25rem', height: '1.25rem' }}>
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

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
  handleDeleteBillPaymentItem,
  handleInsertWidget,
  handleSendNudge,
  startRecording,
  cancelRecording,
  stopRecording,
  ensureElementVisible = ensureElementVisibleUtil,
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

  const totalChars = useMemo(() => {
    const blocks = editingNote?.blocks || [];
    let count = 0;
    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];
      if (b && b.type === 'text') {
        const raw = b.content || '';
        if (!raw.includes('<') && !raw.includes('&')) {
          count += raw.length;
        } else {
          count += raw
            .replace(/<[^>]*>/g, '')
            .replace(/&nbsp;/gi, ' ')
            .replace(/[\u200B\u8203\r\n]/g, '').length;
        }
      }
    }
    return count;
  }, [editingNote?.blocks]);

  const updateBlockForm = (blockId, fields) => {
    setBlockFormStates(prev => ({
      ...prev,
      [blockId]: { ...(prev[blockId] || {}), ...fields }
    }));
  };

  const editorContextValue = useMemo(() => ({
    editingNote,
    setEditingNote,
    handleCloseEditor,
    editorUndoStack,
    editorRedoStack,
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
    friends,
    handleSendNudge,
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
    userPlan,
    notes,
    theme,
    isLight: theme === 'light',
    reminders,
    handleCancelReminder,
    setConfirmDialog,
  }), [
    editingNote,
    setEditingNote,
    handleCloseEditor,
    editorUndoStack,
    editorRedoStack,
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
    friends,
    handleSendNudge,
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
    userPlan,
    notes,
    theme,
    reminders,
    handleCancelReminder,
    setConfirmDialog,
  ]);

  return (
    <EditorProvider value={editorContextValue}>
      <div className="editor-container" onClick={() => { setShowEditorMenu(false); }}>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept="image/*,application/pdf,audio/*"
        multiple
        onChange={handleFileChange}
      />
      <NoteEditorHeader />

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
          value={editingNote.title || ''}
          maxLength={100}
          onChange={(e) => handleUpdateNote('title', e.target.value.slice(0, 100))}
          onBlur={(e) => {
            const trimmed = (e.target.value || '').trim();
            if (trimmed !== e.target.value) {
              handleUpdateNote('title', trimmed);
            }
          }}
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
          handleDeleteBillPaymentItem={handleDeleteBillPaymentItem}
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
    </EditorProvider>
  );
};

export default NoteEditor;

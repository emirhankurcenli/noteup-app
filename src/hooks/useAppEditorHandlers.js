import { useEffect } from 'react';
import useMediaStorageHandlers from './useMediaStorageHandlers';
import useDataRetentionWatcher from './useDataRetentionWatcher';
import useWidgetHandlers from './useWidgetHandlers';
import useBlockHandlers from './useBlockHandlers';
import { handleTextareaKeyDown as handleTextareaKeyDownUtil } from '../utils/editorKeyboardUtils';

export default function useAppEditorHandlers({
  editingNote,
  setEditingNote,
  focusedBlockRef,
  user,
  userPlan,
  lang,
  getStorageUsageBytes,
  PLAN_STORAGE_LIMITS,
  handleUpdateNote,
  trackAttachmentAdded,
  checkAndRequestPermission,
  setToast,
  setShowPaywall,
  setConfirmDialog,
  setLightboxUrl,
  setPreviewFileModal,
  notes,
  setNotes,
  persistNotes,
  deleteFromR2Ref,
  blockFormStates,
  setBlockFormStates,
  reminders,
  setShowEditorMenu,
  checkAndRequestNotificationPermission,
  handleCancelReminder,
  saveReminders,
  scheduleNotification,
  handleSetReminderRaw,
  handleCreateQuickReminderRaw,
  setShowQuickReminderForm,
  setActiveTab,
  t
}) {
  const handleUpdateBlock = (blockId, newData, instantHistory = false) => {
    if (!editingNote) return;
    const updatedBlocks = (editingNote.blocks || []).map(b =>
      b.id === blockId ? { ...b, ...newData } : b
    );
    handleUpdateNote('blocks', updatedBlocks, instantHistory);
  };

  const handleAddBlock = (afterBlockId, type) => {
    if (!editingNote) return;
    const newBlock = type === 'debt'
      ? { id: 'b-' + Date.now(), type: 'debt', items: [] }
      : { id: 'b-' + Date.now(), type: 'text', content: '' };
    const idx = (editingNote.blocks || []).findIndex(b => b.id === afterBlockId);
    const updatedBlocks = [...(editingNote.blocks || [])];
    updatedBlocks.splice(idx + 1, 0, newBlock);
    handleUpdateNote('blocks', updatedBlocks, true);
  };

  const {
    currentAudioRef,
    isRecording,
    recordingSeconds,
    activeAudioPlayingId,
    setActiveAudioPlayingId,
    activeAudioProgress,
    setActiveAudioProgress,
    uploadToR2,
    deleteFromR2,
    handleFileChange,
    startRecording,
    stopRecording,
    cancelRecording,
    handlePlayPauseAudio,
    handleOpenFile,
    handleDownloadFile,
    showCustomConfirm,
    handleDeleteBlock,
    performDeleteBlock,
    gc,
  } = useMediaStorageHandlers({
    editingNote,
    setEditingNote,
    focusedBlockRef,
    user,
    userPlan,
    lang,
    getStorageUsageBytes,
    PLAN_STORAGE_LIMITS,
    handleInsertWidget: (...args) => handleInsertWidget(...args),
    handleUpdateNote,
    trackAttachmentAdded,
    checkAndRequestPermission,
    setToast,
    setShowPaywall,
    setConfirmDialog,
    setLightboxUrl,
    setPreviewFileModal,
  });

  useEffect(() => {
    if (deleteFromR2Ref) {
      deleteFromR2Ref.current = deleteFromR2;
    }
  }, [deleteFromR2]);

  useDataRetentionWatcher({
    notes,
    setNotes,
    userPlan,
    getStorageUsageBytes,
    PLAN_STORAGE_LIMITS,
    persistNotes,
    deleteFromR2,
    setToast
  });

  const {
    handleInsertWidget,
    handleAddDebtItem,
    handleDeleteDebtItem,
    handleAddExpenseItem,
    handleDeleteExpenseItem,
    handleExpenseTitleChange,
    handleSaveBillWidget,
    handleDeleteBillBlock,
    handlePayBill,
    handleSaveExamWidget,
    handleDeleteExamBlock,
  } = useWidgetHandlers({
    editingNote,
    notes,
    userPlan,
    focusedBlockRef,
    blockFormStates,
    setBlockFormStates,
    reminders,
    handleUpdateNote,
    handleUpdateBlock,
    handleDeleteBlock,
    showCustomConfirm,
    setToast,
    setShowPaywall,
    setShowEditorMenu,
    trackAttachmentAdded,
    checkAndRequestNotificationPermission,
    handleCancelReminder,
    saveReminders,
    scheduleNotification,
    t,
  });

  const handleTextareaKeyDown = (e, block, idx) => {
    handleTextareaKeyDownUtil(e, block, idx, editingNote, handleUpdateNote);
  };

  const {
    updateBlockForm,
    handleTodoTitleChange,
    handleAddTodoItem,
    handleToggleTodoItem,
    handleDeleteTodoItem,
    handleSetupSplit,
    handleAddSplitExpense,
    handleDeleteSplitExpense,
  } = useBlockHandlers({
    editingNote,
    handleUpdateNote,
    handleUpdateBlock,
    blockFormStates,
    setBlockFormStates,
  });

  const handleSetReminder = () => {
    if (handleSetReminderRaw) handleSetReminderRaw();
  };

  const handleCreateQuickReminder = () => {
    if (handleCreateQuickReminderRaw) {
      handleCreateQuickReminderRaw(setShowQuickReminderForm, setActiveTab);
    }
  };

  return {
    handleUpdateBlock,
    handleAddBlock,
    currentAudioRef,
    isRecording,
    recordingSeconds,
    activeAudioPlayingId,
    setActiveAudioPlayingId,
    activeAudioProgress,
    setActiveAudioProgress,
    uploadToR2,
    deleteFromR2,
    handleFileChange,
    startRecording,
    stopRecording,
    cancelRecording,
    handlePlayPauseAudio,
    handleOpenFile,
    handleDownloadFile,
    showCustomConfirm,
    handleDeleteBlock,
    performDeleteBlock,
    gc,
    handleInsertWidget,
    handleAddDebtItem,
    handleDeleteDebtItem,
    handleAddExpenseItem,
    handleDeleteExpenseItem,
    handleExpenseTitleChange,
    handleSaveBillWidget,
    handleDeleteBillBlock,
    handlePayBill,
    handleSaveExamWidget,
    handleDeleteExamBlock,
    handleTextareaKeyDown,
    updateBlockForm,
    handleTodoTitleChange,
    handleAddTodoItem,
    handleToggleTodoItem,
    handleDeleteTodoItem,
    handleSetupSplit,
    handleAddSplitExpense,
    handleDeleteSplitExpense,
    handleSetReminder,
    handleCreateQuickReminder
  };
}

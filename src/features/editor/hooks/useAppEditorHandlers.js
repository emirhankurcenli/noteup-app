import { useEffect } from 'react';
import useMediaStorageHandlers from '@features/editor/hooks/useMediaStorageHandlers';
import useWidgetHandlers from '@features/editor/hooks/useWidgetHandlers';
import useBlockHandlers from '@features/editor/hooks/useBlockHandlers';
import { handleTextareaKeyDown as handleTextareaKeyDownUtil } from '@shared/utils/editorKeyboardUtils';

export default function useAppEditorHandlers({
  editingNote,
  setEditingNote,
  focusedBlockRef,
  user,
  userPlan,
  lang,
  getStorageUsageBytes,
  handleUpdateNote,
  checkAndRequestPermission,
  setToast,
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
    handleInsertWidget: (...args) => handleInsertWidget(...args),
    handleUpdateNote,
    checkAndRequestPermission,
    setToast,
    setConfirmDialog,
    setLightboxUrl,
    setPreviewFileModal,
  });

  useEffect(() => {
    if (deleteFromR2Ref) {
      deleteFromR2Ref.current = deleteFromR2;
    }
  }, [deleteFromR2]);

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
    handleDeleteBillPaymentItem,
    handleSaveExamWidget,
    handleDeleteExamBlock,
  } = useWidgetHandlers({
    editingNote,
    notes,
    focusedBlockRef,
    blockFormStates,
    setBlockFormStates,
    reminders,
    handleUpdateNote,
    handleUpdateBlock,
    handleDeleteBlock,
    showCustomConfirm,
    setToast,
    setShowEditorMenu,
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
    handleDeleteBillPaymentItem,
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

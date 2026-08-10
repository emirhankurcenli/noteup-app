import useR2Storage from './useR2Storage';
import useAudioRecorderHandler from './useAudioRecorderHandler';

// ─── useMediaStorageHandlers ────────────────────────────────────────────────
// Koordinatör hook: R2 depolama ve ses kaydı alt hook'larını birleştirir.
// ─────────────────────────────────────────────────────────────────────────────
const useMediaStorageHandlers = ({
  editingNote,
  setEditingNote,
  focusedBlockRef,
  user,
  userPlan,
  lang,
  getStorageUsageBytes,
  PLAN_STORAGE_LIMITS,
  handleInsertWidget,
  handleUpdateNote,
  trackAttachmentAdded,
  checkAndRequestPermission,
  setToast,
  setShowPaywall,
  setConfirmDialog,
  setLightboxUrl,
  setPreviewFileModal,
}) => {
  // ── R2 Depolama: yükleme, silme, dosya açma/indirme, blok silme ──
  const r2Storage = useR2Storage({
    editingNote,
    user,
    userPlan,
    getStorageUsageBytes,
    PLAN_STORAGE_LIMITS,
    handleInsertWidget,
    handleUpdateNote,
    trackAttachmentAdded,
    checkAndRequestPermission,
    setToast,
    setShowPaywall,
    setConfirmDialog,
    setLightboxUrl,
    setPreviewFileModal,
  });

  // ── Ses Kaydı & Oynatma ──
  const audioRecorder = useAudioRecorderHandler({
    editingNote,
    focusedBlockRef,
    userPlan,
    handleInsertWidget,
    handleUpdateNote,
    checkAndRequestPermission,
    setToast,
    setConfirmDialog,
    uploadToR2: r2Storage.uploadToR2,
    getStorageUsageBytes,
    PLAN_STORAGE_LIMITS,
    setShowPaywall,
  });

  return {
    // R2 Storage
    uploadToR2: r2Storage.uploadToR2,
    deleteFromR2: r2Storage.deleteFromR2,
    handleFileChange: r2Storage.handleFileChange,
    handleOpenFile: r2Storage.handleOpenFile,
    handleDownloadFile: r2Storage.handleDownloadFile,
    showCustomConfirm: r2Storage.showCustomConfirm,
    handleDeleteBlock: r2Storage.handleDeleteBlock,
    performDeleteBlock: r2Storage.performDeleteBlock,
    gc: r2Storage.gc, // Expose media garbage collector for deferred deletions

    // Audio Recorder
    currentAudioRef: audioRecorder.currentAudioRef,
    isRecording: audioRecorder.isRecording,
    recordingSeconds: audioRecorder.recordingSeconds,
    activeAudioPlayingId: audioRecorder.activeAudioPlayingId,
    setActiveAudioPlayingId: audioRecorder.setActiveAudioPlayingId,
    activeAudioProgress: audioRecorder.activeAudioProgress,
    setActiveAudioProgress: audioRecorder.setActiveAudioProgress,
    startRecording: audioRecorder.startRecording,
    stopRecording: audioRecorder.stopRecording,
    cancelRecording: audioRecorder.cancelRecording,
    handlePlayPauseAudio: audioRecorder.handlePlayPauseAudio,
  };
};

export default useMediaStorageHandlers;

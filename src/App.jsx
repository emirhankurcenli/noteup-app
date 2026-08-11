import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import LoginScreen from './components/auth/LoginScreen';
import ToastNotification from './components/common/ToastNotification';
import { triggerHaptic } from './services/haptics';
import { initRevenueCat } from './services/billing';
import useAppLogic from './hooks/useAppLogic';
import useAppPermissions from './hooks/useAppPermissions';
import useEditorLifecycle from './hooks/useEditorLifecycle';
import useAppLifecycleEvents from './hooks/useAppLifecycleEvents';
import useInitialDataLoad from './hooks/useInitialDataLoad';
import useAppEditorHandlers from './hooks/useAppEditorHandlers';
import useAppLocalState from './hooks/useAppLocalState';
import useGlobalEventListeners from './hooks/useGlobalEventListeners';
import AppWorkspaceContainer from './components/layout/AppWorkspaceContainer';
import AppModalsContainer from './components/common/AppModalsContainer';
import { DEFAULT_AVATARS } from './constants/avatars';
import { requestBiometricAuth } from './services/biometricService';
import { shareNoteImage } from './utils/shareUtils';
import { formatBytes } from './utils/mediaUtils';
import { PLAN_LEVELS, getChangedFeatures, getLostFeatures } from './utils/planUtils';
import { ensureElementVisible } from './utils/editorKeyboardUtils';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';

// Ensure Status Bar is never transparent overlaying webview, but sits in its own dark top strip
if (Capacitor.isNativePlatform()) {
  StatusBar.setOverlaysWebView({ overlay: false }).catch(() => {});
  StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
  StatusBar.setBackgroundColor({ color: '#0F1117' }).catch(() => {});
}



function App() {
  const setShowPaywallRef = useRef(null);
  const setConfirmDialogRef = useRef(null);
  const setShowReminderModalRef = useRef(null);
  const checkAndRequestNotificationPermissionRef = useRef(null);
  const deleteFromR2Ref = useRef(null);
  const setShowRewardedAdModalRef = useRef(null);
  const setPendingShareRewardRef = useRef(null);

  const {
    lang,
    setLang,
    t,
    formatReminderDate,
    getRemainingTimeText,
    notes,
    setNotes,
    reminders,
    setReminders,
    user,
    setUser,
    isLoggingIn,
    setIsLoggingIn,
    myCode,
    setMyCode,
    profileName,
    setProfileName,
    showAvatarPicker,
    setShowAvatarPicker,
    userPlan,
    setUserPlan,
    planNotification,
    setPlanNotification,
    toast,
    setToast,
    getUserScopedKey,
    getScopedStorageItem,
    handleLogin,
    handleLogout,
    handleSelectAvatar,
    handleUpdateProfileName,
    syncDataFromSupabase,
    // Sharing
    partnerCodeInput,
    setPartnerCodeInput,
    friends,
    setFriends,
    friendRequests,
    setFriendRequests,
    selectedFriendCodes,
    setSelectedFriendCodes,
    incomingRequest,
    setIncomingRequest,
    handleSendFriendRequest,
    handleAcceptFriendRequest,
    handleRejectFriendRequest,
    handleDisconnect,
    handleSendNudge,
    handleSendShareInvitation,
    handleAcceptShare,
    handleRejectShare,
    handleRewardedShareCallback,
    pendingShareReward,
    setPendingShareReward,
    grantedUltraFriendCode,
    ultraGiftFrom,
    isPrimaryUltra,
    isGiftedUltra,
    handleGrantUltraGift,
    // Notes CRUD & Editor Undo/Redo
    editingNote,
    setEditingNote,
    lastEditingNoteId,
    setLastEditingNoteId,
    activeFormatBlockId,
    setActiveFormatBlockId,
    showFormatToolbar,
    setShowFormatToolbar,
    editorUndoStack,
    editorRedoStack,
    persistNotes,
    saveNotes,
    handleUndo,
    handleRedo,
    handleCreateNote,
    handleUpdateNote,
    handleMoveToTrash,
    handleRestoreNote,
    handlePermanentDelete,
    handleBulkRestoreNotes,
    handleBulkPermanentDelete,
    enforceTrailingTextBlock,
    // Reminders
    reminderNoteId,
    setReminderNoteId,
    reminderTime,
    setReminderTime,
    reminderModes,
    setReminderModes,
    quickReminderTitle,
    setQuickReminderTitle,
    quickReminderTime,
    setQuickReminderTime,
    quickReminderModes,
    setQuickReminderModes,
    pendingWidgetAlarmCtx,
    setPendingWidgetAlarmCtx,
    saveReminders,
    scheduleNotification,
    syncDismissedAlarms,
    handleCancelReminder,
    handleSetReminder: handleSetReminderRaw,
    handleCancelWidgetAlarm,
    handleCreateWidgetAlarm,
    handleCreateQuickReminder: handleCreateQuickReminderRaw
  } = useAppLogic({
    setShowPaywall: (show) => setShowPaywallRef.current?.(show),
    setConfirmDialog: (dialog) => setConfirmDialogRef.current?.(dialog),
    setShowReminderModal: (show) => setShowReminderModalRef.current?.(show),
    checkAndRequestNotificationPermission: async () => await checkAndRequestNotificationPermissionRef.current?.(),
    deleteFromR2: (url) => deleteFromR2Ref.current?.(url),
    requestBiometricAuth: requestBiometricAuth,
    setShowRewardedAdModal: (show) => setShowRewardedAdModalRef.current?.(show),
    setPendingShareReward: (data) => setPendingShareRewardRef.current?.(data),
  });

  // Encryption removed — Supabase RLS handles data isolation.
  // Data is stored as plain JSON in localStorage and Supabase.





  const {
    permissionStates,
    updatePermissionStates,
    requestAllPermissionsAtStartup,
    checkAndRequestNotificationPermission,
    handleRequestMicPermission,
    handleRequestStoragePermission,
    checkAndRequestPermission,
    showPermissionDialog
  } = useAppPermissions({ setToast, lang, setConfirmDialog: (dialog) => setConfirmDialogRef.current?.(dialog) });

  checkAndRequestNotificationPermissionRef.current = checkAndRequestNotificationPermission;



  const handleTabClick = async (tabName) => {
    if (tabName === 'reminders') {
      const granted = await checkAndRequestNotificationPermission();
      if (!granted) return;
    }
    if (tabName === 'profile') {
      updatePermissionStates();
    }
    setActiveTab(tabName);
  };

  // --- STATE ───
  const {
    activeTodoItemId,
    setActiveTodoItemId,
    activeTab,
    setActiveTab,
    tabHistoryRef,
    profileSubTab,
    setProfileSubTab,
    showPaywall,
    setShowPaywall,
    cropperImage,
    setCropperImage,
    showAdModal,
    setShowAdModal,
    PLAN_STORAGE_LIMITS,
    getStorageUsageBytes,
    trackAttachmentAdded,
    showReminderModal,
    setShowReminderModal,
    showShareModal,
    setShowShareModal,
    confirmDialog,
    setConfirmDialog,
    activeMenuNoteId,
    setActiveMenuNoteId,
    activeShareNoteId,
    setActiveShareNoteId,
    blockFormStates,
    setBlockFormStates,
    showEditorMenu,
    setShowEditorMenu,
    focusedBlockRef,
    fileInputRef,
    lightboxUrl,
    setLightboxUrl,
    previewFileModal,
    setPreviewFileModal,
    showQuickReminderForm,
    setShowQuickReminderForm,
    pendingOpenNoteId,
    setPendingOpenNoteId,
    showRewardedAdModal,
    setShowRewardedAdModal,
    showFeedbackModal,
    setShowFeedbackModal,
    nudgeTargetNote,
    setNudgeTargetNote,
    theme,
    setTheme,
    now
  } = useAppLocalState({ notes, userPlan });

  setShowPaywallRef.current = setShowPaywall;
  setShowReminderModalRef.current = setShowReminderModal;
  setConfirmDialogRef.current = setConfirmDialog;
  setShowRewardedAdModalRef.current = setShowRewardedAdModal;
  setPendingShareRewardRef.current = setPendingShareReward;

  // 💎 RevenueCat Initialization
  useEffect(() => {
    initRevenueCat(setUserPlan);
  }, []);



  // --- LOAD INITIAL STATE ---
  useInitialDataLoad({
    setMyCode,
    setProfileName,
    setFriends,
    setFriendRequests,
    setNotes,
    setReminders,
    syncDismissedAlarms,
    updatePermissionStates,
    requestAllPermissionsAtStartup,
    getScopedStorageItem
  });

  // Auto-refresh permissions when opening Profile tab
  useEffect(() => {
    if (activeTab === 'profile') {
      updatePermissionStates();
    }
  }, [activeTab]);

  const {
    openEditingNote,
    cleanupEmptyNote,
    handleCloseEditor
  } = useEditorLifecycle({
    notes,
    setNotes,
    reminders,
    user,
    editingNote,
    setEditingNote,
    lastEditingNoteId,
    setLastEditingNoteId,
    persistNotes,
    enforceTrailingTextBlock,
    deleteFromR2: (...args) => deleteFromR2Ref.current?.(...args)
  });

  // --- CROSS-TAB SYNC & NOTIFICATION LISTENER ---
  // Global event listeners hook
  useGlobalEventListeners({
    notes,
    setNotes,
    setReminders,
    myCode,
    user,
    toast,
    setToast,
    setEditingNote,
    setShowReminderModal,
    setShowEditorMenu,
    setActiveMenuNoteId,
    openEditingNote,
    persistNotes,
  });

  useAppLifecycleEvents({
    notes,
    editingNote,
    activeTab,
    setActiveTab,
    showPaywall,
    setShowPaywall,
    confirmDialog,
    setConfirmDialog,
    showEditorMenu,
    setShowEditorMenu,
    showReminderModal,
    setShowReminderModal,
    handleCloseEditor,
    tabHistoryRef,
    setPendingOpenNoteId,
    updatePermissionStates,
    syncDismissedAlarms,
    setEditingNote
  });


  // Handle Authentication Logins
  // Removed block: const handleLogin =...;

  // Removed block: const handleLogout =...;

  // Removed block: const persistNotes =...

  // Save states to localstorage and Supabase helper
  // Removed block: const saveNotes =...
 
  // Removed block: const saveFolders =...
 
  // Removed block: const saveReminders =...

  // --- ACTIONS ---

  // Folder Operations
  // Removed block: const handleCreateFolder =...

  // Removed block: const handleDeleteFolder =...

  // Note Operations
  // Removed block: const handleCreateNote =...

  // Removed block: const handleUpdateNote =...

  // Removed block: const handleMoveToTrash =...

  // Removed block: const handleRestoreNote =...

  // Removed block: const handlePermanentDelete =...


  const handleToggleShare = (noteId) => {
    setNotes(prevNotes => {
      const note = prevNotes.find(n => n.id === noteId);
      if (!note) return prevNotes;
      
      const updated = prevNotes.map(n => n.id === noteId ? { ...n, isShared: !n.isShared, updatedAt: Date.now() } : n);
      persistNotes(updated);

      setToast({
        title: !note.isShared ? "🌐 Not Paylaşıldı" : "🔒 Paylaşım Kapatıldı",
        msg: !note.isShared ? "Bu not artık ortak paylaşıma açık." : "Bu not artık sadece size özel."
      });

      return updated;
    });
  };


  const handleShareNoteImage = async (note) => {
    await shareNoteImage(note, setToast);
  };

  const {
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
  } = useAppEditorHandlers({
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
  });

  // --- RENDERS & SCREENS ---

  // Dynamic filter for active tab & selection
  const getVisibleNotes = () => {
    return notes.filter(n => !n.deletedAt); // Exclude deleted
  };

  const getDeletedNotes = () => {
    return notes.filter(n => n.deletedAt);
  };

  if (!user) {
    return <LoginScreen isLoggingIn={isLoggingIn} handleLogin={handleLogin} />;
  }

  return (
    <div className="app-container">

      {/* Toast Notification */}
      <ToastNotification toast={toast} setToast={setToast} />

      {/* App Workspace Container (Editor or Tabs) */}
      <AppWorkspaceContainer
        editingNote={editingNote}
        setEditingNote={setEditingNote}
        friends={friends}
        reminders={reminders}
        theme={theme}
        lang={lang}
        t={t}
        showEditorMenu={showEditorMenu}
        setShowEditorMenu={setShowEditorMenu}
        activeFormatBlockId={activeFormatBlockId}
        setActiveFormatBlockId={setActiveFormatBlockId}
        showFormatToolbar={showFormatToolbar}
        setShowFormatToolbar={setShowFormatToolbar}
        blockFormStates={blockFormStates}
        setBlockFormStates={setBlockFormStates}
        activeTodoItemId={activeTodoItemId}
        setActiveTodoItemId={setActiveTodoItemId}
        activeAudioPlayingId={activeAudioPlayingId}
        setActiveAudioPlayingId={setActiveAudioPlayingId}
        activeAudioProgress={activeAudioProgress}
        setLightboxUrl={setLightboxUrl}
        fileInputRef={fileInputRef}
        focusedBlockRef={focusedBlockRef}
        currentAudioRef={currentAudioRef}
        permissionStates={permissionStates}
        editorUndoStack={editorUndoStack}
        editorRedoStack={editorRedoStack}
        isRecording={isRecording}
        recordingSeconds={recordingSeconds}
        setToast={setToast}
        getRemainingTimeText={getRemainingTimeText}
        setReminderTime={setReminderTime}
        setReminderNoteId={setReminderNoteId}
        setShowReminderModal={setShowReminderModal}
        setQuickReminderTitle={setQuickReminderTitle}
        setQuickReminderTime={setQuickReminderTime}
        setPendingWidgetAlarmCtx={setPendingWidgetAlarmCtx}
        setShowShareModal={setShowShareModal}
        userPlan={userPlan}
        notes={notes}
        setShowPaywall={setShowPaywall}
        triggerHaptic={triggerHaptic}
        checkAndRequestNotificationPermission={checkAndRequestNotificationPermission}
        checkAndRequestPermission={checkAndRequestPermission}
        showPermissionDialog={showPermissionDialog}
        requestBiometricAuth={requestBiometricAuth}
        persistNotes={persistNotes}
        setNotes={setNotes}
        openEditingNote={openEditingNote}
        handleCloseEditor={handleCloseEditor}
        handleFileChange={handleFileChange}
        handleUndo={handleUndo}
        handleRedo={handleRedo}
        handleRestoreNote={handleRestoreNote}
        handlePermanentDelete={handlePermanentDelete}
        handleMoveToTrash={handleMoveToTrash}
        handleUpdateNote={handleUpdateNote}
        handleUpdateBlock={handleUpdateBlock}
        handleDeleteBlock={handleDeleteBlock}
        handleTextareaKeyDown={handleTextareaKeyDown}
        handleOpenFile={handleOpenFile}
        handlePlayPauseAudio={handlePlayPauseAudio}
        handleAddDebtItem={handleAddDebtItem}
        handleDeleteDebtItem={handleDeleteDebtItem}
        handleAddExpenseItem={handleAddExpenseItem}
        handleDeleteExpenseItem={handleDeleteExpenseItem}
        handleExpenseTitleChange={handleExpenseTitleChange}
        handleTodoTitleChange={handleTodoTitleChange}
        handleToggleTodoItem={handleToggleTodoItem}
        handleDeleteTodoItem={handleDeleteTodoItem}
        handleAddTodoItem={handleAddTodoItem}
        handleSetupSplit={handleSetupSplit}
        handleAddSplitExpense={handleAddSplitExpense}
        handleDeleteSplitExpense={handleDeleteSplitExpense}
        handleDeleteExamBlock={handleDeleteExamBlock}
        handleDeleteBillBlock={handleDeleteBillBlock}
        handlePayBill={handlePayBill}
        handleInsertWidget={handleInsertWidget}
        handleSendNudge={handleSendNudge}
        startRecording={startRecording}
        cancelRecording={cancelRecording}
        stopRecording={stopRecording}
        ensureElementVisible={ensureElementVisible}
        setConfirmDialog={setConfirmDialog}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        getVisibleNotes={getVisibleNotes}
        activeMenuNoteId={activeMenuNoteId}
        setActiveMenuNoteId={setActiveMenuNoteId}
        setActiveShareNoteId={setActiveShareNoteId}
        setNudgeTargetNote={setNudgeTargetNote}
        setSelectedFriendCodes={setSelectedFriendCodes}
        handleCancelReminder={handleCancelReminder}
        handleBulkRestoreNotes={handleBulkRestoreNotes}
        handleBulkPermanentDelete={handleBulkPermanentDelete}
        setTheme={setTheme}
        setLang={setLang}
        profileSubTab={profileSubTab}
        setProfileSubTab={setProfileSubTab}
        user={user}
        setShowAvatarPicker={setShowAvatarPicker}
        profileName={profileName}
        handleUpdateProfileName={handleUpdateProfileName}
        getStorageUsageBytes={getStorageUsageBytes}
        PLAN_STORAGE_LIMITS={PLAN_STORAGE_LIMITS}
        setShowFeedbackModal={setShowFeedbackModal}
        formatBytes={formatBytes}
        myCode={myCode}
        partnerCodeInput={partnerCodeInput}
        setPartnerCodeInput={setPartnerCodeInput}
        formatFriendCode={formatFriendCode}
        handleSendFriendRequest={handleSendFriendRequest}
        friendRequests={friendRequests}
        handleAcceptFriendRequest={handleAcceptFriendRequest}
        handleRejectFriendRequest={handleRejectFriendRequest}
        handleDisconnect={handleDisconnect}
        handleLogout={handleLogout}
        DEFAULT_AVATARS={DEFAULT_AVATARS}
        grantedUltraFriendCode={grantedUltraFriendCode}
        ultraGiftFrom={ultraGiftFrom}
        isPrimaryUltra={isPrimaryUltra}
        isGiftedUltra={isGiftedUltra}
        handleGrantUltraGift={handleGrantUltraGift}
        handleTabClick={handleTabClick}
        handleCreateNote={handleCreateNote}
      />

      {/* --- MODALS --- */}
      <AppModalsContainer
        showReminderModal={showReminderModal}
        setShowReminderModal={setShowReminderModal}
        reminderTime={reminderTime}
        setReminderTime={setReminderTime}
        reminderModes={reminderModes}
        setReminderModes={setReminderModes}
        handleSetReminder={handleSetReminder}
        setReminderNoteId={setReminderNoteId}
        activeShareNoteId={activeShareNoteId}
        setActiveShareNoteId={setActiveShareNoteId}
        friends={friends}
        selectedFriendCodes={selectedFriendCodes}
        setSelectedFriendCodes={setSelectedFriendCodes}
        handleSendShareInvitation={handleSendShareInvitation}
        incomingRequest={incomingRequest}
        handleAcceptShare={handleAcceptShare}
        handleRejectShare={handleRejectShare}
        lightboxUrl={lightboxUrl}
        setLightboxUrl={setLightboxUrl}
        previewFileModal={previewFileModal}
        setPreviewFileModal={setPreviewFileModal}
        showShareModal={showShareModal}
        setShowShareModal={setShowShareModal}
        editingNote={editingNote}
        handleShareNoteImage={handleShareNoteImage}
        showPaywall={showPaywall}
        setShowPaywall={setShowPaywall}
        userPlan={userPlan}
        setUserPlan={setUserPlan}
        planNotification={planNotification}
        setPlanNotification={setPlanNotification}
        confirmDialog={confirmDialog}
        setConfirmDialog={setConfirmDialog}
        getLostFeatures={getLostFeatures}
        getChangedFeatures={getChangedFeatures}
        PLAN_LEVELS={PLAN_LEVELS}
        showAdModal={showAdModal}
        setShowAdModal={setShowAdModal}
        showAvatarPicker={showAvatarPicker}
        setShowAvatarPicker={setShowAvatarPicker}
        user={user}
        setToast={setToast}
        cropperImage={cropperImage}
        setCropperImage={setCropperImage}
        handleSelectAvatar={handleSelectAvatar}
        DEFAULT_AVATARS={DEFAULT_AVATARS}
        checkAndRequestPermission={checkAndRequestPermission}
        checkAndRequestNotificationPermission={checkAndRequestNotificationPermission}
        pendingWidgetAlarmCtx={pendingWidgetAlarmCtx}
        handleCancelWidgetAlarm={handleCancelWidgetAlarm}
        quickReminderTitle={quickReminderTitle}
        setQuickReminderTitle={setQuickReminderTitle}
        quickReminderTime={quickReminderTime}
        setQuickReminderTime={setQuickReminderTime}
        quickReminderModes={quickReminderModes}
        setQuickReminderModes={setQuickReminderModes}
        handleCreateWidgetAlarm={handleCreateWidgetAlarm}
        notes={notes}
        showRewardedAdModal={showRewardedAdModal}
        setShowRewardedAdModal={setShowRewardedAdModal}
        pendingShareReward={pendingShareReward}
        setPendingShareReward={setPendingShareReward}
        handleRewardedShareCallback={handleRewardedShareCallback}
        showFeedbackModal={showFeedbackModal}
        setShowFeedbackModal={setShowFeedbackModal}
        nudgeTargetNote={nudgeTargetNote}
        setNudgeTargetNote={setNudgeTargetNote}
        handleSendNudge={handleSendNudge}
        myCode={myCode}
        profileName={profileName}
        theme={theme}
        lang={lang}
        t={t}
        triggerHaptic={triggerHaptic}
      />



    </div>
  );
}

export default App;

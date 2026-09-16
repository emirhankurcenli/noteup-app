import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import LoginScreen from '@features/auth/components/LoginScreen';
import ToastNotification from '@shared/components/ToastNotification';
import { triggerHaptic } from '@shared/services/haptics';
import useAppLogic from '@shared/hooks/useAppLogic';
import useAppPermissions from '@shared/hooks/useAppPermissions';
import useEditorLifecycle from '@features/editor/hooks/useEditorLifecycle';
import useAppLifecycleEvents from '@shared/hooks/useAppLifecycleEvents';
import useInitialDataLoad from '@features/notes/hooks/useInitialDataLoad';
import useAppEditorHandlers from '@features/editor/hooks/useAppEditorHandlers';
import useAppLocalState from '@features/notes/hooks/useAppLocalState';
import useGlobalEventListeners from '@shared/hooks/useGlobalEventListeners';
import AppWorkspaceContainer from '@layout/AppWorkspaceContainer';
import AppModalsContainer from '@shared/components/AppModalsContainer';
import { DEFAULT_AVATARS } from '@shared/constants/avatars';
import { requestBiometricAuth } from '@shared/services/biometricService';
import { shareNoteImage } from '@features/sharing/utils/shareUtils';
import { formatFriendCode } from '@shared/utils/codeUtils';
import { formatBytes } from '@shared/utils/mediaUtils';
import { ensureElementVisible } from '@shared/utils/editorKeyboardUtils';
import { Capacitor, registerPlugin } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';
import detectPlatform from '@platform/detect';

const AppSettings = registerPlugin('AppSettings');

function App() {
  const setConfirmDialogRef = useRef(null);
  const setShowReminderModalRef = useRef(null);
  const checkAndRequestNotificationPermissionRef = useRef(null);
  const deleteFromR2Ref = useRef(null);

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
    toast,
    setToast,
    getUserScopedKey,
    getScopedStorageItem,
    handleLogin,
    handleLogout,
    handleSelectAvatar,
    handleUpdateProfileName,
    syncDataFromSupabase,
    syncDeltaSharedNotes,
    // Sharing
    partnerCodeInput,
    setPartnerCodeInput,
    friends,
    setFriends,
    friendRequests,
    setFriendRequests,
    selectedFriendCodes,
    setSelectedFriendCodes,
    pendingShareRequests,
    setPendingShareRequests,
    isSendingRequest,
    handleSendFriendRequest,
    handleAcceptFriendRequest,
    handleRejectFriendRequest,
    handleCancelFriendRequest,
    handleDisconnect,
    handleSendNudge,
    handleSendShareInvitation,
    handleAcceptShare,
    handleRejectShare,
    handleLeaveShare,
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
    flushPersist,
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
    setConfirmDialog: (dialog) => setConfirmDialogRef.current?.(dialog),
    setShowReminderModal: (show) => setShowReminderModalRef.current?.(show),
    checkAndRequestNotificationPermission: async () => await checkAndRequestNotificationPermissionRef.current?.(),
    deleteFromR2: (url) => deleteFromR2Ref.current?.(url),
    requestBiometricAuth: requestBiometricAuth,
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
    handleRequestAudioPermission,
    handleRequestLocationPermission,
    checkAndRequestPermission,
    showPermissionDialog,
    openSystemSettings
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
    getStorageUsageBytes,
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
    showFeedbackModal,
    setShowFeedbackModal,
    nudgeTargetNote,
    setNudgeTargetNote,
    theme,
    setTheme,
    now
  } = useAppLocalState({ notes });

  setShowReminderModalRef.current = setShowReminderModal;
  setConfirmDialogRef.current = setConfirmDialog;

  // 📱 Platform Body Class & Safe Area Insets Initialization
  // Android'de AppSettings.getSafeAreaInsets() ile gerçek status bar ve navigation bar yükseklikleri CSS'e atanır.
  const measuredNavBarHeightRef = useRef('48px');

  useEffect(() => {
    const plt = detectPlatform();
    document.body.classList.remove('platform-android', 'platform-ios', 'platform-web');
    document.body.classList.add(`platform-${plt}`);

    if (plt === 'android') {
      // Android varsayılan güvenli değerler (Samsung 3-tuş çubuğu için 48px, status bar için 32px)
      document.documentElement.style.setProperty('--status-bar-height', '32px');
      document.documentElement.style.setProperty('--nav-bar-height', '48px');
      measuredNavBarHeightRef.current = '48px';

      if (Capacitor.isNativePlatform()) {
        try {
          AppSettings.getSafeAreaInsets().then((insets) => {
            if (insets) {
              const top = insets.top || 32;
              const bottom = insets.bottom || 48;
              document.documentElement.style.setProperty('--status-bar-height', `${top}px`);
              document.documentElement.style.setProperty('--nav-bar-height', `${bottom}px`);
              measuredNavBarHeightRef.current = `${bottom}px`;
            }
          }).catch(() => {});
        } catch (_) {}
      }
    } else {
      // Web ve iOS varsayılan değerleri (iOS env() kullanır)
      document.documentElement.style.setProperty('--status-bar-height', '0px');
      document.documentElement.style.setProperty('--nav-bar-height', '0px');
    }
  }, []);

  // 🎨 Status Bar Style & Background Sync with App Theme (Edge-to-Edge with Safe Area Insets)
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    try {
      StatusBar.setOverlaysWebView({ overlay: true }).catch(() => {});
      if (theme === 'light') {
        StatusBar.setStyle({ style: Style.Light }).catch(() => {});
      } else {
        StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
      }
    } catch (e) {}
  }, [theme]);

  // 🎹 Keyboard Hide/Show Window Scroll Lock & Dynamic Inset Adjustments
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const resetWindowScroll = () => {
      window.scrollTo(0, 0);
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    };

    const handleKeyboardWillShow = () => {
      document.body.classList.add('keyboard-open');
      // Klavye açıldığında alt tuş çubuğu klavyenin altına saklandığı için nav-bar-height sıfırlanır
      document.documentElement.style.setProperty('--nav-bar-height', '0px');
    };

    const handleKeyboardWillHide = () => {
      document.body.classList.remove('keyboard-open');
      // Klavye kapandığında gerçek nav-bar yüksekliği geri yüklenir
      document.documentElement.style.setProperty('--nav-bar-height', measuredNavBarHeightRef.current);
      resetWindowScroll();
    };

    let showSub = null;
    let hideSub = null;
    let didHideSub = null;

    try {
      Keyboard.addListener('keyboardWillShow', handleKeyboardWillShow).then(sub => { showSub = sub; });
      Keyboard.addListener('keyboardWillHide', handleKeyboardWillHide).then(sub => { hideSub = sub; });
      Keyboard.addListener('keyboardDidHide', resetWindowScroll).then(sub => { didHideSub = sub; });
    } catch (e) {}

    return () => {
      if (showSub && typeof showSub.remove === 'function') showSub.remove();
      if (hideSub && typeof hideSub.remove === 'function') hideSub.remove();
      if (didHideSub && typeof didHideSub.remove === 'function') didHideSub.remove();
    };
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
    flushPersist,
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
    setEditingNote,
    syncDeltaSharedNotes,
    user
  });


  const handleShareNoteImage = async (note) => {
    await shareNoteImage(note, setToast);
  };

  const {
    handleUpdateBlock,
    currentAudioRef,
    isRecording,
    recordingSeconds,
    activeAudioPlayingId,
    setActiveAudioPlayingId,
    activeAudioProgress,
    setActiveAudioProgress,
    deleteFromR2,
    handleFileChange,
    startRecording,
    stopRecording,
    cancelRecording,
    handlePlayPauseAudio,
    handleOpenFile,
    handleDeleteBlock,
    handleInsertWidget,
    handleAddDebtItem,
    handleDeleteDebtItem,
    handleAddExpenseItem,
    handleDeleteExpenseItem,
    handleExpenseTitleChange,
    handleDeleteBillBlock,
    handlePayBill,
    handleDeleteBillPaymentItem,
    handleDeleteExamBlock,
    handleTextareaKeyDown,
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
  });

  // --- RENDERS & SCREENS ---

  // Dynamic filter for active tab & selection (personal notes only in main tab)
  const getVisibleNotes = () => {
    return notes.filter(n => !n.deletedAt && !n.sharedFrom); // Exclude deleted and received shared notes
  };

  const getDeletedNotes = () => {
    return notes.filter(n => n.deletedAt);
  };

  if (!user) {
    return <LoginScreen isLoggingIn={isLoggingIn} handleLogin={handleLogin} />;
  }

  return (
    <div className="app-container" data-theme={theme}>

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
        handleDeleteBillPaymentItem={handleDeleteBillPaymentItem}
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
        pendingShareRequests={pendingShareRequests}
        handleAcceptShare={handleAcceptShare}
        handleRejectShare={handleRejectShare}
        handleLeaveShare={handleLeaveShare}
        handleRequestMicPermission={handleRequestMicPermission}
        handleRequestStoragePermission={handleRequestStoragePermission}
        handleRequestAudioPermission={handleRequestAudioPermission}
        handleRequestLocationPermission={handleRequestLocationPermission}
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
        setShowFeedbackModal={setShowFeedbackModal}
        formatBytes={formatBytes}
        myCode={myCode}
        partnerCodeInput={partnerCodeInput}
        setPartnerCodeInput={setPartnerCodeInput}
        formatFriendCode={formatFriendCode}
        isSendingRequest={isSendingRequest}
        handleSendFriendRequest={handleSendFriendRequest}
        friendRequests={friendRequests}
        handleAcceptFriendRequest={handleAcceptFriendRequest}
        handleRejectFriendRequest={handleRejectFriendRequest}
        handleCancelFriendRequest={handleCancelFriendRequest}
        handleDisconnect={handleDisconnect}
        handleLogout={handleLogout}
        DEFAULT_AVATARS={DEFAULT_AVATARS}
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
        confirmDialog={confirmDialog}
        setConfirmDialog={setConfirmDialog}
        showAvatarPicker={showAvatarPicker}
        setShowAvatarPicker={setShowAvatarPicker}
        user={user}
        setToast={setToast}
        handleSelectAvatar={handleSelectAvatar}
        DEFAULT_AVATARS={DEFAULT_AVATARS}
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

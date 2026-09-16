/**
 * AppStateContext — Merkezi uygulama state'i.
 *
 * useAppLogic hook'unu wrap ederek Context API'ye donusturur.
 * Performans: 5 ayri context = 5 ayri render grubu.
 * Sadece ilgili state degistiginde ilgili bilesenlerin re-render olur.
 */
import React, { createContext, useContext, useRef } from 'react';
import useAppLogic from '@shared/hooks/useAppLogic';

const LanguageCtx  = createContext(null);
const AuthCtx      = createContext(null);
const NotesCtx     = createContext(null);
const RemindersCtx = createContext(null);
const SharingCtx   = createContext(null);

/**
 * AppStateProvider — Tum state'i context'e koyar.
 * options callback'leri (setConfirmDialog vs.) ref uzerinden inject edilir.
 */
export const AppStateProvider = ({ children, optionsRef }) => {
  const options = {
    setConfirmDialog:    (...args) => optionsRef.current?.setConfirmDialog?.(...args),
    setShowReminderModal:(...args) => optionsRef.current?.setShowReminderModal?.(...args),
    checkAndRequestNotificationPermission: (...args) => optionsRef.current?.checkAndRequestNotificationPermission?.(...args),
    deleteFromR2:        (...args) => optionsRef.current?.deleteFromR2?.(...args),
    requestBiometricAuth:(...args) => optionsRef.current?.requestBiometricAuth?.(...args),
    updateBlockForm:     (...args) => optionsRef.current?.updateBlockForm?.(...args),
  };

  const logic = useAppLogic(options);

  const langValue = React.useMemo(() => ({
    lang: logic.lang,
    setLang: logic.setLang,
    t: logic.t,
    formatReminderDate: logic.formatReminderDate,
    getRemainingTimeText: logic.getRemainingTimeText,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [logic.lang]);

  const authValue = React.useMemo(() => ({
    user: logic.user,
    setUser: logic.setUser,
    isLoggingIn: logic.isLoggingIn,
    setIsLoggingIn: logic.setIsLoggingIn,
    myCode: logic.myCode,
    setMyCode: logic.setMyCode,
    profileName: logic.profileName,
    setProfileName: logic.setProfileName,
    showAvatarPicker: logic.showAvatarPicker,
    setShowAvatarPicker: logic.setShowAvatarPicker,
    userPlan: logic.userPlan,
    setUserPlan: logic.setUserPlan,
    planNotification: logic.planNotification,
    toast: logic.toast,
    setToast: logic.setToast,
    getUserScopedKey: logic.getUserScopedKey,
    getScopedStorageItem: logic.getScopedStorageItem,
    handleLogin: logic.handleLogin,
    handleLogout: logic.handleLogout,
    handleSelectAvatar: logic.handleSelectAvatar,
    handleUpdateProfileName: logic.handleUpdateProfileName,
    syncDataFromSupabase: logic.syncDataFromSupabase,
    syncDeltaSharedNotes: logic.syncDeltaSharedNotes,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [logic.user, logic.isLoggingIn, logic.myCode, logic.profileName, logic.showAvatarPicker, logic.userPlan, logic.toast]);

  const notesValue = React.useMemo(() => ({
    notes: logic.notes,
    setNotes: logic.setNotes,
    editingNote: logic.editingNote,
    setEditingNote: logic.setEditingNote,
    lastEditingNoteId: logic.lastEditingNoteId,
    setLastEditingNoteId: logic.setLastEditingNoteId,
    activeFormatBlockId: logic.activeFormatBlockId,
    setActiveFormatBlockId: logic.setActiveFormatBlockId,
    showFormatToolbar: logic.showFormatToolbar,
    setShowFormatToolbar: logic.setShowFormatToolbar,
    editorUndoStack: logic.editorUndoStack,
    editorRedoStack: logic.editorRedoStack,
    persistNotes: logic.persistNotes,
    flushPersist: logic.flushPersist,
    saveNotes: logic.saveNotes,
    handleUndo: logic.handleUndo,
    handleRedo: logic.handleRedo,
    handleCreateNote: logic.handleCreateNote,
    handleUpdateNote: logic.handleUpdateNote,
    handleMoveToTrash: logic.handleMoveToTrash,
    handleRestoreNote: logic.handleRestoreNote,
    handlePermanentDelete: logic.handlePermanentDelete,
    handleBulkRestoreNotes: logic.handleBulkRestoreNotes,
    handleBulkPermanentDelete: logic.handleBulkPermanentDelete,
    enforceTrailingTextBlock: logic.enforceTrailingTextBlock,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [logic.notes, logic.editingNote, logic.activeFormatBlockId, logic.showFormatToolbar]);

  const remindersValue = React.useMemo(() => ({
    reminders: logic.reminders,
    setReminders: logic.setReminders,
    reminderNoteId: logic.reminderNoteId,
    setReminderNoteId: logic.setReminderNoteId,
    reminderTime: logic.reminderTime,
    setReminderTime: logic.setReminderTime,
    reminderModes: logic.reminderModes,
    setReminderModes: logic.setReminderModes,
    quickReminderTitle: logic.quickReminderTitle,
    setQuickReminderTitle: logic.setQuickReminderTitle,
    quickReminderTime: logic.quickReminderTime,
    setQuickReminderTime: logic.setQuickReminderTime,
    quickReminderModes: logic.quickReminderModes,
    setQuickReminderModes: logic.setQuickReminderModes,
    pendingWidgetAlarmCtx: logic.pendingWidgetAlarmCtx,
    setPendingWidgetAlarmCtx: logic.setPendingWidgetAlarmCtx,
    saveReminders: logic.saveReminders,
    scheduleNotification: logic.scheduleNotification,
    syncDismissedAlarms: logic.syncDismissedAlarms,
    handleCancelReminder: logic.handleCancelReminder,
    handleSetReminder: logic.handleSetReminder,
    handleCancelWidgetAlarm: logic.handleCancelWidgetAlarm,
    handleCreateWidgetAlarm: logic.handleCreateWidgetAlarm,
    handleCreateQuickReminder: logic.handleCreateQuickReminder,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [logic.reminders, logic.reminderNoteId, logic.pendingWidgetAlarmCtx]);

  const sharingValue = React.useMemo(() => ({
    partnerCodeInput: logic.partnerCodeInput,
    setPartnerCodeInput: logic.setPartnerCodeInput,
    friends: logic.friends,
    setFriends: logic.setFriends,
    friendRequests: logic.friendRequests,
    setFriendRequests: logic.setFriendRequests,
    selectedFriendCodes: logic.selectedFriendCodes,
    setSelectedFriendCodes: logic.setSelectedFriendCodes,
    pendingShareRequests: logic.pendingShareRequests,
    setPendingShareRequests: logic.setPendingShareRequests,
    isSendingRequest: logic.isSendingRequest,
    handleSendFriendRequest: logic.handleSendFriendRequest,
    handleAcceptFriendRequest: logic.handleAcceptFriendRequest,
    handleRejectFriendRequest: logic.handleRejectFriendRequest,
    handleCancelFriendRequest: logic.handleCancelFriendRequest,
    handleDisconnect: logic.handleDisconnect,
    handleSendNudge: logic.handleSendNudge,
    handleSendShareInvitation: logic.handleSendShareInvitation,
    handleAcceptShare: logic.handleAcceptShare,
    handleRejectShare: logic.handleRejectShare,
    handleLeaveShare: logic.handleLeaveShare,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [logic.friends, logic.friendRequests, logic.pendingShareRequests, logic.isSendingRequest]);

  return (
    <LanguageCtx.Provider value={langValue}>
      <AuthCtx.Provider value={authValue}>
        <NotesCtx.Provider value={notesValue}>
          <RemindersCtx.Provider value={remindersValue}>
            <SharingCtx.Provider value={sharingValue}>
              {children}
            </SharingCtx.Provider>
          </RemindersCtx.Provider>
        </NotesCtx.Provider>
      </AuthCtx.Provider>
    </LanguageCtx.Provider>
  );
};

// --- Context hook'lari ---
export const useLanguageCtx  = () => { const c = useContext(LanguageCtx);  if (!c) throw new Error('useLanguageCtx outside AppStateProvider');  return c; };
export const useAuthCtx      = () => { const c = useContext(AuthCtx);      if (!c) throw new Error('useAuthCtx outside AppStateProvider');      return c; };
export const useNotesCtx     = () => { const c = useContext(NotesCtx);     if (!c) throw new Error('useNotesCtx outside AppStateProvider');     return c; };
export const useRemindersCtx = () => { const c = useContext(RemindersCtx); if (!c) throw new Error('useRemindersCtx outside AppStateProvider'); return c; };
export const useSharingCtx   = () => { const c = useContext(SharingCtx);   if (!c) throw new Error('useSharingCtx outside AppStateProvider');   return c; };
import { useState, useEffect } from 'react';
import TRANSLATIONS from '../constants/translations';
import { formatReminderDate as sharedFormatReminderDate, getRemainingTimeText as sharedGetRemainingTimeText } from '../shared/utils/dateUtils';
import useAuth from './useAuth';
import useSharing from './useSharing';
import useNotes from './useNotes';
import useReminders from './useReminders';

/**
 * useAppLogic - Central coordinator hook.
 *
 * Calls all domain sub-hooks (useAuth, useSharing, useNotes, useReminders)
 * and re-exports everything through a clean surface following Feature-Based Modular Architecture.
 */
export default function useAppLogic(options = {}) {
  // ─── Language ─────────────────────────────────────────────────────────────
  const [lang, setLang] = useState(() => {
    const saved = localStorage.getItem('app_lang');
    if (saved) return saved;
    const sysLang = navigator.language || 'tr';
    return sysLang.toLowerCase().startsWith('tr') ? 'tr' : 'en';
  });

  const t = (key) => {
    return TRANSLATIONS[lang]?.[key] || TRANSLATIONS['en']?.[key] || TRANSLATIONS['tr']?.[key] || key;
  };

  const formatReminderDate = (dateStr) => sharedFormatReminderDate(dateStr, lang, t);
  const getRemainingTimeText = (targetTimeStr) => sharedGetRemainingTimeText(targetTimeStr, t);

  // Persist language selection
  useEffect(() => {
    localStorage.setItem('app_lang', lang);
  }, [lang]);

  // ─── Sub-hooks ────────────────────────────────────────────────────────────
  const auth = useAuth();

  const sharing = useSharing({
    user: auth.user,
    myCode: auth.myCode,
    profileName: auth.profileName,
    userPlan: auth.userPlan,
    setUserPlan: auth.setUserPlan,
    notes: auth.notes,
    saveNotes: (newNotes) => notesHook.saveNotes(newNotes),
    setToast: auth.setToast,
    setShowPaywall: options.setShowPaywall,
    setShowRewardedAdModal: options.setShowRewardedAdModal,
  });

  const notesHook = useNotes({
    user: auth.user,
    notes: auth.notes,
    setNotes: auth.setNotes,
    reminders: auth.reminders,
    setReminders: auth.setReminders,
    setToast: auth.setToast,
    getUserScopedKey: auth.getUserScopedKey,
    t,
    setConfirmDialog: options.setConfirmDialog,
    deleteFromR2: options.deleteFromR2,
    requestBiometricAuth: options.requestBiometricAuth,
    lang,
    myCode: auth.myCode,
    handleLeaveShare: sharing.handleLeaveShare
  });

  const remindersHook = useReminders({
    user: auth.user,
    notes: auth.notes,
    setNotes: auth.setNotes,
    reminders: auth.reminders,
    setReminders: auth.setReminders,
    editingNote: notesHook.editingNote,
    setEditingNote: notesHook.setEditingNote,
    persistNotes: notesHook.persistNotes,
    setToast: auth.setToast,
    getRemainingTimeText,
    getUserScopedKey: auth.getUserScopedKey,
    t,
    setShowReminderModal: options.setShowReminderModal,
    checkAndRequestNotificationPermission: options.checkAndRequestNotificationPermission,
    updateBlockForm: options.updateBlockForm
  });

  // ─── Re-export everything through one surface ─────────────────────────────
  return {
    // Language
    lang,
    setLang,
    t,
    formatReminderDate,
    getRemainingTimeText,

    // Core data caches (owned by useAuth, will be consumed by useNotes/useReminders later)
    notes: auth.notes,
    setNotes: auth.setNotes,
    reminders: auth.reminders,
    setReminders: auth.setReminders,

    // Auth & Profile
    user: auth.user,
    setUser: auth.setUser,
    isLoggingIn: auth.isLoggingIn,
    setIsLoggingIn: auth.setIsLoggingIn,
    myCode: auth.myCode,
    setMyCode: auth.setMyCode,
    profileName: auth.profileName,
    setProfileName: auth.setProfileName,
    showAvatarPicker: auth.showAvatarPicker,
    setShowAvatarPicker: auth.setShowAvatarPicker,

    // Billing
    userPlan: auth.userPlan,
    setUserPlan: auth.setUserPlan,
    planNotification: auth.planNotification,
    setPlanNotification: auth.setPlanNotification,

    // Toast
    toast: auth.toast,
    setToast: auth.setToast,

    // Helpers
    getUserScopedKey: auth.getUserScopedKey,
    getScopedStorageItem: auth.getScopedStorageItem,

    // Auth Handlers
    handleLogin: auth.handleLogin,
    handleLogout: auth.handleLogout,
    handleSelectAvatar: auth.handleSelectAvatar,
    handleUpdateProfileName: auth.handleUpdateProfileName,
    syncDataFromSupabase: auth.syncDataFromSupabase,

    // Sharing State & Handlers
    partnerCodeInput: sharing.partnerCodeInput,
    setPartnerCodeInput: sharing.setPartnerCodeInput,
    friends: sharing.friends,
    setFriends: sharing.setFriends,
    friendRequests: sharing.friendRequests,
    setFriendRequests: sharing.setFriendRequests,
    selectedFriendCodes: sharing.selectedFriendCodes,
    setSelectedFriendCodes: sharing.setSelectedFriendCodes,
    pendingShareRequests: sharing.pendingShareRequests,
    setPendingShareRequests: sharing.setPendingShareRequests,
    isSendingRequest: sharing.isSendingRequest,
    handleSendFriendRequest: sharing.handleSendFriendRequest,
    handleAcceptFriendRequest: sharing.handleAcceptFriendRequest,
    handleRejectFriendRequest: sharing.handleRejectFriendRequest,
    handleCancelFriendRequest: sharing.handleCancelFriendRequest,
    handleDisconnect: sharing.handleDisconnect,
    handleSendNudge: sharing.handleSendNudge,
    handleSendShareInvitation: sharing.handleSendShareInvitation,
    handleAcceptShare: sharing.handleAcceptShare,
    handleRejectShare: sharing.handleRejectShare,
    handleLeaveShare: sharing.handleLeaveShare,
    handleRewardedShareCallback: sharing.handleRewardedShareCallback,
    pendingShareReward: sharing.pendingShareReward,
    setPendingShareReward: sharing.setPendingShareReward,
    grantedUltraFriendCode: sharing.grantedUltraFriendCode,
    ultraGiftFrom: sharing.ultraGiftFrom,
    isPrimaryUltra: sharing.isPrimaryUltra,
    isGiftedUltra: sharing.isGiftedUltra,
    handleGrantUltraGift: sharing.handleGrantUltraGift,

    // Notes State & Handlers
    editingNote: notesHook.editingNote,
    setEditingNote: notesHook.setEditingNote,
    lastEditingNoteId: notesHook.lastEditingNoteId,
    setLastEditingNoteId: notesHook.setLastEditingNoteId,
    activeFormatBlockId: notesHook.activeFormatBlockId,
    setActiveFormatBlockId: notesHook.setActiveFormatBlockId,
    showFormatToolbar: notesHook.showFormatToolbar,
    setShowFormatToolbar: notesHook.setShowFormatToolbar,
    editorUndoStack: notesHook.editorUndoStack,
    editorRedoStack: notesHook.editorRedoStack,
    persistNotes: notesHook.persistNotes,
    saveNotes: notesHook.saveNotes,
    handleUndo: notesHook.handleUndo,
    handleRedo: notesHook.handleRedo,
    handleCreateNote: notesHook.handleCreateNote,
    handleUpdateNote: notesHook.handleUpdateNote,
    handleMoveToTrash: notesHook.handleMoveToTrash,
    handleRestoreNote: notesHook.handleRestoreNote,
    handlePermanentDelete: notesHook.handlePermanentDelete,
    handleBulkRestoreNotes: notesHook.handleBulkRestoreNotes,
    handleBulkPermanentDelete: notesHook.handleBulkPermanentDelete,
    enforceTrailingTextBlock: notesHook.enforceTrailingTextBlock,

    // Reminders State & Handlers
    reminderNoteId: remindersHook.reminderNoteId,
    setReminderNoteId: remindersHook.setReminderNoteId,
    reminderTime: remindersHook.reminderTime,
    setReminderTime: remindersHook.setReminderTime,
    reminderModes: remindersHook.reminderModes,
    setReminderModes: remindersHook.setReminderModes,
    quickReminderTitle: remindersHook.quickReminderTitle,
    setQuickReminderTitle: remindersHook.setQuickReminderTitle,
    quickReminderTime: remindersHook.quickReminderTime,
    setQuickReminderTime: remindersHook.setQuickReminderTime,
    quickReminderModes: remindersHook.quickReminderModes,
    setQuickReminderModes: remindersHook.setQuickReminderModes,
    pendingWidgetAlarmCtx: remindersHook.pendingWidgetAlarmCtx,
    setPendingWidgetAlarmCtx: remindersHook.setPendingWidgetAlarmCtx,
    saveReminders: remindersHook.saveReminders,
    scheduleNotification: remindersHook.scheduleNotification,
    syncDismissedAlarms: remindersHook.syncDismissedAlarms,
    handleCancelReminder: remindersHook.handleCancelReminder,
    handleSetReminder: remindersHook.handleSetReminder,
    handleCancelWidgetAlarm: remindersHook.handleCancelWidgetAlarm,
    handleCreateWidgetAlarm: remindersHook.handleCreateWidgetAlarm,
    handleCreateQuickReminder: remindersHook.handleCreateQuickReminder
  };
}

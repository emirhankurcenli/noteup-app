import { useState, useEffect } from 'react';
import TRANSLATIONS from '../constants/translations';
import useAuth from './useAuth';
import useSharing from './useSharing';
import useNotes from './useNotes';
import useReminders from './useReminders';

/**
 * useAppLogic - Central coordinator hook.
 *
 * Calls all sub-hooks (useAuth, useSharing, useNotes, useReminders)
 * and re-exports everything through a single surface so that App.jsx and all
 * child components can destructure from one place without any breakage.
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

  const formatReminderDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const timeOptions = { hour: '2-digit', minute: '2-digit' };
    const formattedTime = date.toLocaleTimeString(lang === 'tr' ? 'tr-TR' : 'en-US', timeOptions);
    const isToday = date.toDateString() === now.toDateString();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = date.toDateString() === tomorrow.toDateString();
    if (isToday) {
      return `${t('today')}, ${formattedTime}`;
    } else if (isTomorrow) {
      return `${t('tomorrow')}, ${formattedTime}`;
    } else {
      const dateOptions = { day: 'numeric', month: 'short', weekday: 'short' };
      const formattedDate = date.toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US', dateOptions);
      return `${formattedDate} - ${formattedTime}`;
    }
  };

  const getRemainingTimeText = (targetTimeStr) => {
    const diffMs = new Date(targetTimeStr).getTime() - Date.now();
    if (diffMs <= 0) return t('timeIsPast');
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay > 0) {
      return t('remainingDays').replace('{days}', diffDay).replace('{hours}', diffHour % 24);
    } else if (diffHour > 0) {
      return t('remainingHours').replace('{hours}', diffHour).replace('{mins}', diffMin % 60);
    } else if (diffMin > 0) {
      return t('remainingMins').replace('{mins}', diffMin).replace('{secs}', diffSec % 60);
    } else {
      return t('remainingSecs').replace('{secs}', diffSec);
    }
  };

  // Persist language selection
  useEffect(() => {
    localStorage.setItem('app_lang', lang);
  }, [lang]);

  // ─── Sub-hooks ────────────────────────────────────────────────────────────
  const auth = useAuth();
  
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
    lang
  });

  const sharing = useSharing({
    user: auth.user,
    myCode: auth.myCode,
    profileName: auth.profileName,
    userPlan: auth.userPlan,
    setUserPlan: auth.setUserPlan,
    notes: auth.notes,
    saveNotes: notesHook.saveNotes,
    setToast: auth.setToast,
    setShowPaywall: options.setShowPaywall,
    setShowRewardedAdModal: options.setShowRewardedAdModal,
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
    incomingRequest: sharing.incomingRequest,
    setIncomingRequest: sharing.setIncomingRequest,
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

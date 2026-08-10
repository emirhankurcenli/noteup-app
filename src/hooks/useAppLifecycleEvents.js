import { useEffect } from 'react';
import { registerPlugin } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { supabase } from '../supabaseClient';
import {
  createNotificationChannels,
  addNotificationListener
} from '../services/notificationService';
import { playChime } from '../services/soundService';
import { triggerHaptic } from '../services/haptics';

const AppSettings = registerPlugin('AppSettings');

const touchLastSeenAt = async () => {
  try {
    const userRaw = localStorage.getItem('s23_user');
    if (!userRaw) return;
    const u = JSON.parse(userRaw);
    const userId = u?.uid || u?.id;
    if (!userId) return;
    const nowIso = new Date().toISOString();
    await supabase
      .from('profiles')
      .update({ last_seen_at: nowIso, last_seen: nowIso })
      .eq('id', userId);
  } catch (e) {}
};

export default function useAppLifecycleEvents({
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
}) {
  // 1. Initial notification channels & foreground listener
  useEffect(() => {
    createNotificationChannels();

    const foregroundListener = addNotificationListener(
      'localNotificationReceived',
      () => { playChime(); triggerHaptic('success'); }
    );

    if (updatePermissionStates) updatePermissionStates();

    const handleFocusOrResume = () => {
      if (updatePermissionStates) updatePermissionStates();
      if (syncDismissedAlarms) syncDismissedAlarms();
    };

    window.addEventListener('focus', handleFocusOrResume);
    document.addEventListener('visibilitychange', handleFocusOrResume);

    return () => {
      foregroundListener.then(l => l.remove()).catch(() => {});
      window.removeEventListener('focus', handleFocusOrResume);
      document.removeEventListener('visibilitychange', handleFocusOrResume);
    };
  }, []);

  // 2. Notification action listener (tapping local notification)
  useEffect(() => {
    let actionListener = null;
    try {
      actionListener = addNotificationListener(
        'localNotificationActionPerformed',
        (action) => {
          try {
            const extra = action?.notification?.extra;
            if (extra && extra.noteId && setPendingOpenNoteId) {
              setPendingOpenNoteId(extra.noteId.toString());
            }
          } catch (err) {
            console.error("Error in localNotificationActionPerformed:", err);
          }
        }
      );
    } catch (e) {
      console.log("LocalNotifications listener registration skipped:", e);
    }

    return () => {
      if (actionListener) {
        actionListener.then(l => l.remove()).catch(() => {});
      }
    };
  }, []);

  // 3. Launch Note ID / Resume intent listener
  useEffect(() => {
    const checkLaunchNote = async () => {
      try {
        const res = await AppSettings.getLaunchNoteId();
        if (res && res.noteId && setPendingOpenNoteId) {
          setPendingOpenNoteId(res.noteId.toString());
        }
      } catch (e) {}
    };

    checkLaunchNote();

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkLaunchNote();
        touchLastSeenAt();
      }
    };

    let appStateListener = null;
    try {
      appStateListener = CapApp.addListener('appStateChange', (state) => {
        if (state.isActive) {
          checkLaunchNote();
          touchLastSeenAt();
          if (updatePermissionStates) updatePermissionStates();
        }
      });
    } catch (e) {}

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      if (appStateListener) {
        appStateListener.then(l => l.remove()).catch(() => {});
      }
    };
  }, []);

  // 4. Android Hardware Back Button listener
  useEffect(() => {
    const handleBackButton = async () => {
      if (showPaywall) {
        setShowPaywall(false);
        return;
      }
      if (confirmDialog) {
        if (confirmDialog.onCancel) confirmDialog.onCancel();
        setConfirmDialog(null);
        return;
      }
      if (showEditorMenu) {
        setShowEditorMenu(false);
        return;
      }
      if (showReminderModal) {
        setShowReminderModal(false);
        return;
      }

      if (editingNote) {
        handleCloseEditor();
      } else if (tabHistoryRef && tabHistoryRef.current && tabHistoryRef.current.length > 1) {
        tabHistoryRef.current.pop();
        const prevTab = tabHistoryRef.current[tabHistoryRef.current.length - 1] || 'notes';
        setActiveTab(prevTab);
      } else if (activeTab !== 'notes') {
        setActiveTab('notes');
      } else {
        try {
          await CapApp.exitApp();
        } catch (err) {
          console.error("Minimize failed:", err);
        }
      }
    };

    const listener = CapApp.addListener('backButton', handleBackButton);
    return () => {
      listener.then(l => l.remove());
    };
  }, [
    showPaywall,
    confirmDialog,
    editingNote,
    showEditorMenu,
    showReminderModal,
    activeTab
  ]);
}

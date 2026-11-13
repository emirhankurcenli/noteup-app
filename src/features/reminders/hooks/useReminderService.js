import { useRef, useEffect } from 'react';
import { supabase } from '@src/supabaseClient';
import { Capacitor } from '@capacitor/core';
import { scheduleLocalNotification, cancelLocalNotification } from '@shared/services/notificationService';
import { setNativeAlarm, cancelNativeAlarm, checkNativeAlarmDismissed } from '@shared/services/alarmService';
import { STORAGE_KEYS } from '@shared/utils/storageKeys';

const useReminderService = ({
  user,
  reminders,
  setReminders,
  getUserScopedKey,
  setToast,
}) => {
  const remindersRef = useRef(reminders);
  useEffect(() => {
    remindersRef.current = reminders;
  }, [reminders]);

  const saveReminders = async (updatedReminders) => {
    setReminders(updatedReminders);
    const key = getUserScopedKey(STORAGE_KEYS.REMINDERS);
    localStorage.setItem(key, JSON.stringify(updatedReminders));

    if (user && user.uid) {
      try {
        const remindersToUpsert = updatedReminders.map(r => ({
          id: r.id,
          user_id: user.uid,
          note_id: r.noteId || null,
          time: r.time,
          active: r.active || false
        }));

        const { error } = await supabase
          .from('reminders')
          .upsert(remindersToUpsert);

        if (error) console.error("Error upserting reminders to Supabase:", error);
      } catch (err) {
        console.error("Supabase reminders sync error:", err);
      }
    }
  };

  const scheduleNotification = async (reminder) => {
    const delay = new Date(reminder.time).getTime() - Date.now();
    if (delay <= 0) return;

    const modes = reminder.modes || { notification: true, alarm: true };
    const reminderNoteIdStr = reminder.noteId ? reminder.noteId.toString() : null;
    const numId = reminder.numericId || Math.floor(Math.random() * 100000000);

    if (modes.notification) {
      try {
        await scheduleLocalNotification({
          id: numId,
          title: reminder.title,
          body: "",
          at: new Date(reminder.time),
          channelId: modes.alarm ? 'alarm_channel' : 'system_default_channel_v4',
          extra: {
            noteId: reminderNoteIdStr,
            reminderId: reminder.id
          }
        });
      } catch (e) {
        console.log("Capacitor local notification schedule skipped (running in browser):", e);
      }
    }

    if (modes.alarm) {
      const targetTime = new Date(reminder.time).getTime();
      await setNativeAlarm({
        id: reminder.id,
        noteId: reminderNoteIdStr,
        title: reminder.title,
        timestamp: targetTime.toString()
      });
    }
  };

  const syncDismissedAlarms = async (currentReminders) => {
    if (!Capacitor.isNativePlatform()) return;
    try {
      const list = currentReminders || remindersRef.current;
      if (!list || list.length === 0) return;
      const updated = list.map(rem => ({ ...rem }));
      let changed = false;
      for (let i = 0; i < updated.length; i++) {
        const rem = updated[i];
        if (rem.active) {
          const res = await checkNativeAlarmDismissed(rem.id);
          if (res && res.snoozed) {
            rem.time = res.snoozedTime;
            rem.active = true;
            changed = true;
          } else if (res && res.dismissed) {
            rem.active = false;
            changed = true;
          }
        }
      }
      if (changed) {
        setReminders(updated);
        const remindersKey = getUserScopedKey(STORAGE_KEYS.REMINDERS);
        localStorage.setItem(remindersKey, JSON.stringify(updated));
      }
    } catch (e) {
      console.error("Error syncing dismissed alarms:", e);
    }
  };

  const handleCancelReminder = async (reminder) => {
    if (!reminder) return;
    const numId = reminder.numericId || (typeof reminder.id === 'string' ? Math.abs(reminder.id.split('').reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0)) : 12345);

    try {
      await cancelLocalNotification(numId);
    } catch (e) {
      console.log("Capacitor local notification cancel skipped:", e);
    }

    await cancelNativeAlarm(reminder.id);

    const preId = reminder.id + '-pre';
    const preRem = reminders.find(r => r.id === preId);
    if (preRem) {
      const preNumId = preRem.numericId || (typeof preRem.id === 'string' ? Math.abs(preRem.id.split('').reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0)) : 12346);
      try {
        await cancelLocalNotification(preNumId);
      } catch (e) {}
    }

    const updated = reminders.filter(r => r.id !== reminder.id && r.id !== preId);
    setReminders(updated);
    const key = getUserScopedKey(STORAGE_KEYS.REMINDERS);
    localStorage.setItem(key, JSON.stringify(updated));

    if (user && user.uid) {
      try {
        await supabase.from('reminders').delete().in('id', [reminder.id, preId]);
      } catch (err) {
        console.error("Error deleting reminder from Supabase:", err);
      }
    }

    setToast({
      title: "Alarm İptal Edildi",
      msg: "Planlanan hatırlatıcı kaldırıldı."
    });
  };

  return {
    remindersRef,
    saveReminders,
    scheduleNotification,
    syncDismissedAlarms,
    handleCancelReminder,
  };
};

export default useReminderService;

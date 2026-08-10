import { useRef, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Capacitor, registerPlugin } from '@capacitor/core';
import { scheduleLocalNotification, cancelLocalNotification } from '../services/notificationService';

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
    const key = getUserScopedKey('s23_reminders');
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
      try {
        const targetTime = new Date(reminder.time).getTime();
        await registerPlugin('Alarm').setAlarm({
          id: reminder.id,
          noteId: reminderNoteIdStr,
          title: reminder.title,
          timestamp: targetTime.toString()
        });
      } catch (e) {
        console.log("Native AlarmPlugin scheduling skipped:", e);
      }
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
          try {
            const res = await registerPlugin('Alarm').isAlarmDismissed({ id: rem.id.toString() });
            if (res && res.snoozed) {
              rem.time = res.snoozedTime;
              rem.active = true;
              changed = true;
            } else if (res && res.dismissed) {
              rem.active = false;
              changed = true;
            }
          } catch (e) {
            console.error("isAlarmDismissed plugin call error:", e);
          }
        }
      }
      if (changed) {
        setReminders(updated);
        const remindersKey = getUserScopedKey('s23_reminders');
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

    try {
      await registerPlugin('Alarm').cancelAlarm({ id: reminder.id });
    } catch (e) {
      console.log("Native AlarmPlugin cancel skipped:", e);
    }

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
    const key = getUserScopedKey('s23_reminders');
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

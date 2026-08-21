import { useState } from 'react';
import { cancelLocalNotification } from '../services/notificationService';
import { registerPlugin } from '@capacitor/core';
import { triggerHaptic } from '../services/haptics';
import useReminderService from './useReminderService';

export default function useReminders({
  user,
  notes,
  setNotes,
  reminders,
  setReminders,
  editingNote,
  setEditingNote,
  persistNotes,
  setToast,
  getRemainingTimeText,
  getUserScopedKey,
  t,
  setShowReminderModal,
  checkAndRequestNotificationPermission,
  updateBlockForm
}) {
  // --- STATES ---
  const [reminderNoteId, setReminderNoteId] = useState(null);
  const [reminderTime, setReminderTime] = useState('');
  const [reminderModes, setReminderModes] = useState({ notification: true, alarm: false });
  
  const [quickReminderTitle, setQuickReminderTitle] = useState('');
  const [quickReminderTime, setQuickReminderTime] = useState('');
  const [quickReminderModes, setQuickReminderModes] = useState({ notification: true, alarm: false });
  const [pendingWidgetAlarmCtx, setPendingWidgetAlarmCtx] = useState(null);

  const getTr = (key, fallback) => {
    if (typeof t === 'function') {
      const val = t(key);
      if (val && val !== key) return val;
    }
    return fallback;
  };

  // --- SUB-HOOK: SERVICE ---
  const service = useReminderService({
    user,
    reminders,
    setReminders,
    getUserScopedKey,
    setToast,
  });

  // --- ACTIONS ---
  const handleSetReminder = async () => {
    if (!reminderTime) return;

    const oldReminders = reminders.filter(r => r.noteId === reminderNoteId);
    for (const oldRem of oldReminders) {
      try {
        await cancelLocalNotification(oldRem.numericId);
        await registerPlugin('Alarm').cancelAlarm({ id: oldRem.id });
      } catch (e) {}
    }

    const remainingReminders = reminders.filter(r => r.noteId !== reminderNoteId);

    const numericId = Math.floor(Math.random() * 100000000);
    const newReminder = {
      id: 'r-' + Date.now(),
      numericId: numericId,
      noteId: reminderNoteId,
      title: (editingNote && editingNote.id === reminderNoteId ? editingNote.title : notes.find(n => n.id === reminderNoteId)?.title) || 'Hatırlatıcı',
      time: reminderTime,
      modes: { ...reminderModes },
      active: true
    };
    const updated = [...remainingReminders, newReminder];
    service.saveReminders(updated);

    const capturedTime = reminderTime;
    const capturedModes = { ...reminderModes };

    setReminderNoteId(null);
    setReminderTime('');
    setReminderModes({ notification: true, alarm: false });
    setShowReminderModal(false);

    setShowReminderModal(false);

    const modeLabel = capturedModes.notification && capturedModes.alarm
      ? getTr('notificationAndAlarm', 'Bildirim + Alarm')
      : capturedModes.alarm ? getTr('alarmType', 'Alarm') : getTr('notificationType', 'Bildirim');
    
    setToast({
      title: getTr('alarmSetTitle', 'Alarm Kuruldu'),
      msg: `${modeLabel} • ${getRemainingTimeText(capturedTime)}`
    });
    triggerHaptic('success');

    service.scheduleNotification(newReminder);
  };

  const handleCancelWidgetAlarm = () => {
    setPendingWidgetAlarmCtx(null);
    setQuickReminderTitle('');
    setQuickReminderTime('');
  };

  const handleCreateWidgetAlarm = async () => {
    if (!pendingWidgetAlarmCtx) return;

    const titleToUse = (quickReminderTitle || '').trim() || pendingWidgetAlarmCtx.course || pendingWidgetAlarmCtx.name || 'Hatırlatıcı';
    const timeToUse = quickReminderTime || getNowLocalDateTimeString();

    let granted = false;
    try {
      granted = await checkAndRequestNotificationPermission();
    } catch (e) {
      console.warn("Notification permission check warning:", e);
    }

    const numericId = Math.floor(Math.random() * 100000000);
    const remId = 'r-' + Date.now();
    const capturedTime = timeToUse;
    const capturedCtx = pendingWidgetAlarmCtx;

    if (granted) {
      if (capturedCtx.noteId) {
        const oldReminders = reminders.filter(r => r.noteId === capturedCtx.noteId);
        for (const oldRem of oldReminders) {
          try {
            await cancelLocalNotification(oldRem.numericId);
            await registerPlugin('Alarm').cancelAlarm({ id: oldRem.id });
          } catch (e) {}
        }
      }

      const remainingReminders = capturedCtx.noteId 
        ? reminders.filter(r => r.noteId !== capturedCtx.noteId)
        : reminders;

      const newReminder = {
        id: remId,
        numericId: numericId,
        noteId: capturedCtx.noteId,
        title: titleToUse,
        time: capturedTime,
        modes: { ...quickReminderModes },
        active: true
      };

      const updated = [...remainingReminders, newReminder];
      service.saveReminders(updated);
      service.scheduleNotification(newReminder);
    }

    setQuickReminderTitle('');
    setQuickReminderTime('');
    setQuickReminderModes({ notification: true, alarm: false });
    setPendingWidgetAlarmCtx(null);

    if (capturedCtx && capturedCtx.blockId && typeof updateBlockForm === 'function') {
      updateBlockForm(capturedCtx.blockId, { isEditing: false, tempName: undefined, tempAmount: undefined, tempCourse: undefined });
    }

    const parts = (capturedTime || '').split('T');
    const datePart = parts[0] || '';
    const timePart = parts[1] || '';

    setNotes(prevNotes => {
      const updatedNotes = prevNotes.map(n => {
        if (capturedCtx.noteId && n.id !== capturedCtx.noteId) return n;
        const updatedBlocks = (n.blocks || []).map(b => {
          if (b.id !== capturedCtx.blockId) return b;
          if (capturedCtx.widgetType === 'exam') {
            return {
              ...b,
              course: capturedCtx.course || titleToUse,
              examDate: datePart,
              examTime: timePart ? timePart.slice(0, 5) : '00:00',
              examMs: new Date(capturedTime).getTime() || Date.now(),
              examReminderIds: granted ? [remId] : (b.examReminderIds || []),
              setupDone: true
            };
          } else {
            return {
              ...b,
              name: capturedCtx.name || titleToUse,
              amount: capturedCtx.amount !== undefined ? capturedCtx.amount : b.amount,
              subscriberNo: capturedCtx.subscriberNo !== undefined ? capturedCtx.subscriberNo : (b.subscriberNo || ''),
              nextPaymentTime: capturedTime,
              reminderId: granted ? remId : b.reminderId,
              day: datePart ? parseInt(datePart.split('-')[2], 10) : b.day,
              time: timePart ? timePart.slice(0, 5) : b.time,
              setupDone: true
            };
          }
        });
        const updatedN = { ...n, blocks: updatedBlocks, updatedAt: Date.now() };
        if (editingNote && editingNote.id === n.id) {
          setEditingNote(updatedN);
        }
        return updatedN;
      });
      persistNotes(updatedNotes);
      return updatedNotes;
    });

    const modeLabel = quickReminderModes.notification && quickReminderModes.alarm
      ? getTr('notificationAndAlarm', 'Bildirim + Alarm')
      : quickReminderModes.alarm ? getTr('alarmType', 'Alarm') : getTr('notificationType', 'Bildirim');
    
    setToast({
      title: getTr('alarmSetTitle', 'Alarm Kuruldu'),
      msg: `${modeLabel} • ${getRemainingTimeText(capturedTime)}`
    });
    triggerHaptic('success');
  };

  const handleCreateQuickReminder = async (setShowQuickReminderForm, setActiveTab) => {
    if (!quickReminderTitle.trim() || !quickReminderTime) return;

    const granted = await checkAndRequestNotificationPermission();
    if (!granted) return;

    const targetNoteId = pendingWidgetAlarmCtx ? pendingWidgetAlarmCtx.noteId : null;
    if (targetNoteId) {
      const oldReminders = reminders.filter(r => r.noteId === targetNoteId);
      for (const oldRem of oldReminders) {
        try {
          await cancelLocalNotification(oldRem.numericId);
          await registerPlugin('Alarm').cancelAlarm({ id: oldRem.id });
        } catch (e) {}
      }
    }
    const remainingReminders = targetNoteId
      ? reminders.filter(r => r.noteId !== targetNoteId)
      : reminders;

    const numericId = Math.floor(Math.random() * 100000000);
    const remId = 'r-' + Date.now();
    const newReminder = {
      id: remId,
      numericId: numericId,
      noteId: targetNoteId,
      title: quickReminderTitle.trim(),
      time: quickReminderTime,
      modes: { ...quickReminderModes },
      active: true
    };
    const updated = [...remainingReminders, newReminder];
    service.saveReminders(updated);
    service.scheduleNotification(newReminder);

    const reminderTimeVal = quickReminderTime;
    const capturedModes = { ...quickReminderModes };
    const capturedCtx = pendingWidgetAlarmCtx;
    setQuickReminderTitle('');
    setQuickReminderTime('');
    setQuickReminderModes({ notification: true, alarm: false });
    setShowQuickReminderForm(false);
    setPendingWidgetAlarmCtx(null);

    const modeLabel = capturedModes.notification && capturedModes.alarm
      ? 'Bildirim + Alarm'
      : capturedModes.alarm ? 'Alarm' : 'Bildirim';
    setToast({
      title: getTr('alarmSetTitle', 'Alarm Kuruldu'),
      msg: `${modeLabel} • ${getRemainingTimeText(reminderTimeVal)}`
    });

    if (capturedCtx) {
      const [datePart, timePart] = reminderTimeVal.split('T');
      if (capturedCtx.widgetType === 'exam') {
        const examMs = new Date(reminderTimeVal).getTime();
        setNotes(prevNotes => {
          const updatedNotes = prevNotes.map(n => {
            if (n.id !== capturedCtx.noteId) return n;
            const updatedBlocks = (n.blocks || []).map(b => {
              if (b.id !== capturedCtx.blockId) return b;
              return {
                ...b,
                examDate: datePart,
                examTime: timePart ? timePart.slice(0, 5) : '00:00',
                examMs,
                examReminderIds: [remId],
                setupDone: true
              };
            });
            const updatedN = { ...n, blocks: updatedBlocks, updatedAt: Date.now() };
            if (editingNote && editingNote.id === n.id) {
              setEditingNote(updatedN);
            }
            return updatedN;
          });
          persistNotes(updatedNotes);
          return updatedNotes;
        });
        setTimeout(() => {
          const note = notes.find(n => n.id === capturedCtx.noteId);
          if (note) { setEditingNote(note); setActiveTab('notes'); }
        }, 300);
      } else if (capturedCtx.widgetType === 'bill') {
        setNotes(prevNotes => {
          const updatedNotes = prevNotes.map(n => {
            if (n.id !== capturedCtx.noteId) return n;
            const updatedBlocks = (n.blocks || []).map(b => {
              if (b.id !== capturedCtx.blockId) return b;
              return {
                ...b,
                nextPaymentTime: reminderTimeVal,
                reminderId: remId,
                day: datePart ? parseInt(datePart.split('-')[2]) : b.day,
                time: timePart ? timePart.slice(0, 5) : b.time,
                setupDone: true
              };
            });
            const updatedN = { ...n, blocks: updatedBlocks, updatedAt: Date.now() };
            if (editingNote && editingNote.id === n.id) {
              setEditingNote(updatedN);
            }
            return updatedN;
          });
          persistNotes(updatedNotes);
          return updatedNotes;
        });
        setTimeout(() => {
          const note = notes.find(n => n.id === capturedCtx.noteId);
          if (note) { setEditingNote(note); setActiveTab('notes'); }
        }, 300);
      }
    }

    service.scheduleNotification(newReminder);
  };

  return {
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
    saveReminders: service.saveReminders,
    scheduleNotification: service.scheduleNotification,
    syncDismissedAlarms: service.syncDismissedAlarms,
    handleCancelReminder: service.handleCancelReminder,
    handleSetReminder,
    handleCancelWidgetAlarm,
    handleCreateWidgetAlarm,
    handleCreateQuickReminder
  };
}

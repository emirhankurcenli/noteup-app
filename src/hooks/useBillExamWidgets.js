import { triggerHaptic } from '../services/haptics';
import { sanitizeSingleLine, sanitizeMoneyInput } from '../utils/securityUtils';

const useBillExamWidgets = ({
  editingNote,
  reminders,
  handleUpdateBlock,
  handleDeleteBlock,
  showCustomConfirm,
  setToast,
  checkAndRequestNotificationPermission,
  handleCancelReminder,
  saveReminders,
  scheduleNotification,
  setBlockFormStates,
  t,
}) => {
  const calculateNextBillDate = (day, timeStr) => {
    const now = new Date();
    const [hours, minutes] = timeStr.split(':').map(Number);
    const lastDayThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const targetDay = Math.min(day, lastDayThisMonth);

    let target = new Date(now.getFullYear(), now.getMonth(), targetDay, hours, minutes, 0, 0);

    if (target <= now) {
      const nextMonth = now.getMonth() + 1;
      const lastDayNextMonth = new Date(now.getFullYear(), nextMonth + 1, 0).getDate();
      const nextTargetDay = Math.min(day, lastDayNextMonth);
      target = new Date(now.getFullYear(), nextMonth, nextTargetDay, hours, minutes, 0, 0);
    }

    const year = target.getFullYear();
    const month = String(target.getMonth() + 1).padStart(2, '0');
    const d = String(target.getDate()).padStart(2, '0');
    const h = String(target.getHours()).padStart(2, '0');
    const m = String(target.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${d}T${h}:${m}`;
  };

  const handleSaveBillWidget = async (blockId, name, amount, day, timeStr, mode) => {
    if (!editingNote) return;

    const cleanName = sanitizeSingleLine(name || 'Fatura', 60);
    const cleanAmountStr = sanitizeMoneyInput(String(amount || ''));

    const block = (editingNote.blocks || []).find(b => b.id === blockId);
    if (!block) return;

    if (block.reminderId) {
      const oldRem = reminders.find(r => r.id === block.reminderId);
      if (oldRem) {
        await handleCancelReminder(oldRem);
      }
    }

    const granted = await checkAndRequestNotificationPermission();
    if (!granted) {
      setToast({ title: "🔔 İzin Gerekli", msg: "Bildirim izni verilmediği için alarm kurulmadı." });
    }

    const nextTime = calculateNextBillDate(day, timeStr);
    const numericId = Math.floor(Math.random() * 100000000);
    const reminderId = 'r-' + Date.now();

    const cleanAmount = parseFloat(amount);
    const formattedAmount = isNaN(cleanAmount) ? null : cleanAmount;
    const titleName = formattedAmount ? `${name || 'Fatura'} (${formattedAmount} TL)` : (name || 'Fatura');

    const newReminder = {
      id: reminderId,
      numericId: numericId,
      noteId: editingNote.id,
      title: `Fatura Ödeme: ${titleName}`,
      time: nextTime,
      modes: {
        notification: mode === 'notification' || mode === 'both',
        alarm: mode === 'alarm' || mode === 'both'
      },
      active: true
    };

    const updatedReminders = [...reminders, newReminder];
    const nextTimeMs = new Date(nextTime).getTime();
    const preTimeMs = nextTimeMs - 5 * 24 * 60 * 60 * 1000;

    if (preTimeMs > Date.now()) {
      const preDate = new Date(preTimeMs);
      const year = preDate.getFullYear();
      const month = String(preDate.getMonth() + 1).padStart(2, '0');
      const d = String(preDate.getDate()).padStart(2, '0');
      const h = String(preDate.getHours()).padStart(2, '0');
      const m = String(preDate.getMinutes()).padStart(2, '0');
      const preTimeStr = `${year}-${month}-${d}T${h}:${m}`;

      const preReminder = {
        id: reminderId + '-pre',
        numericId: Math.floor(Math.random() * 100000000),
        noteId: editingNote.id,
        title: `Fatura Ödeme: Ödeme gününe 5 gün kaldı: ${titleName}`,
        time: preTimeStr,
        modes: {
          notification: true,
          alarm: false
        },
        active: true
      };
      updatedReminders.push(preReminder);

      saveReminders(updatedReminders);
      if (granted) {
        scheduleNotification(newReminder);
        scheduleNotification(preReminder);
      }
    } else {
      saveReminders(updatedReminders);
      if (granted) {
        scheduleNotification(newReminder);
      }
    }

    handleUpdateBlock(blockId, {
      name,
      amount: formattedAmount,
      day,
      time: timeStr,
      mode,
      reminderId: reminderId,
      nextPaymentTime: nextTime,
      setupDone: true
    });

    setBlockFormStates(prev => ({
      ...prev,
      [blockId]: {
        ...prev[blockId],
        isEditing: false,
        tempName: undefined,
        tempAmount: undefined,
        tempDay: undefined,
        tempTime: undefined,
        tempMode: undefined
      }
    }));

    setToast({
      title: "🧾 Fatura Kaydedildi",
      msg: `İlk ödeme tarihi: ${new Date(nextTime).toLocaleDateString()} ${timeStr}`
    });
  };

  const handleDeleteBillBlock = async (blockId) => {
    if (!editingNote) return;
    const block = (editingNote.blocks || []).find(b => b.id === blockId);
    if (!block) return;

    showCustomConfirm("Bu eklentiyi silmek istediğinize emin misiniz?", async () => {
      if (block.reminderId) {
        const oldRem = reminders.find(r => r.id === block.reminderId);
        if (oldRem) {
          await handleCancelReminder(oldRem);
        }
      }
      handleDeleteBlock(blockId, true);
    });
  };

  const handlePayBill = async (blockId) => {
    if (!editingNote) return;
    const block = (editingNote.blocks || []).find(b => b.id === blockId);
    if (!block) return;

    if (block.reminderId) {
      const oldRem = reminders.find(r => r.id === block.reminderId);
      if (oldRem) {
        await handleCancelReminder(oldRem);
      }
    }

    const paidTimestamp = Date.now();
    const history = block.history || [];
    const updatedHistory = [...history, paidTimestamp];

    const baseDate = new Date(block.nextPaymentTime || Date.now());
    const [hours, minutes] = (block.time || '12:00').split(':').map(Number);

    let nextMonth = baseDate.getMonth() + 1;
    let nextYear = baseDate.getFullYear();
    if (nextMonth > 11) {
      nextMonth = 0;
      nextYear += 1;
    }

    const lastDayNextMonth = new Date(nextYear, nextMonth + 1, 0).getDate();
    const nextTargetDay = Math.min(block.day || 15, lastDayNextMonth);

    const nextTarget = new Date(nextYear, nextMonth, nextTargetDay, hours, minutes, 0, 0);
    const year = nextTarget.getFullYear();
    const month = String(nextTarget.getMonth() + 1).padStart(2, '0');
    const d = String(nextTarget.getDate()).padStart(2, '0');
    const h = String(nextTarget.getHours()).padStart(2, '0');
    const m = String(nextTarget.getMinutes()).padStart(2, '0');
    const nextTime = `${year}-${month}-${d}T${h}:${m}`;

    const numericId = Math.floor(Math.random() * 100000000);
    const reminderId = 'r-' + Date.now();

    const titleName = block.amount ? `${block.name || 'Fatura'} (${block.amount} TL)` : (block.name || 'Fatura');

    const newReminder = {
      id: reminderId,
      numericId: numericId,
      noteId: editingNote.id,
      title: `Fatura Ödeme: ${titleName}`,
      time: nextTime,
      modes: {
        notification: block.mode === 'notification' || block.mode === 'both',
        alarm: block.mode === 'alarm' || block.mode === 'both'
      },
      active: true
    };

    const updatedReminders = [...reminders, newReminder];
    const nextTimeMs = new Date(nextTime).getTime();
    const preTimeMs = nextTimeMs - 5 * 24 * 60 * 60 * 1000;

    const granted = await checkAndRequestNotificationPermission();

    if (preTimeMs > Date.now()) {
      const preDate = new Date(preTimeMs);
      const year = preDate.getFullYear();
      const month = String(preDate.getMonth() + 1).padStart(2, '0');
      const d = String(preDate.getDate()).padStart(2, '0');
      const h = String(preDate.getHours()).padStart(2, '0');
      const m = String(preDate.getMinutes()).padStart(2, '0');
      const preTimeStr = `${year}-${month}-${d}T${h}:${m}`;

      const preReminder = {
        id: reminderId + '-pre',
        numericId: Math.floor(Math.random() * 100000000),
        noteId: editingNote.id,
        title: `Fatura Ödeme: Ödeme gününe 5 gün kaldı: ${titleName}`,
        time: preTimeStr,
        modes: {
          notification: true,
          alarm: false
        },
        active: true
      };
      updatedReminders.push(preReminder);

      saveReminders(updatedReminders);
      if (granted) {
        scheduleNotification(newReminder);
        scheduleNotification(preReminder);
      }
    } else {
      saveReminders(updatedReminders);
      if (granted) {
        scheduleNotification(newReminder);
      }
    }

    handleUpdateBlock(blockId, {
      reminderId: reminderId,
      nextPaymentTime: nextTime,
      history: updatedHistory
    });

    triggerHaptic('success');
    setToast({
      title: "💚 Fatura Ödendi",
      msg: `Sonraki hatırlatma tarihi: ${new Date(nextTime).toLocaleDateString()}`
    });
  };

  const handleSaveExamWidget = async (blockId, course, examDateStr, examTimeStr) => {
    if (!editingNote) return;
    const cleanCourse = sanitizeSingleLine(course || '', 60);
    if (!cleanCourse || !examDateStr || !examTimeStr) {
      setToast({ title: '⚠️ Eksik Bilgi', msg: 'Lütfen ders adı, tarih ve saati doldurun.' });
      return;
    }

    const block = (editingNote.blocks || []).find(b => b.id === blockId);
    if (!block) return;

    if (block.examReminderIds && block.examReminderIds.length > 0) {
      for (const rid of block.examReminderIds) {
        const old = reminders.find(r => r.id === rid);
        if (old) await handleCancelReminder(old);
      }
    }

    const granted = await checkAndRequestNotificationPermission();
    if (!granted) {
      setToast({ title: '🔔 İzin Gerekli', msg: 'Bildirim izni verilmediği için alarm kurulmadı.' });
    }

    const examMs = new Date(`${examDateStr}T${examTimeStr}`).getTime();
    if (isNaN(examMs)) {
      setToast({ title: '❌ Geçersiz Tarih', msg: 'Lütfen geçerli bir tarih ve saat girin.' });
      return;
    }

    const toLocalDateTimeString = (d) => {
      const dateObj = typeof d === 'number' ? new Date(d) : d;
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      const hours = String(dateObj.getHours()).padStart(2, '0');
      const minutes = String(dateObj.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const makeReminder = (id, title, atMs, isAlarm) => ({
      id,
      numericId: Math.floor(Math.random() * 100000000),
      noteId: editingNote.id,
      title,
      time: toLocalDateTimeString(atMs),
      modes: { notification: true, alarm: isAlarm },
      active: true
    });

    const baseId = 'exam-' + blockId;
    const now = Date.now();
    const newRemindersList = [];
    const newReminderIds = [];

    const r3d = examMs - 3 * 24 * 60 * 60 * 1000;
    if (r3d > now) {
      const r = makeReminder(`${baseId}-3d`, `📅 ${course}: 3 gün kaldı`, r3d, false);
      newRemindersList.push(r); newReminderIds.push(r.id);
    }
    const r2d = examMs - 2 * 24 * 60 * 60 * 1000;
    if (r2d > now) {
      const r = makeReminder(`${baseId}-2d`, `📅 ${course}: 2 gün kaldı`, r2d, false);
      newRemindersList.push(r); newReminderIds.push(r.id);
    }
    const r1d = examMs - 1 * 24 * 60 * 60 * 1000;
    if (r1d > now) {
      const r = makeReminder(`${baseId}-1d`, `📅 ${course}: 1 gün (24 saat) kaldı!`, r1d, false);
      newRemindersList.push(r); newReminderIds.push(r.id);
    }
    const r5h = examMs - 5 * 60 * 60 * 1000;
    if (r5h > now) {
      const r = makeReminder(`${baseId}-5h`, `📅 ${course}: Sınavınıza 5 saat kaldı!`, r5h, false);
      newRemindersList.push(r); newReminderIds.push(r.id);
    }
    const r2h = examMs - 2 * 60 * 60 * 1000;
    if (r2h > now) {
      const r = makeReminder(`${baseId}-2h`, `📅 ${course}: Sınavınıza 2 saat kaldı! [noSnooze]`, r2h, true);
      newRemindersList.push(r); newReminderIds.push(r.id);
    }
    if (examMs > now) {
      const r = makeReminder(`${baseId}-now`, `📅 ${course}: Sınav zamanı geldi!`, examMs, true);
      newRemindersList.push(r); newReminderIds.push(r.id);
    }

    const updatedReminders = [...reminders, ...newRemindersList];
    saveReminders(updatedReminders);
    if (granted) {
      for (const rem of newRemindersList) {
        scheduleNotification(rem);
      }
    }

    handleUpdateBlock(blockId, {
      course,
      examDate: examDateStr,
      examTime: examTimeStr,
      examMs,
      examReminderIds: newReminderIds,
      setupDone: true
    });

    setBlockFormStates(prev => ({
      ...prev,
      [blockId]: { ...prev[blockId], isEditing: false, tempCourse: undefined, tempDate: undefined, tempTime: undefined }
    }));

    const examLabel = new Date(examMs).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
    triggerHaptic('success');
    setToast({ title: `📅 ${t('examSaved')}`, msg: `${course} – ${examLabel} ${examTimeStr} | ${newReminderIds.length} alarm kuruldu.` });
  };

  const handleDeleteExamBlock = async (blockId) => {
    if (!editingNote) return;
    const block = (editingNote.blocks || []).find(b => b.id === blockId);
    if (!block) return;

    showCustomConfirm(t('examDelete') + '?', async () => {
      if (block.examReminderIds && block.examReminderIds.length > 0) {
        for (const rid of block.examReminderIds) {
          const old = reminders.find(r => r.id === rid);
          if (old) await handleCancelReminder(old);
        }
      }
      handleDeleteBlock(blockId, true);
    });
  };

  return {
    handleSaveBillWidget,
    handleDeleteBillBlock,
    handlePayBill,
    handleSaveExamWidget,
    handleDeleteExamBlock,
  };
};

export default useBillExamWidgets;

import { triggerHaptic } from '../services/haptics';
import { sanitizeSingleLine, sanitizeMoneyInput } from '../utils/securityUtils';

export const useBillWidget = ({
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

    const granted = typeof checkAndRequestNotificationPermission === 'function' ? await checkAndRequestNotificationPermission() : true;
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
          notification: mode === 'notification' || mode === 'both',
          alarm: false
        },
        active: true
      };
      updatedReminders.push(preReminder);
      if (typeof scheduleNotification === 'function') {
        scheduleNotification(preReminder);
      }
    }

    saveReminders(updatedReminders);

    if (typeof scheduleNotification === 'function') {
      scheduleNotification(newReminder);
    }

    handleUpdateBlock(blockId, {
      billName: cleanName,
      billAmount: cleanAmountStr,
      billDay: day,
      billTime: timeStr,
      alarmMode: mode,
      reminderId: reminderId,
      nextBillDate: nextTime,
      lastPaidAt: block.lastPaidAt || null
    });

    setBlockFormStates(prev => ({
      ...prev,
      [blockId]: { ...(prev[blockId] || {}), isEditing: false }
    }));

    if (triggerHaptic) triggerHaptic('success');
    setToast({ title: "🔔 Fatura Alarmı Kuruldu", msg: `${titleName} için fatura ödeme hatırlatıcısı aktif.` });
  };

  const handleMarkBillAsPaid = async (blockId) => {
    if (!editingNote) return;
    const block = (editingNote.blocks || []).find(b => b.id === blockId);
    if (!block) return;

    const day = block.billDay || 1;
    const timeStr = block.billTime || '09:00';
    const mode = block.alarmMode || 'notification';

    const nextTime = calculateNextBillDate(day, timeStr);
    const numericId = Math.floor(Math.random() * 100000000);
    const reminderId = 'r-' + Date.now();

    const cleanAmount = parseFloat(block.billAmount);
    const formattedAmount = isNaN(cleanAmount) ? null : cleanAmount;
    const titleName = formattedAmount ? `${block.billName || 'Fatura'} (${formattedAmount} TL)` : (block.billName || 'Fatura');

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

    if (block.reminderId) {
      const oldRem = reminders.find(r => r.id === block.reminderId);
      if (oldRem) {
        await handleCancelReminder(oldRem);
      }
    }

    const updatedReminders = [...reminders.filter(r => r.id !== block.reminderId), newReminder];
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
          notification: mode === 'notification' || mode === 'both',
          alarm: false
        },
        active: true
      };
      updatedReminders.push(preReminder);
      if (typeof scheduleNotification === 'function') {
        scheduleNotification(preReminder);
      }
    }

    saveReminders(updatedReminders);

    if (typeof scheduleNotification === 'function') {
      scheduleNotification(newReminder);
    }

    handleUpdateBlock(blockId, {
      reminderId: reminderId,
      nextBillDate: nextTime,
      lastPaidAt: new Date().toISOString()
    });

    if (triggerHaptic) triggerHaptic('success');
    setToast({ title: "✅ Fatura Ödendi İşaretlendi", msg: `Gelecek ödeme tarihi (${nextTime.split('T')[0]}) olarak güncellendi.` });
  };

  const handleDeleteBillWidget = (blockId) => {
    if (showCustomConfirm) {
      showCustomConfirm({
        title: "🗑️ Faturayı Sil",
        msg: "Bu fatura widget'ını ve bağlı hatırlatıcısını silmek istediğinize emin misiniz?",
        onConfirm: async () => {
          const block = (editingNote.blocks || []).find(b => b.id === blockId);
          if (block && block.reminderId) {
            const rem = reminders.find(r => r.id === block.reminderId);
            if (rem) {
              await handleCancelReminder(rem);
            }
          }
          handleDeleteBlock(blockId);
        }
      });
    } else {
      handleDeleteBlock(blockId);
    }
  };

  const handleDeleteBillBlock = handleDeleteBillWidget;
  const handlePayBill = handleMarkBillAsPaid;

  return {
    handleSaveBillWidget,
    handleMarkBillAsPaid,
    handleDeleteBillWidget,
    handleDeleteBillBlock,
    handlePayBill,
    calculateNextBillDate,
  };
};

export default useBillWidget;

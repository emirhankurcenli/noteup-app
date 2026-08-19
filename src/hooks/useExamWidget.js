import { triggerHaptic } from '../services/haptics';
import { sanitizeSingleLine } from '../utils/securityUtils';

export const useExamWidget = ({
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

    const granted = typeof checkAndRequestNotificationPermission === 'function' ? await checkAndRequestNotificationPermission() : true;
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
    handleSaveExamWidget,
    handleDeleteExamBlock,
  };
};

export default useExamWidget;

import { parseTurkishMoneyToFloat } from '../utils/money';
import useBillExamWidgets from './useBillExamWidgets';
import useExpenseWidget from './useExpenseWidget';
import { sanitizeSingleLine, sanitizeMoneyInput } from '../utils/securityUtils';

const useWidgetHandlers = ({
  editingNote,
  notes,
  userPlan,
  focusedBlockRef,
  blockFormStates,
  setBlockFormStates,
  reminders,
  handleUpdateNote,
  handleUpdateBlock,
  handleDeleteBlock,
  showCustomConfirm,
  setToast,
  setShowPaywall,
  setShowEditorMenu,
  trackAttachmentAdded,
  checkAndRequestNotificationPermission,
  handleCancelReminder,
  saveReminders,
  scheduleNotification,
  triggerHaptic,
  t,
}) => {

  const billExamHandlers = useBillExamWidgets({
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
  });

  const expenseHandlers = useExpenseWidget({
    editingNote,
    handleUpdateBlock,
    blockFormStates,
    setBlockFormStates,
    triggerHaptic,
  });

  // Insert a widget at the cursor position of the currently focused text block
  const handleInsertWidget = (type, blockData = {}, extraBlocks = []) => {
    if (!editingNote) return;
    setShowEditorMenu(false);

    // Enforce Password Kasası Limiti (Lite: max 5 passwords)
    if (type === 'password' && userPlan === 'lite') {
      let totalPasswords = 0;
      (notes || []).forEach(n => {
        (n.blocks || []).forEach(b => {
          if (b && b.type === 'password') totalPasswords++;
        });
      });
      if (totalPasswords >= 5) {
        setToast({
          title: "⚠️ Not Şifreleme Sınırı",
          msg: "NoteUp Lite planında en fazla 5 not şifreleyebilirsiniz. Sınırsız not şifreleme için Pro'ya geçin."
        });
        setShowPaywall(true);
        return;
      }
    }

    trackAttachmentAdded();
    const blocks = editingNote.blocks || [];
    const { id: focusedId } = focusedBlockRef.current || {};

    const newWidget = {
      id: 'b-' + Date.now(),
      type,
      ...blockData
    };
    const widgetGroup = [newWidget, ...(Array.isArray(extraBlocks) ? extraBlocks : [])];
    const newTextAfterBlock = { id: 'b-' + (Date.now() + 2), type: 'text', content: '' };

    const focusedIdx = blocks.findIndex(b => b.id === focusedId);
    const focusedBlock = focusedIdx >= 0 ? blocks[focusedIdx] : null;

    if (!focusedBlock) {
      // 1. Odak yoksa -> En son bloğun hemen altına ekle
      const lastBlock = blocks[blocks.length - 1];
      if (lastBlock && lastBlock.type === 'text' && (lastBlock.content || '').replace(/<[^>]*>/g, '').trim() === '') {
        const updated = [...blocks.slice(0, -1), ...widgetGroup, newTextAfterBlock];
        handleUpdateNote('blocks', updated, true);
      } else {
        handleUpdateNote('blocks', [...blocks, ...widgetGroup, newTextAfterBlock], true);
      }
      return newWidget.id;
    }

    if (focusedBlock.type !== 'text') {
      // 2. Odak zaten bir widget üzerindeyse -> O widget'ın altına ekle
      const updated = [...blocks];
      updated.splice(focusedIdx + 1, 0, ...widgetGroup, newTextAfterBlock);
      handleUpdateNote('blocks', updated, true);
      return newWidget.id;
    }

    // 3. Odak bir metin bloğu üzerindeyse:
    const plainText = (focusedBlock.content || '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
    const isTextEmpty = plainText === '';

    let replacementBlocks = [];
    if (isTextEmpty) {
      // İmlecin olduğu yerde metin YOKSA -> O boş bloğun yerine eklentiyi koy
      replacementBlocks = [...widgetGroup, newTextAfterBlock];
    } else {
      // İmlecin olduğu yerde metin VARSA -> Metin üstte kalsın, eklenti BİR ALTINA geçsin
      replacementBlocks = [focusedBlock, ...widgetGroup, newTextAfterBlock];
    }

    const updated = [...blocks];
    updated.splice(focusedIdx, 1, ...replacementBlocks);
    handleUpdateNote('blocks', updated, true);

    if (type === 'password') {
      setTimeout(() => {
        const el = document.getElementById(`password-title-${newWidget.id}`);
        if (el) el.focus();
      }, 120);
    }
    if (type === 'parking') {
      setTimeout(() => {
        const el = document.getElementById(`parking-note-${newWidget.id}`);
        if (el) el.focus();
      }, 120);
    }
    return newWidget.id;
  };

  const handleAddDebtItem = (blockId) => {
    const fs = blockFormStates[blockId] || {};
    if (!fs.amount) return;
    const cleanAmountStr = sanitizeMoneyInput(fs.amount);
    const amountVal = parseTurkishMoneyToFloat(cleanAmountStr);
    const signedAmount = fs.direction === 'minus' ? -amountVal : amountVal;
    const block = (editingNote.blocks || []).find(b => b.id === blockId);
    const cleanNoteText = sanitizeSingleLine(fs.noteText || '', 100);
    const newItem = { id: 'd-' + Date.now(), name: block?.label || '', note: cleanNoteText, amount: signedAmount, createdAt: Date.now() };
    const updatedItems = [...(block?.items || []), newItem];
    handleUpdateBlock(blockId, { items: updatedItems });
    setBlockFormStates(prev => ({ ...prev, [blockId]: { ...prev[blockId], amount: '', noteText: '', open: false } }));
  };

  const handleDeleteDebtItem = (blockId, itemId) => {
    const block = (editingNote.blocks || []).find(b => b.id === blockId);
    const updatedItems = (block?.items || []).filter(i => i.id !== itemId);
    handleUpdateBlock(blockId, { items: updatedItems });
  };

  return {
    handleInsertWidget,
    handleAddDebtItem,
    handleDeleteDebtItem,
    handleAddExpenseItem: expenseHandlers.handleAddExpenseItem,
    handleDeleteExpenseItem: expenseHandlers.handleDeleteExpenseItem,
    handleExpenseTitleChange: expenseHandlers.handleExpenseTitleChange,
    handleSaveBillWidget: billExamHandlers.handleSaveBillWidget,
    handleDeleteBillBlock: billExamHandlers.handleDeleteBillBlock,
    handlePayBill: billExamHandlers.handlePayBill,
    handleDeleteBillPaymentItem: billExamHandlers.handleDeleteBillPaymentItem,
    handleSaveExamWidget: billExamHandlers.handleSaveExamWidget,
    handleDeleteExamBlock: billExamHandlers.handleDeleteExamBlock,
  };
};

export default useWidgetHandlers;

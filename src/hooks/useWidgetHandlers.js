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
    const { id: focusedId, pos: cursorPos } = focusedBlockRef.current;

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
      const lastBlock = blocks[blocks.length - 1];
      if (lastBlock && lastBlock.type === 'text' && (lastBlock.content || '').trim() === '') {
        const updated = [...blocks.slice(0, -1), ...widgetGroup, newTextAfterBlock];
        handleUpdateNote('blocks', updated, true);
      } else {
        handleUpdateNote('blocks', [...blocks, ...widgetGroup, newTextAfterBlock], true);
      }
      return newWidget.id;
    }

    if (focusedBlock.type !== 'text') {
      const updated = [...blocks];
      updated.splice(focusedIdx + 1, 0, ...widgetGroup);
      handleUpdateNote('blocks', updated, true);
      return newWidget.id;
    }

    const text = focusedBlock.content || '';
    const pos = Math.min(cursorPos, text.length);

    let textBefore = text.substring(0, pos);
    let textAfter = text.substring(pos);

    if (textBefore.endsWith('\n')) {
      textBefore = textBefore.substring(0, textBefore.length - 1);
    }
    if (textAfter.startsWith('\n')) {
      textAfter = textAfter.substring(1);
    }

    const isBeforeEmpty = textBefore.trim() === '';
    const isAfterEmpty = textAfter.trim() === '';

    let replacementBlocks = [];

    if (isBeforeEmpty && isAfterEmpty) {
      replacementBlocks = [...widgetGroup, newTextAfterBlock];
    } else if (isBeforeEmpty && !isAfterEmpty) {
      const updatedAfter = { ...focusedBlock, content: textAfter };
      replacementBlocks = [...widgetGroup, updatedAfter];
    } else if (!isBeforeEmpty && isAfterEmpty) {
      const updatedFocused = { ...focusedBlock, content: textBefore };
      replacementBlocks = [updatedFocused, ...widgetGroup, newTextAfterBlock];
    } else {
      const updatedFocused = { ...focusedBlock, content: textBefore };
      const updatedAfter = { ...newTextAfterBlock, content: textAfter };
      replacementBlocks = [updatedFocused, ...widgetGroup, updatedAfter];
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
    handleSaveExamWidget: billExamHandlers.handleSaveExamWidget,
    handleDeleteExamBlock: billExamHandlers.handleDeleteExamBlock,
  };
};

export default useWidgetHandlers;

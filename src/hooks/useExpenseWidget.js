import { sanitizeSingleLine, sanitizeMoneyInput } from '../utils/securityUtils';
import { parseTurkishMoneyToFloat } from '../utils/money';

export const formatExpenseDate = (timestamp = Date.now()) => {
  const d = new Date(timestamp);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}.${month}.${year} - ${hours}:${minutes}`;
};

const useExpenseWidget = ({
  editingNote,
  handleUpdateBlock,
  blockFormStates,
  setBlockFormStates,
  triggerHaptic,
}) => {
  const handleAddExpenseItem = (blockId) => {
    const fs = blockFormStates[blockId] || {};
    const rawDesc = (fs.expenseName !== undefined ? fs.expenseName : (fs.description || fs.name || fs.noteText || '')).trim();
    const rawAmountStr = fs.expenseAmount !== undefined ? fs.expenseAmount : (fs.amount || '');

    const cleanAmountStr = sanitizeMoneyInput(rawAmountStr || '0');
    const amountVal = parseTurkishMoneyToFloat(cleanAmountStr);
    
    if (amountVal <= 0 && !rawDesc) return;

    const cleanDesc = sanitizeSingleLine(rawDesc || 'Harcama', 100);

    if (triggerHaptic) triggerHaptic('light');

    const block = (editingNote?.blocks || []).find(b => b.id === blockId);
    const now = Date.now();
    const newItem = {
      id: 'exp-' + now,
      name: cleanDesc,
      description: cleanDesc,
      amount: amountVal,
      dateStr: formatExpenseDate(now),
      createdAt: now,
    };

    const updatedItems = [newItem, ...(block?.items || [])];
    handleUpdateBlock(blockId, { items: updatedItems });

    setBlockFormStates(prev => ({
      ...prev,
      [blockId]: {
        ...prev[blockId],
        amount: '',
        description: '',
        expenseAmount: '',
        expenseName: ''
      }
    }));
  };

  const handleDeleteExpenseItem = (blockId, itemIdOrIdx) => {
    if (triggerHaptic) triggerHaptic('warning');
    const block = (editingNote?.blocks || []).find(b => b.id === blockId);
    const updatedItems = (block?.items || []).filter((i, idx) => i.id !== itemIdOrIdx && idx !== itemIdOrIdx);
    handleUpdateBlock(blockId, { items: updatedItems });
  };

  const handleExpenseTitleChange = (blockId, title) => {
    handleUpdateBlock(blockId, { title });
  };

  return {
    handleAddExpenseItem,
    handleDeleteExpenseItem,
    handleExpenseTitleChange,
  };
};

export default useExpenseWidget;

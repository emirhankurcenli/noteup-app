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
    if (!fs.amount && !fs.description) return;
    
    const cleanDesc = sanitizeSingleLine(fs.description || 'Gider', 100);
    const cleanAmountStr = sanitizeMoneyInput(fs.amount || '0');
    const amountVal = parseTurkishMoneyToFloat(cleanAmountStr);
    
    if (amountVal <= 0 && !fs.description) return;

    if (triggerHaptic) triggerHaptic('light');

    const block = (editingNote?.blocks || []).find(b => b.id === blockId);
    const now = Date.now();
    const newItem = {
      id: 'exp-' + now,
      description: cleanDesc,
      amount: amountVal,
      dateStr: formatExpenseDate(now),
      createdAt: now,
    };

    const updatedItems = [newItem, ...(block?.items || [])];
    handleUpdateBlock(blockId, { items: updatedItems });

    setBlockFormStates(prev => ({
      ...prev,
      [blockId]: { ...prev[blockId], amount: '', description: '' }
    }));
  };

  const handleDeleteExpenseItem = (blockId, itemId) => {
    if (triggerHaptic) triggerHaptic('warning');
    const block = (editingNote?.blocks || []).find(b => b.id === blockId);
    const updatedItems = (block?.items || []).filter(i => i.id !== itemId);
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

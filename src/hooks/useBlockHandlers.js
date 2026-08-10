import { parseTurkishMoneyToFloat } from '../utils/money';
import { triggerConfetti } from '../utils/confettiUtils';

const useBlockHandlers = ({
  editingNote,
  handleUpdateNote,
  handleUpdateBlock,
  blockFormStates,
  setBlockFormStates,
}) => {
  const updateBlockForm = (blockId, patch) => {
    setBlockFormStates(prev => ({ ...prev, [blockId]: { ...(prev[blockId] || { direction: 'plus' }), ...patch } }));
  };

  // --- TODO BLOCK OPERATIONS ---
  const handleTodoTitleChange = (blockId, newTitle) => {
    if (!editingNote) return;
    const updatedBlocks = (editingNote.blocks || []).map(b =>
      b.id === blockId ? { ...b, title: newTitle } : b
    );
    handleUpdateNote('blocks', updatedBlocks);
  };

  const handleAddTodoItem = (blockId) => {
    const fs = blockFormStates[blockId] || {};
    if (!fs.todoInput?.trim()) return;
    const block = (editingNote.blocks || []).find(b => b.id === blockId);
    const newItem = { id: 't-' + Date.now(), text: fs.todoInput.trim(), done: false };
    handleUpdateBlock(blockId, { items: [...(block?.items || []), newItem] });
    setBlockFormStates(prev => ({ ...prev, [blockId]: { ...prev[blockId], todoInput: '' } }));
  };

  const handleToggleTodoItem = (blockId, itemId) => {
    const block = (editingNote.blocks || []).find(b => b.id === blockId);
    const oldDoneCount = (block?.items || []).filter(i => i.done).length;
    const total = (block?.items || []).length;

    const updatedItems = (block?.items || []).map(i => i.id === itemId ? { ...i, done: !i.done } : i);
    const newDoneCount = updatedItems.filter(i => i.done).length;

    if (total > 0 && newDoneCount === total && oldDoneCount < total) {
      setTimeout(() => triggerConfetti(blockId), 50);
    }

    handleUpdateBlock(blockId, { items: updatedItems });
  };

  const handleDeleteTodoItem = (blockId, itemId) => {
    const block = (editingNote.blocks || []).find(b => b.id === blockId);
    const updatedItems = (block?.items || []).filter(i => i.id !== itemId);
    handleUpdateBlock(blockId, { items: updatedItems });
  };

  // --- SPLIT BLOCK OPERATIONS ---
  const handleSetupSplit = (blockId) => {
    const fs = blockFormStates[blockId] || {};
    const inputs = fs.splitNameInputs || ['', ''];
    const participants = inputs.map(s => s.trim()).filter(Boolean);
    if (participants.length < 2) return;
    handleUpdateBlock(blockId, { participants, expenses: [] });
    setBlockFormStates(prev => ({ ...prev, [blockId]: { ...prev[blockId], splitSetupDone: true } }));
  };

  const handleAddSplitExpense = (blockId) => {
    const fs = blockFormStates[blockId] || {};
    const block = (editingNote?.blocks || []).find(b => b.id === blockId);
    const amount = parseTurkishMoneyToFloat(fs.splitAmount);
    if (!amount || !fs.splitPaidBy || !fs.splitAmong?.length) return;
    const newExp = {
      id: 'e-' + Date.now(),
      desc: fs.splitDesc || '',
      amount,
      paidBy: fs.splitPaidBy,
      among: fs.splitAmong,
    };
    handleUpdateBlock(blockId, { expenses: [...(block?.expenses || []), newExp] });
    setBlockFormStates(prev => ({
      ...prev,
      [blockId]: { ...prev[blockId], splitAmount: '', splitDesc: '', splitAmong: [], splitShowForm: false }
    }));
  };

  const handleDeleteSplitExpense = (blockId, expId) => {
    const block = (editingNote?.blocks || []).find(b => b.id === blockId);
    handleUpdateBlock(blockId, { expenses: (block?.expenses || []).filter(e => e.id !== expId) });
  };

  return {
    updateBlockForm,
    handleTodoTitleChange,
    handleAddTodoItem,
    handleToggleTodoItem,
    handleDeleteTodoItem,
    handleSetupSplit,
    handleAddSplitExpense,
    handleDeleteSplitExpense,
  };
};

export default useBlockHandlers;

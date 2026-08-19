import React from 'react';
import DebtWidget from '../widgets/DebtWidget';
import TodoWidget from '../widgets/TodoWidget';
import SplitWidget from '../widgets/SplitWidget';
import BillWidget from '../widgets/BillWidget';
import PasswordWidget from '../widgets/PasswordWidget';
import ParkingWidget from '../widgets/ParkingWidget';
import ExamWidget from '../widgets/ExamWidget';
import ExpenseWidget from '../widgets/ExpenseWidget';

export const WidgetBlock = ({
  block,
  idx,
  theme,
  handleDeleteBlock,
  blockFormStates,
  updateBlockForm,
  handleAddDebtItem,
  handleDeleteDebtItem,
  handleAddExpenseItem,
  handleDeleteExpenseItem,
  handleExpenseTitleChange,
  handleTodoTitleChange,
  activeTodoItemId,
  setActiveTodoItemId,
  handleToggleTodoItem,
  handleDeleteTodoItem,
  handleAddTodoItem,
  handleSetupSplit,
  handleAddSplitExpense,
  handleDeleteSplitExpense,
  triggerHaptic,
  setToast,
  handleDeleteExamBlock,
  checkAndRequestNotificationPermission,
  setQuickReminderTitle,
  setQuickReminderTime,
  setPendingWidgetAlarmCtx,
  reminders,
  now,
  handleDeleteBillBlock,
  handlePayBill,
  vaultUnlocked,
  setVaultUnlocked,
  requestBiometricAuth,
  checkAndRequestPermission,
  showPermissionDialog,
}) => {
  switch (block.widgetType) {
    case 'todo':
      return (
        <TodoWidget
          block={block}
          blockFormStates={blockFormStates}
          updateBlockForm={updateBlockForm}
          handleTodoTitleChange={handleTodoTitleChange}
          activeTodoItemId={activeTodoItemId}
          setActiveTodoItemId={setActiveTodoItemId}
          handleToggleTodoItem={handleToggleTodoItem}
          handleDeleteTodoItem={handleDeleteTodoItem}
          handleAddTodoItem={handleAddTodoItem}
          onDeleteBlock={() => handleDeleteBlock(block.id)}
          triggerHaptic={triggerHaptic}
        />
      );
    case 'debt':
      return (
        <DebtWidget
          block={block}
          blockFormStates={blockFormStates}
          updateBlockForm={updateBlockForm}
          handleAddDebtItem={handleAddDebtItem}
          handleDeleteDebtItem={handleDeleteDebtItem}
          onDeleteBlock={() => handleDeleteBlock(block.id)}
          triggerHaptic={triggerHaptic}
        />
      );
    case 'split':
      return (
        <SplitWidget
          block={block}
          blockFormStates={blockFormStates}
          updateBlockForm={updateBlockForm}
          handleSetupSplit={handleSetupSplit}
          handleAddSplitExpense={handleAddSplitExpense}
          handleDeleteSplitExpense={handleDeleteSplitExpense}
          onDeleteBlock={() => handleDeleteBlock(block.id)}
          triggerHaptic={triggerHaptic}
        />
      );
    case 'bill':
      return (
        <BillWidget
          block={block}
          blockFormStates={blockFormStates}
          updateBlockForm={updateBlockForm}
          onDeleteBlock={() => handleDeleteBillBlock(block.id)}
          handlePayBill={handlePayBill}
          triggerHaptic={triggerHaptic}
        />
      );
    case 'password':
      return (
        <PasswordWidget
          block={block}
          blockFormStates={blockFormStates}
          updateBlockForm={updateBlockForm}
          onDeleteBlock={() => handleDeleteBlock(block.id)}
          triggerHaptic={triggerHaptic}
          vaultUnlocked={vaultUnlocked}
          setVaultUnlocked={setVaultUnlocked}
          requestBiometricAuth={requestBiometricAuth}
        />
      );
    case 'parking':
      return (
        <ParkingWidget
          block={block}
          blockFormStates={blockFormStates}
          updateBlockForm={updateBlockForm}
          onDeleteBlock={() => handleDeleteBlock(block.id)}
          triggerHaptic={triggerHaptic}
        />
      );
    case 'exam':
      return (
        <ExamWidget
          block={block}
          blockFormStates={blockFormStates}
          updateBlockForm={updateBlockForm}
          onDeleteBlock={() => handleDeleteExamBlock(block.id)}
          triggerHaptic={triggerHaptic}
        />
      );
    case 'expense':
      return (
        <ExpenseWidget
          block={block}
          blockFormStates={blockFormStates}
          updateBlockForm={updateBlockForm}
          handleAddExpenseItem={handleAddExpenseItem}
          handleDeleteExpenseItem={handleDeleteExpenseItem}
          handleExpenseTitleChange={handleExpenseTitleChange}
          onDeleteBlock={() => handleDeleteBlock(block.id)}
          triggerHaptic={triggerHaptic}
        />
      );
    default:
      return null;
  }
};

export default WidgetBlock;

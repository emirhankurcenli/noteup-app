import React from 'react';
import DebtWidget from '@features/widgets/components/DebtWidget';
import TodoWidget from '@features/widgets/components/TodoWidget';
import SplitWidget from '@features/widgets/components/SplitWidget';
import BillWidget from '@features/widgets/components/BillWidget';
import PasswordWidget from '@features/widgets/components/PasswordWidget';
import ParkingWidget from '@features/widgets/components/ParkingWidget';
import ExamWidget from '@features/widgets/components/ExamWidget';
import ExpenseWidget from '@features/widgets/components/ExpenseWidget';

export const WidgetBlock = ({
  block,
  idx,
  theme,
  t,
  lang,
  editingNote,
  handleUpdateBlock,
  handleDeleteBlock,
  blockFormStates = {},
  setBlockFormStates,
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
  handleDeleteBillPaymentItem,
  vaultUnlocked,
  setVaultUnlocked,
  requestBiometricAuth,
  checkAndRequestPermission,
  showPermissionDialog,
}) => {
  switch (block.type) {
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
          handleDeleteBlock={handleDeleteBlock}
          onDeleteBlock={() => handleDeleteBlock?.(block.id)}
          handleUpdateBlock={handleUpdateBlock}
          triggerHaptic={triggerHaptic}
          theme={theme}
          t={t}
          lang={lang}
        />
      );
    case 'debt':
      return (
        <DebtWidget
          block={block}
          blockFormStates={blockFormStates}
          updateBlockForm={updateBlockForm}
          handleUpdateBlock={handleUpdateBlock}
          handleDeleteBlock={handleDeleteBlock}
          onDeleteBlock={() => handleDeleteBlock?.(block.id)}
          handleAddDebtItem={handleAddDebtItem}
          handleDeleteDebtItem={handleDeleteDebtItem}
          triggerHaptic={triggerHaptic}
          theme={theme}
          t={t}
          lang={lang}
        />
      );
    case 'split':
      return (
        <SplitWidget
          block={block}
          blockFormStates={blockFormStates}
          setBlockFormStates={setBlockFormStates}
          updateBlockForm={updateBlockForm}
          handleSetupSplit={handleSetupSplit}
          handleAddSplitExpense={handleAddSplitExpense}
          handleDeleteSplitExpense={handleDeleteSplitExpense}
          handleDeleteBlock={handleDeleteBlock}
          onDeleteBlock={() => handleDeleteBlock?.(block.id)}
          triggerHaptic={triggerHaptic}
          theme={theme}
          t={t}
          lang={lang}
        />
      );
    case 'bill':
      return (
        <BillWidget
          block={block}
          blockFormStates={blockFormStates}
          updateBlockForm={updateBlockForm}
          handleDeleteBillBlock={handleDeleteBillBlock}
          onDeleteBlock={() => handleDeleteBillBlock?.(block.id)}
          checkAndRequestNotificationPermission={checkAndRequestNotificationPermission}
          setToast={setToast}
          setQuickReminderTitle={setQuickReminderTitle}
          setQuickReminderTime={setQuickReminderTime}
          setPendingWidgetAlarmCtx={setPendingWidgetAlarmCtx}
          handlePayBill={handlePayBill}
          handleDeleteBillPaymentItem={handleDeleteBillPaymentItem}
          handleUpdateBlock={handleUpdateBlock}
          editingNote={editingNote}
          now={now}
          reminders={reminders}
          triggerHaptic={triggerHaptic}
          theme={theme}
          t={t}
          lang={lang}
        />
      );
    case 'password':
      return (
        <PasswordWidget
          block={block}
          blockFormStates={blockFormStates}
          updateBlockForm={updateBlockForm}
          handleUpdateBlock={handleUpdateBlock}
          handleDeleteBlock={handleDeleteBlock}
          onDeleteBlock={() => handleDeleteBlock?.(block.id)}
          triggerHaptic={triggerHaptic}
          vaultUnlocked={vaultUnlocked}
          setVaultUnlocked={setVaultUnlocked}
          requestBiometricAuth={requestBiometricAuth}
          theme={theme}
          t={t}
          lang={lang}
        />
      );
    case 'parking':
      return (
        <ParkingWidget
          block={block}
          blockFormStates={blockFormStates}
          updateBlockForm={updateBlockForm}
          handleUpdateBlock={handleUpdateBlock}
          handleDeleteBlock={handleDeleteBlock}
          onDeleteBlock={() => handleDeleteBlock?.(block.id)}
          triggerHaptic={triggerHaptic}
          setToast={setToast}
          checkAndRequestPermission={checkAndRequestPermission}
          showPermissionDialog={showPermissionDialog}
          theme={theme}
          t={t}
          lang={lang}
        />
      );
    case 'exam':
      return (
        <ExamWidget
          block={block}
          blockFormStates={blockFormStates}
          updateBlockForm={updateBlockForm}
          handleDeleteExamBlock={handleDeleteExamBlock}
          onDeleteBlock={() => handleDeleteExamBlock?.(block.id)}
          checkAndRequestNotificationPermission={checkAndRequestNotificationPermission}
          setToast={setToast}
          setQuickReminderTitle={setQuickReminderTitle}
          setQuickReminderTime={setQuickReminderTime}
          setPendingWidgetAlarmCtx={setPendingWidgetAlarmCtx}
          reminders={reminders}
          editingNote={editingNote}
          now={now}
          triggerHaptic={triggerHaptic}
          theme={theme}
          t={t}
          lang={lang}
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
          handleDeleteBlock={handleDeleteBlock}
          onDeleteBlock={() => handleDeleteBlock?.(block.id)}
          handleUpdateBlock={handleUpdateBlock}
          triggerHaptic={triggerHaptic}
          theme={theme}
          t={t}
          lang={lang}
        />
      );
    default:
      return null;
  }
};

export default WidgetBlock;

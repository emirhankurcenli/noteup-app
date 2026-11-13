import React, { useState, useMemo } from 'react';
import { formatTurkishMoneyDisplay, formatTurkishMoneyInput } from '@shared/utils/money';
import ExpenseDetailModal from '@shared/components/ExpenseDetailModal';
import { ExpenseFormInput } from './expense/ExpenseFormInput';
import { ExpenseListTable } from './expense/ExpenseListTable';

const ExpenseWidget = ({
  block,
  blockFormStates,
  updateBlockForm,
  handleExpenseTitleChange,
  handleAddExpenseItem,
  handleDeleteExpenseItem,
  handleDeleteBlock,
  handleUpdateBlock,
  triggerHaptic,
  theme,
  t,
  lang = 'tr',
}) => {
  const isLight = theme === 'light';
  const [showDetailModal, setShowDetailModal] = useState(false);
  const fs = blockFormStates[block.id] || {};
  const items = block.items || [];
  const total = useMemo(() => items.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0), [items]);

  const getTr = (key, fallback) => {
    if (typeof t === 'function') {
      const val = t(key);
      if (val && val !== key) return val;
    }
    return fallback;
  };

  const onDeleteBlock = () => {
    if (triggerHaptic) triggerHaptic('warning');
    handleDeleteBlock(block.id);
  };

  const onAddItem = (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    handleAddExpenseItem(block.id);
  };

  return (
    <div 
      className="expense-widget"
      style={{
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        background: 'var(--bg-card)',
        padding: '16px'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="expense-widget-header" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <div 
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '9px',
            background: 'rgba(244, 63, 94, 0.14)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#F43F5E',
            flexShrink: 0,
          }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
            <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
            <path d="M18 12a2 2 0 0 0 0 4h3v-4z" />
          </svg>
        </div>

        <div style={{ flex: 1, overflow: 'hidden' }}>
          <input
            type="text"
            value={block.title || ''}
            placeholder={getTr('expenseTracking', lang === 'tr' ? 'Gider Takibi' : 'Expense Tracker')}
            onChange={(e) => handleExpenseTitleChange(block.id, e.target.value)}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.94rem',
              fontWeight: 700,
              fontFamily: 'var(--font-family)',
              width: '100%',
              minWidth: 0,
              cursor: 'text',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* Total Badge */}
          {total > 0 && (
            <div 
              style={{
                fontSize: '0.76rem',
                fontWeight: 600,
                color: '#F43F5E',
                background: 'rgba(244, 63, 94, 0.1)',
                border: '1px solid rgba(244, 63, 94, 0.2)',
                padding: '3px 9px',
                borderRadius: '10px',
                whiteSpace: 'nowrap'
              }}
            >
              {formatTurkishMoneyDisplay(total)}
            </div>
          )}

          <button
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: 'none',
              color: '#EF4444',
              cursor: 'pointer',
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
            onClick={onDeleteBlock}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Input Form Row */}
      <ExpenseFormInput
        blockId={block.id}
        fs={fs}
        updateBlockForm={updateBlockForm}
        onAddItem={onAddItem}
      />

      {/* Expense List Table */}
      <ExpenseListTable
        items={items}
        blockId={block.id}
        handleDeleteExpenseItem={handleDeleteExpenseItem}
      />

      {/* Detail Footer Button */}
      {items.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
          <button
            onClick={() => {
              if (triggerHaptic) triggerHaptic('light');
              setShowDetailModal(true);
            }}
            style={{
              background: 'rgba(244, 63, 94, 0.08)',
              border: '1px solid rgba(244, 63, 94, 0.2)',
              color: '#F43F5E',
              padding: '6px 12px',
              borderRadius: '10px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              transition: 'all 0.15s ease'
            }}
          >
            <span>{getTr('debtSeeAllDetails', lang === 'tr' ? 'Tüm Detayları Gör' : 'See All Details')} ({items.length})</span>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      )}

      {/* Expense History Detail Modal */}
      <ExpenseDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        block={block}
        onDeleteItem={handleDeleteExpenseItem}
        triggerHaptic={triggerHaptic}
        theme={theme}
      />
    </div>
  );
};

export default React.memo(ExpenseWidget);

import React, { useState } from 'react';
import { formatTurkishMoneyDisplay, formatTurkishMoneyInput } from '../../../../utils/money';
import ExpenseDetailModal from '../../../modals/ExpenseDetailModal';
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
}) => {
  const isLight = theme === 'light';
  const [showDetailModal, setShowDetailModal] = useState(false);
  const fs = blockFormStates[block.id] || {};
  const items = block.items || [];
  const total = items.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const onDeleteBlock = () => {
    if (triggerHaptic) triggerHaptic('warning');
    handleDeleteBlock(block.id);
  };

  const onAddItem = (e) => {
    e.preventDefault();
    handleAddExpenseItem(block.id);
  };

  const isSetupForm = block.setupDone !== undefined ? !block.setupDone : (items.length === 0 && !block.title);

  if (isSetupForm) {
    return (
      <div 
        className="expense-widget animate-fade-in"
        style={{
          borderRadius: '18px',
          border: '1.5px solid rgba(244, 63, 94, 0.35)',
          background: 'var(--bg-card)',
          padding: '16px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Setup Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <div 
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '11px',
              background: 'linear-gradient(135deg, #F43F5E 0%, #E11D48 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              flexShrink: 0,
              boxShadow: '0 3px 10px rgba(244, 63, 94, 0.38)'
            }}
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
              <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
              <path d="M18 12a2 2 0 0 0 0 4h3v-4z" />
            </svg>
          </div>

          <span style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--text-primary)' }}>
            Gider Takibi
          </span>

          <button
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: 'none',
              color: '#EF4444',
              cursor: 'pointer',
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginLeft: 'auto'
            }}
            onClick={onDeleteBlock}
            title="Bloğu Sil"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Info Hint Box */}
        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', background: 'rgba(244, 63, 94, 0.08)', border: '1px solid rgba(244, 63, 94, 0.15)', borderRadius: '12px', padding: '10px 12px', lineHeight: 1.5, display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '14px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F43F5E" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <span>Günlük harcamalarınızı ve giderlerinizi tutarlarıyla birlikte düzenli olarak takip edin.</span>
        </div>

        {/* Setup Action Button */}
        <button
          type="button"
          className="btn-primary"
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '0.92rem',
            fontWeight: 800,
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #F43F5E, #E11D48)',
            border: 'none',
            color: '#FFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 4px 14px rgba(244, 63, 94, 0.35)',
            cursor: 'pointer'
          }}
          onClick={() => {
            if (triggerHaptic) triggerHaptic('success');
            if (typeof handleUpdateBlock === 'function') {
              handleUpdateBlock(block.id, { setupDone: true });
            } else {
              updateBlockForm(block.id, { setupDone: true });
            }
          }}
        >
          <span>✓ Gider Takibine Başla</span>
        </button>
      </div>
    );
  }

  return (
    <div 
      className="expense-widget"
      style={{
        borderRadius: '18px',
        border: '1px solid var(--border-color)',
        background: 'var(--bg-card)',
        padding: '16px'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="expense-widget-header" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
        <div 
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '11px',
            background: isLight ? 'linear-gradient(135deg, #F43F5E 0%, #E11D48 100%)' : 'rgba(244, 63, 94, 0.18)',
            border: isLight ? 'none' : '1px solid rgba(244, 63, 94, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isLight ? '#FFFFFF' : '#FB7185',
            flexShrink: 0,
            boxShadow: isLight ? '0 3px 10px rgba(244, 63, 94, 0.38)' : 'none'
          }}
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
            <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
            <path d="M18 12a2 2 0 0 0 0 4h3v-4z" />
          </svg>
        </div>

        <div style={{ flex: 1, overflow: 'hidden' }}>
          <input
            type="text"
            value={block.title || ''}
            placeholder="Gider Takibi"
            onChange={(e) => handleExpenseTitleChange(block.id, e.target.value)}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.95rem',
              fontWeight: 800,
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
                fontSize: '0.78rem',
                fontWeight: 800,
                color: '#F43F5E',
                background: 'rgba(244, 63, 94, 0.1)',
                border: '1px solid rgba(244, 63, 94, 0.2)',
                padding: '3px 10px',
                borderRadius: '12px',
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
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
            onClick={onDeleteBlock}
            title="Bloğu Sil"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
              padding: '6px 14px',
              borderRadius: '10px',
              fontSize: '0.8rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
          >
            <span>Tüm Detayları Gör ({items.length})</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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

export default ExpenseWidget;

import React from 'react';
import { formatTurkishMoneyInput } from '@shared/utils/money';

export const ExpenseFormInput = ({
  blockId,
  fs,
  updateBlockForm,
  onAddItem,
}) => {
  return (
    <form
      onSubmit={onAddItem}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        margin: '10px 0',
        background: 'var(--bg-tertiary)',
        padding: '10px',
        borderRadius: '14px',
        border: '1px solid var(--border-color)',
      }}
    >
      <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
        <input
          type="text"
          placeholder="Harcama açıklaması..."
          value={fs.expenseName || ''}
          onChange={(e) => updateBlockForm(blockId, { expenseName: e.target.value })}
          style={{
            flex: 1,
            minWidth: 0,
            padding: '9px 12px',
            borderRadius: '10px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            fontSize: '0.85rem',
            fontWeight: 500,
            outline: 'none',
          }}
        />
        <input
          type="text"
          inputMode="decimal"
          placeholder="Tutar (₺)"
          value={fs.expenseAmount || ''}
          onChange={(e) => updateBlockForm(blockId, { expenseAmount: formatTurkishMoneyInput(e.target.value) })}
          style={{
            width: '100px',
            minWidth: '85px',
            flexShrink: 0,
            padding: '9px 12px',
            borderRadius: '10px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            fontSize: '0.85rem',
            fontWeight: 600,
            outline: 'none',
            textAlign: 'right',
          }}
        />
      </div>

      <button
        type="submit"
        style={{
          width: '100%',
          padding: '9px 16px',
          borderRadius: '10px',
          background: '#F43F5E',
          border: 'none',
          color: '#FFF',
          fontWeight: 600,
          fontSize: '0.84rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        <span>Harcama Ekle</span>
      </button>
    </form>
  );
};

export default ExpenseFormInput;

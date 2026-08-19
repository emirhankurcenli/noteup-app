import React from 'react';
import { formatTurkishMoneyInput } from '../../../../../utils/money';

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
        gap: '8px',
        margin: '12px 0',
      }}
    >
      <input
        type="text"
        placeholder="Harcama açıklaması..."
        value={fs.expenseName || ''}
        onChange={(e) => updateBlockForm(blockId, { expenseName: e.target.value })}
        style={{
          flex: 2,
          padding: '10px 12px',
          borderRadius: '12px',
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border-color)',
          color: 'var(--text-primary)',
          fontSize: '0.85rem',
          fontWeight: 600,
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
          flex: 1,
          padding: '10px 12px',
          borderRadius: '12px',
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border-color)',
          color: 'var(--text-primary)',
          fontSize: '0.85rem',
          fontWeight: 700,
          outline: 'none',
        }}
      />
      <button
        type="submit"
        style={{
          padding: '10px 16px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #F43F5E, #E11D48)',
          border: 'none',
          color: '#FFF',
          fontWeight: 800,
          fontSize: '0.85rem',
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        Ekle
      </button>
    </form>
  );
};

export default ExpenseFormInput;

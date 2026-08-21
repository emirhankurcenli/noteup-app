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
            width: '100px',
            minWidth: '85px',
            flexShrink: 0,
            padding: '9px 12px',
            borderRadius: '10px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            fontSize: '0.85rem',
            fontWeight: 700,
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
          background: 'linear-gradient(135deg, #F43F5E, #E11D48)',
          border: 'none',
          color: '#FFF',
          fontWeight: 800,
          fontSize: '0.85rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          boxShadow: '0 2px 8px rgba(244, 63, 94, 0.25)'
        }}
      >
        <span>+ Harcama Ekle</span>
      </button>
    </form>
  );
};

export default ExpenseFormInput;

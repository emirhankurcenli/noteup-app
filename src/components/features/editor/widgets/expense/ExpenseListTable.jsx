import React from 'react';
import { formatTurkishMoneyDisplay } from '../../../../../utils/money';

export const ExpenseListTable = ({ items, blockId, handleDeleteExpenseItem }) => {
  if (!items || items.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', margin: '8px 0' }}>
      {items.map((item, idx) => (
        <div
          key={idx}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            background: 'var(--bg-tertiary)',
            borderRadius: '10px',
            border: '1px solid var(--border-color)',
            fontSize: '0.84rem',
          }}
        >
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.name || 'Harcama'}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontWeight: 800, color: '#F43F5E' }}>
              {formatTurkishMoneyDisplay(item.amount)} TL
            </span>
            <button
              type="button"
              onClick={() => handleDeleteExpenseItem(blockId, item.id || idx)}
              style={{
                background: 'none',
                border: 'none',
                color: '#EF4444',
                cursor: 'pointer',
                fontSize: '0.9rem',
                padding: '4px 6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExpenseListTable;

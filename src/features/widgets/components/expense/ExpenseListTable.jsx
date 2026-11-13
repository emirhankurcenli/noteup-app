import React from 'react';
import { formatTurkishMoneyDisplay } from '@shared/utils/money';

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
          <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{item.name || 'Harcama'}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 600, color: '#F43F5E' }}>
              {formatTurkishMoneyDisplay(item.amount)} TL
            </span>
            <button
              type="button"
              onClick={() => handleDeleteExpenseItem(blockId, item.id || idx)}
              style={{
                background: 'rgba(239, 68, 68, 0.08)',
                border: 'none',
                color: '#EF4444',
                cursor: 'pointer',
                width: '22px',
                height: '22px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExpenseListTable;

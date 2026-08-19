import React from 'react';
import { formatTurkishMoneyDisplay } from '../../../../../utils/money';

export const SplitSettlementTable = ({ settlements, getTr }) => {
  if (!settlements || settlements.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '12px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
        {getTr('splitAllSettled', 'Tüm hesaplar dengede, kimsenin borcu yok.')}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', margin: '10px 0' }}>
      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-secondary)' }}>
        {getTr('splitSettlementTitle', 'Hesaplaşma Özeti')}
      </span>
      {settlements.map((s, idx) => (
        <div
          key={idx}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            background: 'var(--bg-tertiary)',
            borderRadius: '10px',
            fontSize: '0.82rem',
          }}
        >
          <span>
            <strong style={{ color: '#F97316' }}>{s.from}</strong> → <strong>{s.to}</strong>
          </span>
          <span style={{ fontWeight: 800, color: '#10B981' }}>
            {formatTurkishMoneyDisplay(s.amount)} TL
          </span>
        </div>
      ))}
    </div>
  );
};

export default SplitSettlementTable;

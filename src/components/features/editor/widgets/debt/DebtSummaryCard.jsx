import React from 'react';
import { formatTurkishMoneyDisplay } from '../../../../utils/money';

const DebtSummaryCard = ({ netTotal, items = [], isLight, getTr }) => {
  const totalReceive = items.filter(i => (Number(i.amount) || 0) > 0).reduce((acc, i) => acc + Number(i.amount), 0);
  const totalOwe = items.filter(i => (Number(i.amount) || 0) < 0).reduce((acc, i) => acc + Math.abs(Number(i.amount)), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div 
        style={{
          padding: '14px 16px',
          borderRadius: '14px',
          background: netTotal > 0
            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.08))'
            : netTotal < 0
            ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.08))'
            : isLight ? 'rgba(0, 0, 0, 0.03)' : 'rgba(255, 255, 255, 0.04)',
          border: netTotal > 0
            ? '1.5px solid rgba(16, 185, 129, 0.35)'
            : netTotal < 0
            ? '1.5px solid rgba(239, 68, 68, 0.35)'
            : isLight ? '1px solid rgba(0, 0, 0, 0.06)' : '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {netTotal > 0 ? getTr('netReceivable', 'Net Alacak') : netTotal < 0 ? getTr('netPayable', 'Net Borç') : getTr('balanced', 'Dengede')}
          </span>
          <h3 style={{ 
            fontSize: '1.25rem', 
            fontWeight: 900, 
            margin: '2px 0 0 0',
            color: netTotal > 0 ? '#10B981' : netTotal < 0 ? '#EF4444' : 'var(--text-primary)'
          }}>
            {netTotal > 0 ? '+' : ''}{formatTurkishMoneyDisplay(netTotal)} ₺
          </h3>
        </div>

        <div style={{ display: 'flex', gap: '12px', textAlign: 'right' }}>
          <div>
            <span style={{ fontSize: '0.68rem', color: '#10B981', fontWeight: 700, display: 'block' }}>Alacak</span>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: isLight ? '#0F172A' : '#FFF' }}>+{formatTurkishMoneyDisplay(totalReceive)} ₺</span>
          </div>
          <div>
            <span style={{ fontSize: '0.68rem', color: '#EF4444', fontWeight: 700, display: 'block' }}>Borç</span>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: isLight ? '#0F172A' : '#FFF' }}>-{formatTurkishMoneyDisplay(totalOwe)} ₺</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebtSummaryCard;

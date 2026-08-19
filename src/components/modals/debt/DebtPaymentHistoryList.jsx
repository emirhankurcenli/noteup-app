import React from 'react';
import { formatTurkishMoneyDisplay } from '../../../utils/money';

const getItemDateString = (item) => {
  let timeMs = item.createdAt;
  if (!timeMs && item.id && typeof item.id === 'string' && item.id.startsWith('d-')) {
    const parsed = parseInt(item.id.replace('d-', ''), 10);
    if (!isNaN(parsed) && parsed > 1000000000000) {
      timeMs = parsed;
    }
  }
  if (!timeMs) return null;
  const d = new Date(timeMs);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  return `${day}.${month}.${year} ${hours}:${mins}`;
};

const DebtPaymentHistoryList = ({
  filteredItems,
  onDeleteItem,
  triggerHaptic,
  isLight
}) => {
  if (filteredItems.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)' }}>
        <p style={{ margin: 0, fontSize: '0.85rem' }}>İşlem kaydı bulunamadı.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {filteredItems.map(item => {
        const amt = Number(item.amount) || 0;
        const isPositive = amt >= 0;
        const dateStr = getItemDateString(item);

        return (
          <div
            key={item.id}
            style={{
              padding: '12px 14px',
              borderRadius: '12px',
              background: isLight ? '#F8FAFC' : 'rgba(255,255,255,0.04)',
              border: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  color: isPositive ? '#10B981' : '#EF4444'
                }}>
                  {isPositive ? `+${formatTurkishMoneyDisplay(amt)} TL` : `${formatTurkishMoneyDisplay(amt)} TL`}
                </span>
                {dateStr && (
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                    • {dateStr}
                  </span>
                )}
              </div>
              {item.note && (
                <p style={{
                  fontSize: '0.78rem',
                  color: isLight ? '#475569' : '#94A3B8',
                  margin: '2px 0 0 0',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {item.note}
                </p>
              )}
            </div>

            {onDeleteItem && (
              <button
                onClick={() => {
                  if (triggerHaptic) triggerHaptic('light');
                  onDeleteItem(item.id);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: isLight ? '#94A3B8' : 'rgba(255,255,255,0.4)',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Sil"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default DebtPaymentHistoryList;

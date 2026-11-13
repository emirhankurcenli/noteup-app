import React, { useState, useMemo } from 'react';
import { formatTurkishMoneyInput, formatTurkishMoneyDisplay } from '@shared/utils/money';
import DebtDetailModal from '@shared/components/DebtDetailModal';

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

const DebtWidget = ({
  block,
  blockFormStates,
  updateBlockForm,
  handleUpdateBlock,
  handleDeleteBlock,
  handleAddDebtItem,
  handleDeleteDebtItem,
  triggerHaptic,
  theme,
  t
}) => {
  const isLight = theme === 'light';
  const [showDetailModal, setShowDetailModal] = useState(false);
  const fs = blockFormStates[block.id] || { direction: 'plus' };
  const items = block.items || [];
  const netTotal = useMemo(() => (block.items || []).reduce((acc, i) => acc + (Number(i.amount) || 0), 0), [block.items]);
  const isEditing = fs.isEditing || !block.setupDone;

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

  // ── Initial Setup / Edit Form ──────────────────────────────────────────────
  if (isEditing) {
    const currentLabel = fs.tempLabel !== undefined ? fs.tempLabel : (block.label || '');
    return (
      <div 
        className="debt-widget" 
        style={{ 
          borderRadius: '16px', 
          border: '1px solid var(--border-color)', 
          background: 'var(--bg-card)', 
          padding: '16px' 
        }} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <div 
            style={{ 
              width: '32px', 
              height: '32px', 
              borderRadius: '9px', 
              background: 'rgba(16, 185, 129, 0.14)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: '#10B981', 
              flexShrink: 0, 
            }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="6" width="20" height="12" rx="2" />
              <circle cx="12" cy="12" r="2" />
              <path d="M6 12h.01M18 12h.01" />
            </svg>
          </div>

          <span style={{ fontWeight: 700, fontSize: '0.94rem', color: 'var(--text-primary)' }}>
            {getTr('debtTrackerWidget', 'Borç / Alacak Takibi')}
          </span>

          <button 
            type="button"
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
              flexShrink: 0,
              marginLeft: 'auto'
            }}
            onClick={onDeleteBlock}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Setup Form */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            id={`debt-person-${block.id}`}
            type="text"
            className="input-field"
            style={{ flex: 1, padding: '10px 14px', fontSize: '0.88rem', fontWeight: 500, borderRadius: '10px' }}
            placeholder={getTr('debtPersonNamePlaceholder', 'Kişi Adı Girin')}
            value={currentLabel}
            onChange={(e) => updateBlockForm(block.id, { tempLabel: e.target.value })}
          />

          <button 
            type="button"
            className="btn-primary" 
            style={{ 
              padding: '10px 16px', 
              fontSize: '0.86rem', 
              fontWeight: 600, 
              borderRadius: '10px', 
              background: '#10B981',
              border: 'none',
              color: '#FFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: 'none',
              flexShrink: 0
            }}
            onClick={() => {
              if (!currentLabel.trim()) {
                if (triggerHaptic) triggerHaptic('warning');
                const el = document.getElementById(`debt-person-${block.id}`);
                if (el) {
                  el.focus();
                  el.style.borderColor = '#F59E0B';
                  el.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.3)';
                  setTimeout(() => {
                    el.style.borderColor = '';
                    el.style.boxShadow = '';
                  }, 1200);
                }
                return;
              }
              handleUpdateBlock(block.id, { label: currentLabel.trim(), setupDone: true });
              updateBlockForm(block.id, { isEditing: false, tempLabel: undefined });
              if (triggerHaptic) triggerHaptic('success');
            }}
          >
            {getTr('confirmDebtSetup', 'Onayla')}
          </button>
        </div>
      </div>
    );
  }

  // ── Established Widget View (setupDone === true) ───────────────────────────
  return (
    <div 
      className="debt-widget" 
      style={{ 
        borderRadius: '16px', 
        border: '1px solid var(--border-color)', 
        background: 'var(--bg-card)', 
        padding: '16px' 
      }} 
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="debt-widget-header" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <div 
          style={{ 
            width: '32px', 
            height: '32px', 
            borderRadius: '9px', 
            background: 'rgba(16, 185, 129, 0.14)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: '#10B981', 
            flexShrink: 0, 
          }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="6" width="20" height="12" rx="2" />
            <circle cx="12" cy="12" r="2" />
            <path d="M6 12h.01M18 12h.01" />
          </svg>
        </div>

        <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontWeight: 700, fontSize: '0.94rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {block.label || getTr('debtTracking', 'Borç / Alacak')}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
          {/* Net Status Badge */}
          <div 
            style={{
              fontSize: '0.76rem',
              fontWeight: 600,
              color: netTotal >= 0 ? '#10B981' : '#EF4444',
              background: netTotal >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: netTotal >= 0 ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(239, 68, 68, 0.25)',
              padding: '3px 9px',
              borderRadius: '10px',
              whiteSpace: 'nowrap'
            }}
          >
            {netTotal > 0 ? '+' : ''}{formatTurkishMoneyDisplay(netTotal)}
          </div>

          {/* Delete Button */}
          <button 
            type="button"
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

      {/* Add Transaction Form Row */}
      <div className="debt-form" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px', background: isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input 
            type="text" 
            className="input-field" 
            style={{ padding: '8px 12px', fontSize: '0.85rem', fontWeight: 500, flex: 1, borderRadius: '10px' }} 
            placeholder={getTr('debtDescPlaceholder', 'Açıklama')} 
            value={fs.noteText || ''}
            onChange={(e) => updateBlockForm(block.id, { noteText: e.target.value })}
          />
          <input 
            type="text" 
            inputMode="decimal"
            className="input-field" 
            style={{ padding: '8px 12px', fontSize: '0.85rem', fontWeight: 600, width: '100px', borderRadius: '10px' }} 
            placeholder={getTr('debtAmountPlaceholder', 'Miktar')} 
            value={fs.amount || ''}
            onChange={(e) => updateBlockForm(block.id, { amount: formatTurkishMoneyInput(e.target.value) })}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div className="debt-type-toggle" style={{ flex: 1, borderRadius: '10px', display: 'flex', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
            <button 
              type="button"
              className={`debt-type-btn ${(fs.direction || 'plus') === 'plus' ? 'active plus' : ''}`}
              onClick={() => updateBlockForm(block.id, { direction: 'plus' })}
              style={{ flex: 1, padding: '6px 0', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
            >
              {getTr('debtGiven', 'Verilen')} (+)
            </button>
            <button 
              type="button"
              className={`debt-type-btn ${fs.direction === 'minus' ? 'active minus' : ''}`}
              onClick={() => updateBlockForm(block.id, { direction: 'minus' })}
              style={{ flex: 1, padding: '6px 0', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
            >
              {getTr('debtReceived', 'Alınan')} (-)
            </button>
          </div>
          <button 
            type="button"
            className="btn-primary" 
            style={{ 
              padding: '6px 16px', 
              fontSize: '0.84rem', 
              fontWeight: 600, 
              borderRadius: '10px', 
              background: '#10B981', 
              border: 'none', 
              color: '#FFF',
              boxShadow: 'none',
              cursor: 'pointer'
            }}
            onClick={() => handleAddDebtItem(block.id)}
          >
            {getTr('splitAdd', 'Ekle')}
          </button>
        </div>
      </div>

      {/* Detail Footer Button */}
      {items.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
          <button
            type="button"
            onClick={() => {
              if (triggerHaptic) triggerHaptic('light');
              setShowDetailModal(true);
            }}
            style={{
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              color: '#10B981',
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
            <span>{getTr('debtSeeAllDetails', 'Tüm Detayları Gör')} ({items.length})</span>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      )}

      {/* Debt History Detail Modal */}
      <DebtDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        block={block}
        onDeleteItem={handleDeleteDebtItem}
        triggerHaptic={triggerHaptic}
        theme={theme}
      />
    </div>
  );
};

export default React.memo(DebtWidget);

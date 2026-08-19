import React from 'react';
import { formatTurkishMoneyInput, formatTurkishMoneyDisplay } from '../../../../utils/money';
import { calculateSettlements } from '../../../../utils/settlementUtils';
import { SplitParticipantInput } from './split/SplitParticipantInput';
import { SplitSettlementTable } from './split/SplitSettlementTable';

const SplitWidget = ({
  block,
  blockFormStates,
  setBlockFormStates,
  updateBlockForm,
  handleDeleteBlock,
  handleSetupSplit,
  handleAddSplitExpense,
  handleDeleteSplitExpense,
  triggerHaptic,
  t
}) => {
  const sfs = blockFormStates[block.id] || {};
  const participants = block.participants || [];
  const expenses = block.expenses || [];
  const isSetup = participants.length < 2;
  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
  const settlements = !isSetup ? calculateSettlements(participants, expenses) : [];

  const getTr = (key, fallback) => {
    if (typeof t === 'function') {
      const val = t(key);
      if (val && val !== key) return val;
    }
    return fallback;
  };

  return (
    <div className="split-widget" style={{ borderRadius: '18px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', padding: '16px' }} onClick={(e) => e.stopPropagation()}>
      <div className="split-header" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg, #F97316, #EA580C)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', boxShadow: '0 2px 8px rgba(249, 115, 22, 0.3)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="8.5" cy="7" r="4" />
            <polyline points="17 8 20 11 23 8" />
          </svg>
        </div>
        <span className="split-title" style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{getTr('splitTitle', 'Hesap Bölümü')}</span>
        <button
          style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#EF4444', cursor: 'pointer', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: 'auto' }}
          onClick={() => {
            if (triggerHaptic) triggerHaptic('medium');
            handleDeleteBlock(block.id);
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {isSetup ? (
        <SplitParticipantInput
          blockId={block.id}
          sfs={sfs}
          setBlockFormStates={setBlockFormStates}
          handleSetupSplit={handleSetupSplit}
          triggerHaptic={triggerHaptic}
          getTr={getTr}
        />
      ) : (
        <>
          <div className="split-participants" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
            {participants.map(p => (
              <span key={p} className="split-chip" style={{ padding: '4px 10px', borderRadius: '8px', background: 'rgba(249, 115, 22, 0.12)', color: '#F97316', fontWeight: 700, fontSize: '0.78rem' }}>{p}</span>
            ))}
          </div>

          {expenses.length > 0 && (
            <div className="split-expense-list">
              {expenses.map(exp => {
                const isActive = sfs.activeExpenseId === exp.id;
                return (
                  <div
                    key={exp.id}
                    className={`split-expense-item ${isActive ? 'active' : ''}`}
                    onClick={() => setBlockFormStates(prev => ({
                      ...prev,
                      [block.id]: { ...prev[block.id], activeExpenseId: isActive ? null : exp.id }
                    }))}
                  >
                    <div className="split-expense-main">
                      <div className="split-expense-left">
                        <span className="split-expense-desc">{exp.desc || '—'}</span>
                        <span className="split-expense-meta">{exp.paidBy} {getTr('splitPaidBy', 'ödedi')} · {exp.among.length} {getTr('splitPeople', 'kişi')}</span>
                      </div>
                      <div className="split-expense-right">
                        <span className="split-expense-amount">{formatTurkishMoneyDisplay(exp.amount)}</span>
                        {isActive && (
                          <button
                            className="split-delete-btn"
                            onClick={e => {
                              e.stopPropagation();
                              if (triggerHaptic) triggerHaptic('medium');
                              handleDeleteSplitExpense(block.id, exp.id);
                            }}
                          >×</button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div className="split-total-row">
                <span>{getTr('splitTotal', 'Toplam')}</span>
                <span className="split-total-amount">{formatTurkishMoneyDisplay(totalSpent)}</span>
              </div>
            </div>
          )}

          {sfs.splitShowForm ? (
            <div className="split-form" style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  className="input-field"
                  style={{ fontSize: '0.85rem', padding: '9px 12px', flex: 2, borderRadius: '10px' }}
                  placeholder={getTr('splitDescPlaceholder', 'Harcama açıklaması...')}
                  value={sfs.splitDesc || ''}
                  onChange={e => setBlockFormStates(prev => ({ ...prev, [block.id]: { ...prev[block.id], splitDesc: e.target.value } }))}
                />
                <input
                  className="input-field"
                  style={{ fontSize: '0.85rem', padding: '9px 12px', flex: 1, borderRadius: '10px' }}
                  type="text"
                  inputMode="decimal"
                  placeholder={getTr('splitAmountPlaceholder', 'Tutar')}
                  value={sfs.splitAmount || ''}
                  onChange={e => setBlockFormStates(prev => ({ ...prev, [block.id]: { ...prev[block.id], splitAmount: formatTurkishMoneyInput(e.target.value) } }))}
                />
              </div>
              <p className="split-form-label" style={{ fontSize: '0.78rem', fontWeight: 700, margin: '2px 0' }}>{getTr('splitWhoPaid', 'KİM ÖDEDİ')}</p>
              <div className="split-chip-row">
                {participants.map(p => (
                  <button
                    key={p}
                    className={`split-chip-btn ${sfs.splitPaidBy === p ? 'active' : ''}`}
                    onClick={() => {
                      if (triggerHaptic) triggerHaptic('light');
                      setBlockFormStates(prev => ({ ...prev, [block.id]: { ...prev[block.id], splitPaidBy: p } }));
                    }}
                  >{p}</button>
                ))}
              </div>
              <p className="split-form-label" style={{ fontSize: '0.78rem', fontWeight: 700, margin: '2px 0' }}>{getTr('splitWhoIncluded', 'KİMLER DAHİL')}</p>
              <div className="split-chip-row">
                {participants.map(p => {
                  const among = sfs.splitAmong || [];
                  const selected = among.includes(p);
                  return (
                    <button
                      key={p}
                      className={`split-chip-btn ${selected ? 'active' : ''}`}
                      onClick={() => {
                        if (triggerHaptic) triggerHaptic('light');
                        const next = selected ? among.filter(x => x !== p) : [...among, p];
                        setBlockFormStates(prev => ({ ...prev, [block.id]: { ...prev[block.id], splitAmong: next } }));
                      }}
                    >{p}</button>
                  );
                })}
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <button className="btn-secondary" style={{ flex: 1, fontSize: '0.82rem', padding: '9px', borderRadius: '10px' }}
                  onClick={() => {
                    if (triggerHaptic) triggerHaptic('light');
                    setBlockFormStates(prev => ({ ...prev, [block.id]: { ...prev[block.id], splitShowForm: false } }));
                  }}>
                  {getTr('splitCancel', 'İptal')}
                </button>
                <button className="btn-primary" style={{ flex: 1, fontSize: '0.82rem', padding: '9px', borderRadius: '10px', background: 'linear-gradient(135deg, #F97316, #EA580C)', border: 'none', color: '#FFF' }}
                  onClick={() => {
                    if (triggerHaptic) triggerHaptic('success');
                    handleAddSplitExpense(block.id);
                  }}>
                  {getTr('splitAdd', 'Ekle')}
                </button>
              </div>
            </div>
          ) : (
            <button
              className="split-add-expense-btn"
              style={{ marginTop: '10px', borderRadius: '10px', fontSize: '0.82rem', padding: '10px' }}
              onClick={() => {
                if (triggerHaptic) triggerHaptic('light');
                setBlockFormStates(prev => ({ ...prev, [block.id]: { ...prev[block.id], splitShowForm: true, splitAmong: [...participants] } }));
              }}
            >
              <span className="split-add-icon">＋</span> {getTr('splitAddExpense', 'Harcama Ekle')}
            </button>
          )}

          {/* Settlement Table */}
          <SplitSettlementTable settlements={settlements} getTr={getTr} />
        </>
      )}
    </div>
  );
};

export default SplitWidget;

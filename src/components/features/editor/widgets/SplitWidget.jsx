import React from 'react';
import { formatTurkishMoneyInput, formatTurkishMoneyDisplay } from '../../../../utils/money';
import { calculateSettlements } from '../../../../utils/settlementUtils';

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
        <div className="split-setup">
          <p className="split-setup-hint" style={{ fontSize: '0.85rem', fontWeight: 600, margin: '0 0 10px 0' }}>{getTr('splitWhoJoins', 'Katılımcılar kimler?')}</p>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', background: 'rgba(249, 115, 22, 0.08)', border: '1px solid rgba(249, 115, 22, 0.15)', borderRadius: '12px', padding: '10px 12px', lineHeight: 1.5, marginBottom: '14px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <span>{getTr('splitHintText', 'İsimleri girin ve başlatın. Harcamaları girdikten sonra kim kime ne kadar ödemeli hesaplanır.')}</span>
          </div>

          <div className="split-name-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
            {(sfs.splitNameInputs || ['', '']).map((name, idx) => (
              <div key={idx} className="split-name-row" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  id={`split-name-${block.id}-${idx}`}
                  className="input-field"
                  style={{ fontSize: '0.85rem', padding: '10px 14px', flex: 1, borderRadius: '10px' }}
                  placeholder={`${idx + 1}${getTr('splitPersonPlaceholder', '. Kişi adı...')}`}
                  value={name}
                  onChange={e => {
                    const inputs = [...(sfs.splitNameInputs || ['', ''])];
                    inputs[idx] = e.target.value;
                    setBlockFormStates(prev => ({ ...prev, [block.id]: { ...prev[block.id], splitNameInputs: inputs } }));
                  }}
                />
                {(sfs.splitNameInputs || ['', '']).length > 2 && (
                  <button
                    style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#EF4444', cursor: 'pointer', width: '28px', height: '28px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                    onClick={() => {
                      if (triggerHaptic) triggerHaptic('medium');
                      const inputs = (sfs.splitNameInputs || ['', '']).filter((_, i) => i !== idx);
                      setBlockFormStates(prev => ({ ...prev, [block.id]: { ...prev[block.id], splitNameInputs: inputs } }));
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
            <button
              className="split-add-person-btn"
              style={{ padding: '8px 12px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 700 }}
              onClick={() => {
                if (triggerHaptic) triggerHaptic('light');
                const inputs = [...(sfs.splitNameInputs || ['', '']), ''];
                const newIdx = inputs.length - 1;
                setBlockFormStates(prev => ({ ...prev, [block.id]: { ...prev[block.id], splitNameInputs: inputs } }));
                setTimeout(() => {
                  const el = document.getElementById(`split-name-${block.id}-${newIdx}`);
                  if (el) el.focus();
                }, 80);
              }}
            >+ {getTr('splitAddPerson', 'Kişi Ekle')}</button>
          </div>

          <button 
            className="btn-primary" 
            style={{ width: '100%', padding: '12px', fontSize: '0.9rem', fontWeight: 700, borderRadius: '12px', background: 'linear-gradient(135deg, #F97316, #EA580C)', border: 'none', color: '#FFF', boxShadow: '0 4px 14px rgba(249, 115, 22, 0.3)', cursor: 'pointer' }} 
            onClick={() => {
              const inputs = (sfs.splitNameInputs || ['', '']);
              const emptyIndices = [];
              inputs.forEach((val, idx) => {
                if (!val.trim()) emptyIndices.push(idx);
              });

              if (emptyIndices.length > 0 || inputs.filter(v => v.trim()).length < 2) {
                if (triggerHaptic) triggerHaptic('warning');
                emptyIndices.forEach((idx, i) => {
                  const el = document.getElementById(`split-name-${block.id}-${idx}`);
                  if (el) {
                    if (i === 0) el.focus();
                    el.style.border = '2px solid #F59E0B';
                    el.style.boxShadow = '0 0 12px rgba(245, 158, 11, 0.6)';
                    el.style.backgroundColor = 'rgba(245, 158, 11, 0.12)';
                    setTimeout(() => {
                      el.style.border = '';
                      el.style.boxShadow = '';
                      el.style.backgroundColor = '';
                    }, 1500);
                  }
                });
                return;
              }

              if (triggerHaptic) triggerHaptic('success');
              handleSetupSplit(block.id);
            }}
          >
            {getTr('splitStart', 'Başlat')}
          </button>
        </div>
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

          {settlements.length > 0 && (
            <div className="split-settlements" style={{ marginTop: '14px' }}>
              <div className="split-settlements-header" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <div style={{ width: '26px', height: '26px', borderRadius: '8px', background: 'linear-gradient(135deg, #10B981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                    <line x1="1" y1="10" x2="23" y2="10" />
                  </svg>
                </div>
                <span className="split-settlements-title" style={{ fontWeight: 800, fontSize: '0.85rem' }}>{getTr('splitPayments', 'Ödemeler')}</span>
              </div>
              {settlements.map((s, i) => (
                <div key={i} className="split-settlement-card">
                  <div className="split-settlement-names">
                    <span className="split-from">{s.from}</span>
                    <span className="split-arrow-icon">→</span>
                    <span className="split-to">{s.to}</span>
                  </div>
                  <span className="split-settlement-amount">{s.amount.toLocaleString('tr-TR')} ₺</span>
                </div>
              ))}
            </div>
          )}
          {expenses.length > 0 && settlements.length === 0 && (
            <div className="split-settled" style={{ marginTop: '10px' }}>{getTr('splitAllSettled', '✅ Herkes eşit ödedi, hesaplaşma gerekmiyor!')}</div>
          )}
        </>
      )}
    </div>
  );
};

export default SplitWidget;

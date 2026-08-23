import React, { useState } from 'react';
import { formatTurkishMoneyInput, formatTurkishMoneyDisplay, parseTurkishMoneyToFloat } from '../../../../utils/money';
import BillDetailModal from '../../../modals/BillDetailModal';

const getNowLocalDateTimeString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const BillWidget = ({
  block,
  blockFormStates,
  updateBlockForm,
  handleDeleteBillBlock,
  checkAndRequestNotificationPermission,
  setToast,
  setQuickReminderTitle,
  setQuickReminderTime,
  setPendingWidgetAlarmCtx,
  handlePayBill,
  handleDeleteBillPaymentItem,
  handleUpdateBlock,
  editingNote,
  lang,
  triggerHaptic,
  theme = 'dark',
  t = (k) => k
}) => {
  const isLight = theme === 'light';
  const [showDetailModal, setShowDetailModal] = useState(false);
  const bfs = blockFormStates[block.id] || {};
  const name = bfs.tempName !== undefined ? bfs.tempName : (block.name || '');
  const amount = bfs.tempAmount !== undefined ? bfs.tempAmount : (formatTurkishMoneyDisplay(block.amount) || '');
  const subscriberNo = bfs.tempSubscriberNo !== undefined ? bfs.tempSubscriberNo : (block.subscriberNo || '');
  const isEditing = bfs.isEditing || !block.setupDone;

  const paymentCount = (block.paymentHistory && block.paymentHistory.length) || (block.history && block.history.length) || 0;

  const getRemainingDaysText = () => {
    if (!block.nextPaymentTime) return '';
    const diffTime = new Date(block.nextPaymentTime).getTime() - Date.now();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return t('billOverdue');
    if (diffDays === 0) return t('billToday');
    if (diffDays === 1) return t('billTomorrow');
    return `${t('billRemaining')}: ${diffDays} ${t('days')}`;
  };

  if (isEditing) {
    return (
      <div className="split-widget" style={{ borderRadius: '18px', border: '1.5px solid rgba(139, 92, 246, 0.35)', background: 'var(--bg-card)', padding: '16px' }} onClick={(e) => e.stopPropagation()}>
        <div className="split-header" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', boxShadow: '0 2px 8px rgba(139, 92, 246, 0.3)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{t('billTitle')}</span>
          <button
            style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#EF4444', cursor: 'pointer', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: 'auto' }}
            onClick={() => handleDeleteBillBlock(block.id)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="debt-form animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="debt-form-row" style={{ display: 'flex', gap: '10px' }}>
            <input 
              id={`bill-name-${block.id}`}
              type="text" 
              className="input-field" 
              style={{ flex: 2, padding: '10px 14px', borderRadius: '12px', fontSize: '0.85rem' }}
              placeholder={t('billName')} 
              value={name}
              onChange={(e) => updateBlockForm(block.id, { tempName: e.target.value })}
            />
            <input 
              id={`bill-amount-${block.id}`}
              type="text" 
              inputMode="decimal"
              className="input-field" 
              style={{ flex: 1, padding: '10px 14px', borderRadius: '12px', fontSize: '0.85rem' }}
              placeholder={t('billAmount')} 
              value={amount}
              onChange={(e) => updateBlockForm(block.id, { tempAmount: formatTurkishMoneyInput(e.target.value) })}
            />
          </div>

          {/* Opsiyonel Abone / Müşteri Numarası */}
          <div className="debt-form-row" style={{ display: 'flex', gap: '10px' }}>
            <input 
              id={`bill-subscriber-${block.id}`}
              type="text" 
              className="input-field" 
              style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', fontSize: '0.85rem' }}
              placeholder={t('billSubscriberNo') || 'Abone / Müşteri No (Opsiyonel)'} 
              value={subscriberNo}
              onChange={(e) => updateBlockForm(block.id, { tempSubscriberNo: e.target.value })}
            />
          </div>

          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', background: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.15)', borderRadius: '12px', padding: '10px 12px', lineHeight: 1.5, display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <span>{t('billHintText')}</span>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            {block.setupDone && (
              <button 
                className="btn-secondary" 
                style={{ flex: 1, padding: '10px', borderRadius: '12px', fontWeight: 600, fontSize: '0.82rem' }}
                onClick={() => updateBlockForm(block.id, { isEditing: false, tempName: undefined, tempAmount: undefined, tempSubscriberNo: undefined })}
              >{t('cancelBtn')}</button>
            )}
            <button 
              className="btn-primary" 
              style={{ flex: 2, padding: '12px', fontSize: '0.9rem', fontWeight: 700, borderRadius: '12px', background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: 'none', color: '#FFF', boxShadow: '0 4px 14px rgba(139, 92, 246, 0.3)', cursor: 'pointer' }}
              onClick={async () => {
                const cleanAmount = parseTurkishMoneyToFloat(amount);
                const isNameEmpty = !name.trim();
                const isAmountEmpty = !amount || cleanAmount <= 0;

                if (isNameEmpty || isAmountEmpty) {
                  if (triggerHaptic) triggerHaptic('warning');
                  const nameEl = document.getElementById(`bill-name-${block.id}`);
                  const amountEl = document.getElementById(`bill-amount-${block.id}`);
                  
                  if (isNameEmpty && nameEl) {
                    nameEl.focus();
                    nameEl.style.borderColor = '#F59E0B';
                    nameEl.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.4)';
                    nameEl.style.backgroundColor = 'rgba(245, 158, 11, 0.08)';
                    setTimeout(() => {
                      nameEl.style.borderColor = '';
                      nameEl.style.boxShadow = '';
                      nameEl.style.backgroundColor = '';
                    }, 1200);
                  }
                  if (isAmountEmpty && amountEl) {
                    if (!isNameEmpty) amountEl.focus();
                    amountEl.style.borderColor = '#F59E0B';
                    amountEl.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.4)';
                    amountEl.style.backgroundColor = 'rgba(245, 158, 11, 0.08)';
                    setTimeout(() => {
                      amountEl.style.borderColor = '';
                      amountEl.style.boxShadow = '';
                      amountEl.style.backgroundColor = '';
                    }, 1200);
                  }
                  return;
                }

                if (triggerHaptic) triggerHaptic('medium');
                try {
                  await checkAndRequestNotificationPermission();
                } catch (e) {}

                updateBlockForm(block.id, { tempName: name, tempAmount: cleanAmount, tempSubscriberNo: subscriberNo.trim(), isEditing: false });
                const fillTitle = amount ? `${name.trim()} (${amount} TL)` : `${name.trim()}`;
                setQuickReminderTitle(fillTitle);
                setQuickReminderTime(getNowLocalDateTimeString());
                setPendingWidgetAlarmCtx({
                  blockId: block.id,
                  noteId: editingNote ? editingNote.id : null,
                  widgetType: 'bill',
                  name: name.trim(),
                  amount: cleanAmount,
                  subscriberNo: subscriberNo.trim()
                });
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="13" r="8" />
                <polyline points="12 9 12 13 15 15" />
                <line x1="5" y1="3" x2="2" y2="6" />
                <line x1="19" y1="3" x2="22" y2="6" />
              </svg>
              {t ? t('setReminderBtn') : (lang === 'tr' ? 'Alarm Kur' : 'Set Alarm')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isButtonDisabled = (() => {
    if (!block.nextPaymentTime) return true;
    const nextTimeMs = new Date(block.nextPaymentTime).getTime();
    const timeDiff = nextTimeMs - Date.now();
    return timeDiff > 5 * 24 * 60 * 60 * 1000;
  })();

  return (
    <div className="split-widget" style={{ borderRadius: '18px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', padding: '16px', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ 
          width: '36px', 
          height: '36px', 
          borderRadius: '12px', 
          background: block.mode === 'alarm' ? 'linear-gradient(135deg, #EF4444, #DC2626)' : 'linear-gradient(135deg, #8B5CF6, #6D28D9)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          color: '#FFF', 
          flexShrink: 0, 
          boxShadow: block.mode === 'alarm' ? '0 2px 8px rgba(239, 68, 68, 0.3)' : '0 2px 8px rgba(139, 92, 246, 0.3)' 
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        </div>
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{block.name}</span>
            {block.amount !== null && block.amount !== undefined && (
              <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#8B5CF6' }}>
                {formatTurkishMoneyDisplay(block.amount)}
              </span>
            )}
            <span style={{ 
              fontSize: '0.68rem', 
              padding: '2px 8px', 
              borderRadius: '6px', 
              background: block.mode === 'alarm' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(139, 92, 246, 0.12)', 
              color: block.mode === 'alarm' ? '#EF4444' : '#8B5CF6', 
              fontWeight: 700 
            }}>
              {block.mode === 'alarm' ? t('billAlarm') : t('billNotif')}
            </span>
          </div>

          {/* Abone No Badge with Quick Copy */}
          {block.subscriberNo && (
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px', 
              background: 'rgba(139, 92, 246, 0.08)', 
              border: '1px solid rgba(139, 92, 246, 0.2)', 
              borderRadius: '8px', 
              padding: '3px 8px', 
              width: 'fit-content',
              marginTop: '1px',
              marginBottom: '2px'
            }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                {t('billSubscriberNoLabel') || 'Abone No'}: <strong style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>{block.subscriberNo}</strong>
              </span>
              <button
                type="button"
                onClick={async (e) => {
                  e.stopPropagation();
                  if (triggerHaptic) triggerHaptic('light');
                  try {
                    await navigator.clipboard.writeText(block.subscriberNo);
                    if (setToast) {
                      setToast({ title: '📋 ' + (t('copiedBtn') || 'Kopyalandı!'), msg: `${t('billSubscriberNoLabel') || 'Abone No'}: ${block.subscriberNo}` });
                    }
                  } catch (err) {
                    console.warn('Clipboard copy error:', err);
                  }
                }}
                title={t('copyBtn') || 'Kopyala'}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '2px',
                  cursor: 'pointer',
                  color: '#8B5CF6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </button>
            </div>
          )}
          
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            {t('billMonthly')} {block.day}. {t('billAt')} {block.time}
          </span>
          
          {isButtonDisabled ? (
            <span style={{ 
              fontSize: '0.75rem', 
              fontWeight: 600, 
              color: 'var(--text-muted)' 
            }}>
              {t('billNextDate')}: {new Date(block.nextPaymentTime).toLocaleDateString()} {block.time}
            </span>
          ) : (
            <span style={{ 
              fontSize: '0.75rem', 
              fontWeight: 700, 
              color: getRemainingDaysText() === t('billToday') ? '#EF4444' : '#8B5CF6' 
            }}>
              {getRemainingDaysText()}
            </span>
          )}
        </div>
        
        <div style={{ display: 'flex', gap: '6px', alignSelf: 'flex-start' }}>
          <button 
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', cursor: 'pointer', width: '28px', height: '28px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => updateBlockForm(block.id, { isEditing: true, tempName: block.name, tempAmount: formatTurkishMoneyDisplay(block.amount), tempSubscriberNo: block.subscriberNo || '', tempDay: block.day, tempTime: block.time, tempMode: block.mode })}
            title={t('editBtn')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </button>
          <button 
            style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#EF4444', cursor: 'pointer', width: '28px', height: '28px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => handleDeleteBillBlock(block.id)}
            title={t('deleteBtn')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      <div style={{ 
        marginTop: '14px', 
        paddingTop: '12px', 
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        {/* 1. Bu Ay Ödendi Butonu */}
        <button 
          className="btn-primary" 
          style={{ 
            width: '100%', 
            padding: '10px', 
            background: isButtonDisabled ? 'var(--text-muted)' : 'linear-gradient(135deg, #10B981, #059669)', 
            opacity: isButtonDisabled ? 0.6 : 1,
            cursor: isButtonDisabled ? 'not-allowed' : 'pointer',
            fontSize: '0.85rem',
            fontWeight: 800,
            borderRadius: '12px',
            border: 'none',
            color: '#FFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
          onClick={() => {
            if (triggerHaptic) triggerHaptic('success');
            handlePayBill(block.id);
          }}
          disabled={isButtonDisabled}
        >
          ✓ {t('billPay')}
        </button>

        {/* 2. Tüm Detayları Gör / Ödeme Geçmişi Butonu */}
        <button
          type="button"
          onClick={() => {
            if (triggerHaptic) triggerHaptic('light');
            setShowDetailModal(true);
          }}
          style={{
            width: '100%',
            padding: '8px 12px',
            background: isLight ? 'rgba(139, 92, 246, 0.08)' : 'rgba(139, 92, 246, 0.12)',
            border: isLight ? '1px solid rgba(139, 92, 246, 0.25)' : '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '12px',
            color: isLight ? '#7C3AED' : '#C084FC',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all 0.15s ease'
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span>{t('billSeeAllDetails') || 'Tüm Detayları Gör'} {paymentCount > 0 ? `(${paymentCount})` : ''}</span>
        </button>

        {/* Mini Son 3 Ödeme Rozeti */}
        {block.history && block.history.length > 0 && (
          <div style={{ marginTop: '2px' }}>
            <span style={{ fontSize: '0.70rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t('billHistory')}:</span>
            <div style={{ 
              display: 'flex', 
              gap: '6px', 
              flexWrap: 'wrap', 
              marginTop: '4px',
              maxHeight: '60px',
              overflowY: 'auto'
            }}>
              {block.history.slice(-3).reverse().map((ts, hidx) => (
                <span key={hidx} style={{ 
                  fontSize: '0.68rem', 
                  background: 'rgba(16, 185, 129, 0.1)', 
                  color: '#10B981',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  fontWeight: 600
                }}>
                  ✓ {new Date(ts).toLocaleDateString()}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fatura Detay Modalı */}
      <BillDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        block={block}
        onDeletePaymentItem={handleDeleteBillPaymentItem}
        triggerHaptic={triggerHaptic}
        setToast={setToast}
        theme={theme}
        t={t}
      />
    </div>
  );
};

export default BillWidget;

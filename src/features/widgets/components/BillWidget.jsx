import React, { useState, useMemo } from 'react';
import { formatTurkishMoneyInput, formatTurkishMoneyDisplay, parseTurkishMoneyToFloat } from '@shared/utils/money';
import BillDetailModal from '@shared/components/BillDetailModal';
import { getNowLocalDateTimeString } from '@shared/utils/dateUtils';

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

  const remainingDaysText = useMemo(() => {
    if (!block.nextPaymentTime) return '';
    const diffTime = new Date(block.nextPaymentTime).getTime() - Date.now();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return t('billOverdue');
    if (diffDays === 0) return t('billToday');
    if (diffDays === 1) return t('billTomorrow');
    return `${t('billRemaining')}: ${diffDays} ${t('days')}`;
  }, [block.nextPaymentTime, t]);

  if (isEditing) {
    return (
      <div className="split-widget" style={{ borderRadius: '16px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', padding: '16px' }} onClick={(e) => e.stopPropagation()}>
        <div className="split-header" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: 'rgba(139, 92, 246, 0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B5CF6' }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: '0.94rem', color: 'var(--text-primary)' }}>{t('billTitle')}</span>
          <button
            style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#EF4444', cursor: 'pointer', width: '28px', height: '28px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: 'auto' }}
            onClick={() => handleDeleteBillBlock(block.id)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className="debt-form-row" style={{ display: 'flex', gap: '8px' }}>
            <input 
              id={`bill-name-${block.id}`}
              type="text" 
              className="input-field" 
              style={{ flex: 2, padding: '10px 14px', borderRadius: '10px', fontSize: '0.86rem', fontWeight: 500 }}
              placeholder={t('billName')} 
              value={name}
              onChange={(e) => updateBlockForm(block.id, { tempName: e.target.value })}
            />
            <input 
              id={`bill-amount-${block.id}`}
              type="text" 
              inputMode="decimal"
              className="input-field" 
              style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', fontSize: '0.86rem', fontWeight: 600 }}
              placeholder={t('billAmount')} 
              value={amount}
              onChange={(e) => updateBlockForm(block.id, { tempAmount: formatTurkishMoneyInput(e.target.value) })}
            />
          </div>

          {/* Opsiyonel Abone / Müşteri Numarası */}
          <div className="debt-form-row" style={{ display: 'flex', gap: '8px' }}>
            <input 
              id={`bill-subscriber-${block.id}`}
              type="text" 
              className="input-field" 
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', fontSize: '0.86rem', fontWeight: 500 }}
              placeholder={t('billSubscriberNo') || 'Abone / Müşteri No (Opsiyonel)'} 
              value={subscriberNo}
              onChange={(e) => updateBlockForm(block.id, { tempSubscriberNo: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
            {block.setupDone && (
              <button 
                className="btn-secondary" 
                style={{ flex: 1, padding: '10px', borderRadius: '10px', fontWeight: 600, fontSize: '0.84rem' }}
                onClick={() => updateBlockForm(block.id, { isEditing: false, tempName: undefined, tempAmount: undefined, tempSubscriberNo: undefined })}
              >{t('cancelBtn')}</button>
            )}
            <button 
              className="btn-primary" 
              style={{ flex: 2, padding: '10px 14px', fontSize: '0.86rem', fontWeight: 600, borderRadius: '10px', background: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: 'none', color: '#FFF', boxShadow: 'none', cursor: 'pointer' }}
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
    <div className="split-widget" style={{ borderRadius: '16px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', padding: '16px', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ 
          width: '34px', 
          height: '34px', 
          borderRadius: '10px', 
          background: block.mode === 'alarm' ? 'rgba(239, 68, 68, 0.14)' : 'rgba(139, 92, 246, 0.14)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          color: block.mode === 'alarm' ? '#EF4444' : '#8B5CF6', 
          flexShrink: 0, 
        }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        </div>
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontWeight: 700, fontSize: '0.94rem', color: 'var(--text-primary)' }}>{block.name}</span>
            {block.amount !== null && block.amount !== undefined && (
              <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#8B5CF6' }}>
                {formatTurkishMoneyDisplay(block.amount)}
              </span>
            )}
            <span style={{ 
              fontSize: '0.68rem', 
              padding: '2px 8px', 
              borderRadius: '6px', 
              background: block.mode === 'alarm' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(139, 92, 246, 0.12)', 
              color: block.mode === 'alarm' ? '#EF4444' : '#8B5CF6', 
              fontWeight: 600 
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
              color: remainingDaysText === t('billToday') ? '#EF4444' : '#8B5CF6' 
            }}>
              {remainingDaysText}
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
            background: isButtonDisabled ? 'var(--text-muted)' : '#10B981', 
            opacity: isButtonDisabled ? 0.6 : 1,
            cursor: isButtonDisabled ? 'not-allowed' : 'pointer',
            fontSize: '0.84rem',
            fontWeight: 600,
            borderRadius: '10px',
            border: 'none',
            color: '#FFF',
            boxShadow: 'none',
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
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{t('billPay')}</span>
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
            borderRadius: '10px',
            color: isLight ? '#7C3AED' : '#C084FC',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all 0.15s ease'
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {new Date(ts).toLocaleDateString()}
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

export default React.memo(BillWidget);

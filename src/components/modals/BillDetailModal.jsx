import React, { useState } from 'react';
import { formatTurkishMoneyDisplay } from '../../utils/money';

const formatDateTime = (timestamp) => {
  if (!timestamp) return '-';
  const d = new Date(timestamp);
  if (isNaN(d.getTime())) return '-';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  return `${day}.${month}.${year} ${hours}:${mins}`;
};

const formatDateOnly = (timestamp) => {
  if (!timestamp) return '-';
  const d = new Date(timestamp);
  if (isNaN(d.getTime())) return '-';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
};

export const BillDetailModal = ({
  isOpen,
  onClose,
  block,
  onDeletePaymentItem,
  triggerHaptic,
  setToast,
  theme = 'dark',
  t = (k) => k,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen || !block) return null;

  const isLight = theme === 'light';

  // Normalize payments: support both block.paymentHistory (objects) and legacy block.history (timestamps)
  const rawHistory = block.paymentHistory || (block.history || []).map((ts, idx) => ({
    id: `legacy-${idx}-${ts}`,
    paidAt: ts,
    amount: block.amount,
    subscriberNo: block.subscriberNo || '',
    cycleDate: ts,
    billName: block.name || ''
  }));

  // Sort descending by paid date
  const sortedPayments = [...rawHistory].sort((a, b) => {
    const timeA = new Date(a.paidAt || a).getTime() || 0;
    const timeB = new Date(b.paidAt || b).getTime() || 0;
    return timeB - timeA;
  });

  const totalPaidAmount = sortedPayments.reduce((sum, item) => {
    const amt = typeof item === 'object' ? (Number(item.amount) || Number(block.amount) || 0) : (Number(block.amount) || 0);
    return sum + amt;
  }, 0);

  const filteredPayments = sortedPayments.filter(item => {
    const q = searchTerm.toLowerCase();
    const paidAtStr = formatDateTime(item.paidAt || item).toLowerCase();
    const amountStr = (item.amount !== undefined ? item.amount : block.amount || '').toString().toLowerCase();
    const subNoStr = (item.subscriberNo || block.subscriberNo || '').toLowerCase();
    return paidAtStr.includes(q) || amountStr.includes(q) || subNoStr.includes(q);
  });

  const latestPayment = sortedPayments[0];

  return (
    <div 
      className="modal-overlay animate-fade-in"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: isLight ? 'rgba(15, 23, 42, 0.4)' : 'rgba(0, 0, 0, 0.78)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div 
        className="modal-card animate-pop"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '460px',
          maxHeight: '85vh',
          background: isLight ? '#FFFFFF' : 'var(--bg-card, #1E293B)',
          borderRadius: '24px',
          border: isLight ? '1px solid rgba(226, 232, 240, 0.9)' : '1px solid var(--border-color, rgba(255,255,255,0.12))',
          boxShadow: isLight ? '0 20px 45px rgba(0, 0, 0, 0.12)' : '0 24px 60px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div 
          style={{
            padding: '18px 20px',
            borderBottom: isLight ? '1px solid #F1F5F9' : '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: isLight ? 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)' : 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(124, 58, 237, 0.05) 100%)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div 
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFF',
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.35)'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: isLight ? '#0F172A' : '#F8FAFC' }}>
                {block.name || t('billTitle')}
              </h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: isLight ? '#64748B' : '#94A3B8', fontWeight: 600 }}>
                {sortedPayments.length} {t('billPaymentsCount') || 'Ödeme Kaydı'}
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: 'none',
              background: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)',
              color: isLight ? '#64748B' : '#94A3B8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '18px 20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div 
              style={{
                padding: '12px 14px',
                borderRadius: '16px',
                background: isLight ? '#FAF5FF' : 'rgba(139, 92, 246, 0.08)',
                border: isLight ? '1px solid #E9D5FF' : '1px solid rgba(139, 92, 246, 0.2)',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px'
              }}
            >
              <span style={{ fontSize: '0.72rem', color: isLight ? '#7E22CE' : '#C084FC', fontWeight: 700, textTransform: 'uppercase' }}>
                {t('billTotalPaid') || 'Toplam Ödenen'}
              </span>
              <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#8B5CF6' }}>
                {formatTurkishMoneyDisplay(totalPaidAmount)}
              </span>
            </div>

            <div 
              style={{
                padding: '12px 14px',
                borderRadius: '16px',
                background: isLight ? '#F8FAFC' : 'rgba(255, 255, 255, 0.03)',
                border: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px'
              }}
            >
              <span style={{ fontSize: '0.72rem', color: isLight ? '#64748B' : '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>
                {t('billLastPayment') || 'Son Ödeme'}
              </span>
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: isLight ? '#1E293B' : '#F1F5F9', marginTop: '2px' }}>
                {latestPayment ? formatDateOnly(latestPayment.paidAt || latestPayment) : '-'}
              </span>
            </div>
          </div>

          {/* Subscriber No Info (If Present) */}
          {block.subscriberNo && (
            <div 
              style={{
                padding: '10px 14px',
                borderRadius: '14px',
                background: isLight ? '#F8FAFC' : 'rgba(255, 255, 255, 0.04)',
                border: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.78rem', color: isLight ? '#64748B' : '#94A3B8', fontWeight: 600 }}>
                  {t('billSubscriberNoLabel') || 'Abone / Müşteri No'}:
                </span>
                <strong style={{ fontSize: '0.88rem', fontFamily: 'monospace', color: isLight ? '#0F172A' : '#F8FAFC' }}>
                  {block.subscriberNo}
                </strong>
              </div>
              <button
                type="button"
                onClick={async () => {
                  if (triggerHaptic) triggerHaptic('light');
                  try {
                    await navigator.clipboard.writeText(block.subscriberNo);
                    if (setToast) {
                      setToast({ title: '📋 ' + (t('copiedBtn') || 'Kopyalandı!'), msg: `${t('billSubscriberNoLabel') || 'Abone No'}: ${block.subscriberNo}` });
                    }
                  } catch (e) {}
                }}
                style={{
                  background: 'rgba(139, 92, 246, 0.12)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '4px 8px',
                  color: '#8B5CF6',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                {t('copyBtn') || 'Kopyala'}
              </button>
            </div>
          )}

          {/* Search Box */}
          {sortedPayments.length > 3 && (
            <div style={{ position: 'relative' }}>
              <input 
                type="text"
                placeholder={t('searchPlaceholder') || 'Ödemelerde ara...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 34px',
                  fontSize: '0.82rem',
                  borderRadius: '12px',
                  border: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.1)',
                  background: isLight ? '#F8FAFC' : 'rgba(255,255,255,0.04)',
                  color: 'var(--text-primary)',
                  boxSizing: 'border-box'
                }}
              />
              <svg 
                width="14" 
                height="14" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.2"
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }}
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
          )}

          {/* Payment Records List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: isLight ? '#64748B' : '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {t('billPaymentHistoryTitle') || 'Ödeme Geçmişi'}
            </span>

            {filteredPayments.length === 0 ? (
              <div 
                style={{
                  padding: '24px 16px',
                  textAlign: 'center',
                  background: isLight ? '#F8FAFC' : 'rgba(255,255,255,0.02)',
                  borderRadius: '16px',
                  border: isLight ? '1px dashed #CBD5E1' : '1px dashed rgba(255,255,255,0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span style={{ fontSize: '1.4rem' }}>🧾</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  {searchTerm ? (t('noResultsFound') || 'Sonuç bulunamadı.') : (t('billNoPaymentHistory') || 'Henüz ödeme kaydı bulunmuyor.')}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {t('billHistoryAutoRecorded') || '"Bu Ay Ödendi" butonuna bastığınızda kayıtlar buraya eklenir.'}
                </span>
              </div>
            ) : (
              filteredPayments.map((item, index) => {
                const isObj = typeof item === 'object';
                const itemId = isObj ? item.id : `legacy-${index}`;
                const paidTime = isObj ? item.paidAt : item;
                const itemAmount = isObj ? (item.amount !== undefined ? item.amount : block.amount) : block.amount;
                const itemSubNo = isObj ? (item.subscriberNo || block.subscriberNo) : block.subscriberNo;

                return (
                  <div 
                    key={itemId || index}
                    className="animate-fade-in"
                    style={{
                      padding: '12px 14px',
                      borderRadius: '16px',
                      background: isLight ? '#FFFFFF' : 'rgba(255, 255, 255, 0.03)',
                      border: isLight ? '1px solid #F1F5F9' : '1px solid rgba(255, 255, 255, 0.06)',
                      boxShadow: isLight ? '0 2px 8px rgba(0,0,0,0.03)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div 
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '10px',
                          background: 'rgba(16, 185, 129, 0.12)',
                          color: '#10B981',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                          {formatDateTime(paidTime)}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 700 }}>
                            ✓ {t('billPaidStatus') || 'Ödendi'}
                          </span>
                          {itemSubNo && (
                            <span style={{ fontSize: '0.70rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                              • No: {itemSubNo}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {itemAmount !== null && itemAmount !== undefined && (
                        <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#8B5CF6' }}>
                          {formatTurkishMoneyDisplay(itemAmount)}
                        </span>
                      )}

                      {onDeletePaymentItem && (
                        <button
                          type="button"
                          onClick={() => {
                            if (triggerHaptic) triggerHaptic('warning');
                            onDeletePaymentItem(block.id, itemId, paidTime);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '6px',
                            transition: 'color 0.15s'
                          }}
                          title={t('deleteBtn') || 'Kaydı Sil'}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div 
          style={{
            padding: '14px 20px',
            borderTop: isLight ? '1px solid #F1F5F9' : '1px solid rgba(255,255,255,0.08)',
            background: isLight ? '#FAF5FF' : 'rgba(139, 92, 246, 0.04)'
          }}
        >
          <button 
            className="btn-primary"
            onClick={onClose}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '14px',
              fontSize: '0.9rem',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
              border: 'none',
              color: '#FFF',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(139, 92, 246, 0.3)'
            }}
          >
            {t('confirmCancel') || 'Kapat'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BillDetailModal;

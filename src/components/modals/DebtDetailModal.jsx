import React, { useState } from 'react';
import { formatTurkishMoneyDisplay } from '../../utils/money';
import DebtPaymentHistoryList from './debt/DebtPaymentHistoryList';

const DebtDetailModal = ({
  isOpen,
  onClose,
  block,
  onDeleteItem,
  triggerHaptic,
  theme = 'dark',
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen || !block) return null;

  const isLight = theme === 'light';
  const items = block.items || [];
  const netTotal = items.reduce((acc, i) => acc + (Number(i.amount) || 0), 0);

  const filteredItems = items.filter(item => {
    const q = searchTerm.toLowerCase();
    return (
      (item.note || '').toLowerCase().includes(q) ||
      (item.amount || '').toString().includes(q)
    );
  });

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
        background: isLight ? 'rgba(15, 23, 42, 0.35)' : 'rgba(0, 0, 0, 0.75)',
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
            background: isLight ? 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)' : 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(5, 150, 105, 0.04) 100%)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div 
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: '#10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFF',
                fontWeight: 'bold',
                fontSize: '1.1rem'
              }}
            >
              ₺
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: isLight ? '#0F172A' : '#F8FAFC' }}>
                {block.name || 'Borç / Alacak Detayı'}
              </h3>
              <span style={{ fontSize: '0.75rem', color: isLight ? '#64748B' : '#94A3B8' }}>
                {items.length} İşlem Kaydı
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: isLight ? '#64748B' : '#94A3B8',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Net Total Status Card */}
        <div style={{ padding: '16px 20px 8px 20px' }}>
          <div 
            style={{
              padding: '14px 18px',
              borderRadius: '16px',
              background: netTotal >= 0 
                ? (isLight ? '#ECFDF5' : 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(5, 150, 105, 0.06) 100%)')
                : (isLight ? '#FEF2F2' : 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(185, 28, 28, 0.06) 100%)'),
              border: netTotal >= 0 
                ? (isLight ? '1.5px solid #A7F3D0' : '1px solid rgba(16, 185, 129, 0.25)')
                : (isLight ? '1.5px solid #FCA5A5' : '1px solid rgba(239, 68, 68, 0.25)'),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: isLight ? '#0F172A' : '#F8FAFC' }}>
              Net Bakiye:
            </span>
            <span style={{ fontSize: '1.25rem', fontWeight: 900, color: netTotal >= 0 ? '#10B981' : '#EF4444', letterSpacing: '-0.02em' }}>
              {netTotal > 0 ? '+' : ''}{formatTurkishMoneyDisplay(netTotal)}
            </span>
          </div>
        </div>

        {/* Transaction Items List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 20px 20px 20px' }}>
          <DebtPaymentHistoryList 
            filteredItems={filteredItems}
            onDeleteItem={(itemId) => onDeleteItem(block.id, itemId)}
            triggerHaptic={triggerHaptic}
            isLight={isLight}
          />
        </div>
      </div>
    </div>
  );
};

export default DebtDetailModal;

import React, { useState } from 'react';
import { formatTurkishMoneyDisplay } from '../../utils/money';

const ExpenseDetailModal = ({
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
  const totalAmount = items.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

  const filteredItems = items.filter(item => {
    const q = searchTerm.toLowerCase();
    return (
      (item.description || '').toLowerCase().includes(q) ||
      (item.dateStr || '').toLowerCase().includes(q) ||
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
            background: isLight ? 'linear-gradient(135deg, #FFF5F5 0%, #FFEAEA 100%)' : 'linear-gradient(135deg, rgba(244, 63, 94, 0.1) 0%, rgba(225, 29, 72, 0.04) 100%)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div 
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #F43F5E, #E11D48)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFF',
                boxShadow: '0 4px 12px rgba(244, 63, 94, 0.35)'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                <path d="M18 12a2 2 0 0 0 0 4h3v-4z" />
              </svg>
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: isLight ? '#0F172A' : '#F8FAFC' }}>
                {block.title || 'Gider Detayları'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: isLight ? '#64748B' : '#94A3B8', fontWeight: 600 }}>
                Toplam {items.length} kayıt
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: isLight ? 'rgba(241, 245, 249, 0.9)' : 'rgba(255, 255, 255, 0.08)',
              border: isLight ? '1px solid #CBD5E1' : '1px solid rgba(255, 255, 255, 0.12)',
              color: isLight ? '#475569' : '#94A3B8',
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Total Grand Card */}
        <div style={{ padding: '16px 20px 8px 20px' }}>
          <div 
            style={{
              padding: '14px 18px',
              borderRadius: '16px',
              background: isLight ? '#FFF0F3' : 'linear-gradient(135deg, rgba(244, 63, 94, 0.12) 0%, rgba(225, 29, 72, 0.06) 100%)',
              border: isLight ? '1.5px solid #FECDD3' : '1px solid rgba(244, 63, 94, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: isLight ? '#0F172A' : '#F8FAFC' }}>
              Toplam Harcama:
            </span>
            <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#E11D48', letterSpacing: '-0.02em' }}>
              {formatTurkishMoneyDisplay(totalAmount)}
            </span>
          </div>

          {items.length > 3 && (
            <input
              type="text"
              placeholder="Giderlerde ara (açıklama, tarih...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                marginTop: '12px',
                padding: '10px 14px',
                borderRadius: '12px',
                background: isLight ? '#F8FAFC' : 'rgba(255, 255, 255, 0.05)',
                border: isLight ? '1.5px solid #CBD5E1' : '1px solid var(--border-color)',
                color: isLight ? '#0F172A' : '#F8FAFC',
                fontSize: '0.88rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          )}
        </div>

        {/* Expenses List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 20px 20px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: isLight ? '#64748B' : '#94A3B8', fontSize: '0.85rem' }}>
              {items.length === 0 ? 'Henüz kaydedilmiş gider bulunmuyor.' : 'Aramanızla eşleşen gider bulunamadı.'}
            </div>
          ) : (
            filteredItems.map(item => (
              <div
                key={item.id}
                style={{
                  padding: '12px 14px',
                  borderRadius: '14px',
                  background: isLight ? '#F8FAFC' : 'rgba(255, 255, 255, 0.04)',
                  border: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: isLight ? '#0F172A' : '#F8FAFC', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.description}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: isLight ? '#64748B' : '#94A3B8', marginTop: '3px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#E11D48', flexShrink: 0 }}>
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <span>{item.dateStr || 'Tarih yok'}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: '#E11D48' }}>
                    -{formatTurkishMoneyDisplay(item.amount)}
                  </span>
                  <button
                    onClick={() => {
                      if (triggerHaptic) triggerHaptic('warning');
                      onDeleteItem(block.id, item.id);
                    }}
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: 'none',
                      color: '#EF4444',
                      width: '26px',
                      height: '26px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Sil"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpenseDetailModal;

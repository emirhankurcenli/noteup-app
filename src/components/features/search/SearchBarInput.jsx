import React from 'react';
import { useLanguage } from '../../../context/LanguageContext';

export const SearchBarInput = ({ searchQuery, handleQueryChange, clearSearch, isLight, t: propT }) => {
  const ctx = useLanguage();
  const t = propT || ctx?.t || ((k) => k);
  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        background: isLight ? '#F1F5F9' : 'rgba(255, 255, 255, 0.06)',
        borderRadius: '16px',
        border: isLight ? '1.5px solid #CBD5E1' : '1.5px solid rgba(255, 255, 255, 0.12)',
        padding: '0 14px',
        boxShadow: isLight ? '0 4px 12px rgba(0,0,0,0.04)' : '0 4px 14px rgba(0,0,0,0.2)',
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>

      <input
        type="text"
        value={searchQuery}
        onChange={handleQueryChange}
        placeholder={(t('search') || 'Ara') + '...'}
        style={{
          width: '100%',
          padding: '12px 10px',
          background: 'transparent',
          border: 'none',
          outline: 'none',
          fontSize: '0.95rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
        }}
      />

      {searchQuery && (
        <button
          onClick={clearSearch}
          style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: 'none',
            color: '#EF4444',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default SearchBarInput;

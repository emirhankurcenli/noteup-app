import React from 'react';

const FriendShareCheckRow = ({ friend, isSelected, onToggle, isLight }) => {
  return (
    <div
      onClick={onToggle}
      style={{
        padding: '12px 14px',
        borderRadius: '14px',
        background: isSelected 
          ? (isLight ? '#EFF6FF' : 'rgba(59, 130, 246, 0.12)')
          : (isLight ? '#F8FAFC' : 'rgba(255,255,255,0.04)'),
        border: isSelected
          ? '1.5px solid #3B82F6'
          : (isLight ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.06)'),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img
          src={friend.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=friend'}
          alt="Avatar"
          style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
        />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: isLight ? '#0F172A' : '#FFFFFF' }}>
            {friend.name || 'Arkadaş'}
          </span>
          <span style={{ fontSize: '0.72rem', color: isLight ? '#64748B' : '#94A3B8' }}>
            {friend.email}
          </span>
        </div>
      </div>

      <div style={{
        width: '20px',
        height: '20px',
        borderRadius: '6px',
        border: isSelected ? 'none' : (isLight ? '2px solid #CBD5E1' : '2px solid rgba(255,255,255,0.2)'),
        background: isSelected ? 'linear-gradient(135deg, #3B82F6, #2563EB)' : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#FFFFFF',
        fontSize: '0.75rem',
        fontWeight: 'bold'
      }}>
        {isSelected && '✓'}
      </div>
    </div>
  );
};

export default FriendShareCheckRow;

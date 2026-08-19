import React, { useState, useEffect } from 'react';

const AccountProfileHeader = ({
  user,
  setShowAvatarPicker,
  profileName,
  handleUpdateProfileName,
  DEFAULT_AVATARS,
  triggerHaptic,
  isLight,
  t
}) => {
  const [tempName, setTempName] = useState(profileName || user?.name || '');

  useEffect(() => {
    setTempName(profileName || user?.name || '');
  }, [profileName, user?.name]);

  const isNameChanged = tempName.trim() !== '' && tempName.trim() !== (profileName || user?.name || '');

  return (
    <div style={{
      padding: '24px 20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      background: isLight ? 'rgba(255,255,255,0.85)' : 'rgba(18, 24, 36, 0.85)',
      backdropFilter: 'blur(16px)',
      borderRadius: '20px',
      border: isLight ? '1px solid rgba(0,0,0,0.06)' : '1px solid rgba(255,255,255,0.08)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
      position: 'relative'
    }}>
      {/* Avatar with Edit Badge */}
      <div 
        onClick={() => setShowAvatarPicker(true)} 
        style={{ cursor: 'pointer', position: 'relative', width: '90px', height: '90px', marginBottom: '14px' }}
      >
        <img 
          src={user?.photoURL} 
          alt="Avatar" 
          style={{
            width: '90px',
            height: '90px',
            borderRadius: '50%',
            border: '3px solid var(--btn-primary-bg)',
            objectFit: 'cover',
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)'
          }}
          onError={(e) => {
            if (DEFAULT_AVATARS && DEFAULT_AVATARS[0]) {
              e.target.src = DEFAULT_AVATARS[0].url;
            }
          }} 
        />
        <div style={{
          position: 'absolute',
          right: '2px',
          bottom: '2px',
          background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          border: '2px solid #FFF'
        }}>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
        </div>
      </div>

      {/* User Info */}
      <div style={{ textAlign: 'center', width: '100%', marginBottom: '16px' }}>
        <span style={{ fontSize: '1.25rem', fontWeight: 800, color: isLight ? '#0F172A' : '#FFFFFF' }}>{user?.name}</span>
        <span style={{ fontSize: '0.85rem', color: isLight ? '#1E293B' : '#CBD5E1', fontWeight: 700, display: 'block', marginTop: '2px' }}>{user?.email}</span>
      </div>

      {/* Profile Name Input with Apply Button */}
      <div style={{ width: '100%', borderTop: isLight ? '1px solid rgba(0,0,0,0.06)' : '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
        <label style={{ fontSize: '0.78rem', fontWeight: 800, color: isLight ? '#1E293B' : '#CBD5E1', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {t('profileNameLabel')}
        </label>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
          <input 
            type="text" 
            className="input-field" 
            placeholder={t('profileNamePlaceholder')} 
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && isNameChanged) {
                if (triggerHaptic) triggerHaptic('medium');
                handleUpdateProfileName(tempName);
              }
            }}
            style={{ 
              flex: 1,
              padding: '10px 14px',
              borderRadius: '12px',
              fontSize: '0.9rem',
              fontWeight: 700,
              color: isLight ? '#0F172A' : '#FFFFFF',
              background: isLight ? '#F8FAFC' : 'rgba(0,0,0,0.2)',
              border: isLight ? '1px solid #CBD5E1' : '1px solid rgba(255,255,255,0.1)'
            }}
          />
          <button
            onClick={() => {
              if (isNameChanged) {
                if (triggerHaptic) triggerHaptic('medium');
                handleUpdateProfileName(tempName);
              }
            }}
            disabled={!isNameChanged}
            style={{
              padding: '10px 16px',
              borderRadius: '12px',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 800,
              background: isNameChanged ? 'linear-gradient(135deg, #3B82F6, #2563EB)' : 'rgba(148, 163, 184, 0.2)',
              color: isNameChanged ? '#FFFFFF' : '#94A3B8',
              cursor: isNameChanged ? 'pointer' : 'default',
              boxShadow: isNameChanged ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            {t('saveBtn')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountProfileHeader;

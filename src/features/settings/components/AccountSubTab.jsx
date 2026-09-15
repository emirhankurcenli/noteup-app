import React from 'react';
import AccountProfileHeader from '@features/settings/components/account/AccountProfileHeader';
import LogoutActionCard from '@features/settings/components/account/LogoutActionCard';
import { stripHtml as cleanText } from '@shared/utils/textUtils';
import { MAX_STORAGE_BYTES } from '@features/notes/hooks/useAppLocalState';

const AccountSubTab = ({
  user,
  setShowAvatarPicker,
  profileName,
  handleUpdateProfileName,
  getStorageUsageBytes,
  formatBytes,
  isLight,
  DEFAULT_AVATARS,
  deletedNotesCount = 0,
  handleTabClick,
  triggerHaptic,
  handleLogout,
  lang,
  t,
}) => {
  const usedBytes = getStorageUsageBytes ? getStorageUsageBytes() : 0;
  const limitBytes = MAX_STORAGE_BYTES;
  const percent = Math.min(100, Math.round((usedBytes / limitBytes) * 100));
  const limitText = formatBytes ? formatBytes(limitBytes) : '5 GB';

  return (
    <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* HERO PROFILE CARD */}
      <AccountProfileHeader 
        user={user}
        setShowAvatarPicker={setShowAvatarPicker}
        profileName={profileName}
        handleUpdateProfileName={handleUpdateProfileName}
        DEFAULT_AVATARS={DEFAULT_AVATARS}
        triggerHaptic={triggerHaptic}
        isLight={isLight}
        t={t}
      />

      {/* CLOUD STORAGE CARD */}
      <div style={{
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        background: isLight ? 'rgba(255,255,255,0.85)' : 'rgba(18, 24, 36, 0.85)',
        backdropFilter: 'blur(12px)',
        borderRadius: '16px',
        border: isLight ? '1px solid rgba(0,0,0,0.06)' : '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: isLight ? 'linear-gradient(135deg, #3B82F6, #1D4ED8)' : 'linear-gradient(135deg, #1E40AF, #1E3A8A)',
              border: isLight ? 'none' : '1px solid rgba(96, 165, 250, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: isLight ? '0 2px 8px rgba(59, 130, 246, 0.3)' : '0 2px 8px rgba(30, 64, 175, 0.3)'
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
              </svg>
            </div>
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: isLight ? '#0F172A' : '#FFFFFF' }}>Bulut Depolama</span>
          </div>

          <span style={{ fontSize: '0.8rem', color: isLight ? '#1E293B' : '#CBD5E1', fontWeight: 800 }}>
            {formatBytes(usedBytes)} / {limitText} ({percent}%)
          </span>
        </div>

        <div style={{ width: '100%', height: '8px', background: isLight ? '#E2E8F0' : 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{
            width: `${percent}%`,
            height: '100%',
            background: percent > 85 ? 'linear-gradient(90deg, #EF4444, #DC2626)' : percent > 60 ? 'linear-gradient(90deg, #F59E0B, #D97706)' : 'linear-gradient(90deg, #3B82F6, #2563EB)',
            borderRadius: '4px',
            transition: 'width 0.4s ease'
          }} />
        </div>
      </div>

      {/* TRASH / RECENTLY DELETED CARD */}
      <div 
        onClick={() => {
          if (triggerHaptic) triggerHaptic('light');
          if (handleTabClick) handleTabClick('trash');
        }}
        style={{
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: isLight ? 'rgba(255,255,255,0.85)' : 'rgba(18, 24, 36, 0.85)',
          backdropFilter: 'blur(12px)',
          borderRadius: '16px',
          border: isLight ? '1px solid rgba(0,0,0,0.06)' : '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: isLight ? 'linear-gradient(135deg, #EF4444, #DC2626)' : 'linear-gradient(135deg, #991B1B, #7F1D1D)',
            border: isLight ? 'none' : '1px solid rgba(248, 113, 113, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: isLight ? '0 4px 12px rgba(239, 68, 68, 0.3)' : '0 4px 12px rgba(153, 27, 27, 0.3)'
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: isLight ? '#0F172A' : '#FFFFFF' }}>
              {t('trashBin')}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            fontSize: '0.8rem',
            fontWeight: 800,
            width: '26px',
            height: '26px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: deletedNotesCount > 0 ? 'rgba(239, 68, 68, 0.12)' : (isLight ? '#F1F5F9' : 'rgba(255,255,255,0.08)'),
            color: deletedNotesCount > 0 ? '#EF4444' : 'var(--text-muted)',
            border: deletedNotesCount > 0 ? '1px solid rgba(239, 68, 68, 0.25)' : 'none',
            flexShrink: 0
          }}>
            {deletedNotesCount}
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)' }}>
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      </div>

      {/* SECTION: Sign Out Action */}
      <LogoutActionCard 
        handleLogout={handleLogout}
        triggerHaptic={triggerHaptic}
        isLight={isLight}
        lang={lang}
      />

    </div>
  );
};

export default AccountSubTab;

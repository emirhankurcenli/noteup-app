import React from 'react';
import AccountSubTab from './AccountSubTab';
import SocialSubTab from './SocialSubTab';
import SettingsSubTab from './SettingsSubTab';

const ProfileTab = ({
  userPlan,
  theme,
  setTheme,
  lang,
  setLang,
  triggerHaptic,
  profileSubTab,
  setProfileSubTab,
  user,
  setShowAvatarPicker,
  profileName,
  handleUpdateProfileName,
  getStorageUsageBytes,
  PLAN_STORAGE_LIMITS,
  formatBytes,
  setShowPaywall,
  myCode,
  setToast,
  partnerCodeInput,
  setPartnerCodeInput,
  formatFriendCode,
  isSendingRequest,
  handleSendFriendRequest,
  friendRequests,
  handleAcceptFriendRequest,
  handleRejectFriendRequest,
  handleCancelFriendRequest,
  friends,
  handleDisconnect,
  permissionStates,
  handleLogout,
  DEFAULT_AVATARS,
  deletedNotesCount = 0,
  handleTabClick,
  grantedUltraFriendCode,
  ultraGiftFrom,
  isPrimaryUltra,
  isGiftedUltra,
  handleGrantUltraGift,
  t
}) => {
  const isLight = theme === 'light';

  return (
    <div className="animate-slide-up" style={{ paddingBottom: '24px' }}>
      {/* Modern iOS Segmented Control */}
      <div style={{
        display: 'flex',
        background: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
        borderRadius: '16px',
        padding: '4px',
        marginBottom: '20px',
        border: isLight ? '1px solid rgba(0,0,0,0.06)' : '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(12px)'
      }}>
        {/* Account Tab Button */}
        <button
          onClick={() => { triggerHaptic('light'); setProfileSubTab('account'); }}
          style={{
            flex: 1,
            padding: '10px 8px',
            borderRadius: '12px',
            border: 'none',
            fontSize: '0.8rem',
            fontWeight: '700',
            cursor: 'pointer',
            background: profileSubTab === 'account' ? (isLight ? '#FFFFFF' : 'linear-gradient(135deg, #3B82F6, #2563EB)') : 'transparent',
            color: profileSubTab === 'account' ? (isLight ? '#0F172A' : '#FFFFFF') : 'var(--text-secondary)',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: profileSubTab === 'account' ? '0 4px 12px rgba(0,0,0,0.12)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          {lang === 'tr' ? 'Hesap' : 'Account'}
        </button>

        {/* Social Tab Button */}
        <button
          onClick={() => { triggerHaptic('light'); setProfileSubTab('social'); }}
          style={{
            flex: 1,
            padding: '10px 8px',
            borderRadius: '12px',
            border: 'none',
            fontSize: '0.8rem',
            fontWeight: '700',
            cursor: 'pointer',
            background: profileSubTab === 'social' ? (isLight ? '#FFFFFF' : 'linear-gradient(135deg, #3B82F6, #2563EB)') : 'transparent',
            color: profileSubTab === 'social' ? (isLight ? '#0F172A' : '#FFFFFF') : 'var(--text-secondary)',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: profileSubTab === 'social' ? '0 4px 12px rgba(0,0,0,0.12)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M9 21v-2a4 4 0 0 1 3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            <circle cx="9" cy="7" r="4" />
          </svg>
          {lang === 'tr' ? 'Sosyal' : 'Social'}
        </button>

        {/* Settings Tab Button */}
        <button
          onClick={() => { triggerHaptic('light'); setProfileSubTab('settings'); }}
          style={{
            flex: 1,
            padding: '10px 6px',
            borderRadius: '12px',
            border: 'none',
            fontSize: '0.75rem',
            fontWeight: '700',
            cursor: 'pointer',
            background: profileSubTab === 'settings' ? (isLight ? '#FFFFFF' : 'linear-gradient(135deg, #3B82F6, #2563EB)') : 'transparent',
            color: profileSubTab === 'settings' ? (isLight ? '#0F172A' : '#FFFFFF') : 'var(--text-secondary)',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: profileSubTab === 'settings' ? '0 4px 12px rgba(0,0,0,0.12)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px'
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          {lang === 'tr' ? 'Ayarlar' : 'Settings'}
        </button>
      </div>

      <div className="match-section" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* --- SUBTAB 1: ACCOUNT & MEMBERSHIP --- */}
        {profileSubTab === 'account' && (
          <AccountSubTab
            user={user}
            setShowAvatarPicker={setShowAvatarPicker}
            profileName={profileName}
            handleUpdateProfileName={handleUpdateProfileName}
            userPlan={userPlan}
            setShowPaywall={setShowPaywall}
            getStorageUsageBytes={getStorageUsageBytes}
            PLAN_STORAGE_LIMITS={PLAN_STORAGE_LIMITS}
            formatBytes={formatBytes}
            isLight={isLight}
            DEFAULT_AVATARS={DEFAULT_AVATARS}
            deletedNotesCount={deletedNotesCount}
            handleTabClick={handleTabClick}
            triggerHaptic={triggerHaptic}
            handleLogout={handleLogout}
            lang={lang}
            t={t}
          />
        )}

        {/* --- SUBTAB 2: SOCIAL & COLLABORATION --- */}
        {profileSubTab === 'social' && (
          <SocialSubTab
            myCode={myCode}
            setToast={setToast}
            partnerCodeInput={partnerCodeInput}
            setPartnerCodeInput={setPartnerCodeInput}
            formatFriendCode={formatFriendCode}
            isSendingRequest={isSendingRequest}
            handleSendFriendRequest={handleSendFriendRequest}
            friendRequests={friendRequests}
            handleAcceptFriendRequest={handleAcceptFriendRequest}
            handleRejectFriendRequest={handleRejectFriendRequest}
            handleCancelFriendRequest={handleCancelFriendRequest}
            friends={friends}
            handleDisconnect={handleDisconnect}
            userPlan={userPlan}
            grantedUltraFriendCode={grantedUltraFriendCode}
            ultraGiftFrom={ultraGiftFrom}
            isPrimaryUltra={isPrimaryUltra}
            isGiftedUltra={isGiftedUltra}
            handleGrantUltraGift={handleGrantUltraGift}
            lang={lang}
            isLight={isLight}
            t={t}
          />
        )}

        {/* --- SUBTAB 3: SYSTEM SETTINGS & PERMISSIONS --- */}
        {profileSubTab === 'settings' && (
          <SettingsSubTab
            theme={theme}
            setTheme={setTheme}
            lang={lang}
            setLang={setLang}
            triggerHaptic={triggerHaptic}
            permissionStates={permissionStates}
            handleLogout={handleLogout}
            isLight={isLight}
            t={t}
          />
        )}
      </div>
    </div>
  );
};

export default ProfileTab;

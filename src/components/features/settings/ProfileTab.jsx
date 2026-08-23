import React from 'react';
import AccountSubTab from './AccountSubTab';
import SocialSubTab from './SocialSubTab';
import SettingsSubTab from './SettingsSubTab';
import ProfileTabBar from './ProfileTabBar';

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
  handleRequestMicPermission,
  handleRequestStoragePermission,
  handleRequestAudioPermission,
  handleRequestLocationPermission,
  checkAndRequestNotificationPermission,
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
      <ProfileTabBar 
        profileSubTab={profileSubTab}
        setProfileSubTab={setProfileSubTab}
        triggerHaptic={triggerHaptic}
        isLight={isLight}
        t={t}
      />

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
            handleRequestMicPermission={handleRequestMicPermission}
            handleRequestStoragePermission={handleRequestStoragePermission}
            handleRequestAudioPermission={handleRequestAudioPermission}
            handleRequestLocationPermission={handleRequestLocationPermission}
            checkAndRequestNotificationPermission={checkAndRequestNotificationPermission}
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

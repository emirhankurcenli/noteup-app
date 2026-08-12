import React, { useState } from 'react';
import NotesGrid from '../features/notes/NotesGrid';
import RemindersTab from '../features/notes/RemindersTab';
import TrashTab from '../features/notes/TrashTab';
import ProfileTab from '../features/settings/ProfileTab';
import SearchTab from '../features/search/SearchTab';

const WorkspaceTabs = ({
  activeTab,
  getVisibleNotes,
  notes,
  reminders,
  activeMenuNoteId,
  setActiveMenuNoteId,
  requestBiometricAuth,
  setNotes,
  persistNotes,
  setToast,
  getRemainingTimeText,
  handleMoveToTrash,
  openEditingNote,
  setActiveTab,
  checkAndRequestNotificationPermission,
  setReminderNoteId,
  setShowReminderModal,
  setActiveShareNoteId,
  setNudgeTargetNote,
  permissionStates,
  handleCancelReminder,
  handleRestoreNote,
  handlePermanentDelete,
  handleBulkRestoreNotes,
  handleBulkPermanentDelete,
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
  handleLogout,
  DEFAULT_AVATARS,
  grantedUltraFriendCode,
  ultraGiftFrom,
  isPrimaryUltra,
  isGiftedUltra,
  handleGrantUltraGift,
  t,
}) => {
  // Persistent search query — survives tab switches until manually cleared
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="app-content">
      {/* TAB 0: SEARCH */}
      {activeTab === 'search' && (
        <SearchTab
          notes={notes}
          openEditingNote={openEditingNote}
          theme={theme}
          lang={lang}
          t={t}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      )}

      {/* TAB 1: NOTES LIST VIEW */}
      {activeTab === 'notes' && (
        <NotesGrid
          visibleNotes={getVisibleNotes()}
          reminders={reminders}
          activeMenuNoteId={activeMenuNoteId}
          setActiveMenuNoteId={setActiveMenuNoteId}
          requestBiometricAuth={requestBiometricAuth}
          setNotes={setNotes}
          persistNotes={persistNotes}
          setToast={setToast}
          getRemainingTimeText={getRemainingTimeText}
          handleMoveToTrash={handleMoveToTrash}
          openEditingNote={openEditingNote}
          setReminderNoteId={setReminderNoteId}
          setShowReminderModal={setShowReminderModal}
          handleCancelReminder={handleCancelReminder}
          setActiveShareNoteId={setActiveShareNoteId}
          setNudgeTargetNote={setNudgeTargetNote}
          checkAndRequestNotificationPermission={checkAndRequestNotificationPermission}
          lang={lang}
          t={t}
        />
      )}

      {/* TAB 2: REMINDERS VIEW */}
      {activeTab === 'reminders' && (
        <RemindersTab
          notes={notes}
          reminders={reminders}
          permissionStates={permissionStates}
          checkAndRequestNotificationPermission={checkAndRequestNotificationPermission}
          handleCancelReminder={handleCancelReminder}
          lang={lang}
          t={t}
        />
      )}

      {/* TAB 3: TRASH BIN VIEW */}
      {activeTab === 'trash' && (
        <TrashTab
          notes={notes}
          handleRestoreNote={handleRestoreNote}
          handlePermanentDelete={handlePermanentDelete}
          handleBulkRestoreNotes={handleBulkRestoreNotes}
          handleBulkPermanentDelete={handleBulkPermanentDelete}
          openEditingNote={openEditingNote}
          setActiveTab={setActiveTab}
          theme={theme}
          lang={lang}
          t={t}
        />
      )}

      {/* TAB: SHARED NOTES VIEW */}
      {activeTab === 'shared' && (() => {
        const sharedNotesList = (notes || []).filter(n => n && !n.deletedAt && (n.isShared || (n.sharedWith && n.sharedWith.length > 0)));
        return (
          <NotesGrid
            visibleNotes={sharedNotesList}
            reminders={reminders}
            activeMenuNoteId={activeMenuNoteId}
            setActiveMenuNoteId={setActiveMenuNoteId}
            requestBiometricAuth={requestBiometricAuth}
            setNotes={setNotes}
            persistNotes={persistNotes}
            setToast={setToast}
            getRemainingTimeText={getRemainingTimeText}
            handleMoveToTrash={handleMoveToTrash}
            openEditingNote={openEditingNote}
            setReminderNoteId={setReminderNoteId}
            setShowReminderModal={setShowReminderModal}
            handleCancelReminder={handleCancelReminder}
            setActiveShareNoteId={setActiveShareNoteId}
            setNudgeTargetNote={setNudgeTargetNote}
            checkAndRequestNotificationPermission={checkAndRequestNotificationPermission}
            lang={lang}
            t={t}
          />
        );
      })()}

      {/* TAB 4: PROFILE & COLLABORATION VIEW */}
      {activeTab === 'profile' && (
        <ProfileTab
          userPlan={userPlan}
          theme={theme}
          setTheme={setTheme}
          lang={lang}
          setLang={setLang}
          triggerHaptic={triggerHaptic}
          profileSubTab={profileSubTab}
          setProfileSubTab={setProfileSubTab}
          user={user}
          setShowAvatarPicker={setShowAvatarPicker}
          profileName={profileName}
          handleUpdateProfileName={handleUpdateProfileName}
          getStorageUsageBytes={getStorageUsageBytes}
          PLAN_STORAGE_LIMITS={PLAN_STORAGE_LIMITS}
          formatBytes={formatBytes}
          setShowPaywall={setShowPaywall}
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
          permissionStates={permissionStates}
          handleLogout={handleLogout}
          DEFAULT_AVATARS={DEFAULT_AVATARS}
          deletedNotesCount={(notes || []).filter(n => n && n.deletedAt).length}
          handleTabClick={setActiveTab}
          grantedUltraFriendCode={grantedUltraFriendCode}
          ultraGiftFrom={ultraGiftFrom}
          isPrimaryUltra={isPrimaryUltra}
          isGiftedUltra={isGiftedUltra}
          handleGrantUltraGift={handleGrantUltraGift}
          t={t}
        />
      )}
    </div>
  );
};

export default WorkspaceTabs;

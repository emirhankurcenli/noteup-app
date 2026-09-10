import React from 'react';
import PaywallScreen from '@features/paywall/components/PaywallScreen';
import ModalOverlays from '@shared/components/ModalOverlays';
import IncomingShareModal from '@features/sharing/modals/IncomingShareModal';
import LightboxModal from '@shared/components/LightboxModal';
import DocumentPreviewModal from '@shared/components/DocumentPreviewModal';
import ShareOptionsModal from '@features/sharing/modals/ShareOptionsModal';
import AdModal from '@features/ads/modals/AdModal';
import AvatarPickerModal from '@features/settings/modals/AvatarPickerModal';
import WidgetAlarmModal from '@shared/components/WidgetAlarmModal';
import ReminderModal from '@features/reminders/modals/ReminderModal';
import SelectFriendsShareModal from '@features/sharing/modals/SelectFriendsShareModal';
import RewardedAdModal from '@features/ads/modals/RewardedAdModal';
import FeedbackModal from '@features/settings/modals/FeedbackModal';
import NudgePromptModal from '@features/ads/modals/NudgePromptModal';
import DrumPicker from '@shared/components/DrumPicker';
import EncryptedImage from '@shared/components/EncryptedImage';


const AppModals = ({
  notes,
  showReminderModal, setShowReminderModal, reminderTime, setReminderTime, reminderModes, setReminderModes, handleSetReminder,
  activeShareNoteId, setActiveShareNoteId, friends, selectedFriendCodes, setSelectedFriendCodes, handleSendShareInvitation,
  handleAcceptShare, handleRejectShare,
  lightboxUrl, setLightboxUrl, handleCloseLightbox, lightboxOverlayRef, lightboxImgRef, handleLightboxDoubleTap,
  previewFileModal, setPreviewFileModal,
  showShareModal, setShowShareModal, editingNote, handleShareNoteImage,
  showPaywall, setShowPaywall, userPlan, setUserPlan,
  planNotification, setPlanNotification, confirmDialog, setConfirmDialog, getLostFeatures, getChangedFeatures, PLAN_LEVELS,
  showAdModal, setShowAdModal,
  showAvatarPicker, setShowAvatarPicker, user, setToast, handleSelectAvatar, DEFAULT_AVATARS, checkAndRequestNotificationPermission,
  pendingWidgetAlarmCtx, handleCancelWidgetAlarm, quickReminderTitle, setQuickReminderTitle, quickReminderTime, setQuickReminderTime, quickReminderModes, setQuickReminderModes, handleCreateWidgetAlarm,
  showRewardedAdModal, setShowRewardedAdModal,
  pendingShareReward, setPendingShareReward,
  handleRewardedShareCallback,
  showFeedbackModal, setShowFeedbackModal, myCode, profileName,
  nudgeTargetNote, setNudgeTargetNote, handleSendNudge,
  theme, lang, t, triggerHaptic
}) => {
  return (
    <>
      {/* 2. Add Reminder Modal */}
      <ReminderModal
        showReminderModal={showReminderModal}
        setShowReminderModal={setShowReminderModal}
        reminderTime={reminderTime}
        setReminderTime={setReminderTime}
        reminderModes={reminderModes}
        setReminderModes={setReminderModes}
        handleSetReminder={handleSetReminder}
        lang={lang}
        theme={theme}
        t={t}
        triggerHaptic={triggerHaptic}
      />

      {/* 4. Select Friends to Share Note Modal */}
      <SelectFriendsShareModal
        activeShareNoteId={activeShareNoteId}
        setActiveShareNoteId={setActiveShareNoteId}
        friends={friends}
        selectedFriendCodes={selectedFriendCodes}
        setSelectedFriendCodes={setSelectedFriendCodes}
        handleSendShareInvitation={handleSendShareInvitation}
        notes={notes || (editingNote ? [editingNote] : [])}
        theme={theme}
        lang={lang}
        t={t}
        userPlan={userPlan}
        setShowPaywall={setShowPaywall}
        setShowRewardedAdModal={setShowRewardedAdModal}
        setPendingShareReward={setPendingShareReward}
      />



      {/* Lightbox Image Preview */}
      <LightboxModal
        lightboxUrl={lightboxUrl}
        onClose={() => setLightboxUrl(null)}
        t={t}
      />

      {/* In-App Document Preview Modal */}
      <DocumentPreviewModal
        previewFileModal={previewFileModal}
        setPreviewFileModal={setPreviewFileModal}
      />

      {/* 📤 Share Options Modal */}
      <ShareOptionsModal
        showShareModal={showShareModal}
        setShowShareModal={setShowShareModal}
        editingNote={editingNote}
        handleShareNoteImage={handleShareNoteImage}
        setActiveShareNoteId={setActiveShareNoteId}
        checkAndRequestNotificationPermission={checkAndRequestNotificationPermission}
        theme={theme}
        t={t}
        userPlan={userPlan}
        setToast={setToast}
        setConfirmDialog={setConfirmDialog}
        lang={lang}
      />

      {/* 💎 Paywall / Plan Seçim Ekranı */}
      {showPaywall && (
        <PaywallScreen
          theme={theme}
          currentPlan={userPlan}
          onClose={() => setShowPaywall(false)}
          onSelectPlan={(planId) => {
            setUserPlan(planId);
            if (planId === 'lite') {
              setShowPaywall(false);
            }
          }}
        />
      )}

      <ModalOverlays
        planNotification={planNotification}
        setPlanNotification={setPlanNotification}
        confirmDialog={confirmDialog}
        setConfirmDialog={setConfirmDialog}
        theme={theme}
        triggerHaptic={triggerHaptic}
        getLostFeatures={getLostFeatures}
        getChangedFeatures={getChangedFeatures}
        PLAN_LEVELS={PLAN_LEVELS}
        t={t}
      />

      {/* 🚀 Sponsorlu Reklam Modal */}
      <AdModal
        showAdModal={showAdModal}
        setShowAdModal={setShowAdModal}
        setShowPaywall={setShowPaywall}
      />

      {/* Avatar Picker Modal */}
      <AvatarPickerModal
        showAvatarPicker={showAvatarPicker}
        setShowAvatarPicker={setShowAvatarPicker}
        handleSelectAvatar={handleSelectAvatar}
        DEFAULT_AVATARS={DEFAULT_AVATARS}
        user={user}
        t={t}
      />

      {/* 7. Inline Widget Alarm Modal */}
      <WidgetAlarmModal
        pendingWidgetAlarmCtx={pendingWidgetAlarmCtx}
        handleCancelWidgetAlarm={handleCancelWidgetAlarm}
        quickReminderTitle={quickReminderTitle}
        setQuickReminderTitle={setQuickReminderTitle}
        quickReminderTime={quickReminderTime}
        setQuickReminderTime={setQuickReminderTime}
        quickReminderModes={quickReminderModes}
        setQuickReminderModes={setQuickReminderModes}
        handleCreateWidgetAlarm={handleCreateWidgetAlarm}
        lang={lang}
        theme={theme}
        t={t}
        triggerHaptic={triggerHaptic}
      />
      {/* 🎬 Ödüllü Reklam - Arkadaş Daveti (Yalnızca Lite plan 2. davet) */}
      <RewardedAdModal
        show={showRewardedAdModal}
        onClose={() => setShowRewardedAdModal(false)}
        onRewardGranted={() => handleRewardedShareCallback(pendingShareReward)}
        setShowPaywall={setShowPaywall}
        theme={theme}
        lang={lang}
      />

      {/* 📣 Dürt / Bildirim Gönder Modalı */}
      <NudgePromptModal
        nudgeTargetNote={nudgeTargetNote}
        setNudgeTargetNote={setNudgeTargetNote}
        handleSendNudge={handleSendNudge}
        lang={lang}
        theme={theme}
        triggerHaptic={triggerHaptic}
      />

      {/* 💡 İstek ve Öneri Modalı */}
      <FeedbackModal
        show={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        myCode={myCode}
        profileName={profileName}
        userPlan={userPlan}
        setToast={setToast}
        theme={theme}
        lang={lang}
        triggerHaptic={triggerHaptic}
        t={t}
      />
    </>
  );
};

export default AppModals;

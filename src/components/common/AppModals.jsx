import React from 'react';
import PaywallScreen from '../features/paywall/PaywallScreen';
import ModalOverlays from './ModalOverlays';
import IncomingShareModal from '../modals/IncomingShareModal';
import LightboxModal from '../modals/LightboxModal';
import DocumentPreviewModal from '../modals/DocumentPreviewModal';
import ShareOptionsModal from '../modals/ShareOptionsModal';
import AdModal from '../modals/AdModal';
import AvatarPickerModal from '../modals/AvatarPickerModal';
import WidgetAlarmModal from '../modals/WidgetAlarmModal';
import ReminderModal from '../modals/ReminderModal';
import SelectFriendsShareModal from '../modals/SelectFriendsShareModal';
import RewardedAdModal from '../modals/RewardedAdModal';
import FeedbackModal from '../modals/FeedbackModal';
import NudgePromptModal from '../modals/NudgePromptModal';
import DrumPicker from './DrumPicker';
import EncryptedImage from './EncryptedImage';
import { convertHeicToJpegIfNecessary } from '../../utils/mediaUtils';

// Helper to get local date-time string in YYYY-MM-DDTHH:mm format
const getNowLocalDateTimeString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Safe helper to parse "YYYY-MM-DDTHH:mm" datetime string
const parseDateTimeString = (val) => {
  const now = new Date();
  if (!val || typeof val !== 'string') return now;
  const parts = val.split('T');
  if (parts.length !== 2) return now;
  const [datePart, timePart] = parts;
  const [yearStr, monthStr, dayStr] = datePart.split('-');
  const [hourStr, minStr] = timePart.split(':');
  
  const y = parseInt(yearStr, 10);
  const m = parseInt(monthStr, 10) - 1;
  const day = parseInt(dayStr, 10);
  const h = parseInt(hourStr, 10);
  const min = parseInt(minStr, 10);
  
  if (isNaN(y) || isNaN(m) || isNaN(day) || isNaN(h) || isNaN(min)) return now;
  return new Date(y, m, day, h, min);
};

const AppModals = ({
  notes,
  showReminderModal, setShowReminderModal, reminderTime, setReminderTime, reminderModes, setReminderModes, handleSetReminder,
  activeShareNoteId, setActiveShareNoteId, friends, selectedFriendCodes, setSelectedFriendCodes, handleSendShareInvitation,
  incomingRequest, handleAcceptShare, handleRejectShare,
  lightboxUrl, setLightboxUrl, handleCloseLightbox, lightboxOverlayRef, lightboxImgRef, handleLightboxDoubleTap,
  previewFileModal, setPreviewFileModal,
  showShareModal, setShowShareModal, editingNote, handleShareNoteImage,
  showPaywall, setShowPaywall, userPlan, setUserPlan,
  planNotification, setPlanNotification, confirmDialog, setConfirmDialog, getLostFeatures, getChangedFeatures, PLAN_LEVELS,
  showAdModal, setShowAdModal,
  showAvatarPicker, setShowAvatarPicker, user, setToast, cropperImage, setCropperImage, handleSelectAvatar, DEFAULT_AVATARS, checkAndRequestPermission,
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

      {/* 5. Incoming Share Request Modal */}
      <IncomingShareModal
        incomingRequest={incomingRequest}
        handleAcceptShare={handleAcceptShare}
        handleRejectShare={handleRejectShare}
        lang={lang}
        t={t}
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
        userPlan={userPlan}
        setToast={setToast}
        setShowPaywall={setShowPaywall}
        cropperImage={cropperImage}
        setCropperImage={setCropperImage}
        handleSelectAvatar={handleSelectAvatar}
        DEFAULT_AVATARS={DEFAULT_AVATARS}
        user={user}
        checkAndRequestPermission={checkAndRequestPermission}
        theme={theme}
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
export { DrumPicker, EncryptedImage, convertHeicToJpegIfNecessary, parseDateTimeString, getNowLocalDateTimeString };

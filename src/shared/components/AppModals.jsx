import React from 'react';
import ModalOverlays from '@shared/components/ModalOverlays';
import LightboxModal from '@shared/components/LightboxModal';
import DocumentPreviewModal from '@shared/components/DocumentPreviewModal';
import ShareOptionsModal from '@features/sharing/modals/ShareOptionsModal';
import AvatarPickerModal from '@features/settings/modals/AvatarPickerModal';
import WidgetAlarmModal from '@shared/components/WidgetAlarmModal';
import ReminderModal from '@features/reminders/modals/ReminderModal';
import SelectFriendsShareModal from '@features/sharing/modals/SelectFriendsShareModal';
import FeedbackModal from '@features/settings/modals/FeedbackModal';

const AppModals = ({
  notes,
  showReminderModal, setShowReminderModal, reminderTime, setReminderTime, reminderModes, setReminderModes, handleSetReminder,
  activeShareNoteId, setActiveShareNoteId, friends, selectedFriendCodes, setSelectedFriendCodes, handleSendShareInvitation,
  lightboxUrl, setLightboxUrl,
  previewFileModal, setPreviewFileModal,
  showShareModal, setShowShareModal, editingNote, handleShareNoteImage,
  confirmDialog, setConfirmDialog,
  showAvatarPicker, setShowAvatarPicker, user, setToast, handleSelectAvatar, DEFAULT_AVATARS, checkAndRequestNotificationPermission,
  pendingWidgetAlarmCtx, handleCancelWidgetAlarm, quickReminderTitle, setQuickReminderTitle, quickReminderTime, setQuickReminderTime, quickReminderModes, setQuickReminderModes, handleCreateWidgetAlarm,
  showFeedbackModal, setShowFeedbackModal, myCode, profileName,
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
        setToast={setToast}
        setConfirmDialog={setConfirmDialog}
        lang={lang}
      />

      {/* Modal Overlays (Confirm Dialogs) */}
      <ModalOverlays
        confirmDialog={confirmDialog}
        setConfirmDialog={setConfirmDialog}
        theme={theme}
        triggerHaptic={triggerHaptic}
        t={t}
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

      {/* 💡 İstek ve Öneri Modalı */}
      <FeedbackModal
        show={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        myCode={myCode}
        profileName={profileName}
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

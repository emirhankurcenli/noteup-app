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
import { DEFAULT_AVATARS } from '@shared/constants/avatars';

import {
  useLanguageCtx,
  useAuthCtx,
  useNotesCtx,
  useRemindersCtx,
  useSharingCtx
} from '@shared/context/AppStateContext';

const AppModals = ({
  showReminderModal, setShowReminderModal,
  activeShareNoteId, setActiveShareNoteId,
  lightboxUrl, setLightboxUrl,
  previewFileModal, setPreviewFileModal,
  showShareModal, setShowShareModal, handleShareNoteImage,
  confirmDialog, setConfirmDialog,
  showFeedbackModal, setShowFeedbackModal,
  checkAndRequestNotificationPermission,
  theme = 'dark',
  triggerHaptic
}) => {
  const langCtx = useLanguageCtx() || {};
  const authCtx = useAuthCtx() || {};
  const notesCtx = useNotesCtx() || {};
  const remindersCtx = useRemindersCtx() || {};
  const sharingCtx = useSharingCtx() || {};

  const lang = langCtx.lang || 'tr';
  const t = langCtx.t || ((k) => k);

  const user = authCtx.user;
  const setToast = authCtx.setToast;
  const myCode = authCtx.myCode;
  const profileName = authCtx.profileName;
  const showAvatarPicker = authCtx.showAvatarPicker;
  const setShowAvatarPicker = authCtx.setShowAvatarPicker;
  const handleSelectAvatar = authCtx.handleSelectAvatar;

  const notes = notesCtx.notes;
  const editingNote = notesCtx.editingNote;

  const reminderTime = remindersCtx.reminderTime;
  const setReminderTime = remindersCtx.setReminderTime;
  const reminderModes = remindersCtx.reminderModes;
  const setReminderModes = remindersCtx.setReminderModes;
  const handleSetReminder = remindersCtx.handleSetReminder;
  const pendingWidgetAlarmCtx = remindersCtx.pendingWidgetAlarmCtx;
  const handleCancelWidgetAlarm = remindersCtx.handleCancelWidgetAlarm;
  const quickReminderTitle = remindersCtx.quickReminderTitle;
  const setQuickReminderTitle = remindersCtx.setQuickReminderTitle;
  const quickReminderTime = remindersCtx.quickReminderTime;
  const setQuickReminderTime = remindersCtx.setQuickReminderTime;
  const quickReminderModes = remindersCtx.quickReminderModes;
  const setQuickReminderModes = remindersCtx.setQuickReminderModes;
  const handleCreateWidgetAlarm = remindersCtx.handleCreateWidgetAlarm;

  const friends = sharingCtx.friends;
  const selectedFriendCodes = sharingCtx.selectedFriendCodes;
  const setSelectedFriendCodes = sharingCtx.setSelectedFriendCodes;
  const handleSendShareInvitation = sharingCtx.handleSendShareInvitation;

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

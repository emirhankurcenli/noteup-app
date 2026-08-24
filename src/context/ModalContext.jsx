import React, { createContext, useContext, useState } from 'react';

const ModalContext = createContext(null);

export const ModalProvider = ({ children }) => {
  // [EARLY ACCESS] Paywall geçici olarak devre dışı — tüm setShowPaywall(true) çağrıları yok sayılır
  const showPaywall = false;
  const setShowPaywall = () => {};
  // [EARLY ACCESS ORIGINAL] const [showPaywall, setShowPaywall] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [showAdModal, setShowAdModal] = useState(false);
  const [showRewardedAdModal, setShowRewardedAdModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState(null);
  const [previewFileModal, setPreviewFileModal] = useState(null);
  const [pendingShareReward, setPendingShareReward] = useState(null);
  const [nudgeTargetNote, setNudgeTargetNote] = useState(null);
  const [planNotification, setPlanNotification] = useState(null);

  const value = {
    showPaywall,
    setShowPaywall,
    showReminderModal,
    setShowReminderModal,
    showShareModal,
    setShowShareModal,
    confirmDialog,
    setConfirmDialog,
    showAdModal,
    setShowAdModal,
    showRewardedAdModal,
    setShowRewardedAdModal,
    showFeedbackModal,
    setShowFeedbackModal,
    showAvatarPicker,
    setShowAvatarPicker,
    lightboxUrl,
    setLightboxUrl,
    previewFileModal,
    setPreviewFileModal,
    pendingShareReward,
    setPendingShareReward,
    nudgeTargetNote,
    setNudgeTargetNote,
    planNotification,
    setPlanNotification,
  };

  return (
    <ModalContext.Provider value={value}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModals = () => {
  const context = useContext(ModalContext);
  if (!context) {
    return {
      showPaywall: false,
      setShowPaywall: () => {},
      showReminderModal: false,
      setShowReminderModal: () => {},
      showShareModal: false,
      setShowShareModal: () => {},
      confirmDialog: null,
      setConfirmDialog: () => {},
      showAdModal: false,
      setShowAdModal: () => {},
      showRewardedAdModal: false,
      setShowRewardedAdModal: () => {},
      showFeedbackModal: false,
      setShowFeedbackModal: () => {},
      showAvatarPicker: false,
      setShowAvatarPicker: () => {},
      lightboxUrl: null,
      setLightboxUrl: () => {},
      previewFileModal: null,
      setPreviewFileModal: () => {},
      pendingShareReward: null,
      setPendingShareReward: () => {},
      nudgeTargetNote: null,
      setNudgeTargetNote: () => {},
      planNotification: null,
      setPlanNotification: () => {},
    };
  }
  return context;
};

export default ModalContext;

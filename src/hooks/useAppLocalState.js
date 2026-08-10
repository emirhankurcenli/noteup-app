import React, { useState, useEffect, useRef, useCallback } from 'react';
import { showInterstitialAd } from '../services/adService';

const cachedRemoteLimits = (() => {
  try {
    const item = localStorage.getItem('s23_remote_plan_limits');
    return item ? JSON.parse(item) : null;
  } catch (e) {
    return null;
  }
})();

export const PLAN_STORAGE_LIMITS = cachedRemoteLimits || {
  lite: 50 * 1024 * 1024,          // 50 MB (Varsayılan yedek)
  pro: 1 * 1024 * 1024 * 1024,     // 1 GB (Varsayılan yedek)
  ultra: 5 * 1024 * 1024 * 1024,   // 5 GB (Varsayılan yedek)
};

export default function useAppLocalState({ notes, userPlan }) {
  const [activeTodoItemId, setActiveTodoItemId] = useState(null);
  const [activeTab, setActiveTab] = useState('notes');
  const tabHistoryRef = useRef(['notes']);

  useEffect(() => {
    const history = tabHistoryRef.current;
    if (history[history.length - 1] !== activeTab) {
      history.push(activeTab);
    }
    window.scrollTo(0, 0);
    const mainContent = document.querySelector('.app-content') || document.querySelector('.workspace-container');
    if (mainContent) mainContent.scrollTop = 0;
  }, [activeTab]);

  const [profileSubTab, setProfileSubTab] = useState('account');
  const [showPaywall, setShowPaywall] = useState(false);
  const [cropperImage, setCropperImage] = useState(null);
  const [showAdModal, setShowAdModal] = useState(false);

  const getStorageUsageBytes = useCallback(() => {
    let totalBytes = 0;
    (notes || []).forEach(n => {
      (n.blocks || []).forEach(b => {
        if (b && (b.type === 'image' || b.type === 'file' || b.type === 'audio')) {
          if (b.size && typeof b.size === 'number') {
            totalBytes += b.size;
          } else if (b.url && b.url.startsWith('data:')) {
            totalBytes += Math.round((b.url.length - 22) * 3 / 4);
          } else {
            totalBytes += 250 * 1024;
          }
        }
      });
    });
    return totalBytes;
  }, [notes]);

  const trackAttachmentAdded = async () => {
    if (userPlan !== 'lite') return;
    const currentRaw = localStorage.getItem('s23_attachment_count');
    const currentCount = currentRaw ? parseInt(currentRaw, 10) : 0;
    const newCount = currentCount + 1;
    localStorage.setItem('s23_attachment_count', newCount.toString());

    if (newCount % 5 === 0) {
      await showInterstitialAd(() => setShowAdModal(true));
    }
  };

  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [activeMenuNoteId, setActiveMenuNoteId] = useState(null);
  const [activeShareNoteId, setActiveShareNoteId] = useState(null);
  const [blockFormStates, setBlockFormStates] = useState({});
  const [showEditorMenu, setShowEditorMenu] = useState(false);
  const focusedBlockRef = useRef({ id: null, pos: 0, selStart: 0, selEnd: 0 });
  const fileInputRef = useRef(null);
  const [lightboxUrl, setLightboxUrl] = useState(null);
  const [previewFileModal, setPreviewFileModal] = useState(null);
  const [showQuickReminderForm, setShowQuickReminderForm] = useState(false);
  const [pendingOpenNoteId, setPendingOpenNoteId] = useState(null);
  const [showRewardedAdModal, setShowRewardedAdModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [nudgeTargetNote, setNudgeTargetNote] = useState(null);

  const [theme, setTheme] = useState(() => localStorage.getItem('s23_theme') || 'dark');

  useEffect(() => {
    localStorage.setItem('s23_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (activeTab !== 'reminders') return;
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, [activeTab]);

  return {
    activeTodoItemId,
    setActiveTodoItemId,
    activeTab,
    setActiveTab,
    tabHistoryRef,
    profileSubTab,
    setProfileSubTab,
    showPaywall,
    setShowPaywall,
    cropperImage,
    setCropperImage,
    showAdModal,
    setShowAdModal,
    PLAN_STORAGE_LIMITS,
    getStorageUsageBytes,
    trackAttachmentAdded,
    showReminderModal,
    setShowReminderModal,
    showShareModal,
    setShowShareModal,
    confirmDialog,
    setConfirmDialog,
    activeMenuNoteId,
    setActiveMenuNoteId,
    activeShareNoteId,
    setActiveShareNoteId,
    blockFormStates,
    setBlockFormStates,
    showEditorMenu,
    setShowEditorMenu,
    focusedBlockRef,
    fileInputRef,
    lightboxUrl,
    setLightboxUrl,
    previewFileModal,
    setPreviewFileModal,
    showQuickReminderForm,
    setShowQuickReminderForm,
    pendingOpenNoteId,
    setPendingOpenNoteId,
    showRewardedAdModal,
    setShowRewardedAdModal,
    showFeedbackModal,
    setShowFeedbackModal,
    nudgeTargetNote,
    setNudgeTargetNote,
    theme,
    setTheme,
    now
  };
}

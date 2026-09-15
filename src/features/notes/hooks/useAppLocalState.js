import { useState, useEffect, useRef, useCallback } from 'react';

export const MAX_STORAGE_BYTES = 5 * 1024 * 1024 * 1024; // 5 GB

export default function useAppLocalState({ notes }) {
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

  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [activeMenuNoteId, setActiveMenuNoteId] = useState(null);
  const [activeShareNoteId, setActiveShareNoteId] = useState(null);
  const [blockFormStates, setBlockFormStates] = useState({});
  const [showEditorMenu, setShowEditorMenu] = useState(false);
  const focusedBlockRef = useRef(null);
  const fileInputRef = useRef(null);
  const [lightboxUrl, setLightboxUrl] = useState(null);
  const [previewFileModal, setPreviewFileModal] = useState(null);
  const [showQuickReminderForm, setShowQuickReminderForm] = useState(false);
  const [pendingOpenNoteId, setPendingOpenNoteId] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // App Theme: 'light' | 'dark'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('app_theme') || localStorage.getItem('s23_theme') || 'light';
  });

  useEffect(() => {
    try {
      localStorage.setItem('app_theme', theme);
      localStorage.setItem('s23_theme', theme);
    } catch (_) {}
    document.documentElement.setAttribute('data-theme', theme);
    if (document.body) {
      document.body.setAttribute('data-theme', theme);
    }
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'light' ? '#F0F4F8' : '#0A0E17');
    }
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
    MAX_STORAGE_BYTES,
    getStorageUsageBytes,
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
    showFeedbackModal,
    setShowFeedbackModal,
    theme,
    setTheme,
    now
  };
}

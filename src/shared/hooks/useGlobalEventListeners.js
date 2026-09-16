/**
 * useGlobalEventListeners — thin orchestrator
 *
 * Each concern is now in its own single-responsibility hook.
 * This wrapper exists only to maintain the existing call signature in App.jsx.
 */
import { useStorageSync } from '@shared/hooks/useStorageSync';
import { useScrollLock } from '@shared/hooks/useScrollLock';
import { usePopstateNavigation } from '@shared/hooks/usePopstateNavigation';
import { useOutsideClickHandler } from '@shared/hooks/useOutsideClickHandler';
import { useToastAutoClose } from '@shared/hooks/useToastAutoClose';

export const useGlobalEventListeners = ({
  notes,
  setNotes,
  setReminders,
  myCode,
  user,
  toast,
  setToast,
  setEditingNote,
  setShowReminderModal,
  setShowEditorMenu,
  setActiveMenuNoteId,
  openEditingNote,
  persistNotes,
}) => {
  useStorageSync({ myCode, setNotes, setReminders });
  useScrollLock();
  usePopstateNavigation({ notes, setEditingNote, setShowReminderModal, setShowEditorMenu, openEditingNote });
  useOutsideClickHandler({ setActiveMenuNoteId });
  useToastAutoClose({ toast, setToast });
};

export default useGlobalEventListeners;
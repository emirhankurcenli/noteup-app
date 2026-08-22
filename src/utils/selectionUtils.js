/**
 * Selection & Rich-Text formatting utilities for NoteUp
 */

let lastSavedRange = null;
let lastTargetBlockId = null;

export const saveCurrentSelection = (blockId) => {
  const sel = window.getSelection();
  if (sel && sel.rangeCount > 0) {
    lastSavedRange = sel.getRangeAt(0).cloneRange();
    if (blockId) lastTargetBlockId = blockId;
  }
};

export const getLastSavedSelection = () => ({
  range: lastSavedRange,
  blockId: lastTargetBlockId,
});

export const clearSavedSelection = () => {
  lastSavedRange = null;
  lastTargetBlockId = null;
};

export const restoreSelection = (targetElement, customRange = null) => {
  const rangeToRestore = customRange || lastSavedRange;
  if (!targetElement) return false;

  try {
    targetElement.focus({ preventScroll: true });
  } catch (e) {
    targetElement.focus();
  }

  if (rangeToRestore) {
    try {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(rangeToRestore);
        return true;
      }
    } catch (err) {
      console.warn('Could not restore selection range:', err);
    }
  }
  return false;
};

export const applyRichFormat = ({
  command,
  value = null,
  targetBlockId,
  onUpdateContent,
}) => {
  if (!targetBlockId) return;
  const targetEl = document.querySelector(`[data-block-id="${targetBlockId}"]`);
  if (!targetEl) return;

  restoreSelection(targetEl);

  try {
    document.execCommand('styleWithCSS', false, true);
  } catch (e) {}

  try {
    document.execCommand(command, false, value);
  } catch (err) {
    console.warn(`execCommand('${command}') failed:`, err);
  }

  // Save new selection state after applying format
  saveCurrentSelection(targetBlockId);

  if (onUpdateContent && typeof onUpdateContent === 'function') {
    onUpdateContent(targetEl.innerHTML);
  }
};

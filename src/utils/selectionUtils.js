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

  const sel = window.getSelection();
  const hasTextSelected = sel && sel.rangeCount > 0 && !sel.isCollapsed;

  try {
    document.execCommand('styleWithCSS', false, true);
  } catch (e) {}

  // 1. If text is highlighted (Basılı tutularak seçilen metin)
  if (hasTextSelected) {
    try {
      document.execCommand(command, false, value);
    } catch (err) {
      console.warn(`execCommand('${command}') failed on selection:`, err);
    }
  } else {
    // 2. If no text is selected -> Cursor position for UPCOMING typing (Seçim yapıldıktan sonra yazılacak metin)
    try {
      document.execCommand(command, false, value);
    } catch (err) {
      console.warn(`execCommand('${command}') failed on cursor:`, err);
    }

    // Fallback for empty block or Android soft caret: ensure styled typing container
    const isElementEmpty = !targetEl.textContent || targetEl.textContent.trim() === '';
    if (isElementEmpty && (command === 'foreColor' || command === 'fontName' || command === 'bold')) {
      const span = document.createElement('span');
      if (command === 'foreColor' && value) span.style.color = value;
      if (command === 'fontName' && value) span.style.fontFamily = value;
      if (command === 'bold') span.style.fontWeight = 'bold';
      span.innerHTML = '&#8203;'; // zero-width space to hold the caret

      targetEl.innerHTML = '';
      targetEl.appendChild(span);

      if (sel) {
        const range = document.createRange();
        range.setStart(span.firstChild, 1);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
  }

  // Save new selection state after applying format
  saveCurrentSelection(targetBlockId);

  if (onUpdateContent && typeof onUpdateContent === 'function') {
    onUpdateContent(targetEl.innerHTML);
  }
};

export const getCurrentFormatState = (targetElement) => {
  const state = {
    isBold: false,
    isList: false,
  };

  try {
    state.isBold = document.queryCommandState('bold');
  } catch (e) {}

  try {
    state.isList = document.queryCommandState('insertUnorderedList');
  } catch (e) {}

  // Fallback: check DOM parent node of current selection
  try {
    const sel = window.getSelection();
    if (sel && sel.anchorNode) {
      let node = sel.anchorNode;
      if (node.nodeType === Node.TEXT_NODE) node = node.parentNode;
      
      if (node) {
        if (!state.isList && (node.closest('li') || node.closest('ul'))) {
          state.isList = true;
        }
        if (!state.isBold) {
          const bTag = node.closest('b') || node.closest('strong');
          if (bTag) {
            state.isBold = true;
          } else {
            const weight = window.getComputedStyle(node).fontWeight;
            if (weight === 'bold' || parseInt(weight, 10) >= 700) {
              state.isBold = true;
            }
          }
        }
      }
    }
  } catch (e) {}

  return state;
};

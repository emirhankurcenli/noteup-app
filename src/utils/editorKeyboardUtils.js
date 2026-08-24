export const ensureElementVisible = (element, container) => {
  if (!element) return;
  const parentContainer = container || (element.closest ? element.closest('.editor-body') : null);
  if (!parentContainer) return;

  // Always reset window scroll if Chromium shifted window
  if (window.scrollY !== 0) {
    window.scrollTo(0, 0);
  }

  const elemRect = element.getBoundingClientRect();
  const containerRect = parentContainer.getBoundingClientRect();

  const bottomThreshold = containerRect.bottom - 80;
  const topThreshold = containerRect.top + 20;

  if (elemRect.bottom > bottomThreshold) {
    const scrollNeeded = elemRect.bottom - bottomThreshold;
    parentContainer.scrollTo({
      top: parentContainer.scrollTop + scrollNeeded,
      behavior: 'smooth'
    });
    if (window.scrollY !== 0) window.scrollTo(0, 0);
  } else if (elemRect.top < topThreshold) {
    const scrollNeeded = topThreshold - elemRect.top;
    parentContainer.scrollTo({
      top: Math.max(0, parentContainer.scrollTop - scrollNeeded),
      behavior: 'smooth'
    });
    if (window.scrollY !== 0) window.scrollTo(0, 0);
  }
};

export const setCaretAtEnd = (element) => {
  if (!element) return;
  try {
    element.focus();
    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
      const len = element.value ? element.value.length : 0;
      element.setSelectionRange(len, len);
    } else {
      const sel = window.getSelection();
      if (sel) {
        const range = document.createRange();
        range.selectNodeContents(element);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
  } catch (err) {}
};

export const setCaretAtStart = (element) => {
  if (!element) return;
  try {
    element.focus();
    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
      element.setSelectionRange(0, 0);
    } else {
      const sel = window.getSelection();
      if (sel) {
        const range = document.createRange();
        range.selectNodeContents(element);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
  } catch (err) {}
};

export const setCaretAtOffset = (element, targetOffset) => {
  if (!element) return;
  try {
    element.focus();
    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
      element.setSelectionRange(targetOffset, targetOffset);
      return;
    }

    const sel = window.getSelection();
    if (!sel) return;

    const range = document.createRange();
    let currentOffset = 0;
    let found = false;

    const traverse = (node) => {
      if (found) return;
      if (node.nodeType === Node.TEXT_NODE) {
        const len = node.textContent.length;
        if (currentOffset + len >= targetOffset) {
          range.setStart(node, Math.min(targetOffset - currentOffset, len));
          range.collapse(true);
          found = true;
        } else {
          currentOffset += len;
        }
      } else {
        for (let i = 0; i < node.childNodes.length; i++) {
          traverse(node.childNodes[i]);
          if (found) break;
        }
      }
    };

    traverse(element);

    if (!found) {
      range.selectNodeContents(element);
      range.collapse(false);
    }

    sel.removeAllRanges();
    sel.addRange(range);
  } catch (err) {
    setCaretAtEnd(element);
  }
};

export const mergeConsecutiveTextBlocks = (blocks) => {
  if (!Array.isArray(blocks) || blocks.length <= 1) return blocks || [];

  const result = [];
  let currentText = null;

  for (const b of blocks) {
    if (!b) continue;

    if (
      b.type === 'text' && 
      !b.bullet &&
      currentText &&
      currentText.type === 'text' &&
      !currentText.bullet &&
      (currentText.fontFamily || 'inherit') === (b.fontFamily || 'inherit') &&
      (currentText.fontWeight || 'normal') === (b.fontWeight || 'normal') &&
      (currentText.color || 'var(--text-primary)') === (b.color || 'var(--text-primary)')
    ) {
      currentText.content = (currentText.content || '') + '<br>' + (b.content || '');
    } else {
      const copy = { ...b };
      result.push(copy);
      if (copy.type === 'text' && !copy.bullet) {
        currentText = copy;
      } else {
        currentText = null;
      }
    }
  }

  return result;
};

export const handleTextareaKeyDown = (e, block, idx, editingNote, handleUpdateNote) => {
  const getCaretOffsets = (target) => {
    if (!target) return { start: 0, end: 0 };
    if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT') {
      return { start: target.selectionStart || 0, end: target.selectionEnd || 0 };
    }
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return { start: 0, end: 0 };
    try {
      const range = sel.getRangeAt(0);
      const preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(target);
      preCaretRange.setEnd(range.startContainer, range.startOffset);
      const start = preCaretRange.toString().length;
      const end = sel.isCollapsed ? start : start + sel.toString().length;
      return { start, end };
    } catch (err) {
      return { start: 0, end: 0 };
    }
  };

  // Find if cursor is inside a list item <li>
  const getEnclosingLi = () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    const range = sel.getRangeAt(0);
    let node = range.startContainer;
    while (node && node !== e.target && node !== document.body) {
      if (node.nodeName === 'LI') return node;
      node = node.parentNode;
    }
    return null;
  };

  if (e.key === 'Enter') {
    const liNode = getEnclosingLi();
    if (liNode) {
      const liText = (liNode.innerText || liNode.textContent || '').replace(/\u8203/g, '').trim();
      if (liText === '') {
        // Pressing Enter on empty bullet exits list mode!
        e.preventDefault();
        const ulNode = liNode.closest('ul') || liNode.closest('ol');
        const allLis = ulNode ? Array.from(ulNode.querySelectorAll('li')) : [];

        if (allLis.length <= 1) {
          if (ulNode) {
            const div = document.createElement('div');
            div.innerHTML = '<br>';
            ulNode.parentNode.replaceChild(div, ulNode);
            setCaretAtStart(div);
          }
        } else {
          liNode.remove();
          const div = document.createElement('div');
          div.innerHTML = '<br>';
          if (ulNode.nextSibling) {
            ulNode.parentNode.insertBefore(div, ulNode.nextSibling);
          } else {
            ulNode.parentNode.appendChild(div);
          }
          setCaretAtStart(div);
        }

        const html = e.target.innerHTML;
        const hasList = html.toLowerCase().includes('<ul') || html.toLowerCase().includes('<li');
        handleUpdateNote('blocks', (editingNote.blocks || []).map((b, i) => i === idx ? { ...b, content: html, ...(hasList ? {} : { bullet: false }) } : b), true);
        return;
      }
    }
    return;
  }

  if (e.key === 'Backspace') {
    const liNode = getEnclosingLi();
    if (liNode) {
      const liText = (liNode.innerText || liNode.textContent || '').replace(/\u8203/g, '').trim();
      const sel = window.getSelection();
      const range = sel && sel.rangeCount > 0 ? sel.getRangeAt(0) : null;
      const isAtLiStart = range && range.startOffset === 0;

      if (liText === '' || isAtLiStart) {
        e.preventDefault();
        const ulNode = liNode.closest('ul') || liNode.closest('ol');
        const allLis = ulNode ? Array.from(ulNode.querySelectorAll('li')) : [];

        if (liText === '') {
          // 1. Delete empty list item / bullet
          if (allLis.length <= 1) {
            // Only 1 item in list -> remove entire list container
            if (ulNode) {
              const div = document.createElement('div');
              div.innerHTML = '<br>';
              ulNode.parentNode.replaceChild(div, ulNode);
              setCaretAtStart(div);
            }
          } else {
            const liIdx = allLis.indexOf(liNode);
            const prevLi = liIdx > 0 ? allLis[liIdx - 1] : allLis[1];
            liNode.remove();
            if (prevLi) {
              setCaretAtEnd(prevLi);
            }
          }
        } else {
          // 2. At start of list item -> convert this line to normal text
          const div = document.createElement('div');
          div.innerHTML = liNode.innerHTML;
          if (ulNode) {
            if (allLis.length <= 1) {
              ulNode.parentNode.replaceChild(div, ulNode);
            } else {
              ulNode.parentNode.insertBefore(div, ulNode);
              liNode.remove();
            }
          }
          setCaretAtStart(div);
        }

        const html = e.target.innerHTML;
        const hasList = html.toLowerCase().includes('<ul') || html.toLowerCase().includes('<li');
        handleUpdateNote('blocks', (editingNote.blocks || []).map((b, i) => i === idx ? { ...b, content: html, ...(hasList ? {} : { bullet: false }) } : b), true);
        return;
      }
    }

    const { start: selectionStart, end: selectionEnd } = getCaretOffsets(e.target);
    const plainText = (e.target.innerText || e.target.textContent || e.target.value || '').replace(/\u8203/g, '').trim();
    const isEmptyBlock = plainText === '';

    if (selectionStart === 0 && selectionEnd === 0) {
      const blocks = editingNote.blocks || [];

      // 1. If it's a legacy bullet block flag and selection is at start, convert it to normal text
      if (block?.bullet) {
        e.preventDefault();
        const currentTarget = e.target;
        const updatedBlocks = blocks.map((b, i) => {
          if (i === idx) return { ...b, bullet: false };
          return b;
        });
        handleUpdateNote('blocks', updatedBlocks, true);
        
        if (currentTarget) {
          const keepFocus = () => {
            setCaretAtStart(currentTarget);
          };
          keepFocus();
          queueMicrotask(keepFocus);
          setTimeout(keepFocus, 0);
          setTimeout(keepFocus, 20);
        }
        return;
      }

      // 2. If idx > 0
      if (idx > 0) {
        const prevBlock = blocks[idx - 1];

        if (isEmptyBlock) {
          // Cleanly delete the empty line / block
          e.preventDefault();
          const updatedBlocks = blocks.filter((_, i) => i !== idx);
          const container = e.target.closest('.editor-body');
          handleUpdateNote('blocks', updatedBlocks, true);

          const focusPrev = () => {
            const prevEl = document.querySelector(`[data-block-id="${prevBlock.id}"]`);
            if (prevEl) {
              setCaretAtEnd(prevEl);
              ensureElementVisible(prevEl, container);
            }
          };

          focusPrev();
          queueMicrotask(focusPrev);
          setTimeout(focusPrev, 0);
          setTimeout(focusPrev, 25);
          return;
        }

        if (prevBlock && prevBlock.type === 'text') {
          e.preventDefault();
          const prevContent = prevBlock.content || '';
          const currentContent = (e.target && e.target.innerHTML) ? e.target.innerHTML : (block?.content || '');
          const mergedContent = prevContent + currentContent;

          const updatedBlocks = blocks.map((b, i) => {
            if (i === idx - 1) return { ...b, content: mergedContent };
            return b;
          }).filter((_, i) => i !== idx);

          const container = e.target.closest('.editor-body');
          handleUpdateNote('blocks', updatedBlocks, true);

          const focusPrev = () => {
            const prevEl = document.querySelector(`[data-block-id="${prevBlock.id}"]`);
            if (prevEl) {
              const prevTextLen = prevContent.replace(/<[^>]*>/g, '').length;
              setCaretAtOffset(prevEl, prevTextLen);
              ensureElementVisible(prevEl, container);
            }
          };

          focusPrev();
          queueMicrotask(focusPrev);
          setTimeout(focusPrev, 0);
          setTimeout(focusPrev, 25);
        } else {
          // Previous block is a WIDGET
          e.preventDefault();
          const updatedBlocks = blocks.filter((_, i) => i !== idx);
          handleUpdateNote('blocks', updatedBlocks, true);

          setTimeout(() => {
            const currentPrevEl = document.querySelector(`.blocks-container .block-wrapper:nth-child(${idx})`);
            if (currentPrevEl) {
              const input = currentPrevEl.querySelector('input, textarea, button, [contenteditable="true"]');
              if (input) {
                setCaretAtEnd(input);
              }
            }
          }, 10);
        }
        return;
      }

      // 3. If idx === 0 (the first block in the note body) and at start
      if (idx === 0) {
        e.preventDefault();
        const titleEl = document.querySelector('.editor-title-input');

        if (isEmptyBlock && blocks.length > 1) {
          const updatedBlocks = blocks.filter((_, i) => i !== 0);
          handleUpdateNote('blocks', updatedBlocks, true);
        }

        if (titleEl) {
          setCaretAtEnd(titleEl);
        }
        return;
      }
    }
  }
};

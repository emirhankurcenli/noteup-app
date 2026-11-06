import React from 'react';
import { saveCurrentSelection } from '@shared/utils/selectionUtils';
import { sanitizeNoteContent } from '@shared/utils/securityUtils';

export const TextBlock = React.memo(({
  block,
  idx,
  t,
  setActiveFormatBlockId,
  ensureElementVisible,
  handleTextareaKeyDown,
  handleUpdateBlock,
}) => {
  const handleSaveSelection = () => {
    setActiveFormatBlockId(block.id);
    saveCurrentSelection(block.id);
  };

  const getInitialContent = () => {
    let content = sanitizeNoteContent(block.content || '');
    if (block.bullet && content.trim() && !content.toLowerCase().includes('<ul') && !content.toLowerCase().includes('<li')) {
      return `<ul><li>${content}</li></ul>`;
    }
    return content;
  };

  return (
    <div
      className="block-textarea content-editable-block"
      contentEditable="true"
      suppressContentEditableWarning={true}
      data-placeholder={idx === 0 ? t('noteBodyPlaceholder') : ''}
      data-block-id={block.id}
      style={{
        fontFamily: block.fontFamily || 'inherit',
      }}
      ref={(el) => {
        if (el) {
          if (el.dataset.initializedId !== block.id) {
            el.innerHTML = getInitialContent();
            el.dataset.initializedId = block.id;
          } else if (el.innerHTML !== (block.content || '') && document.activeElement !== el) {
            el.innerHTML = getInitialContent();
          }
        }
      }}
      onFocus={() => {
        handleSaveSelection();
        ensureElementVisible(block.id);
      }}
      onClick={handleSaveSelection}
      onKeyUp={handleSaveSelection}
      onMouseUp={handleSaveSelection}
      onTouchEnd={handleSaveSelection}
      onSelect={handleSaveSelection}
      onKeyDown={(e) => handleTextareaKeyDown(e, block, idx)}
      onInput={(e) => {
        const html = e.currentTarget.innerHTML;
        const hasList = html.toLowerCase().includes('<ul') || html.toLowerCase().includes('<li');
        // instantHistory = false: Her karakterde değil, kelime/zaman sınırında snapshot alarak klavye gecikmesini sıfırla
        handleUpdateBlock(block.id, { content: html, ...(hasList ? {} : { bullet: false }) }, false);
      }}
      onBlur={(e) => {
        const html = e.currentTarget.innerHTML;
        const hasList = html.toLowerCase().includes('<ul') || html.toLowerCase().includes('<li');
        // instantHistory = true: Odaktan çıkıldığında son hali kesin snapshot olarak kaydet
        handleUpdateBlock(block.id, { content: html, ...(hasList ? {} : { bullet: false }) }, true);
      }}
    />
  );
});

export default TextBlock;

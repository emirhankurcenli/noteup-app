import React from 'react';
import { saveCurrentSelection } from '../../../../utils/selectionUtils';

export const TextBlock = ({
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

  // Ensure legacy bullet blocks are seamlessly converted to native HTML lists
  const getInitialContent = () => {
    let content = block.content || '';
    if (block.bullet && !content.toLowerCase().includes('<ul') && !content.toLowerCase().includes('<li')) {
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
      onFocus={(e) => {
        handleSaveSelection();
        ensureElementVisible(block.id);
      }}
      onClick={handleSaveSelection}
      onKeyUp={handleSaveSelection}
      onMouseUp={handleSaveSelection}
      onTouchEnd={handleSaveSelection}
      onSelect={handleSaveSelection}
      onKeyDown={(e) => handleTextareaKeyDown(e, block.id, idx)}
      onInput={(e) => {
        handleSaveSelection();
        handleUpdateBlock(block.id, { content: e.currentTarget.innerHTML }, true);
      }}
      onBlur={(e) => {
        handleUpdateBlock(block.id, { content: e.currentTarget.innerHTML });
      }}
    />
  );
};

export default TextBlock;

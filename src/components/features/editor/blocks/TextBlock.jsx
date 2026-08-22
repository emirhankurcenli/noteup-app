import React from 'react';

export const TextBlock = ({
  block,
  idx,
  t,
  setActiveFormatBlockId,
  ensureElementVisible,
  handleTextareaKeyDown,
  handleUpdateBlock,
}) => {
  const contentNode = (
    <div
      className="block-textarea content-editable-block"
      contentEditable="true"
      suppressContentEditableWarning={true}
      data-placeholder={idx === 0 && !block.bullet ? t('noteBodyPlaceholder') : (block.bullet ? 'Madde...' : '')}
      data-block-id={block.id}
      style={{
        fontFamily: block.fontFamily || 'inherit',
        color: block.color || 'var(--text-primary)',
        fontWeight: block.fontWeight === 'bold' || block.isBold ? 'bold' : 'normal',
        flex: block.bullet ? 1 : undefined,
        minWidth: block.bullet ? 0 : undefined,
      }}
      ref={(el) => {
        if (el) {
          if (el.dataset.initializedId !== block.id) {
            el.innerHTML = block.content || '';
            el.dataset.initializedId = block.id;
          } else if (el.innerHTML !== (block.content || '') && document.activeElement !== el) {
            el.innerHTML = block.content || '';
          }
        }
      }}
      onFocus={() => {
        setActiveFormatBlockId(block.id);
        ensureElementVisible(block.id);
      }}
      onClick={() => setActiveFormatBlockId(block.id)}
      onKeyDown={(e) => handleTextareaKeyDown(e, block.id, idx)}
      onInput={(e) => {
        handleUpdateBlock(block.id, { content: e.currentTarget.innerHTML }, true);
      }}
      onBlur={(e) => {
        handleUpdateBlock(block.id, { content: e.currentTarget.innerHTML });
      }}
    />
  );

  if (block.bullet) {
    return (
      <div className="block-wrapper-bullet">
        <span className="block-bullet-dot">•</span>
        {contentNode}
      </div>
    );
  }

  return contentNode;
};

export default TextBlock;

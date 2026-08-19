import React from 'react';

export const EditorActionButtons = ({
  editorUndoStack = [],
  editorRedoStack = [],
  handleUndo,
  handleRedo,
  showFormatToolbar,
  setShowFormatToolbar,
  activeFormatBlockId,
  setActiveFormatBlockId,
  editingNote,
  showEditorMenu,
  setShowEditorMenu,
}) => {
  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      {/* Undo Button */}
      <button
        className="btn-secondary"
        style={{
          padding: '8px 10px',
          fontSize: '1.05rem',
          opacity: (editorUndoStack || []).length === 0 ? 0.35 : 1,
          pointerEvents: (editorUndoStack || []).length === 0 ? 'none' : 'auto',
          height: '38px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: '38px',
          background: 'rgba(255,255,255,0.04)',
          borderColor: 'var(--border-color)',
          color: 'var(--text-primary)',
        }}
        onClick={(e) => {
          e.stopPropagation();
          handleUndo();
        }}
        title="Geri Al"
      >
        ↩️
      </button>

      {/* Redo Button */}
      <button
        className="btn-secondary"
        style={{
          padding: '8px 10px',
          fontSize: '1.05rem',
          opacity: (editorRedoStack || []).length === 0 ? 0.35 : 1,
          pointerEvents: (editorRedoStack || []).length === 0 ? 'none' : 'auto',
          height: '38px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: '38px',
          background: 'rgba(255,255,255,0.04)',
          borderColor: 'var(--border-color)',
          color: 'var(--text-primary)',
        }}
        onClick={(e) => {
          e.stopPropagation();
          handleRedo();
        }}
        title="İleri Al"
      >
        ↪️
      </button>

      {/* Format Bar Toggle */}
      <button
        className="btn-secondary"
        style={{
          padding: '8px 12px',
          fontWeight: 'bold',
          fontSize: '1rem',
          background: showFormatToolbar ? 'rgba(139,92,246,0.18)' : 'rgba(255,255,255,0.04)',
          borderColor: showFormatToolbar ? 'var(--primary)' : 'var(--border-color)',
          color: showFormatToolbar ? 'var(--primary)' : 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: '40px',
          height: '38px',
          borderRadius: '12px',
        }}
        onMouseDown={(e) => e.preventDefault()}
        onTouchStart={(e) => e.preventDefault()}
        onClick={(e) => {
          e.stopPropagation();
          setShowFormatToolbar((v) => !v);
          let targetBlockId = activeFormatBlockId;
          if (!targetBlockId && editingNote?.blocks?.length > 0) {
            const firstText = editingNote.blocks?.find((b) => b.type === 'text');
            if (firstText) {
              targetBlockId = firstText.id;
              setActiveFormatBlockId(firstText.id);
            }
          }
          if (targetBlockId) {
            const focusTarget = () => {
              const el = document.querySelector(`textarea[data-block-id="${targetBlockId}"]`);
              if (el) try { el.focus({ preventScroll: true }); } catch (err) { el.focus(); }
            };
            focusTarget();
            queueMicrotask(focusTarget);
            setTimeout(focusTarget, 0);
            setTimeout(focusTarget, 30);
          }
        }}
        title="Yazı Biçimi"
      >
        Aa
      </button>
    </div>
  );
};

export default EditorActionButtons;

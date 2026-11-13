import React from 'react';

const UndoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7v6h6" />
    <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
  </svg>
);

const RedoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 7v6h-6" />
    <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" />
  </svg>
);

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
  const canUndo = (editorUndoStack || []).length > 0;
  const canRedo = (editorRedoStack || []).length > 0;

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      {/* Undo Button */}
      <button
        className="btn-secondary"
        style={{
          width: '38px',
          height: '38px',
          padding: 0,
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          color: 'var(--text-primary)',
          cursor: canUndo ? 'pointer' : 'default',
          transition: 'all 0.2s ease',
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (canUndo) handleUndo();
        }}
        disabled={!canUndo}
        title="Geri Al"
      >
        <div style={{ opacity: canUndo ? 1 : 0.25, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <UndoIcon />
        </div>
      </button>

      {/* Redo Button */}
      <button
        className="btn-secondary"
        style={{
          width: '38px',
          height: '38px',
          padding: 0,
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          color: 'var(--text-primary)',
          cursor: canRedo ? 'pointer' : 'default',
          transition: 'all 0.2s ease',
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (canRedo) handleRedo();
        }}
        disabled={!canRedo}
        title="İleri Al"
      >
        <div style={{ opacity: canRedo ? 1 : 0.25, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <RedoIcon />
        </div>
      </button>

      {/* Format Bar Toggle */}
      <button
        className="btn-secondary"
        style={{
          padding: '8px 12px',
          fontWeight: 'bold',
          fontSize: '1rem',
          background: showFormatToolbar ? 'rgba(139,92,246,0.18)' : 'var(--bg-surface)',
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
              const el = document.querySelector(`[data-block-id="${targetBlockId}"]`);
              if (el) {
                try { el.focus({ preventScroll: true }); } catch (err) { el.focus(); }
              }
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

import React from 'react';
import { useEditorContext } from '../../../context/EditorContext';
import { EditorActionButtons } from './header/EditorActionButtons';
import { EditorOptionsMenuDropdown } from './header/EditorOptionsMenuDropdown';

const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '1.25rem', height: '1.25rem' }}>
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

const NoteEditorHeader = (props) => {
  const ctx = useEditorContext();
  const {
    editingNote = props.editingNote || {},
    handleCloseEditor = props.handleCloseEditor,
    editorUndoStack = props.editorUndoStack || [],
    editorRedoStack = props.editorRedoStack || [],
    handleUndo = props.handleUndo,
    handleRedo = props.handleRedo,
    showFormatToolbar = props.showFormatToolbar,
    setShowFormatToolbar = props.setShowFormatToolbar,
    activeFormatBlockId = props.activeFormatBlockId,
    setActiveFormatBlockId = props.setActiveFormatBlockId,
    showEditorMenu = props.showEditorMenu,
    setShowEditorMenu = props.setShowEditorMenu,
  } = { ...props, ...ctx };

  return (
    <div className="editor-header">
      <button className="btn-secondary" style={{ padding: '8px 12px' }} onClick={handleCloseEditor}>
        <BackIcon />
      </button>
      {!editingNote.deletedAt && (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <EditorActionButtons
            editorUndoStack={editorUndoStack}
            editorRedoStack={editorRedoStack}
            handleUndo={handleUndo}
            handleRedo={handleRedo}
            showFormatToolbar={showFormatToolbar}
            setShowFormatToolbar={setShowFormatToolbar}
            activeFormatBlockId={activeFormatBlockId}
            setActiveFormatBlockId={setActiveFormatBlockId}
            editingNote={editingNote}
            showEditorMenu={showEditorMenu}
            setShowEditorMenu={setShowEditorMenu}
          />
          <div style={{ position: 'relative' }}>
            <button
              className="btn-secondary"
              style={{ padding: '8px 16px', fontSize: '1.1rem', letterSpacing: '3px', lineHeight: 1 }}
              onMouseDown={(e) => e.preventDefault()}
              onTouchStart={(e) => e.preventDefault()}
              onClick={(e) => { e.stopPropagation(); setShowEditorMenu(v => !v); }}
            >⋯</button>
            <EditorOptionsMenuDropdown />
          </div>
        </div>
      )}
    </div>
  );
};

export default NoteEditorHeader;

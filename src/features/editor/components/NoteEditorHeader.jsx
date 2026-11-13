import React from 'react';
import { useEditorContext } from '@features/editor/context/EditorContext';
import { useAuthCtx } from '@shared/context/AppStateContext';
import { useNotePresence } from '@features/sharing/hooks/useNotePresence';
import { EditorActionButtons } from '@features/editor/components/header/EditorActionButtons';
import { EditorOptionsMenuDropdown } from '@features/editor/components/header/EditorOptionsMenuDropdown';

const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '1.25rem', height: '1.25rem' }}>
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

const NoteEditorHeader = (props) => {
  const ctx = useEditorContext();
  const authCtx = useAuthCtx() || {};
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

  const myCode = authCtx.myCode || props.myCode;
  const profileName = authCtx.profileName || props.profileName;

  const isShared = Boolean(
    editingNote?.isShared ||
    editingNote?.sharedFrom ||
    (Array.isArray(editingNote?.sharedWith) && editingNote.sharedWith.length > 0)
  );

  const { presentUsers } = useNotePresence({
    noteId: editingNote?.id,
    myCode,
    profileName,
    isShared,
  });

  return (
    <div className="editor-header">
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
          cursor: 'pointer',
        }}
        onClick={handleCloseEditor}
        title="Geri"
      >
        <BackIcon />
      </button>
      {!editingNote.deletedAt && (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {presentUsers && presentUsers.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginRight: '4px' }}>
              {presentUsers.slice(0, 3).map((u, i) => (
                <div
                  key={u.code || i}
                  title={`${u.name || u.code} şu an bu notta`}
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: `hsl(${(i * 127 + 210) % 360}, 75%, 50%)`,
                    color: '#FFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    border: '2px solid var(--bg-surface, #0F172A)',
                    marginLeft: i > 0 ? '-8px' : '0',
                    position: 'relative',
                    zIndex: 3 - i,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                  }}
                >
                  {(u.name || u.code || 'A').charAt(0).toUpperCase()}
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '0px',
                      right: '0px',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#10B981',
                      border: '1.5px solid var(--bg-surface, #0F172A)',
                      boxShadow: '0 0 4px #10B981',
                    }}
                  />
                </div>
              ))}
              {presentUsers.length > 3 && (
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, marginLeft: '4px' }}>
                  +{presentUsers.length - 3}
                </span>
              )}
            </div>
          )}
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
              style={{
                height: '38px',
                padding: '0 14px',
                fontSize: '1.1rem',
                letterSpacing: '3px',
                lineHeight: 1,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
              }}
              onMouseDown={(e) => e.preventDefault()}
              onTouchStart={(e) => e.preventDefault()}
              onClick={(e) => { e.stopPropagation(); setShowEditorMenu(v => !v); }}
              title="Seçenekler"
            >⋯</button>
            <EditorOptionsMenuDropdown />
          </div>
        </div>
      )}
    </div>
  );
};

export default NoteEditorHeader;

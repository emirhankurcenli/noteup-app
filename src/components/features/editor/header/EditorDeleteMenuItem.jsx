import React from 'react';

export const EditorDeleteMenuItem = ({
  editingNote,
  setShowEditorMenu,
  handleMoveToTrash,
  t,
  isLight,
}) => {
  return (
    <button
      style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '9px 12px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600, color: '#EF4444' }}
      onClick={() => {
        setShowEditorMenu(false);
        handleMoveToTrash(editingNote.id);
      }}
    >
      <div
        style={{
          width: '28px',
          height: '28px',
          borderRadius: '8px',
          background: isLight ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.18)',
          border: isLight ? 'none' : '1px solid rgba(239, 68, 68, 0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: isLight ? '#EF4444' : '#FCA5A5',
          flexShrink: 0,
        }}
      >
        {editingNote?.sharedFrom ? (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        ) : (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        )}
      </div>
      <span>{editingNote?.sharedFrom ? (t('leaveCollabBtn') || 'Paylaşımdan Ayrıl') : t('moveToTrash')}</span>
    </button>
  );
};

export default EditorDeleteMenuItem;

import React from 'react';

export const EditorShareMenuItem = ({
  setShowShareModal,
  setShowEditorMenu,
  t,
  isLight,
}) => {
  return (
    <button
      style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '9px 12px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600 }}
      onClick={() => {
        setShowShareModal(true);
        setShowEditorMenu(false);
      }}
    >
      <div
        style={{
          width: '28px',
          height: '28px',
          borderRadius: '8px',
          background: isLight ? 'linear-gradient(135deg, #3B82F6, #0D9488)' : 'rgba(59, 130, 246, 0.18)',
          border: isLight ? 'none' : '1px solid rgba(59, 130, 246, 0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: isLight ? '#FFF' : '#60A5FA',
          flexShrink: 0,
        }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
      </div>
      <span>{t('shareNoteLabel')}</span>
    </button>
  );
};

export default EditorShareMenuItem;

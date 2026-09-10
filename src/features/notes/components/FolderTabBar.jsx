import React from 'react';

export const FolderTabBar = ({
  folders = [],
  activeFolderId,
  setActiveFolderId,
  onAddFolder,
  t,
}) => {
  return (
    <div
      className="folder-tab-bar"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        overflowX: 'auto',
        padding: '4px 0 12px 0',
        scrollbarWidth: 'none',
      }}
    >
      <button
        onClick={() => setActiveFolderId('all')}
        style={{
          padding: '6px 14px',
          borderRadius: '20px',
          fontSize: '0.82rem',
          fontWeight: 800,
          background: activeFolderId === 'all' ? 'var(--primary)' : 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          color: activeFolderId === 'all' ? '#FFF' : 'var(--text-primary)',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        {t('allNotes') || 'Tüm Notlar'}
      </button>

      {folders.map((f) => {
        const isActive = activeFolderId === f.id;
        return (
          <button
            key={f.id}
            onClick={() => setActiveFolderId(f.id)}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.82rem',
              fontWeight: 800,
              background: isActive ? f.color || 'var(--primary)' : 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              color: isActive ? '#FFF' : 'var(--text-primary)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {f.name}
          </button>
        );
      })}

      {onAddFolder && (
        <button
          onClick={onAddFolder}
          style={{
            padding: '6px 10px',
            borderRadius: '20px',
            fontSize: '0.82rem',
            fontWeight: 800,
            background: 'rgba(139, 92, 246, 0.12)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            color: '#8B5CF6',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          + {t('addFolder') || 'Yeni Klasör'}
        </button>
      )}
    </div>
  );
};

export default FolderTabBar;

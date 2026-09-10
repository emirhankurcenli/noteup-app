import React from 'react';
import { getFileIconInfo } from '../fileIconUtils';

export const FileBlock = ({ block, handleOpenFile, handleDeleteBlock }) => {
  const iconInfo = getFileIconInfo(block.fileName);

  return (
    <div
      className="file-block-wrapper"
      onClick={() => handleOpenFile(block)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 14px',
        background: 'var(--bg-card)',
        borderRadius: '14px',
        border: '1px solid var(--border-color)',
        margin: '8px 0',
        cursor: 'pointer',
      }}
    >
      {iconInfo.icon}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {block.fileName || 'Ek Dosya'}
        </span>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          {block.fileSize ? `${Math.round(block.fileSize / 1024)} KB` : 'Doküman'}
        </span>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          handleDeleteBlock(block.id);
        }}
        style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}
      >
        ✕
      </button>
    </div>
  );
};

export default FileBlock;

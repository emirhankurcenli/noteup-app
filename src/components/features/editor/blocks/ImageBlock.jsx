import React from 'react';

export const ImageBlock = ({ block, setLightboxUrl, handleDeleteBlock }) => {
  return (
    <div className="image-block-wrapper" style={{ position: 'relative', margin: '10px 0' }}>
      <img
        src={block.content || block.url}
        alt="Visual attachment"
        onClick={() => setLightboxUrl(block.content || block.url)}
        style={{
          width: '100%',
          maxHeight: '350px',
          objectFit: 'cover',
          borderRadius: '16px',
          cursor: 'pointer',
          border: '1px solid var(--border-color)',
        }}
      />
      <button
        onClick={() => handleDeleteBlock(block.id)}
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          background: 'rgba(0, 0, 0, 0.6)',
          border: 'none',
          color: '#FFF',
          borderRadius: '50%',
          width: '26px',
          height: '26px',
          cursor: 'pointer',
        }}
      >
        ✕
      </button>
    </div>
  );
};

export default ImageBlock;

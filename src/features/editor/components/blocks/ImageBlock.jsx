import React from 'react';
import EncryptedImage from '@shared/components/EncryptedImage';

const ImageBlockComponent = ({ block, setLightboxUrl, handleDeleteBlock }) => {
  const imageUrl = block.content || block.url;

  return (
    <div className="image-block-wrapper" style={{ position: 'relative', margin: '10px 0' }}>
      <EncryptedImage
        src={imageUrl}
        encKey={block.encKey}
        mimeType={block.mimeType || 'image/jpeg'}
        alt={block.name || 'Görsel eki'}
        onClick={(displaySrc) => {
          if (typeof setLightboxUrl === 'function') {
            setLightboxUrl({
              url: imageUrl,
              displaySrc: displaySrc || imageUrl,
              encKey: block.encKey,
              mimeType: block.mimeType || 'image/jpeg',
            });
          }
        }}
        style={{
          width: '100%',
          maxHeight: '350px',
          objectFit: 'cover',
          borderRadius: '16px',
          cursor: 'pointer',
          border: '1px solid var(--border-color)',
          display: 'block',
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
          zIndex: 3,
        }}
      >
        ✕
      </button>
    </div>
  );
};

export const ImageBlock = React.memo(ImageBlockComponent);
export default ImageBlock;

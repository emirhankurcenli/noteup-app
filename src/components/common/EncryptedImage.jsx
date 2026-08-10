import React, { useState, useEffect } from 'react';

export default function EncryptedImage({ src, alt, className, onClick }) {
  const [displaySrc, setDisplaySrc] = useState(src);

  useEffect(() => {
    setDisplaySrc(src);
  }, [src]);

  return (
    <img 
      src={displaySrc} 
      alt={alt} 
      className={className} 
      onError={(e) => {
        console.warn("Image load error for:", displaySrc);
      }}
      onClick={() => onClick && onClick(displaySrc)} 
    />
  );
}

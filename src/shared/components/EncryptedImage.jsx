import React, { useState, useEffect, useRef } from 'react';
import { CryptoService } from '@shared/services/cryptoService';

/**
 * EncryptedImage — Seamlessly renders encrypted (AES-256-GCM) or unencrypted images.
 * Automatically decrypts from Cloudflare R2 on demand, with synchronous in-memory cache.
 */
export default function EncryptedImage({
  src,
  encKey,
  mimeType = 'image/jpeg',
  alt = 'Image attachment',
  className = '',
  style = {},
  onClick,
  onLoad,
  onError,
}) {
  // Support passing src as an object { url, displaySrc, encKey, mimeType }
  const actualUrl = (src && typeof src === 'object') ? (src.displaySrc || src.url) : src;
  const actualKey = (src && typeof src === 'object' && src.encKey) ? src.encKey : encKey;
  const actualMime = (src && typeof src === 'object' && src.mimeType) ? src.mimeType : mimeType;

  // 1. Initial State: Synchronous cache check (0ms latency if already decrypted)
  const getInitialDisplaySrc = () => {
    if (!actualUrl) return '';
    if (actualUrl.startsWith('data:') || actualUrl.startsWith('blob:')) return actualUrl;
    if (!actualKey && !actualUrl.includes('.enc')) return actualUrl;
    const cached = CryptoService.getCachedMediaUrl(actualUrl);
    return cached || '';
  };

  const [displaySrc, setDisplaySrc] = useState(getInitialDisplaySrc);
  const [isLoading, setIsLoading] = useState(() => !getInitialDisplaySrc() && Boolean(actualUrl));
  const [hasError, setHasError] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!actualUrl) {
      setDisplaySrc('');
      setIsLoading(false);
      return;
    }

    // Direct local / unencrypted URLs
    if (actualUrl.startsWith('data:') || actualUrl.startsWith('blob:') || (!actualKey && !actualUrl.includes('.enc'))) {
      setDisplaySrc(actualUrl);
      setIsLoading(false);
      setHasError(false);
      return;
    }

    // Check synchronous cache
    const cached = CryptoService.getCachedMediaUrl(actualUrl);
    if (cached) {
      setDisplaySrc(cached);
      setIsLoading(false);
      setHasError(false);
      return;
    }

    // Asynchronous decryption
    setIsLoading(true);
    setHasError(false);

    CryptoService.getOrDecryptMedia(actualUrl, actualKey, actualMime)
      .then((decryptedUrl) => {
        if (!isMountedRef.current) return;
        if (decryptedUrl) {
          setDisplaySrc(decryptedUrl);
          setIsLoading(false);
        } else {
          setHasError(true);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!isMountedRef.current) return;
        console.warn('[EncryptedImage] Decryption error:', err);
        setHasError(true);
        setIsLoading(false);
      });
  }, [actualUrl, actualKey, actualMime]);

  const handleClick = (e) => {
    if (onClick) {
      onClick(displaySrc || actualUrl, e);
    }
  };

  if (hasError) {
    return (
      <div
        className={className}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px dashed #EF4444',
          borderRadius: style.borderRadius || '14px',
          padding: '24px',
          color: 'var(--text-muted, #94A3B8)',
          fontSize: '0.82rem',
          minHeight: '120px',
          ...style,
        }}
      >
        <span style={{ fontSize: '1.5rem', marginBottom: '6px' }}>🔒</span>
        <span>Şifreli görsel çözülemedi</span>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: style.width || '100%', display: 'inline-block' }}>
      {isLoading && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.25)',
            backdropFilter: 'blur(4px)',
            borderRadius: style.borderRadius || '16px',
            zIndex: 2,
            minHeight: '120px',
          }}
        >
          <div
            style={{
              width: '28px',
              height: '28px',
              border: '3px solid rgba(255, 255, 255, 0.2)',
              borderTopColor: '#3B82F6',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }}
          />
        </div>
      )}

      {displaySrc && (
        <img
          src={displaySrc}
          alt={alt}
          className={className}
          style={{
            ...style,
            opacity: isLoading ? 0.3 : 1,
            transition: 'opacity 0.2s ease-in-out',
          }}
          onLoad={(e) => {
            setIsLoading(false);
            if (onLoad) onLoad(e);
          }}
          onError={(e) => {
            setIsLoading(false);
            console.warn('[EncryptedImage] Image tag render error:', displaySrc);
            if (onError) onError(e);
          }}
          onClick={handleClick}
        />
      )}
    </div>
  );
}

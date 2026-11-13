import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Capacitor, registerPlugin } from '@capacitor/core';
import jsQR from 'jsqr';
import { openSystemSettings } from '@shared/hooks/useAppPermissions';

const AppSettings = registerPlugin('AppSettings');

/**
 * InAppQRScannerModal / InAppQRScannerView
 * Compact, inline camera viewfinder for instant QR code scanning.
 * Fits seamlessly directly below the Add Friend form without full-screen takeover.
 * Features:
 * - Native Android Camera Permission check
 * - HTML5 getUserMedia + Autoplay/PlaysInline handling
 * - Hardware BarcodeDetector + ultra-fast jsQR dual engine
 * - Torch / Flashlight toggle
 * - Gallery upload fallback with canvas decoding
 */
const InAppQRScannerModal = ({
  isOpen,
  onClose,
  onScanSuccess,
  triggerHaptic,
  lang = 'tr'
}) => {
  const onScanSuccessRef = useRef(onScanSuccess);
  onScanSuccessRef.current = onScanSuccess;
  const triggerHapticRef = useRef(triggerHaptic);
  triggerHapticRef.current = triggerHaptic;

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const galleryInputRef = useRef(null);
  const scanIntervalRef = useRef(null);
  const isStoppingRef = useRef(false);
  const isStartingRef = useRef(false);

  const [cameraError, setCameraError] = useState(null);
  const [hasTorch, setHasTorch] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Stop camera stream safely
  const stopCameraStream = useCallback(() => {
    isStoppingRef.current = true;
    isStartingRef.current = false;
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((track) => {
          try {
            if (track.readyState === 'live') track.stop();
          } catch (_) {}
        });
      } catch (_) {}
      streamRef.current = null;
    }
    if (videoRef.current) {
      try {
        videoRef.current.srcObject = null;
      } catch (_) {}
    }
    setTorchOn(false);
  }, []);

  // Start camera stream safely
  const startCameraStream = useCallback(async () => {
    if (isStartingRef.current || streamRef.current) return;
    isStartingRef.current = true;
    isStoppingRef.current = false;
    setCameraError(null);
    setIsProcessing(false);

    // 1. Native Android Camera Permission check & request
    if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
      try {
        const permRes = await AppSettings.requestCameraPermission();
        if (permRes && permRes.camera && permRes.camera !== 'granted') {
          setCameraError(
            lang === 'tr'
              ? 'Kamera erişim izni verilmedi. Ayarlardan kamera iznini açabilirsiniz.'
              : 'Camera permission denied. Please grant permission in settings.'
          );
          isStartingRef.current = false;
          return;
        }
      } catch (permErr) {
        console.warn('Native camera permission error:', permErr);
      }
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError(
        lang === 'tr'
          ? 'Kamera bu cihazda veya tarayıcıda desteklenmiyor.'
          : 'Camera is not supported on this device.'
      );
      isStartingRef.current = false;
      return;
    }

    try {
      let stream = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch (_) {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });
      }

      if (isStoppingRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        isStartingRef.current = false;
        return;
      }

      streamRef.current = stream;

      if (videoRef.current) {
        const video = videoRef.current;
        video.setAttribute('playsinline', 'true');
        video.setAttribute('webkit-playsinline', 'true');
        video.muted = true;
        video.srcObject = stream;
        video.play().catch((e) => console.warn('Video play error:', e));
      }

      // Check torch capability
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        try {
          const caps = videoTrack.getCapabilities?.() || {};
          if (caps.torch) setHasTorch(true);
        } catch (_) {}
      }

      isStartingRef.current = false;

      // Setup BarcodeDetector if available
      let nativeDetector = null;
      if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
        try {
          nativeDetector = new window.BarcodeDetector({ formats: ['qr_code'] });
        } catch (_) {}
      }

      // Scanning interval loop
      scanIntervalRef.current = setInterval(async () => {
        if (isStoppingRef.current || !videoRef.current) return;
        const video = videoRef.current;
        if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) return;

        let detected = null;

        // Try BarcodeDetector
        if (nativeDetector) {
          try {
            const barcodes = await nativeDetector.detect(video);
            if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
              detected = barcodes[0].rawValue.trim();
            }
          } catch (_) {}
        }

        // Fallback to jsQR via canvas
        if (!detected) {
          let canvas = canvasRef.current;
          if (!canvas) {
            canvas = document.createElement('canvas');
            canvasRef.current = canvas;
          }
          const w = Math.min(video.videoWidth, 480);
          const h = Math.round((w / video.videoWidth) * video.videoHeight);
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (ctx) {
            ctx.drawImage(video, 0, 0, w, h);
            const imgData = ctx.getImageData(0, 0, w, h);
            const qr = jsQR(imgData.data, imgData.width, imgData.height, {
              inversionAttempts: 'dontInvert',
            });
            if (qr && qr.data && qr.data.trim()) {
              detected = qr.data.trim();
            }
          }
        }

        if (detected) {
          if (scanIntervalRef.current) {
            clearInterval(scanIntervalRef.current);
            scanIntervalRef.current = null;
          }
          setIsProcessing(true);
          if (triggerHapticRef.current) triggerHapticRef.current('success');
          stopCameraStream();
          onScanSuccessRef.current?.(detected);
        }
      }, 150);

    } catch (err) {
      console.warn('Camera stream error:', err);
      isStartingRef.current = false;
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError(
          lang === 'tr'
            ? 'Kamera erişim izni reddedildi. Lütfen uygulama izinlerinden kamerayı etkinleştirin.'
            : 'Camera permission denied. Please allow camera access in app settings.'
        );
      } else {
        setCameraError(
          lang === 'tr'
            ? 'Kamera başlatılamadı. Başka bir uygulama kamerayı kullanıyor olabilir.'
            : 'Unable to start camera. Another app may be using it.'
        );
      }
    }
  }, [lang, stopCameraStream]);

  // Torch toggle
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const videoTrack = streamRef.current.getVideoTracks()[0];
    if (videoTrack) {
      try {
        const nextState = !torchOn;
        await videoTrack.applyConstraints({
          advanced: [{ torch: nextState }],
        });
        setTorchOn(nextState);
        if (triggerHapticRef.current) triggerHapticRef.current('light');
      } catch (e) {
        console.warn('Torch toggle error:', e);
      }
    }
  };

  // Gallery photo picker fallback
  const handleGalleryImagePick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'attemptBoth',
          });

          if (code && code.data && code.data.trim()) {
            if (triggerHapticRef.current) triggerHapticRef.current('success');
            stopCameraStream();
            onScanSuccessRef.current?.(code.data.trim());
          } else {
            setIsProcessing(false);
            alert(lang === 'tr' ? 'Seçilen fotoğrafta geçerli bir QR kod bulunamadı.' : 'No QR code found in selected image.');
          }
        };
        img.onerror = () => {
          setIsProcessing(false);
          alert(lang === 'tr' ? 'Fotoğraf yüklenemedi.' : 'Failed to load image.');
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setIsProcessing(false);
      alert(lang === 'tr' ? 'Görsel işlenirken hata oluştu.' : 'Failed to process image.');
    } finally {
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    }
  };

  // Lifecycle
  useEffect(() => {
    if (isOpen) {
      startCameraStream();
    } else {
      stopCameraStream();
    }
    return () => {
      stopCameraStream();
    };
  }, [isOpen, startCameraStream, stopCameraStream]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '240px',
        borderRadius: '16px',
        overflow: 'hidden',
        background: '#0B0F19',
        border: '1.5px solid rgba(16, 185, 129, 0.45)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        userSelect: 'none',
        boxSizing: 'border-box',
        marginTop: '4px',
      }}
      className="animate-slide-up"
    >
      {/* ── Keyframe Animations ────────────────────────────────────────────── */}
      <style>{`
        @keyframes inlineScannerLaser {
          0% { top: 8px; opacity: 0.3; }
          50% { top: calc(100% - 12px); opacity: 1; }
          100% { top: 8px; opacity: 0.3; }
        }
      `}</style>

      {/* ── Live Video Stream Element ──────────────────────────────────────── */}
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 1,
        }}
      />

      {/* ── Dark Vignette Overlay ─────────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at center, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.65) 100%)',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />

      {/* ── Top Bar Controls ──────────────────────────────────────────────── */}
      <div
        style={{
          width: '100%',
          padding: '10px 12px 6px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 10,
          boxSizing: 'border-box',
        }}
      >
        {/* Close (X) Button */}
        <button
          type="button"
          onClick={() => {
            stopCameraStream();
            onClose();
          }}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#FFFFFF',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
          }}
          title={lang === 'tr' ? 'Kapat' : 'Close'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Header Title */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#FFFFFF', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
            {lang === 'tr' ? 'QR Kodu Tara' : 'Scan QR Code'}
          </span>
          <span style={{ fontSize: '0.66rem', color: 'rgba(255, 255, 255, 0.8)', fontWeight: 600 }}>
            {lang === 'tr' ? 'Kodu vizörün içine hizalayın' : 'Align QR inside frame'}
          </span>
        </div>

        {/* Torch (Flashlight) Toggle Button */}
        {hasTorch ? (
          <button
            type="button"
            onClick={toggleTorch}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: torchOn ? '#F59E0B' : 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(8px)',
              border: torchOn ? 'none' : '1px solid rgba(255, 255, 255, 0.2)',
              color: torchOn ? '#000000' : '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
            }}
            title={torchOn ? 'Feneri Kapat' : 'Feneri Aç'}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill={torchOn ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </button>
        ) : (
          <div style={{ width: '32px' }} />
        )}
      </div>

      {/* ── Center Viewfinder Frame ───────────────────────────────────────── */}
      <div
        style={{
          position: 'relative',
          width: '140px',
          height: '140px',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Outer subtle frame */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '16px',
            border: '1.5px solid rgba(255, 255, 255, 0.25)',
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.45)',
            pointerEvents: 'none',
          }}
        />

        {/* 4 Corner Brackets */}
        <div style={{
          position: 'absolute', top: '-2px', left: '-2px', width: '22px', height: '22px',
          borderTop: '3.5px solid #10B981', borderLeft: '3.5px solid #10B981',
          borderTopLeftRadius: '16px', zIndex: 12,
        }} />
        <div style={{
          position: 'absolute', top: '-2px', right: '-2px', width: '22px', height: '22px',
          borderTop: '3.5px solid #10B981', borderRight: '3.5px solid #10B981',
          borderTopRightRadius: '16px', zIndex: 12,
        }} />
        <div style={{
          position: 'absolute', bottom: '-2px', left: '-2px', width: '22px', height: '22px',
          borderBottom: '3.5px solid #10B981', borderLeft: '3.5px solid #10B981',
          borderBottomLeftRadius: '16px', zIndex: 12,
        }} />
        <div style={{
          position: 'absolute', bottom: '-2px', right: '-2px', width: '22px', height: '22px',
          borderBottom: '3.5px solid #10B981', borderRight: '3.5px solid #10B981',
          borderBottomRightRadius: '16px', zIndex: 12,
        }} />

        {/* Laser line */}
        {!cameraError && !isProcessing && (
          <div
            style={{
              position: 'absolute',
              left: '8px',
              right: '8px',
              height: '2.5px',
              borderRadius: '2px',
              background: 'linear-gradient(90deg, transparent, #10B981, #34D399, #10B981, transparent)',
              boxShadow: '0 0 10px #10B981, 0 0 3px #FFFFFF',
              zIndex: 11,
              animation: 'inlineScannerLaser 2s ease-in-out infinite',
            }}
          />
        )}

        {/* Processing Spinner */}
        {isProcessing && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
            color: '#10B981',
            zIndex: 15,
            background: 'rgba(0, 0, 0, 0.8)',
            padding: '12px 16px',
            borderRadius: '12px',
            backdropFilter: 'blur(6px)',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#FFFFFF' }}>
              {lang === 'tr' ? 'QR Okundu!' : 'QR Detected!'}
            </span>
          </div>
        )}

        {/* Error / Permission Overlay */}
        {cameraError && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.94)',
            borderRadius: '16px',
            padding: '10px 8px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            gap: '6px',
            zIndex: 14,
          }}>
            <span style={{ fontSize: '0.68rem', color: '#F8FAFC', lineHeight: 1.3, fontWeight: 600 }}>
              {cameraError}
            </span>
            <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
              <button
                type="button"
                onClick={startCameraStream}
                style={{
                  padding: '5px 10px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#10B981',
                  color: '#FFFFFF',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {lang === 'tr' ? 'Yeniden Dene' : 'Retry'}
              </button>
              <button
                type="button"
                onClick={openSystemSettings}
                style={{
                  padding: '5px 10px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  background: 'rgba(255, 255, 255, 0.12)',
                  color: '#FFFFFF',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {lang === 'tr' ? 'Ayarları Aç' : 'Settings'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom Controls: Gallery Fallback ─────────────────────────────── */}
      <div
        style={{
          width: '100%',
          padding: '6px 14px 10px 14px',
          display: 'flex',
          justifyContent: 'center',
          zIndex: 10,
          boxSizing: 'border-box',
        }}
      >
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleGalleryImagePick}
        />

        <button
          type="button"
          onClick={() => {
            if (galleryInputRef.current) galleryInputRef.current.click();
          }}
          style={{
            padding: '7px 16px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.18)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            color: '#FFFFFF',
            fontSize: '0.74rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <span>{lang === 'tr' ? 'Galeriden Fotoğraf Seç' : 'Choose from Gallery'}</span>
        </button>
      </div>
    </div>
  );
};

export default InAppQRScannerModal;

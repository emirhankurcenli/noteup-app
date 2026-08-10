import React, { useEffect, useRef } from 'react';
import { EncryptedImage } from '../common/AppModals';

const LightboxModal = ({
  lightboxUrl,
  onClose,
  t,
}) => {
  const lightboxOverlayRef = useRef(null);
  const lightboxImgRef = useRef(null);
  const scaleRef = useRef(1);
  const posRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const isPinchingRef = useRef(false);
  const lastTapRef = useRef(0);

  const applyTransform = (x, y, scale, animate = false) => {
    const imgEl = lightboxImgRef.current;
    if (!imgEl) return;
    imgEl.style.transition = animate ? 'transform 0.22s cubic-bezier(0.2, 0, 0.2, 1)' : 'none';
    imgEl.style.transform = `translate3d(${x}px, ${y}px, 0px) scale(${scale})`;
  };

  useEffect(() => {
    if (!lightboxUrl) {
      scaleRef.current = 1;
      posRef.current = { x: 0, y: 0 };
    }
  }, [lightboxUrl]);

  // Direct GPU Non-passive Touch Listener for 60 FPS Pinch-Zoom & Dragging on Mobile
  useEffect(() => {
    const overlay = lightboxOverlayRef.current;
    if (!overlay || !lightboxUrl) return;

    let initialDist = 0;
    let initialScale = 1;
    let startTouchX = 0;
    let startTouchY = 0;
    let startPosX = 0;
    let startPosY = 0;

    const onTouchStart = (e) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        isPinchingRef.current = false;
        startTouchX = e.touches[0].clientX;
        startTouchY = e.touches[0].clientY;
        startPosX = posRef.current.x;
        startPosY = posRef.current.y;
      } else if (e.touches.length === 2) {
        if (e.cancelable) e.preventDefault();
        isDraggingRef.current = false;
        isPinchingRef.current = true;
        initialDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        initialScale = scaleRef.current;
      }
    };

    const onTouchMove = (e) => {
      if (e.touches.length === 2 && initialDist > 0) {
        if (e.cancelable) e.preventDefault();
        const currentDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const factor = currentDist / initialDist;
        let newScale = Math.max(1, Math.min(initialScale * factor, 6));
        scaleRef.current = newScale;

        if (newScale <= 1.05) {
          posRef.current = { x: 0, y: 0 };
        }
        applyTransform(posRef.current.x, posRef.current.y, newScale, false);
      } else if (e.touches.length === 1 && isDraggingRef.current && scaleRef.current > 1.05) {
        if (e.cancelable) e.preventDefault();
        const dx = e.touches[0].clientX - startTouchX;
        const dy = e.touches[0].clientY - startTouchY;
        const newX = startPosX + dx;
        const newY = startPosY + dy;

        posRef.current = { x: newX, y: newY };
        applyTransform(newX, newY, scaleRef.current, false);
      }
    };

    const onTouchEnd = (e) => {
      if (e.touches.length < 2) {
        isPinchingRef.current = false;
      }
      if (e.touches.length === 0) {
        isDraggingRef.current = false;
        if (scaleRef.current <= 1.05) {
          scaleRef.current = 1;
          posRef.current = { x: 0, y: 0 };
          applyTransform(0, 0, 1, true);
        }
      }
    };

    const onWheel = (e) => {
      if (e.cancelable) e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
      let newScale = Math.max(1, Math.min(scaleRef.current * zoomFactor, 6));
      scaleRef.current = newScale;

      if (newScale <= 1) {
        posRef.current = { x: 0, y: 0 };
      }
      applyTransform(posRef.current.x, posRef.current.y, newScale, false);
    };

    overlay.addEventListener('touchstart', onTouchStart, { passive: false });
    overlay.addEventListener('touchmove', onTouchMove, { passive: false });
    overlay.addEventListener('touchend', onTouchEnd, { passive: false });
    overlay.addEventListener('touchcancel', onTouchEnd, { passive: false });
    overlay.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      overlay.removeEventListener('touchstart', onTouchStart);
      overlay.removeEventListener('touchmove', onTouchMove);
      overlay.removeEventListener('touchend', onTouchEnd);
      overlay.removeEventListener('touchcancel', onTouchEnd);
      overlay.removeEventListener('wheel', onWheel);
    };
  }, [lightboxUrl]);

  const handleLightboxDoubleTap = (e) => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;
    if (now - lastTapRef.current < DOUBLE_PRESS_DELAY) {
      if (scaleRef.current > 1.05) {
        scaleRef.current = 1;
        posRef.current = { x: 0, y: 0 };
        applyTransform(0, 0, 1, true);
      } else {
        scaleRef.current = 2.5;
        posRef.current = { x: 0, y: 0 };
        applyTransform(0, 0, 2.5, true);
      }
    }
    lastTapRef.current = now;
  };

  const handleCloseLightbox = () => {
    scaleRef.current = 1;
    posRef.current = { x: 0, y: 0 };
    if (onClose) onClose();
  };

  if (!lightboxUrl) return null;

  return (
    <div
      ref={lightboxOverlayRef}
      className="lightbox-overlay"
      onClick={handleCloseLightbox}
    >
      <div
        className="lightbox-img-wrapper"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          ref={lightboxImgRef}
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            touchAction: 'none',
            willChange: 'transform'
          }}
        >
          <EncryptedImage
            src={lightboxUrl}
            className="lightbox-img"
            alt="Lightbox Preview"
            onClick={handleLightboxDoubleTap}
          />
        </div>
      </div>

      {/* Red Corner Close Button */}
      <button
        className="lightbox-close-corner-btn"
        onClick={handleCloseLightbox}
        title={t ? t('closeBtn') : 'Kapat'}
      >
        ✕
      </button>
    </div>
  );
};

export default LightboxModal;

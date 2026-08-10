import React, { useState, useRef, useEffect } from "react";

export default function AvatarCropper({ imageSrc, onCrop, onCancel, theme }) {
  const [scale, setScale] = useState(1);
  const [zoomRange, setZoomRange] = useState(0); // 0 to 100
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [imgSize, setImgSize] = useState({ width: 0, height: 0, initScale: 1 });
  const [loading, setLoading] = useState(true);

  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const positionStartRef = useRef({ x: 0, y: 0 });

  // Pinch zoom state
  const touchStartDistRef = useRef(0);
  const touchStartScaleRef = useRef(1);

  const CROP_SIZE = 250; // Diameter of the crop circle

  useEffect(() => {
    if (!imageSrc) return;
    setLoading(true);
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      const initScale = Math.max(CROP_SIZE / img.width, CROP_SIZE / img.height);
      setImgSize({
        width: img.width,
        height: img.height,
        initScale,
      });
      setScale(initScale);
      setZoomRange(0);
      setPosition({ x: 0, y: 0 });
      setLoading(false);
    };
  }, [imageSrc]);

  // Handle Zoom change from slider
  const handleZoomChange = (e) => {
    const val = parseFloat(e.target.value);
    setZoomRange(val);
    const newScale = imgSize.initScale * (1 + (val / 100) * 3);
    setScale(newScale);
    setPosition((prev) => constrainPosition(prev.x, prev.y, newScale));
  };

  // Helper to constrain position
  const constrainPosition = (x, y, currentScale) => {
    const wImg = imgSize.width * currentScale;
    const hImg = imgSize.height * currentScale;

    const xLimit = Math.max(0, (wImg - CROP_SIZE) / 2);
    const yLimit = Math.max(0, (hImg - CROP_SIZE) / 2);

    return {
      x: Math.min(xLimit, Math.max(-xLimit, x)),
      y: Math.min(yLimit, Math.max(-yLimit, y)),
    };
  };

  // Mouse / Touch Drag Events
  const handleStart = (clientX, clientY) => {
    if (loading) return;
    isDraggingRef.current = true;
    dragStartRef.current = { x: clientX, y: clientY };
    positionStartRef.current = { ...position };
  };

  const handleMove = (clientX, clientY) => {
    if (!isDraggingRef.current) return;
    const dx = clientX - dragStartRef.current.x;
    const dy = clientY - dragStartRef.current.y;

    const targetX = positionStartRef.current.x + dx;
    const targetY = positionStartRef.current.y + dy;

    setPosition(constrainPosition(targetX, targetY, scale));
  };

  const handleEnd = () => {
    isDraggingRef.current = false;
  };

  // Touch handlers (including pinch zoom)
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      handleStart(e.touches[0].clientX, e.touches[0].clientY);
    } else if (e.touches.length === 2) {
      isDraggingRef.current = false;
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
      touchStartDistRef.current = dist;
      touchStartScaleRef.current = scale;
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 1) {
      handleMove(e.touches[0].clientX, e.touches[0].clientY);
    } else if (e.touches.length === 2 && touchStartDistRef.current > 0) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
      const ratio = dist / touchStartDistRef.current;
      const targetScale = Math.min(
        imgSize.initScale * 4,
        Math.max(imgSize.initScale, touchStartScaleRef.current * ratio),
      );

      setScale(targetScale);

      const computedRange = ((targetScale / imgSize.initScale - 1) / 3) * 100;
      setZoomRange(Math.min(100, Math.max(0, computedRange)));
      setPosition(constrainPosition(position.x, position.y, targetScale));
    }
  };

  const handleTouchEnd = () => {
    handleEnd();
    touchStartDistRef.current = 0;
  };

  // Perform crop on canvas
  const handleCrop = () => {
    if (loading) return;

    const canvas = document.createElement("canvas");
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext("2d");

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    const cropWidthOnNatural = CROP_SIZE / scale;
    const cropHeightOnNatural = CROP_SIZE / scale;

    const centerXOnNatural = imgSize.width / 2 - position.x / scale;
    const centerYOnNatural = imgSize.height / 2 - position.y / scale;

    const sx = centerXOnNatural - cropWidthOnNatural / 2;
    const sy = centerYOnNatural - cropHeightOnNatural / 2;

    const imageElement = imageRef.current;
    if (imageElement) {
      ctx.drawImage(
        imageElement,
        sx,
        sy,
        cropWidthOnNatural,
        cropHeightOnNatural,
        0,
        0,
        300,
        300,
      );
      const croppedDataUrl = canvas.toDataURL("image/jpeg", 0.9);
      onCrop(croppedDataUrl);
    }
  };

  const isLight = theme === "light";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <div
        style={{
          background: isLight ? "var(--bg-surface-elevated)" : "#121216",
          border: "1px solid var(--border-color)",
          borderRadius: "24px",
          width: "100%",
          maxWidth: "360px",
          padding: "20px",
          boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <h3
          style={{
            fontSize: "1.05rem",
            fontWeight: 700,
            margin: 0,
            color: "var(--text-primary)",
          }}
        >
          {isLight ? "Fotoğrafı Düzenle" : "Edit Photo"}
        </h3>

        {/* Crop Area Container */}
        <div
          ref={containerRef}
          onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
          onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            width: "280px",
            height: "280px",
            borderRadius: "16px",
            overflow: "hidden",
            position: "relative",
            background: "#000",
            cursor: "move",
            touchAction: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {imageSrc && (
            <img
              ref={imageRef}
              src={imageSrc}
              alt="To Crop"
              style={{
                pointerEvents: "none",
                userSelect: "none",
                maxWidth: "none",
                maxHeight: "none",
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                transition: isDraggingRef.current
                  ? "none"
                  : "transform 0.1s ease-out",
                opacity: loading ? 0 : 1,
              }}
            />
          )}

          {/* Circle Mask Overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: `${CROP_SIZE}px`,
                height: `${CROP_SIZE}px`,
                borderRadius: "50%",
                border: "2px solid #fff",
                boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.6)",
                boxSizing: "border-box",
              }}
            />
          </div>

          {loading && (
            <div
              style={{
                position: "absolute",
                color: "#fff",
                fontSize: "0.85rem",
              }}
            >
              Yükleniyor...
            </div>
          )}
        </div>

        {/* Zoom Slider */}
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "0.75rem",
              color: "var(--text-secondary)",
              fontWeight: 600,
            }}
          >
            <span>🔍 Yakınlaştır</span>
            <span>{Math.round((scale / imgSize.initScale) * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={zoomRange}
            onChange={handleZoomChange}
            disabled={loading}
            style={{
              width: "100%",
              accentColor: "var(--primary)",
              height: "4px",
              borderRadius: "2px",
              background: "rgba(255,255,255,0.1)",
            }}
          />
        </div>

        {/* Bottom Actions */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            width: "100%",
            marginTop: "4px",
          }}
        >
          <button
            className="btn-secondary"
            onClick={onCancel}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "12px",
              fontSize: "0.85rem",
              fontWeight: 600,
            }}
          >
            İptal
          </button>
          <button
            className="btn-primary"
            onClick={handleCrop}
            disabled={loading}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "12px",
              fontSize: "0.85rem",
              fontWeight: 700,
            }}
          >
            Kırp ve Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}

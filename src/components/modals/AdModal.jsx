import React, { useState, useEffect, useRef } from 'react';

const AD_DURATION = 8;

const AdModal = ({
  showAdModal,
  setShowAdModal,
  setShowPaywall,
}) => {
  const [countdown, setCountdown] = useState(AD_DURATION);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!showAdModal) return;
    setCountdown(AD_DURATION);
    setProgress(0);
    intervalRef.current = setInterval(() => {
      setCountdown(prev => {
        const next = prev - 1;
        setProgress(((AD_DURATION - next) / AD_DURATION) * 100);
        if (next <= 0) {
          clearInterval(intervalRef.current);
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [showAdModal]);

  if (!showAdModal) return null;

  const canClose = countdown <= 0;

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.88)',
      backdropFilter: 'blur(12px)',
      zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '24px',
        padding: '28px 24px',
        maxWidth: '380px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
        position: 'relative',
      }}>
        {/* Badge */}
        <div style={{
          display: 'inline-block',
          background: 'rgba(249,115,22,0.15)', color: '#F97316',
          fontSize: '11px', fontWeight: 800,
          padding: '4px 10px', borderRadius: '99px',
          marginBottom: '16px', letterSpacing: '0.5px',
        }}>
          📢 LİTE PLAN SPONSORLU REKLAM (5/5 EKLENTİ)
        </div>

        <div style={{ fontSize: '48px', marginBottom: '12px' }}>🚀</div>

        <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'white', margin: '0 0 8px 0' }}>
          NoteUp Pro'ya Geçin!
        </h3>
        <p style={{ fontSize: '13px', color: '#9CA3AF', margin: '0 0 20px 0', lineHeight: 1.5 }}>
          Reklamsız kullanım, 1GB bulut depolama ve çoklu cihaz eşitlemesi için hemen Pro'ya yükseltin.
        </p>

        {/* Progress bar */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{
            width: '100%', height: '6px', borderRadius: '99px',
            background: 'rgba(255,255,255,0.08)', overflow: 'hidden', marginBottom: '8px',
          }}>
            <div style={{
              height: '100%', width: `${progress}%`,
              background: canClose ? '#10B981' : 'linear-gradient(90deg, #F97316, #EAB308)',
              borderRadius: '99px', transition: 'width 0.9s linear',
            }} />
          </div>
          <p style={{ margin: 0, fontSize: '12px', color: canClose ? '#10B981' : '#6B7280', fontWeight: 600 }}>
            {canClose ? '✅ Reklam tamamlandı' : `⏳ ${countdown} saniye sonra kapatılabilir`}
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={() => { setShowAdModal(false); setShowPaywall(true); }}
          style={{
            width: '100%', padding: '14px',
            background: 'linear-gradient(135deg, #F97316, #EAB308)',
            border: 'none', borderRadius: '12px',
            color: 'white', fontSize: '15px', fontWeight: 700,
            cursor: 'pointer', marginBottom: '12px',
            fontFamily: 'inherit',
          }}
        >
          7 Gün Ücretsiz Dene 🔥
        </button>

        {/* Close — only after countdown */}
        <button
          onClick={() => canClose && setShowAdModal(false)}
          disabled={!canClose}
          style={{
            background: 'none', border: 'none',
            color: canClose ? '#9CA3AF' : '#374151',
            fontSize: '13px', fontWeight: 600,
            cursor: canClose ? 'pointer' : 'not-allowed',
            fontFamily: 'inherit',
            transition: 'color 0.3s ease',
          }}
        >
          {canClose ? 'Reklamı Kapat ✕' : `Reklamı Kapat (${countdown}s)`}
        </button>
      </div>
    </div>
  );
};

export default AdModal;

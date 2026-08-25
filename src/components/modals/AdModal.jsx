import React, { useState, useEffect, useRef } from 'react';

const RocketIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="url(#rocketGrad)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '12px' }}>
    <defs>
      <linearGradient id="rocketGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F97316" />
        <stop offset="100%" stopColor="#EAB308" />
      </linearGradient>
    </defs>
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </svg>
);

const AD_DURATION = 5; // saniye

const AdModal = ({ showAdModal, setShowAdModal, setShowPaywall }) => {
  const [countdown, setCountdown] = useState(AD_DURATION);
  const [canClose, setCanClose] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (showAdModal) {
      setCountdown(AD_DURATION);
      setCanClose(false);
      setProgress(0);

      const startTime = Date.now();
      intervalRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        const remaining = Math.max(0, Math.ceil(AD_DURATION - elapsed));
        const pct = Math.min(100, (elapsed / AD_DURATION) * 100);

        setCountdown(remaining);
        setProgress(pct);

        if (remaining <= 0) {
          clearInterval(intervalRef.current);
          setCanClose(true);
        }
      }, 200);
    }

    return () => clearInterval(intervalRef.current);
  }, [showAdModal]);

  if (!showAdModal) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10000,
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        background: '#1A1A24',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '24px',
        padding: '32px 24px',
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
          LİTE PLAN SPONSORLU REKLAM (5/5 EKLENTİ)
        </div>

        <RocketIcon />

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
            {canClose ? 'Reklam tamamlandı' : `${countdown} saniye sonra kapatılabilir`}
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
          7 Gün Ücretsiz Dene
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
          {canClose ? 'Reklamı Kapat' : `Reklamı Kapat (${countdown}s)`}
        </button>
      </div>
    </div>
  );
};

export default AdModal;

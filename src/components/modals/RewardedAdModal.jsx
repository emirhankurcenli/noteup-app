import React, { useState, useEffect, useRef } from 'react';

const AD_DURATION = 5;

const RewardedAdModal = ({
  show,
  onClose,
  onRewardGranted,
  setShowPaywall,
  theme = 'dark',
  lang = 'tr',
}) => {
  const [adPhase, setAdPhase] = useState('offer');
  const [countdown, setCountdown] = useState(AD_DURATION);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef(null);

  const isLight = theme === 'light';

  useEffect(() => {
    if (show) {
      setAdPhase('offer');
      setCountdown(AD_DURATION);
      setProgress(0);
    }
    return () => clearInterval(intervalRef.current);
  }, [show]);

  useEffect(() => {
    if (adPhase !== 'watching') return;
    intervalRef.current = setInterval(() => {
      setCountdown(prev => {
        const next = prev - 1;
        setProgress(((AD_DURATION - next) / AD_DURATION) * 100);
        if (next <= 0) {
          clearInterval(intervalRef.current);
          setAdPhase('done');
          // Reklam biter bitmez daveti otomatik gönder
          onRewardGranted && onRewardGranted();
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [adPhase]);

  if (!show) return null;

  const cardBg = isLight ? '#FFFFFF' : '#1E293B';
  const cardBorder = isLight ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.10)';
  const textPrimary = isLight ? '#0F172A' : '#F8FAFC';
  const textSecondary = isLight ? '#475569' : '#94A3B8';
  const overlayBg = isLight ? 'rgba(15,23,42,0.45)' : 'rgba(0,0,0,0.80)';

  const titles = {
    offer: lang === 'tr' ? 'Ekstra Davet Hakkı' : 'Extra Invite Slot',
    watching: lang === 'tr' ? 'Reklam Oynatılıyor...' : 'Ad Playing...',
    done: lang === 'tr' ? 'Davet Gönderildi!' : 'Invite Sent!',
  };
  const descs = {
    offer: lang === 'tr'
      ? 'Limit aşımı için kısa bir reklam izle veya planını yükselt.'
      : 'Watch a short ad for an extra invite, or upgrade your plan.',
    watching: lang === 'tr'
      ? 'Reklam tamamlanana kadar lütfen bekle. Atlanamaz!'
      : 'Please wait until the ad completes. Cannot be skipped!',
    done: lang === 'tr'
      ? 'Reklam tamamlandı, davet başarıyla gönderildi!'
      : 'Ad completed, invite sent successfully!',
  };

  const headerGradient = adPhase === 'done'
    ? 'linear-gradient(135deg, #10B981, #059669)'
    : 'linear-gradient(135deg, #6366F1, #3B82F6)';

  const icon = adPhase === 'done' ? '✅' : adPhase === 'watching' ? '🎬' : '🎁';

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 11000,
        background: overlayBg,
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
      // Sadece teklif aşamasında arka plana tıklayarak kapanabilir
      onClick={adPhase === 'offer' ? onClose : undefined}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: '340px',
          background: cardBg, border: cardBorder, borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: isLight ? '0 24px 60px rgba(0,0,0,0.14)' : '0 24px 60px rgba(0,0,0,0.55)',
          animation: 'confirmPop 0.28s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        {/* Header */}
        <div style={{
          background: headerGradient,
          padding: '28px 24px 24px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
        }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '20px',
            background: 'rgba(255,255,255,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem',
          }}>
            {icon}
          </div>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ margin: 0, color: '#FFFFFF', fontWeight: 800, fontSize: '1.1rem' }}>
              {titles[adPhase]}
            </h3>
            <p style={{ margin: '6px 0 0', color: 'rgba(255,255,255,0.85)', fontSize: '0.82rem', lineHeight: 1.5 }}>
              {descs[adPhase]}
            </p>
          </div>
        </div>

        {/* Progress bar (sadece izleme aşamasında) */}
        {adPhase === 'watching' && (
          <div style={{ padding: '20px 24px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.78rem', fontWeight: 700, color: textSecondary }}>
              <span>{lang === 'tr' ? 'Reklam süresi' : 'Ad duration'}</span>
              <span style={{ color: '#6366F1', fontWeight: 800 }}>{countdown}s</span>
            </div>
            <div style={{ width: '100%', height: '10px', borderRadius: '99px', background: isLight ? '#E2E8F0' : 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #6366F1, #3B82F6)', borderRadius: '99px', transition: 'width 0.9s linear' }} />
            </div>
            {/* Simulated Ad Content */}
            <div style={{ marginTop: '16px', borderRadius: '14px', background: isLight ? '#F8FAFC' : 'rgba(255,255,255,0.05)', border: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.08)', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #F59E0B, #EF4444)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>📱</div>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: textPrimary }}>NoteUp Pro</div>
                <div style={{ fontSize: '0.72rem', color: textSecondary, marginTop: '2px' }}>{lang === 'tr' ? 'Sınırsız paylaşım, sınırsız not.' : 'Unlimited sharing, unlimited notes.'}</div>
              </div>
              <div style={{ marginLeft: 'auto', flexShrink: 0, background: 'linear-gradient(135deg, #6366F1, #3B82F6)', color: '#fff', borderRadius: '8px', padding: '6px 10px', fontSize: '0.7rem', fontWeight: 800 }}>AD</div>
            </div>
            <p style={{ textAlign: 'center', fontSize: '0.72rem', color: '#EF4444', fontWeight: 600, margin: '10px 0 0' }}>
              ⛔ {lang === 'tr' ? 'Reklam devam ediyor, atlanamaz.' : 'Ad is still running, cannot skip.'}
            </p>
          </div>
        )}

        {/* Actions */}
        <div style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>

          {/* TEKLIF aşaması */}
          {adPhase === 'offer' && (
            <>
              <button onClick={() => setAdPhase('watching')} style={{ width: '100%', padding: '14px', borderRadius: '14px', border: 'none', background: 'linear-gradient(135deg, #6366F1, #3B82F6)', color: '#FFF', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 4px 16px rgba(99,102,241,0.35)', fontFamily: 'inherit' }}>
                🎬 {lang === 'tr' ? 'Reklam İzle (5 sn)' : 'Watch Ad (5s)'}
              </button>
              <button onClick={() => { onClose(); setShowPaywall(true); }} style={{ width: '100%', padding: '14px', borderRadius: '14px', border: isLight ? '1.5px solid #E2E8F0' : '1.5px solid rgba(255,255,255,0.12)', background: isLight ? '#F8FAFC' : 'rgba(255,255,255,0.06)', color: textPrimary, fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                {lang === 'tr' ? '⭐ Planını Yükselt' : '⭐ Upgrade Plan'}
              </button>
              <button onClick={onClose} style={{ background: 'none', border: 'none', color: textSecondary, fontSize: '0.82rem', cursor: 'pointer', padding: '4px', fontFamily: 'inherit' }}>
                {lang === 'tr' ? 'Vazgeç' : 'Cancel'}
              </button>
            </>
          )}

          {/* İZLEME aşaması — hiç buton yok */}
          {adPhase === 'watching' && (
            <div style={{ textAlign: 'center', color: textSecondary, fontSize: '0.8rem', fontWeight: 600, padding: '4px 0' }}>
              {lang === 'tr' ? `⏳ ${countdown} saniye içinde tamamlanacak...` : `⏳ Ad completes in ${countdown} seconds...`}
            </div>
          )}

          {/* TAMAMLANDI aşaması — sadece ✕ çarpı */}
          {adPhase === 'done' && (
            <button
              onClick={onClose}
              style={{
                width: '100%', padding: '14px', borderRadius: '14px', border: 'none',
                background: isLight ? '#F1F5F9' : 'rgba(255,255,255,0.08)',
                color: textSecondary,
                fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer',
                fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}
            >
              ✕
            </button>
          )}

        </div>
      </div>
    </div>
  );
};

export default RewardedAdModal;

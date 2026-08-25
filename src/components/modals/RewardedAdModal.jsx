import React, { useState, useEffect, useRef } from 'react';

const AD_DURATION = 5;

const GiftIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#FFFFFF' }}>
    <polyline points="20 12 20 22 4 22 4 12" />
    <rect x="2" y="7" width="20" height="5" />
    <line x1="12" y1="22" x2="12" y2="7" />
    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
  </svg>
);

const VideoIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#FFFFFF' }}>
    <polygon points="23 7 16 12 23 17 23 7" />
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </svg>
);

const CheckIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#FFFFFF' }}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#FFFFFF' }}>
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
    <line x1="12" y1="18" x2="12.01" y2="18" />
  </svg>
);

const PlayIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

const StarIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#F59E0B' }}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

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

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 11000,
        background: overlayBg,
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
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
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {adPhase === 'done' ? <CheckIcon /> : adPhase === 'watching' ? <VideoIcon /> : <GiftIcon />}
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
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #F59E0B, #EF4444)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PhoneIcon />
              </div>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: textPrimary }}>NoteUp Pro</div>
                <div style={{ fontSize: '0.72rem', color: textSecondary, marginTop: '2px' }}>{lang === 'tr' ? 'Sınırsız paylaşım, sınırsız not.' : 'Unlimited sharing, unlimited notes.'}</div>
              </div>
              <div style={{ marginLeft: 'auto', flexShrink: 0, background: 'linear-gradient(135deg, #6366F1, #3B82F6)', color: '#fff', borderRadius: '8px', padding: '6px 10px', fontSize: '0.7rem', fontWeight: 800 }}>AD</div>
            </div>
            <p style={{ textAlign: 'center', fontSize: '0.72rem', color: '#EF4444', fontWeight: 600, margin: '10px 0 0' }}>
              {lang === 'tr' ? 'Reklam devam ediyor, atlanamaz.' : 'Ad is still running, cannot skip.'}
            </p>
          </div>
        )}

        {/* Actions */}
        <div style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>

          {/* TEKLIF aşaması */}
          {adPhase === 'offer' && (
            <>
              <button 
                onClick={() => setAdPhase('watching')} 
                style={{ 
                  width: '100%', padding: '14px', borderRadius: '14px', border: 'none', 
                  background: 'linear-gradient(135deg, #6366F1, #3B82F6)', color: '#FFF', 
                  fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', 
                  boxShadow: '0 4px 16px rgba(99,102,241,0.35)', fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                }}
              >
                <PlayIcon /> {lang === 'tr' ? 'Reklam İzle (5 sn)' : 'Watch Ad (5s)'}
              </button>
              <button 
                onClick={() => { onClose(); setShowPaywall(true); }} 
                style={{ 
                  width: '100%', padding: '14px', borderRadius: '14px', 
                  border: isLight ? '1.5px solid #E2E8F0' : '1.5px solid rgba(255,255,255,0.12)', 
                  background: isLight ? '#F8FAFC' : 'rgba(255,255,255,0.06)', 
                  color: textPrimary, fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                }}
              >
                <StarIcon /> {lang === 'tr' ? 'Planını Yükselt' : 'Upgrade Plan'}
              </button>
              <button onClick={onClose} style={{ background: 'none', border: 'none', color: textSecondary, fontSize: '0.82rem', cursor: 'pointer', padding: '4px', fontFamily: 'inherit' }}>
                {lang === 'tr' ? 'Vazgeç' : 'Cancel'}
              </button>
            </>
          )}

          {/* İZLEME aşaması */}
          {adPhase === 'watching' && (
            <div style={{ textAlign: 'center', color: textSecondary, fontSize: '0.8rem', fontWeight: 600, padding: '4px 0' }}>
              {lang === 'tr' ? `${countdown} saniye içinde tamamlanacak...` : `Ad completes in ${countdown} seconds...`}
            </div>
          )}

          {/* TAMAMLANDI aşaması */}
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
              <CloseIcon />
            </button>
          )}

        </div>
      </div>
    </div>
  );
};

export default RewardedAdModal;

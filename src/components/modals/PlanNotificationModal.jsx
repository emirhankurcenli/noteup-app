import React from 'react';

// Feature Icons Map for Plan Notification Modal
const FeatureIcon = ({ featureKey, color, included }) => {
  const iconColor = included ? color : "#94A3B8";

  switch (featureKey) {
    case "storage":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
        </svg>
      );
    case "devices":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
          <path d="M12 18h.01" />
        </svg>
      );
    case "sharing":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "encryption":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      );
    case "deviceMgmt":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <rect width="18" height="12" x="3" y="4" rx="2" />
          <line x1="2" x2="22" y1="20" y2="20" />
        </svg>
      );
    case "noAds":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
    case "avatar":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
      );
    case "pdfExport":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      );
    default:
      return null;
  }
};

const PlanNotificationModal = ({
  planNotification,
  setPlanNotification,
  isLight,
  triggerHaptic,
  getLostFeatures,
  getChangedFeatures,
  PLAN_LEVELS,
}) => {
  if (!planNotification) return null;

  const from = planNotification.fromPlan || 'lite';
  const to = planNotification.plan || 'lite';
  const isDown = PLAN_LEVELS[to] < PLAN_LEVELS[from];

  const activeFeaturesList = isDown ? getLostFeatures(from, to) : getChangedFeatures(from, to);

  const getModalBorder = () => {
    if (to === 'ultra') return '2px solid #F59E0B';
    if (to === 'pro') return '2px solid #3B82F6';
    return isLight ? '2px solid #E2E8F0' : '2px solid rgba(255,255,255,0.1)';
  };

  const getModalShadow = () => {
    if (to === 'ultra') return '0 0 50px rgba(245, 158, 11, 0.4), inset 0 0 20px rgba(245, 158, 11, 0.1)';
    if (to === 'pro') return '0 0 50px rgba(59, 130, 246, 0.4), inset 0 0 20px rgba(59, 130, 246, 0.1)';
    return isLight ? '0 10px 40px rgba(0,0,0,0.06)' : '0 10px 40px rgba(0,0,0,0.4)';
  };

  const getTitleBackground = () => {
    if (to === 'ultra') return 'linear-gradient(135deg, #F59E0B, #EC4899)';
    if (to === 'pro') return 'linear-gradient(135deg, #3B82F6, #8B5CF6)';
    return isLight ? 'linear-gradient(135deg, #475569, #0F172A)' : 'linear-gradient(135deg, #94A3B8, #F1F5F9)';
  };

  const getHeaderColor = () => {
    if (isDown) return '#EF4444';
    if (to === 'ultra') return '#F59E0B';
    return '#3B82F6';
  };

  const getButtonBackground = () => {
    if (isDown && to === 'lite') {
      return isLight ? 'linear-gradient(135deg, #64748B 0%, #475569 100%)' : 'linear-gradient(135deg, #334155 0%, #1E293B 100%)';
    }
    if (to === 'ultra') return 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)';
    return 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)';
  };

  const getButtonShadow = () => {
    if (isDown && to === 'lite') {
      return isLight ? '0 4px 15px rgba(100,116,139,0.2)' : '0 4px 15px rgba(0,0,0,0.2)';
    }
    if (to === 'ultra') return '0 4px 25px rgba(245,158,11,0.35)';
    return '0 4px 25px rgba(59,130,246,0.35)';
  };

  const getButtonLabel = () => {
    if (isDown && to === 'lite') return 'Tamam';
    return 'Kullanmaya Başla 🚀';
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <style>{`
        @keyframes slideDownCelebrationGlobal {
          0% { transform: scale(0.9) translateY(-45px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes eraseLineGlobal {
          0% { transform: scaleX(1); opacity: 1; }
          100% { transform: scaleX(0); opacity: 0; }
        }
        @keyframes drawLineGlobal {
          0% { transform: scaleX(0); opacity: 0; }
          100% { transform: scaleX(1); opacity: 1; }
        }
        @keyframes lightUpTextGlobal {
          0% { opacity: 0.35; }
          100% { opacity: 1; }
        }
        @keyframes dimTextGlobal {
          0% { opacity: 1; }
          100% { opacity: 0.35; }
        }
        @keyframes fadeOutIconGlobal {
          0% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.6); }
        }
        @keyframes fadeInIconGlobal {
          0% { opacity: 0; transform: scale(0.5) rotate(-45deg); }
          100% { opacity: 1; transform: scale(1.25) rotate(0deg); }
        }
        @keyframes fadeOutCheckIconGlobal {
          0% { opacity: 1; transform: scale(1) rotate(0deg); }
          100% { opacity: 0; transform: scale(0.6) rotate(45deg); }
        }
        @keyframes fadeInCrossIconGlobal {
          0% { opacity: 0; transform: scale(0.5); }
          100% { opacity: 1; transform: scale(1.25); }
        }
      `}</style>
      
      <div style={{
        background: isLight ? 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)' : 'linear-gradient(135deg, #0d0d1a 0%, #05050a 100%)',
        border: getModalBorder(),
        borderRadius: '24px',
        padding: '36px 28px',
        textAlign: 'center',
        maxWidth: '395px',
        width: '100%',
        boxShadow: getModalShadow(),
        color: isLight ? '#0f172a' : '#ffffff',
        animation: 'slideDownCelebrationGlobal 0.65s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
      }}>
        {/* Badge Icon */}
        {to !== 'lite' && (
          <div style={{ marginBottom: '16px', display: 'inline-block', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))' }}>
            {to === 'ultra' && <span style={{ fontSize: '64px' }}>👑</span>}
            {to === 'pro' && (
              <svg viewBox="0 0 100 100" width="64" height="64" style={{ display: 'block', margin: '0 auto', filter: 'drop-shadow(0 4px 12px rgba(37, 99, 235, 0.25))' }}>
                <rect x="0" y="0" width="100" height="100" rx="24" fill="#2563EB" />
                <polygon points="54 10 18 58 50 58 46 90 82 42 50 42 54 10" fill="none" stroke="#93C5FD" strokeWidth="5" strokeLinejoin="round" opacity="0.8" />
                <polygon points="54 15 24 55 50 55 46 85 76 45 50 45 54 15" fill="#FFFFFF" />
              </svg>
            )}
          </div>
        )}

        {/* Title */}
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: '900', 
          marginBottom: '10px', 
          background: getTitleBackground(), 
          WebkitBackgroundClip: 'text', 
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.5px'
        }}>
          {planNotification.title}
        </h2>

        {/* Sub-description */}
        <p style={{ 
          fontSize: '14px', 
          lineHeight: '1.6', 
          color: isLight ? '#475569' : '#94A3B8', 
          marginBottom: '26px',
          padding: '0 10px'
        }}>
          {planNotification.message}
        </p>

        {/* Unlocking/Locking features container */}
        {activeFeaturesList.length > 0 && (
          <div style={{
            background: isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.03)',
            border: isLight ? '1px solid rgba(0,0,0,0.06)' : '1px solid rgba(255,255,255,0.05)',
            borderRadius: '16px',
            padding: '18px 16px',
            marginBottom: '28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            textAlign: 'left'
          }}>
            <span style={{ 
              fontSize: '11px', 
              fontWeight: '800', 
              color: getHeaderColor(), 
              letterSpacing: '1px', 
              textTransform: 'uppercase', 
              marginBottom: '4px', 
              display: 'block' 
            }}>
              {isDown ? 'KAYBEDİLEN AYRICALIKLAR:' : 'AÇILAN AYRICALIKLAR:'}
            </span>
            
            {activeFeaturesList.map((feature, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
                {/* Icon */}
                <div style={{
                  position: 'relative',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '15px',
                  fontWeight: '800',
                  flexShrink: 0
                }}>
                  {isDown ? (
                    <>
                      <span style={{
                        position: 'absolute',
                        opacity: 1,
                        transform: 'scale(1)',
                        animation: 'fadeOutCheckIconGlobal 0.4s ease 0.8s forwards',
                        color: '#10B981'
                      }}>✓</span>
                      <span style={{
                        position: 'absolute',
                        opacity: 0,
                        transform: 'scale(0.5)',
                        animation: 'fadeInCrossIconGlobal 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.8s forwards',
                        color: '#EF4444'
                      }}>✕</span>
                    </>
                  ) : (
                    <>
                      <span style={{
                        position: 'absolute',
                        opacity: 1,
                        transform: 'scale(1)',
                        animation: 'fadeOutIconGlobal 0.4s ease 0.8s forwards',
                        color: '#EF4444'
                      }}>✕</span>
                      <span style={{
                        position: 'absolute',
                        opacity: 0,
                        transform: 'scale(0.5) rotate(-45deg)',
                        animation: 'fadeInIconGlobal 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.8s forwards',
                        color: '#10B981'
                      }}>✓</span>
                    </>
                  )}
                </div>

                {/* Text */}
                <div style={{
                  position: 'relative',
                  fontSize: '14px',
                  color: isDown
                    ? (isLight ? '#0F172A' : '#FFFFFF') 
                    : (isLight ? '#64748B' : '#9CA3AF'),
                  opacity: isDown ? 1 : 0.35,
                  animation: isDown 
                    ? 'dimTextGlobal 0.8s ease 0.8s forwards' 
                    : 'lightUpTextGlobal 0.8s ease 0.8s forwards'
                }}>
                  <span style={{ 
                    color: isLight ? '#334155' : '#E2E8F0', 
                    fontWeight: '600', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px' 
                  }}>
                    <FeatureIcon featureKey={feature.key} color={getHeaderColor()} included={true} />
                    <span>{feature.text}</span>
                  </span>
                  
                  {!isDown ? (
                    <div style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      top: '52%',
                      height: '2px',
                      background: '#EF4444',
                      transformOrigin: 'left',
                      animation: 'eraseLineGlobal 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.8s forwards'
                    }} />
                  ) : (
                    <div style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      top: '52%',
                      height: '2px',
                      background: '#EF4444',
                      transformOrigin: 'left',
                      transform: 'scaleX(0)',
                      animation: 'drawLineGlobal 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.8s forwards'
                    }} />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA Start Button */}
        <button
          onClick={() => {
            triggerHaptic?.('light');
            if (to) {
              localStorage.setItem(`s23_seen_plan_modal_${to}`, 'true');
            }
            setPlanNotification(null);
          }}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: '14px',
            border: 'none',
            background: getButtonBackground(),
            color: '#ffffff',
            fontWeight: '700',
            fontSize: '16px',
            cursor: 'pointer',
            boxShadow: getButtonShadow(),
            transition: 'transform 0.2s',
          }}
        >
          {getButtonLabel()}
        </button>
      </div>
    </div>
  );
};

export default PlanNotificationModal;

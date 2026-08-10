import React from 'react';
import { ProPlanIcon, UltraPlanIcon } from '../common/PlanIcons';

const HeaderBar = ({ friends, userPlan = 'lite', setShowPaywall, setShowFeedbackModal, triggerHaptic, lang = 'tr', t, theme = 'dark' }) => {
  const isLight = theme === 'light';

  const getBadgeConfig = () => {
    if (userPlan === 'ultra') {
      return {
        label: 'Ultra',
        icon: <UltraPlanIcon size={16} />,
        bg: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(126, 34, 206, 0.25) 100%)',
        border: '1px solid rgba(168, 85, 247, 0.4)',
        color: '#C084FC',
        shadow: '0 2px 10px rgba(168, 85, 247, 0.2)'
      };
    }
    if (userPlan === 'pro') {
      return {
        label: 'Pro',
        icon: <ProPlanIcon size={16} />,
        bg: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.25) 100%)',
        border: '1px solid rgba(59, 130, 246, 0.4)',
        color: '#60A5FA',
        shadow: '0 2px 10px rgba(59, 130, 246, 0.2)'
      };
    }
    return null;
  };

  const badge = getBadgeConfig();

  return (
    <div className="app-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
      <div className="app-title-section" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <h1 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 800 }}>NoteUp</h1>
      </div>

      <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* İstek & Öneri Butonu */}
        <button
          onClick={() => {
            if (typeof triggerHaptic === 'function') triggerHaptic('light');
            if (typeof setShowFeedbackModal === 'function') setShowFeedbackModal(true);
          }}
          title={lang === 'tr' ? 'İstek & Öneri Gönder' : 'Send Feedback'}
          style={{
            background: isLight ? 'rgba(245, 158, 11, 0.12)' : 'rgba(245, 158, 11, 0.18)',
            border: isLight ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid rgba(245, 158, 11, 0.4)',
            color: isLight ? '#D97706' : '#FBBF24',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backdropFilter: 'blur(8px)',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            outline: 'none',
            boxShadow: isLight ? '0 2px 8px rgba(245, 158, 11, 0.15)' : '0 2px 10px rgba(245, 158, 11, 0.25)'
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
            <path d="M9 18h6" />
            <path d="M10 22h4" />
          </svg>
          <span>{t('feedbackModalTitle')}</span>
        </button>

        {friends && friends.length > 0 && (
          <div className="match-badge active">
            {friends.length} {t('friendsCount')}
          </div>
        )}
      </div>
    </div>
  );
};

export default HeaderBar;

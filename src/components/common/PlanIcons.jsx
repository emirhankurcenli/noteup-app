import React from 'react';

export const LitePlanIcon = () => null;

export const ProPlanIcon = ({ size = 20 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    style={{ flexShrink: 0 }}
  >
    <defs>
      <linearGradient id="proGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3B82F6" />
        <stop offset="100%" stopColor="#1D4ED8" />
      </linearGradient>
    </defs>
    <rect width="24" height="24" rx="7" fill="url(#proGrad)" fillOpacity="0.2" />
    <path 
      d="M13 2.5L4.5 13.5H12L11 21.5L19.5 10.5H12L13 2.5Z" 
      fill="url(#proGrad)" 
      stroke="#60A5FA" 
      strokeWidth="1.2" 
      strokeLinejoin="round"
    />
  </svg>
);

export const UltraPlanIcon = ({ size = 20 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    style={{ flexShrink: 0 }}
  >
    <defs>
      <linearGradient id="ultraGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
    </defs>
    <rect width="24" height="24" rx="7" fill="url(#ultraGrad)" fillOpacity="0.25" />
    <path 
      d="M3 17.5L4.5 8.5L9 12.5L12 5.5L15 12.5L19.5 8.5L21 17.5H3Z" 
      fill="url(#ultraGrad)" 
      stroke="#FBBF24" 
      strokeWidth="1.2" 
      strokeLinejoin="round"
    />
    <circle cx="4.5" cy="7.5" r="1.2" fill="#FBBF24" />
    <circle cx="12" cy="4.5" r="1.5" fill="#FBBF24" />
    <circle cx="19.5" cy="7.5" r="1.2" fill="#FBBF24" />
  </svg>
);

export const PlanBadgeIcon = ({ plan = 'lite', size = 18 }) => {
  if (plan === 'ultra') return <UltraPlanIcon size={size} />;
  if (plan === 'pro') return <ProPlanIcon size={size} />;
  return null;
};

export default PlanBadgeIcon;

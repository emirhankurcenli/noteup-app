import React from 'react';

export const getFileIconInfo = (filename = '', isLight = true) => {
  const ext = filename.includes('.') ? filename.split('.').pop()?.toLowerCase() || '' : '';
  if (['pdf'].includes(ext)) {
    return {
      typeLabel: 'PDF',
      bgColor: isLight ? 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)' : 'linear-gradient(135deg, #991B1B 0%, #7F1D1D 100%)',
      borderColor: isLight ? 'transparent' : 'rgba(248, 113, 113, 0.4)',
      glowColor: isLight ? 'rgba(239, 68, 68, 0.35)' : 'rgba(153, 27, 27, 0.3)',
      badgeColor: '#FFFFFF',
      svg: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="file-card-svg">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="9" y1="13" x2="15" y2="13"></line>
          <line x1="9" y1="17" x2="13" y2="17"></line>
        </svg>
      )
    };
  }
  if (['doc', 'docx', 'rtf'].includes(ext)) {
    return {
      typeLabel: 'DOC',
      bgColor: isLight ? 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)' : 'linear-gradient(135deg, #1E40AF 0%, #1E3A8A 100%)',
      borderColor: isLight ? 'transparent' : 'rgba(96, 165, 250, 0.4)',
      glowColor: isLight ? 'rgba(59, 130, 246, 0.35)' : 'rgba(30, 64, 175, 0.3)',
      badgeColor: '#FFFFFF',
      svg: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="file-card-svg">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <line x1="10" y1="9" x2="8" y2="9"></line>
        </svg>
      )
    };
  }
  if (['xls', 'xlsx', 'csv'].includes(ext)) {
    return {
      typeLabel: 'EXCEL',
      bgColor: isLight ? 'linear-gradient(135deg, #10B981 0%, #047857 100%)' : 'linear-gradient(135deg, #065F46 0%, #064E3B 100%)',
      borderColor: isLight ? 'transparent' : 'rgba(52, 211, 153, 0.4)',
      glowColor: isLight ? 'rgba(16, 185, 129, 0.35)' : 'rgba(6, 95, 70, 0.3)',
      badgeColor: '#FFFFFF',
      svg: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="file-card-svg">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <rect x="8" y="12" width="8" height="6" rx="1"></rect>
          <line x1="12" y1="12" x2="12" y2="18"></line>
        </svg>
      )
    };
  }
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
    return {
      typeLabel: 'ZIP',
      bgColor: isLight ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' : 'linear-gradient(135deg, #92400E 0%, #78350F 100%)',
      borderColor: isLight ? 'transparent' : 'rgba(251, 191, 36, 0.4)',
      glowColor: isLight ? 'rgba(245, 158, 11, 0.35)' : 'rgba(146, 64, 14, 0.3)',
      badgeColor: '#FFFFFF',
      svg: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="file-card-svg">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
          <line x1="12" y1="22.08" x2="12" y2="12"></line>
        </svg>
      )
    };
  }
  if (['txt'].includes(ext)) {
    return {
      typeLabel: 'TXT',
      bgColor: isLight ? 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)' : 'linear-gradient(135deg, #155E75 0%, #164E63 100%)',
      borderColor: isLight ? 'transparent' : 'rgba(103, 232, 249, 0.4)',
      glowColor: isLight ? 'rgba(6, 182, 212, 0.35)' : 'rgba(21, 94, 117, 0.3)',
      badgeColor: '#FFFFFF',
      svg: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="file-card-svg">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
        </svg>
      )
    };
  }
  return {
    typeLabel: ext.toUpperCase() || 'FILE',
    bgColor: isLight ? 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)' : 'linear-gradient(135deg, #5B21B6 0%, #4C1D95 100%)',
    borderColor: isLight ? 'transparent' : 'rgba(192, 132, 252, 0.4)',
    glowColor: isLight ? 'rgba(139, 92, 246, 0.35)' : 'rgba(91, 33, 182, 0.3)',
    badgeColor: '#FFFFFF',
    svg: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="file-card-svg">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
      </svg>
    )
  };
};

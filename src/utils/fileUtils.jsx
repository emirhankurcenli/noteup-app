import React from 'react';

// Helper for dynamic file extension icon & gradient badge styling
export const getFileIconInfo = (filename = '') => {
  const ext = filename.includes('.') ? filename.split('.').pop()?.toLowerCase() || '' : '';
  if (['pdf'].includes(ext)) {
    return {
      typeLabel: 'PDF',
      bgColor: 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)',
      glowColor: 'rgba(239, 68, 68, 0.35)',
      badgeColor: '#EF4444',
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
      bgColor: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
      glowColor: 'rgba(59, 130, 246, 0.35)',
      badgeColor: '#3B82F6',
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
      bgColor: 'linear-gradient(135deg, #10B981 0%, #047857 100%)',
      glowColor: 'rgba(16, 185, 129, 0.35)',
      badgeColor: '#10B981',
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
      bgColor: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
      glowColor: 'rgba(245, 158, 11, 0.35)',
      badgeColor: '#F59E0B',
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
      bgColor: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)',
      glowColor: 'rgba(6, 182, 212, 0.35)',
      badgeColor: '#06B6D4',
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
    bgColor: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
    glowColor: 'rgba(139, 92, 246, 0.35)',
    badgeColor: '#8B5CF6',
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

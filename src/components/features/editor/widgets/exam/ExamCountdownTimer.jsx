import React from 'react';

export const getExamStatusInfo = (examMs, t = (k) => k) => {
  if (!examMs) return null;
  const diffMs = examMs - Date.now();
  if (diffMs < 0) return { text: t('examPassed') || 'Sınav Geçti', color: 'var(--text-muted)', urgent: false };
  const diffHours = diffMs / (1000 * 60 * 60);
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffHours < 1) return { text: `${Math.ceil(diffMs / 60000)} dk kaldı ⚡`, color: '#EF4444', urgent: true };
  if (diffHours < 24) return { text: `${Math.floor(diffHours)} ${t('examHoursLeft') || 'saat kaldı'} ⚡`, color: '#EF4444', urgent: true };
  if (diffDays === 0) return { text: t('examToday') || 'Sınav Bugün', color: '#EF4444', urgent: true };
  return { text: `${diffDays} ${t('examDaysLeft') || 'gün kaldı'}`, color: diffDays <= 3 ? '#F59E0B' : '#6366F1', urgent: diffDays <= 3 };
};

const ExamCountdownTimer = ({ examMs, isLight, t }) => {
  const status = getExamStatusInfo(examMs, t);
  if (!status) return null;

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '4px 10px',
      borderRadius: '20px',
      background: status.urgent 
        ? 'rgba(239, 68, 68, 0.12)' 
        : (isLight ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.15)'),
      border: `1px solid ${status.color}`,
      color: status.color,
      fontSize: '0.78rem',
      fontWeight: 800,
      boxShadow: status.urgent ? '0 0 12px rgba(239, 68, 68, 0.25)' : 'none'
    }}>
      <span>⏳</span>
      <span>{status.text}</span>
    </div>
  );
};

export default ExamCountdownTimer;

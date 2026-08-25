/**
 * Date and Time Utilities (DRY & Single Responsibility)
 * Provides pure functions for date formatting, reminder string generation, and countdown calculations.
 */

export const formatReminderDate = (dateStr, lang = 'tr', t = (k) => k) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';

  const now = new Date();
  const timeOptions = { hour: '2-digit', minute: '2-digit' };
  const formattedTime = date.toLocaleTimeString(lang === 'tr' ? 'tr-TR' : 'en-US', timeOptions);
  const isToday = date.toDateString() === now.toDateString();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  if (isToday) {
    return `${t('today') || 'Bugün'}, ${formattedTime}`;
  } else if (isTomorrow) {
    return `${t('tomorrow') || 'Yarın'}, ${formattedTime}`;
  } else {
    const dateOptions = { day: 'numeric', month: 'short', weekday: 'short' };
    const formattedDate = date.toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US', dateOptions);
    return `${formattedDate} - ${formattedTime}`;
  }
};

export const getRemainingTimeText = (targetTimeStr, t = (k) => k) => {
  if (!targetTimeStr) return '';
  const diffMs = new Date(targetTimeStr).getTime() - Date.now();
  if (diffMs <= 0) return t('timeIsPast') || 'Süre doldu';

  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffDay > 0) {
    const template = t('remainingDays') || '{days} gün {hours} sa kaldı';
    return template.replace('{days}', diffDay).replace('{hours}', diffHour % 24);
  } else if (diffHour > 0) {
    const template = t('remainingHours') || '{hours} sa {mins} dk kaldı';
    return template.replace('{hours}', diffHour).replace('{mins}', diffMin % 60);
  } else if (diffMin > 0) {
    const template = t('remainingMins') || '{mins} dk {secs} sn kaldı';
    return template.replace('{mins}', diffMin).replace('{secs}', diffSec % 60);
  } else {
    const template = t('remainingSecs') || '{secs} sn kaldı';
    return template.replace('{secs}', diffSec);
  }
};

export const formatDateDisplay = (timestamp, lang = 'tr') => {
  if (!timestamp) return '';
  const d = new Date(timestamp);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

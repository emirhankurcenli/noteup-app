import React, { createContext, useContext, useState, useEffect } from 'react';
import TRANSLATIONS from '../constants/translations';

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    const saved = localStorage.getItem('app_lang');
    if (saved) return saved;
    const sysLang = navigator.language || 'tr';
    return sysLang.toLowerCase().startsWith('tr') ? 'tr' : 'en';
  });

  useEffect(() => {
    localStorage.setItem('app_lang', lang);
  }, [lang]);

  const t = (key) => {
    return TRANSLATIONS[lang]?.[key] || TRANSLATIONS['en']?.[key] || TRANSLATIONS['tr']?.[key] || key;
  };

  const formatReminderDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const timeOptions = { hour: '2-digit', minute: '2-digit' };
    const formattedTime = date.toLocaleTimeString(lang === 'tr' ? 'tr-TR' : 'en-US', timeOptions);
    const isToday = date.toDateString() === now.toDateString();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = date.toDateString() === tomorrow.toDateString();
    if (isToday) {
      return `${t('today')}, ${formattedTime}`;
    } else if (isTomorrow) {
      return `${t('tomorrow')}, ${formattedTime}`;
    } else {
      const dateOptions = { day: 'numeric', month: 'short', weekday: 'short' };
      const formattedDate = date.toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US', dateOptions);
      return `${formattedDate} - ${formattedTime}`;
    }
  };

  const getRemainingTimeText = (targetTimeStr) => {
    const diffMs = new Date(targetTimeStr).getTime() - Date.now();
    if (diffMs <= 0) return t('timeIsPast');
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay > 0) {
      return t('remainingDays').replace('{days}', diffDay).replace('{hours}', diffHour % 24);
    } else if (diffHour > 0) {
      return t('remainingHours').replace('{hours}', diffHour).replace('{mins}', diffMin % 60);
    } else if (diffMin > 0) {
      return t('remainingMins').replace('{mins}', diffMin).replace('{secs}', diffSec % 60);
    } else {
      return t('remainingSecs').replace('{secs}', diffSec);
    }
  };

  const value = {
    lang,
    setLang,
    t,
    formatReminderDate,
    getRemainingTimeText,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

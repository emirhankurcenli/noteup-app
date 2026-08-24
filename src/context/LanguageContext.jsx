import React, { createContext, useContext, useState, useEffect } from 'react';
import TRANSLATIONS from '../constants/translations';

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('app_lang') : null;
    if (saved) return saved;
    const sysLang = (typeof navigator !== 'undefined' && navigator.language) || 'tr';
    return sysLang.toLowerCase().startsWith('tr') ? 'tr' : 'en';
  });

  useEffect(() => {
    try {
      localStorage.setItem('app_lang', lang);
    } catch (_) {}
  }, [lang]);

  const t = (key) => {
    return TRANSLATIONS[lang]?.[key] || TRANSLATIONS['en']?.[key] || TRANSLATIONS['tr']?.[key] || key;
  };

  const BCP47_LOCALES = {
    tr: 'tr-TR',
    en: 'en-US',
    de: 'de-DE',
    es: 'es-ES',
    fr: 'fr-FR',
    it: 'it-IT',
    ru: 'ru-RU',
    ar: 'ar-SA',
    ja: 'ja-JP',
    zh: 'zh-CN',
  };

  const formatReminderDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const currentLocale = BCP47_LOCALES[lang] || 'en-US';
      const timeOptions = { hour: '2-digit', minute: '2-digit' };
      const formattedTime = date.toLocaleTimeString(currentLocale, timeOptions);
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
        const formattedDate = date.toLocaleDateString(currentLocale, dateOptions);
        return `${formattedDate} - ${formattedTime}`;
      }
    } catch (_) {
      return String(dateStr || '');
    }
  };

  const getRemainingTimeText = (targetTimeStr) => {
    try {
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
    } catch (_) {
      return '';
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
    // Safe fallback to prevent runtime crashes if accessed outside LanguageProvider
    const savedLang = (typeof localStorage !== 'undefined' && localStorage.getItem('app_lang')) ||
      (typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('tr') ? 'tr' : 'en') || 'tr';
    const fallbackT = (key) => TRANSLATIONS[savedLang]?.[key] || TRANSLATIONS['en']?.[key] || TRANSLATIONS['tr']?.[key] || key;
    return {
      lang: savedLang,
      setLang: (newLang) => {
        try {
          localStorage.setItem('app_lang', newLang);
        } catch (_) {}
      },
      t: fallbackT,
      formatReminderDate: (dateStr) => {
        try {
          const date = new Date(dateStr);
          return date.toLocaleDateString(savedLang === 'tr' ? 'tr-TR' : 'en-US');
        } catch (_) {
          return String(dateStr || '');
        }
      },
      getRemainingTimeText: () => '',
    };
  }
  return context;
};

export default LanguageContext;

import React from 'react';

const LANGUAGES_MAP = {
  tr: 'Türkçe 🇹🇷',
  en: 'English 🇺🇸',
  de: 'Deutsch 🇩🇪',
  es: 'Español 🇪🇸',
  fr: 'Français 🇫🇷',
  it: 'Italiano 🇮🇹',
  ru: 'Русский 🇷🇺',
  ar: 'العربية 🇸🇦',
  ja: '日本語 🇯🇵',
  zh: '中文 🇨🇳'
};

const LanguageSelectionCard = ({ lang, setShowLangModal, isLight, t }) => {
  return (
    <div 
      onClick={() => setShowLangModal(true)}
      style={{
        padding: '14px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: isLight ? 'rgba(255,255,255,0.85)' : 'rgba(18, 24, 36, 0.85)',
        backdropFilter: 'blur(12px)',
        borderRadius: '16px',
        border: isLight ? '1px solid rgba(0,0,0,0.06)' : '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
        cursor: 'pointer'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          background: isLight ? 'linear-gradient(135deg, #06B6D4, #0891B2)' : 'rgba(6, 182, 212, 0.18)',
          border: isLight ? 'none' : '1px solid rgba(6, 182, 212, 0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: isLight ? '#FFF' : '#22D3EE',
          boxShadow: isLight ? '0 2px 8px rgba(6, 182, 212, 0.3)' : 'none'
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
        </div>
        <div>
          <span style={{ fontSize: '0.88rem', fontWeight: 800, color: isLight ? '#0F172A' : '#FFFFFF', display: 'block' }}>
            {t ? t('appLanguage') : (lang === 'tr' ? 'Uygulama Dili' : 'App Language')}
          </span>
          <span style={{ fontSize: '0.74rem', color: isLight ? '#475569' : '#CBD5E1', fontWeight: 600 }}>
            {LANGUAGES_MAP[lang] || 'Türkçe 🇹🇷'}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: isLight ? '#3B82F6' : '#60A5FA', fontSize: '0.82rem', fontWeight: 800 }}>
        <span>{t ? t('changeLanguage') : (lang === 'tr' ? 'Değiştir' : 'Change')}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>
    </div>
  );
};

export default LanguageSelectionCard;

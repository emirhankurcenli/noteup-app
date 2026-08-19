import React, { useState } from 'react';
import { registerPlugin } from '@capacitor/core';
import ThemeSelectionCard from './appSettings/ThemeSelectionCard';
import LanguageSelectionCard from './appSettings/LanguageSelectionCard';

const AppSettings = registerPlugin('AppSettings');

const LANGUAGES_LIST = [
  { code: 'tr', native: 'Türkçe', tr: 'Türkçe', en: 'Turkish', de: 'Turkisch', es: 'Turco', fr: 'Turc', it: 'Turco', ru: 'Турецкий', ar: 'التركية', ja: 'トルコ語', zh: '土耳其语' },
  { code: 'en', native: 'English', tr: 'İngilizce', en: 'English', de: 'Englisch', es: 'Inglés', fr: 'Anglais', it: 'Inglese', ru: 'Английский', ar: 'الإنكليزية', ja: '英語', zh: '英语' },
  { code: 'de', native: 'Deutsch', tr: 'Almanca', en: 'German', de: 'Deutsch', es: 'Alemán', fr: 'Allemand', it: 'Tedesco', ru: 'Немецкий', ar: 'الألمانية', ja: 'ドイツ語', zh: '德语' },
  { code: 'es', native: 'Español', tr: 'İspanyolca', en: 'Spanish', de: 'Spanisch', es: 'Español', fr: 'Espagnol', it: 'Spagnolo', ru: 'Испанский', ar: 'الإسبانية', ja: 'スペイン語', zh: '西班牙语' },
  { code: 'fr', native: 'Français', tr: 'Fransızca', en: 'French', de: 'Französisch', es: 'Francés', fr: 'Français', it: 'Francese', ru: 'Французский', ar: 'الفرنسية', ja: 'フランス語', zh: '法语' },
  { code: 'it', native: 'Italiano', tr: 'İtalyanca', en: 'Italian', de: 'Italienisch', es: 'Italiano', fr: 'Italien', it: 'Italiano', ru: 'Итальянский', ar: 'الإيطالية', ja: 'イタリア語', zh: '意大利语' },
  { code: 'ru', native: 'Русский', tr: 'Rusça', en: 'Russian', de: 'Russisch', es: 'Ruso', fr: 'Russe', it: 'Russo', ru: 'Русский', ar: 'الروسية', ja: 'ロシア語', zh: '俄语' },
  { code: 'ar', native: 'العربية', tr: 'Arapça', en: 'Arabic', de: 'Arabisch', es: 'Árabe', fr: 'Arabe', it: 'Arabo', ru: 'الأربك', ar: 'العربية', ja: 'アラビア語', zh: '阿拉伯语' },
  { code: 'ja', native: '日本語', tr: 'Japonca', en: 'Japanese', de: 'Japanisch', es: 'Japonés', fr: 'Japonais', it: 'Giapponese', ru: 'Японский', ar: 'اليابانية', ja: '日本語', zh: '日语' },
  { code: 'zh', native: '中文', tr: 'Çince', en: 'Chinese', de: 'Chinesisch', es: 'Chino', fr: 'Chinois', it: 'Cinese', ru: 'Китайский', ar: 'الصينية', ja: '中国語', zh: '中文' },
];

const getLangLabel = (item, currentLang) => {
  if (!item) return '';
  const translated = item[currentLang] || item['en'] || item['tr'];
  return `${item.native} (${translated})`;
};

const SettingsSubTab = ({
  theme,
  setTheme,
  lang,
  setLang,
  triggerHaptic,
  permissionStates,
  handleLogout,
  isLight,
  t,
}) => {
  const [showLangModal, setShowLangModal] = useState(false);
  const permissionsList = [
    {
      key: 'notification',
      title: t('notifications'),
      desc: t('notificationsSub'),
      iconBgLight: '#3B82F6',
      iconBgDark: 'rgba(59, 130, 246, 0.18)',
      iconBorderDark: 'rgba(59, 130, 246, 0.35)',
      iconColorDark: '#60A5FA',
      svg: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      )
    },
    {
      key: 'microphone',
      title: t('microphone'),
      desc: t('microphoneSub'),
      iconBgLight: '#10B981',
      iconBgDark: 'rgba(16, 185, 129, 0.18)',
      iconBorderDark: 'rgba(16, 185, 129, 0.35)',
      iconColorDark: '#34D399',
      svg: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
      )
    },
    {
      key: 'storage',
      title: t('filesPhotos'),
      desc: t('filesPhotosSub'),
      iconBgLight: '#8B5CF6',
      iconBgDark: 'rgba(139, 92, 246, 0.18)',
      iconBorderDark: 'rgba(139, 92, 246, 0.35)',
      iconColorDark: '#C084FC',
      svg: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      )
    },
    {
      key: 'audio',
      title: t('musicAudio'),
      desc: t('musicAudioSub'),
      iconBgLight: '#EC4899',
      iconBgDark: 'rgba(236, 72, 153, 0.18)',
      iconBorderDark: 'rgba(236, 72, 153, 0.35)',
      iconColorDark: '#F472B6',
      svg: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      )
    },
    {
      key: 'location',
      title: lang === 'tr' ? 'Konum (GPS)' : 'Location (GPS)',
      desc: lang === 'tr' ? "Otopark widget'ı ve araç yeri için" : 'For parking widget & car location',
      iconBgLight: '#F59E0B',
      iconBgDark: 'rgba(245, 158, 11, 0.18)',
      iconBorderDark: 'rgba(245, 158, 11, 0.35)',
      iconColorDark: '#FBBF24',
      svg: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      )
    }
  ];

  return (
    <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* SECTION: App Preferences */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <span style={{ fontSize: '0.78rem', fontWeight: 800, color: isLight ? '#1E293B' : '#CBD5E1', textTransform: 'uppercase', letterSpacing: '0.5px', paddingLeft: '4px' }}>
          {lang === 'tr' ? 'Görünüm ve Dil' : 'Appearance & Language'}
        </span>

        {/* Theme Toggle */}
        <ThemeSelectionCard 
          theme={theme}
          setTheme={setTheme}
          triggerHaptic={triggerHaptic}
          isLight={isLight}
          lang={lang}
          t={t}
        />

        {/* Language Selector Card */}
        <LanguageSelectionCard 
          lang={lang}
          setShowLangModal={setShowLangModal}
          isLight={isLight}
        />
      </div>

      {/* SECTION: System Permissions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <span style={{ fontSize: '0.78rem', fontWeight: 800, color: isLight ? '#1E293B' : '#CBD5E1', textTransform: 'uppercase', letterSpacing: '0.5px', paddingLeft: '4px' }}>
          {t('appPermissions')}
        </span>

        <div style={{
          padding: '12px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          background: isLight ? 'rgba(255,255,255,0.85)' : 'rgba(24, 24, 37, 0.75)',
          backdropFilter: 'blur(12px)',
          borderRadius: '16px',
          border: isLight ? '1px solid rgba(0,0,0,0.06)' : '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
        }}>
          {permissionsList.map((perm) => {
            const isGranted = permissionStates[perm.key] === 'granted';
            return (
              <div 
                key={perm.key}
                onClick={async () => {
                  if (!isGranted) {
                    try { await AppSettings.openSettings(); } catch (_) {}
                  }
                }}
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '8px 0',
                  borderBottom: perm.key !== 'location' ? (isLight ? '1px solid rgba(0,0,0,0.04)' : '1px solid rgba(255,255,255,0.05)') : 'none',
                  cursor: !isGranted ? 'pointer' : 'default'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                  <div style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '10px',
                    background: isLight ? perm.iconBgLight : perm.iconBgDark,
                    border: isLight ? 'none' : `1px solid ${perm.iconBorderDark}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isLight ? '#FFF' : perm.iconColorDark,
                    flexShrink: 0,
                    boxShadow: isLight ? `0 2px 8px ${perm.iconBgLight}40` : 'none'
                  }}>
                    {perm.svg}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', minWidth: 0, flex: 1, paddingRight: '8px' }}>
                    <span style={{ fontSize: '0.86rem', fontWeight: 800, color: isLight ? '#0F172A' : '#FFFFFF' }}>{perm.title}</span>
                  </div>
                </div>

                <div style={{ flexShrink: 0 }}>
                  {isGranted ? (
                    <span style={{
                      fontSize: '0.72rem',
                      color: '#10B981',
                      fontWeight: 700,
                      background: 'rgba(16, 185, 129, 0.12)',
                      padding: '4px 10px',
                      borderRadius: '99px',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      ✓ {t('approved')}
                    </span>
                  ) : (
                    <button style={{
                      padding: '5px 12px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      borderRadius: '8px',
                      border: '1px solid var(--accent)',
                      color: 'var(--accent)',
                      background: 'rgba(255, 107, 43, 0.08)',
                      cursor: 'pointer'
                    }}>
                      {t('openSettings')}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Language Selection Modal */}
      {showLangModal && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
          onClick={() => setShowLangModal(false)}
        >
          <div 
            style={{
              width: '100%',
              maxWidth: '380px',
              maxHeight: '80vh',
              background: isLight ? '#FFFFFF' : '#1E1E2E',
              borderRadius: '24px',
              padding: '20px',
              border: isLight ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.35)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '1rem', fontWeight: 800, color: isLight ? '#0F172A' : '#FFFFFF' }}>
                {t('appLanguage')}
              </span>
              <button
                onClick={() => setShowLangModal(false)}
                style={{
                  background: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.08)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: isLight ? '#64748B' : '#94A3B8',
                  fontSize: '0.85rem',
                  fontWeight: 700
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: '60vh', paddingRight: '4px' }}>
              {LANGUAGES_LIST.map((item) => {
                const isSelected = lang === item.code;
                return (
                  <button
                    key={item.code}
                    onClick={() => {
                      triggerHaptic('light');
                      setLang(item.code);
                      localStorage.setItem('app_lang', item.code);
                      setShowLangModal(false);
                    }}
                    style={{
                      padding: '13px 16px',
                      borderRadius: '14px',
                      border: isSelected 
                        ? '1.5px solid #3B82F6' 
                        : (isLight ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.06)'),
                      background: isSelected 
                        ? (isLight ? 'rgba(59, 130, 246, 0.08)' : 'rgba(59, 130, 246, 0.18)')
                        : (isLight ? '#F8FAFC' : 'rgba(255,255,255,0.03)'),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s ease',
                      fontFamily: 'inherit'
                    }}
                  >
                    <span style={{ 
                      fontSize: '0.88rem', 
                      fontWeight: isSelected ? 800 : 600,
                      color: isSelected ? '#3B82F6' : (isLight ? '#1E293B' : '#CBD5E1')
                    }}>
                      {getLangLabel(item, lang)}
                    </span>
                    {isSelected && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsSubTab;

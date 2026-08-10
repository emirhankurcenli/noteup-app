import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { sanitizeSingleLine, sanitizeText } from '../../utils/securityUtils';

const FeedbackModal = ({
  show,
  onClose,
  myCode,
  profileName,
  userPlan = 'lite',
  setToast,
  theme = 'dark',
  lang = 'tr',
  triggerHaptic,
  t = (k) => k,
}) => {
  const [category, setCategory] = useState('istek'); // 'istek' | 'hata' | 'gorus'
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!show) return null;

  const isLight = theme === 'light';

  const categories = [
    { id: 'istek', label: t('catFeature') || 'Özellik İsteği', icon: '💡' },
    { id: 'hata', label: t('catBug') || 'Hata Bildirimi', icon: '🐞' },
    { id: 'gorus', label: t('catDesign') || 'Tasarım / Arayüz', icon: '💬' },
  ];

  const selectedCategoryObj = categories.find(c => c.id === category) || categories[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      if (typeof setToast === 'function') {
        setToast({ title: '⚠️', msg: t('feedbackMessage') });
      }
      return;
    }

    setIsSubmitting(true);
    if (typeof triggerHaptic === 'function') triggerHaptic('light');

    const feedbackData = {
      id: 'fb-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      user_code: sanitizeSingleLine(myCode || '', 20),
      user_name: sanitizeSingleLine(profileName || 'Kullanıcı', 50),
      user_plan: userPlan,
      category: category,
      subject: sanitizeSingleLine(subject.trim() || t('feedbackSubject'), 100),
      message: sanitizeText(message.trim()),
      status: 'new',
      created_at: new Date().toISOString(),
    };

    let sentSuccessfully = false;

    // 1. Supabase table insert (feedback_messages ve feedbacks tabloları)
    try {
      const { error } = await supabase.from('feedback_messages').insert([feedbackData]);
      if (!error) {
        sentSuccessfully = true;
      } else {
        console.warn('Supabase feedback_messages insert error, trying feedbacks table fallback:', error);
        const { error: error2 } = await supabase.from('feedbacks').insert([feedbackData]);
        if (!error2) {
          sentSuccessfully = true;
        }
      }
    } catch (err) {
      console.warn('Supabase insertion exception:', err);
    }

    // 2. LocalStorage fallback
    try {
      const existing = JSON.parse(localStorage.getItem('s23_admin_feedback_list') || '[]');
      existing.unshift(feedbackData);
      localStorage.setItem('s23_admin_feedback_list', JSON.stringify(existing));
      sentSuccessfully = true;
    } catch (err) {
      console.error('LocalStorage backup save error:', err);
    }

    setIsSubmitting(false);

    if (sentSuccessfully) {
      if (typeof setToast === 'function') {
        setToast({
          title: '🎉',
          msg: lang === 'tr' ? 'Mesajınız iletildi, teşekkürler!' : 'Thank you for your feedback!'
        });
      }
      setSubject('');
      setMessage('');
      onClose();
    }
  };

  const textTitle = isLight ? '#0B132B' : '#F8FAFC';
  const textLabel = isLight ? '#1E293B' : '#CBD5E1';
  const inputBg = isLight ? '#F1F5F9' : 'rgba(255,255,255,0.06)';
  const inputBorder = isLight ? '1px solid #CBD5E1' : '1px solid rgba(255,255,255,0.1)';

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: '440px',
          background: isLight ? '#FFFFFF' : '#0F172A',
          borderRadius: '24px',
          border: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.12)',
          boxShadow: isLight ? '0 20px 50px rgba(11,19,43,0.18)' : '0 24px 60px rgba(0,0,0,0.6)',
          padding: '22px',
          display: 'flex', flexDirection: 'column', gap: '18px',
          fontFamily: "'Outfit', 'Inter', -apple-system, sans-serif"
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '14px',
              background: 'linear-gradient(135deg, #F59E0B, #D97706)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 4px 14px rgba(245,158,11,0.35)',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
                <path d="M9 18h6" />
                <path d="M10 22h4" />
              </svg>
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: textTitle, margin: 0, letterSpacing: '-0.2px' }}>
                {t('feedbackModalTitle')}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: isLight ? '#F1F5F9' : 'rgba(255,255,255,0.08)',
              border: inputBorder, color: textLabel,
              cursor: 'pointer', width: '32px', height: '32px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Custom Category Selection Button */}
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 800, color: textLabel, marginBottom: '6px', display: 'block' }}>
              {t('feedbackCategory')}
            </label>
            <button
              type="button"
              onClick={() => {
                triggerHaptic?.('light');
                setShowCategoryPicker(true);
              }}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '14px',
                background: inputBg,
                border: inputBorder,
                color: textTitle,
                fontSize: '0.88rem',
                fontWeight: 700,
                outline: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease',
                boxShadow: isLight ? '0 2px 6px rgba(0,0,0,0.03)' : '0 2px 6px rgba(0,0,0,0.2)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.1rem' }}>{selectedCategoryObj.icon}</span>
                <span>{selectedCategoryObj.label}</span>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: textLabel }}>
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </button>
          </div>

          {/* Subject */}
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 800, color: textLabel, marginBottom: '6px', display: 'block' }}>
              {t('feedbackSubject')}
            </label>
            <input
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder={t('feedbackSubject')}
              style={{
                width: '100%', padding: '12px 14px', borderRadius: '14px',
                background: inputBg, border: inputBorder, color: textTitle,
                fontSize: '0.88rem', fontWeight: 600, outline: 'none', fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Message */}
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 800, color: textLabel, marginBottom: '6px', display: 'block' }}>
              {t('feedbackMessage')} <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder={t('feedbackMessage')}
              style={{
                width: '100%', padding: '12px 14px', borderRadius: '14px',
                background: inputBg, border: inputBorder, color: textTitle,
                fontSize: '0.88rem', fontWeight: 600, outline: 'none', resize: 'none',
                fontFamily: 'inherit', boxSizing: 'border-box', lineHeight: 1.45,
              }}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1, padding: '13px', borderRadius: '14px',
                border: inputBorder, background: inputBg,
                color: textLabel, fontWeight: 800, fontSize: '0.88rem',
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              {t('cancelBtn')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                flex: 1.5, padding: '13px', borderRadius: '14px', border: 'none',
                background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                color: '#FFFFFF', fontWeight: 900, fontSize: '0.88rem',
                cursor: isSubmitting ? 'wait' : 'pointer',
                boxShadow: '0 4px 16px rgba(245,158,11,0.35)',
                fontFamily: 'inherit', opacity: isSubmitting ? 0.7 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              }}
            >
              {isSubmitting ? (
                <span>{lang === 'tr' ? 'Gönderiliyor...' : 'Sending...'}</span>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                  <span>{lang === 'tr' ? 'Gönder' : 'Submit'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* CUSTOM CATEGORY PICKER MODAL (Light & Dark Mode Supported) */}
      {showCategoryPicker && (
        <div
          onClick={() => setShowCategoryPicker(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10001,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '360px',
              background: isLight ? '#FFFFFF' : '#1E293B',
              border: isLight ? '1px solid rgba(0, 0, 0, 0.08)' : '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '24px',
              padding: '20px',
              boxShadow: isLight
                ? '0 20px 40px rgba(0, 0, 0, 0.15)'
                : '0 20px 50px rgba(0, 0, 0, 0.6)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              animation: 'scaleUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: isLight ? '#0F172A' : '#F8FAFC' }}>
                {t('feedbackCategory') || (lang === 'tr' ? 'Kategori Seçin' : 'Select Category')}
              </h4>
              <button
                type="button"
                onClick={() => setShowCategoryPicker(false)}
                style={{
                  background: isLight ? '#F1F5F9' : 'rgba(255, 255, 255, 0.08)',
                  border: 'none',
                  color: isLight ? '#64748B' : '#94A3B8',
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '700'
                }}
              >
                ✕
              </button>
            </div>

            {/* Category Options List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {categories.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      triggerHaptic?.('light');
                      setCategory(cat.id);
                      setShowCategoryPicker(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: '16px',
                      background: isSelected
                        ? (isLight ? 'rgba(245, 158, 11, 0.12)' : 'rgba(245, 158, 11, 0.18)')
                        : (isLight ? '#F8FAFC' : 'rgba(255, 255, 255, 0.03)'),
                      border: isSelected
                        ? '1.5px solid #F59E0B'
                        : (isLight ? '1px solid #E2E8F0' : '1px solid rgba(255, 255, 255, 0.06)'),
                      color: isSelected
                        ? (isLight ? '#D97706' : '#FBBF24')
                        : (isLight ? '#334155' : '#CBD5E1'),
                      fontSize: '0.92rem',
                      fontWeight: isSelected ? 800 : 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: isSelected
                        ? (isLight ? '0 4px 12px rgba(245, 158, 11, 0.15)' : '0 4px 14px rgba(245, 158, 11, 0.25)')
                        : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '1.25rem' }}>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </div>

                    {/* Custom Radio Button Circle */}
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      border: isSelected ? '2px solid #F59E0B' : (isLight ? '2px solid #CBD5E1' : '2px solid #64748B'),
                      background: isSelected ? '#F59E0B' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease'
                    }}>
                      {isSelected && (
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: '#FFFFFF'
                        }} />
                      )}
                    </div>
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

export default FeedbackModal;

import React from 'react';
import { exportNoteAsPDF } from '../../utils/pdfExport';
import { requestBiometricAuth } from '../../services/biometricService';
import ShareQrCodeCard from './share/ShareQrCodeCard';
import ExportFormatButtons from './share/ExportFormatButtons';

const cleanText = (str) => {
  if (!str) return '';
  return str.replace(/^[\s\p{Extended_Pictographic}\u2300-\u23FF\u2600-\u27BF]+/gu, '').trim();
};

const ShareOptionsModal = ({
  showShareModal,
  setShowShareModal,
  editingNote,
  handleShareNoteImage,
  theme,
  t,
  userPlan,
  setToast,
  setConfirmDialog,
  setActiveShareNoteId,
  checkAndRequestNotificationPermission,
  lang,
}) => {
  if (!showShareModal) return null;

  const isLight = theme === 'light';

  return (
    <div 
      className="modal-overlay animate-fade-in" 
      onClick={() => setShowShareModal(false)}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        background: isLight ? 'rgba(15, 23, 42, 0.45)' : 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <div
        className="modal-content animate-pop"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '340px',
          padding: '24px 20px',
          borderRadius: '24px',
          background: isLight ? '#FFFFFF' : 'var(--bg-card, #1E293B)',
          border: isLight ? '1px solid rgba(226, 232, 240, 0.9)' : '1px solid var(--border-color, rgba(255,255,255,0.12))',
          boxShadow: isLight ? '0 20px 45px rgba(0, 0, 0, 0.14)' : '0 20px 50px rgba(0, 0, 0, 0.45)',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #3B82F6, #0D9488)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFF',
              boxShadow: '0 4px 14px rgba(59, 130, 246, 0.35)'
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: isLight ? '#0F172A' : '#F8FAFC', margin: 0 }}>
              {cleanText(t('shareNoteLabel')) || 'Notu Paylaş'}
            </h3>
          </div>

          <button
            onClick={() => setShowShareModal(false)}
            style={{
              background: isLight ? 'rgba(241, 245, 249, 0.9)' : 'rgba(255, 255, 255, 0.08)',
              border: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255, 255, 255, 0.12)',
              color: isLight ? '#475569' : '#94A3B8',
              cursor: 'pointer',
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Option 1: Share as Image */}
          <button
            onClick={async () => {
              if (editingNote?.isLocked) {
                const title = lang === 'tr' ? 'Kilitli Not Görseli' : 'Locked Note Image';
                const subtitle = lang === 'tr' ? 'Notu görsel olarak aktarmak için kimliğinizi doğrulayın' : 'Authenticate to export note image';
                const ok = await requestBiometricAuth(title, subtitle);
                if (!ok) {
                  setToast?.({ title: '⚠️', msg: lang === 'tr' ? 'Kimlik doğrulama başarısız.' : 'Authentication failed.' });
                  return;
                }
              }
              handleShareNoteImage(editingNote);
              setShowShareModal(false);
            }}
            style={{
              padding: '14px 16px',
              borderRadius: '16px',
              border: isLight ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(16, 185, 129, 0.3)',
              background: isLight ? '#ECFDF5' : 'rgba(16, 185, 129, 0.12)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              textAlign: 'left',
              transition: 'all 0.2s ease',
              boxShadow: isLight ? '0 2px 8px rgba(16, 185, 129, 0.06)' : 'none'
            }}
          >
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #10B981, #059669)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFF',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontWeight: 800, fontSize: '0.9rem', color: isLight ? '#065F46' : '#F8FAFC' }}>
                {cleanText(t('shareAsImage')) || 'Görsel Olarak Paylaş'}
              </span>
              <span style={{ fontSize: '0.72rem', color: isLight ? '#059669' : '#6EE7B7', lineHeight: 1.3, fontWeight: 600 }}>
                Notu yüksek kaliteli kart görseli olarak oluşturur
              </span>
            </div>

            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isLight ? '#10B981' : '#6EE7B7'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          {/* Option 2: Share with Friend */}
          <button
            onClick={async () => {
              if (checkAndRequestNotificationPermission) {
                const granted = await checkAndRequestNotificationPermission();
                if (!granted) return;
              }
              if (editingNote?.isLocked) {
                const title = lang === 'tr' ? 'Kilitli Not Paylaşımı' : 'Share Locked Note';
                const subtitle = lang === 'tr' ? 'Notu arkadaşınızla paylaşmak için kimliğinizi doğrulayın' : 'Authenticate to share note with friend';
                const ok = await requestBiometricAuth(title, subtitle);
                if (!ok) {
                  setToast?.({ title: '⚠️', msg: lang === 'tr' ? 'Kimlik doğrulama başarısız.' : 'Authentication failed.' });
                  return;
                }
              }
              setShowShareModal(false);
              if (typeof setActiveShareNoteId === 'function' && editingNote) {
                setActiveShareNoteId(editingNote.id);
              }
            }}
            style={{
              padding: '14px 16px',
              borderRadius: '16px',
              border: isLight ? '1px solid rgba(59, 130, 246, 0.25)' : '1px solid rgba(59, 130, 246, 0.3)',
              background: isLight ? '#F0F7FF' : 'rgba(59, 130, 246, 0.12)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              textAlign: 'left',
              transition: 'all 0.2s ease',
              boxShadow: isLight ? '0 2px 8px rgba(59, 130, 246, 0.06)' : 'none'
            }}
          >
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFF',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontWeight: 800, fontSize: '0.9rem', color: isLight ? '#1E3A8A' : '#F8FAFC' }}>
                {cleanText(t('shareWithFriend')) || (lang === 'tr' ? 'Arkadaşınla Paylaş' : 'Share with Friend')}
              </span>
              <span style={{ fontSize: '0.72rem', color: isLight ? '#2563EB' : '#93C5FD', lineHeight: 1.3, fontWeight: 600 }}>
                {lang === 'tr' ? 'Notu arkadaşına doğrudan gönder' : 'Send note directly to a friend'}
              </span>
            </div>

            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isLight ? '#3B82F6' : '#93C5FD'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          {/* Option 3: Export/Share as PDF (Only for Ultra/VIP users) */}
          {(userPlan === 'ultra' || userPlan === 'vip') && (
            <button
              onClick={async () => {
                if (editingNote?.isLocked) {
                  const title = lang === 'tr' ? 'Kilitli Not PDF' : 'Locked Note PDF';
                  const subtitle = lang === 'tr' ? 'Notu PDF olarak aktarmak için kimliğinizi doğrulayın' : 'Authenticate to export note PDF';
                  const ok = await requestBiometricAuth(title, subtitle);
                  if (!ok) {
                    setToast?.({ title: '⚠️', msg: lang === 'tr' ? 'Kimlik doğrulama başarısız.' : 'Authentication failed.' });
                    return;
                  }
                }
                setShowShareModal(false);
                exportNoteAsPDF(editingNote, userPlan, setToast, null, lang, setConfirmDialog);
              }}
              style={{
                padding: '14px 16px',
                borderRadius: '16px',
                border: isLight ? '1px solid rgba(239, 68, 68, 0.25)' : '1px solid rgba(239, 68, 68, 0.3)',
                background: isLight ? '#FEF2F2' : 'rgba(239, 68, 68, 0.12)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                textAlign: 'left',
                transition: 'all 0.2s ease',
                boxShadow: isLight ? '0 2px 8px rgba(239, 68, 68, 0.06)' : 'none'
              }}
            >
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFF',
                flexShrink: 0,
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontWeight: 800, fontSize: '0.9rem', color: isLight ? '#991B1B' : '#F8FAFC' }}>
                  {lang === 'tr' ? 'PDF Olarak Kaydet / Paylaş' : 'Save / Share as PDF'}
                </span>
                <span style={{ fontSize: '0.72rem', color: isLight ? '#EF4444' : '#FCA5A5', lineHeight: 1.3, fontWeight: 600 }}>
                  Notu PDF dosyası olarak cihazınıza indirir veya paylaşır
                </span>
              </div>

              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isLight ? '#EF4444' : '#FCA5A5'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareOptionsModal;

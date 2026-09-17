import React from 'react';
import { htmlToPlainText, getDaysLeft } from '@shared/utils/textUtils';
import { noteHasPasswordVault } from '@shared/utils/securityUtils';

const TrashPreviewModal = ({
  note,
  onClose,
  handleRestoreNote,
  handlePermanentDelete,
  openEditingNote,
  isLight,
  lang,
  t
}) => {
  if (!note) return null;

  // FIX: use shared getDaysLeft utility — no more duplicated formula
  const daysLeft = getDaysLeft(note.deletedAt);
  const hasVault = noteHasPasswordVault(note);

  const handleRestoreAndOpen = () => {
    // FIX: close modal FIRST, then restore, then open in editor
    // This prevents the editor being fed a note that still has deletedAt in state
    onClose();
    handleRestoreNote(note.id);
    if (typeof openEditingNote === 'function') {
      // Push a small delay so the restore state update can propagate before editor opens
      setTimeout(() => {
        window.history.pushState({ page: 'editor', noteId: note.id }, '');
        openEditingNote({ ...note, deletedAt: null });
      }, 80);
    }
  };

  const handleRestoreOnly = () => {
    handleRestoreNote(note.id);
    onClose();
  };

  const handleDeletePermanent = () => {
    onClose();
    handlePermanentDelete(note.id);
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: '0 0 calc(env(safe-area-inset-bottom, 0px) + 12px) 0',
        animation: 'fade-in 0.2s ease forwards'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          width: '100%',
          maxWidth: '520px',
          maxHeight: '85vh',
          background: isLight ? '#FFFFFF' : '#1E293B',
          borderRadius: '24px 24px 20px 20px',
          padding: '24px 20px 20px 20px',
          boxShadow: isLight ? '0 -10px 40px rgba(0,0,0,0.15)' : '0 -10px 40px rgba(0,0,0,0.6)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          overflow: 'hidden',
          animation: 'slide-up 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar for bottom sheet look */}
        <div style={{
          width: '40px',
          height: '4px',
          background: isLight ? '#E2E8F0' : 'rgba(255, 255, 255, 0.2)',
          borderRadius: '2px',
          alignSelf: 'center',
          marginBottom: '2px'
        }} />

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '3px 9px',
                borderRadius: '12px',
                background: daysLeft <= 3 
                  ? (isLight ? '#FEE2E2' : 'rgba(239, 68, 68, 0.2)') 
                  : (isLight ? '#EFF6FF' : 'rgba(59, 130, 246, 0.15)'),
                color: daysLeft <= 3 
                  ? (isLight ? '#DC2626' : '#FCA5A5') 
                  : (isLight ? '#2563EB' : '#93C5FD')
              }}>
                {daysLeft > 0 ? `${daysLeft} ${t('daysRemaining') || 'gün kaldı'}` : (t('willBeDeletedToday') || 'Bugün silinecek')}
              </span>
              {hasVault && (
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '3px 8px',
                  borderRadius: '12px',
                  background: isLight ? 'rgba(234, 179, 8, 0.15)' : 'rgba(234, 179, 8, 0.25)',
                  color: isLight ? '#B45309' : '#FCD34D',
                  border: isLight ? '1px solid rgba(234, 179, 8, 0.35)' : '1px solid rgba(234, 179, 8, 0.4)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  🔑 {lang === 'tr' ? 'Şifre Kasası' : 'Vault'}
                </span>
              )}
              <span style={{ fontSize: '0.72rem', color: isLight ? '#94A3B8' : 'rgba(255,255,255,0.4)' }}>
                {note.deletedAt ? new Date(note.deletedAt).toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
              </span>
            </div>

            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              margin: 0,
              color: isLight ? '#0F172A' : '#FFFFFF',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {note.title || t('untitledNote') || 'Başlıksız Not'}
            </h3>
          </div>

          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: 'none',
              background: isLight ? '#F1F5F9' : 'rgba(255,255,255,0.08)',
              color: isLight ? '#64748B' : '#94A3B8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Note Content Preview (Scrollable) — FIX: flex grow instead of fixed maxHeight */}
        <div style={{
          flex: '1 1 auto',
          minHeight: 0,
          overflowY: 'auto',
          maxHeight: '38vh',
          padding: '14px',
          background: isLight ? '#F8FAFC' : 'rgba(15, 23, 42, 0.6)',
          borderRadius: '16px',
          border: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.06)'
        }}>
          {note.blocks && note.blocks.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {note.blocks.map((block, idx) => {
                if (block.type === 'text') {
                  const plain = htmlToPlainText(block.content || '');
                  return (
                    <p key={block.id || idx} style={{
                      fontSize: '0.88rem',
                      lineHeight: '1.55',
                      margin: 0,
                      color: isLight ? '#334155' : 'rgba(255, 255, 255, 0.85)',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {plain || <span style={{ fontStyle: 'italic', color: isLight ? '#94A3B8' : 'rgba(255,255,255,0.3)' }}>(Boş blok)</span>}
                    </p>
                  );
                }
                return (
                  <div key={block.id || idx} style={{
                    fontSize: '0.8rem',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    background: isLight ? '#EDE9FE' : 'rgba(139, 92, 246, 0.15)',
                    color: isLight ? '#6D28D9' : '#C4B5FD',
                    fontWeight: 600
                  }}>
                    📦 {block.type.toUpperCase()} Eklentisi
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{
              fontSize: '0.88rem',
              lineHeight: '1.55',
              margin: 0,
              color: isLight ? '#334155' : 'rgba(255, 255, 255, 0.85)',
              whiteSpace: 'pre-wrap'
            }}>
              {htmlToPlainText(note.content || '') || <span style={{ fontStyle: 'italic', color: isLight ? '#94A3B8' : 'rgba(255,255,255,0.3)' }}>(İçerik boş)</span>}
            </p>
          )}
        </div>

        {/* Vault Warning Banner if note contains password vault */}
        {hasVault && (
          <div style={{
            padding: '10px 14px',
            borderRadius: '12px',
            background: isLight ? '#FEF3C7' : 'rgba(245, 158, 11, 0.16)',
            border: isLight ? '1.5px solid #F59E0B' : '1.5px solid rgba(245, 158, 11, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span style={{ fontSize: '1.1rem' }}>🔑</span>
            <span style={{
              fontSize: '0.8rem',
              color: isLight ? '#92400E' : '#FDE68A',
              fontWeight: 700,
              lineHeight: '1.35'
            }}>
              {lang === 'tr' 
                ? 'Bu not Şifre Kasası içermektedir. Kalıcı olarak silerseniz kayıtlı hesap şifreleriniz geri getirilemez şekilde yok olur!' 
                : 'This note contains a Password Vault. Permanent deletion will permanently destroy your saved passwords!'}
            </span>
          </div>
        )}

        {/* Warning Banner */}
        <div style={{
          padding: '10px 14px',
          borderRadius: '12px',
          background: isLight ? '#FFFBEB' : 'rgba(245, 158, 11, 0.12)',
          border: isLight ? '1px solid #FDE68A' : '1px solid rgba(245, 158, 11, 0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span style={{ fontSize: '1rem' }}>⚠️</span>
          <span style={{
            fontSize: '0.78rem',
            color: isLight ? '#B45309' : '#FCD34D',
            fontWeight: 500,
            lineHeight: '1.35'
          }}>
            {lang === 'tr' 
              ? 'Bu not çöp kutusundadır. Not üzerinde değişiklik yapmak için önce geri yüklemeniz gerekir.' 
              : 'This note is in trash. You need to restore it before making any edits.'}
          </span>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button
              onClick={handleRestoreOnly}
              style={{
                padding: '12px',
                borderRadius: '14px',
                background: isLight ? '#ECFDF5' : 'rgba(16, 185, 129, 0.18)',
                color: isLight ? '#059669' : '#34D399',
                fontSize: '0.86rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                border: isLight ? '1px solid #A7F3D0' : '1px solid rgba(52, 211, 153, 0.3)'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
              </svg>
              {t('restoreBtn') || 'Geri Yükle'}
            </button>

            <button
              onClick={handleRestoreAndOpen}
              style={{
                padding: '12px',
                borderRadius: '14px',
                border: 'none',
                background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                color: '#FFFFFF',
                fontSize: '0.86rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              {lang === 'tr' ? 'Geri Yükle & Aç' : 'Restore & Edit'}
            </button>
          </div>

          <button
            onClick={handleDeletePermanent}
            style={{
              padding: '11px',
              borderRadius: '14px',
              border: isLight ? '1px solid #FECACA' : '1px solid rgba(239, 68, 68, 0.25)',
              background: isLight ? '#FEF2F2' : 'rgba(239, 68, 68, 0.12)',
              color: isLight ? '#DC2626' : '#FCA5A5',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            {t('deletePermanentlyBtn') || 'Kalıcı Olarak Sil'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrashPreviewModal;

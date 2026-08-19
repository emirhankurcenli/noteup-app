import React from 'react';
import { PLAN_LIMITS } from '../../../../constants/paywallPlans';

export const EditorLockStatusBadge = ({
  editingNote,
  setEditingNote,
  setShowEditorMenu,
  userPlan = 'lite',
  notes = [],
  setToast,
  setShowPaywall,
  lang,
  t,
  requestBiometricAuth,
  setNotes,
  persistNotes,
  isLight,
}) => {
  const handleToggleLock = async () => {
    setShowEditorMenu(false);
    const isLocking = !editingNote.isLocked;

    if (isLocking) {
      const limits = PLAN_LIMITS[userPlan] || PLAN_LIMITS.lite;
      const currentLockedCount = (notes || []).filter((n) => n.isLocked && !n.deletedAt && n.id !== editingNote.id).length;
      if (currentLockedCount >= limits.maxEncryptedNotes) {
        setToast?.({
          title: '⭐ Plan Limiti Aşıldı',
          msg: `Lite planında en fazla ${limits.maxEncryptedNotes} adet not kilitleyebilirsiniz. Sınırsız şifreleme için Pro'ya geçin!`,
        });
        if (typeof setShowPaywall === 'function') setShowPaywall(true);
        return;
      }
    }

    const title = isLocking ? (lang === 'tr' ? 'Notu Kilitle' : 'Lock Note') : (lang === 'tr' ? 'Kilidi Kaldır' : 'Unlock Note');
    const subtitle = isLocking
      ? (lang === 'tr' ? 'Notu kilitlemek için parmak izi, yüz tanıma veya telefon şifrenizi girin' : 'Use Face ID, fingerprint or phone password to lock')
      : (lang === 'tr' ? 'Kilidi kaldırmak için parmak izi, yüz tanıma veya telefon şifrenizi girin' : 'Use Face ID, fingerprint or phone password to unlock');

    const ok = await requestBiometricAuth(title, subtitle);
    if (ok) {
      const updated = { ...editingNote, isLocked: isLocking, updatedAt: Date.now() };
      setEditingNote(updated);
      setNotes((prev) => {
        const upd = prev.map((n) => (n.id === editingNote.id ? updated : n));
        persistNotes(upd);
        return upd;
      });
      setToast?.({
        title: isLocking ? '🔒' : '🔓',
        msg: isLocking ? (lang === 'tr' ? 'Not kilitlendi.' : 'Note locked.') : (lang === 'tr' ? 'Notun kilidi kaldırıldı.' : 'Note unlocked.'),
      });
    } else {
      setToast?.({ title: '⚠️', msg: t('authFailed') });
    }
  };

  return (
    <button
      style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600 }}
      onClick={handleToggleLock}
    >
      <div
        style={{
          width: '28px',
          height: '28px',
          borderRadius: '8px',
          background: isLight ? 'linear-gradient(135deg, #F59E0B, #D97706)' : 'rgba(245, 158, 11, 0.18)',
          border: isLight ? 'none' : '1px solid rgba(245, 158, 11, 0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: isLight ? '#FFF' : '#FBBF24',
          flexShrink: 0,
        }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {editingNote.isLocked ? (
            <>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 9.9-1" />
            </>
          ) : (
            <>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </>
          )}
        </svg>
      </div>
      <span>{editingNote.isLocked ? (lang === 'tr' ? 'Kilidi Kaldır' : 'Unlock Note') : (lang === 'tr' ? 'Notu Kilitle' : 'Lock Note')}</span>
    </button>
  );
};

export default EditorLockStatusBadge;

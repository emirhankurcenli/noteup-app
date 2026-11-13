import React, { useState, useEffect } from 'react';
import { CryptoService } from '@shared/services/cryptoService';

const PasswordWidget = ({
  block,
  blockFormStates,
  updateBlockForm,
  handleUpdateBlock,
  handleDeleteBlock,
  triggerHaptic,
  vaultUnlocked,
  setVaultUnlocked,
  requestBiometricAuth,
  t
}) => {
  const pfs = blockFormStates[block.id] || {};
  const title = block.title || '';
  const username = block.username || '';
  const rawPasswordVal = block.passwordVal || '';
  const [decryptedPassword, setDecryptedPassword] = useState('');

  useEffect(() => {
    let isMounted = true;
    if (rawPasswordVal.startsWith('ENC:v1:')) {
      CryptoService.decrypt(rawPasswordVal).then(dec => {
        if (isMounted) setDecryptedPassword(dec || '');
      });
    } else {
      setDecryptedPassword(rawPasswordVal);
    }
    return () => { isMounted = false; };
  }, [rawPasswordVal]);

  const handlePasswordChange = async (val) => {
    setDecryptedPassword(val);
    if (!val) {
      handleUpdateBlock(block.id, { passwordVal: '' });
      return;
    }
    try {
      const encrypted = await CryptoService.encrypt(val);
      handleUpdateBlock(block.id, { passwordVal: encrypted });
    } catch (e) {
      handleUpdateBlock(block.id, { passwordVal: val });
    }
  };
  const isVisible = pfs.passwordVisible;

  // Biyometrik kapı: not oturumunda ilk kez geçtiyse tekrar sormaz
  const withVaultAuth = async (action) => {
    if (vaultUnlocked) {
      // Bu not oturumunda zaten doğrulandı, direkt çalıştır
      action();
      return;
    }
    // Cihaz biyometrik / şifre doğrulaması
    const ok = await requestBiometricAuth(
      'Şifre Kasası',
      'Şifrenizi görmek için parmak izi, yüz tanıma veya cihaz şifrenizi girin'
    );
    if (ok) {
      if (typeof setVaultUnlocked === 'function') setVaultUnlocked(true);
      if (triggerHaptic) triggerHaptic('success');
      action();
    } else {
      if (triggerHaptic) triggerHaptic('warning');
    }
  };

  const handleCopy = (field, text) => {
    if (!text) return;
    withVaultAuth(() => {
      navigator.clipboard.writeText(text);
      updateBlockForm(block.id, { copiedField: field });
      setTimeout(() => {
        updateBlockForm(block.id, { copiedField: null });
      }, 1500);
    });
  };

  const handleToggleVisible = () => {
    withVaultAuth(() => {
      updateBlockForm(block.id, { passwordVisible: !isVisible });
    });
  };

  const isSetupForm = !block.setupDone;

  const getTr = (key, fallback) => {
    if (typeof t === 'function') {
      const val = t(key);
      if (val && val !== key) return val;
    }
    return fallback;
  };

  const confirmSetup = () => {
    if (!title.trim()) {
      const el = document.getElementById(`password-title-${block.id}`);
      if (el) {
        el.focus();
        el.style.borderColor = '#F59E0B';
        el.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.3)';
        setTimeout(() => {
          el.style.borderColor = '';
          el.style.boxShadow = '';
        }, 1200);
      }
      if (triggerHaptic) triggerHaptic('warning');
      return;
    }
    if (triggerHaptic) triggerHaptic('success');
    handleUpdateBlock(block.id, { setupDone: true });
  };

  if (isSetupForm) {
    return (
      <div className="password-widget animate-fade-in" style={{ borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', padding: '8px 10px', margin: '2px 0' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <div style={{ width: '26px', height: '26px', borderRadius: '7px', background: 'rgba(234, 179, 8, 0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706', flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="7.5" cy="15.5" r="5.5" />
              <path d="M21 2l-9.6 9.6" />
              <path d="M15.5 7.5l3 3" />
            </svg>
          </div>
          <input
            id={`password-title-${block.id}`}
            className="input-field"
            style={{ flex: 1, minWidth: 0, padding: '6px 10px', borderRadius: '8px', fontSize: '0.84rem', fontWeight: 500, boxSizing: 'border-box' }}
            placeholder={getTr('pwdPlatformPlaceholder', 'Platform (Örn: Instagram, Google...)')}
            value={title}
            onChange={e => handleUpdateBlock(block.id, { title: e.target.value })}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                confirmSetup();
              }
            }}
          />
          <button
            type="button"
            className="btn-primary"
            style={{
              padding: '6px 12px',
              fontSize: '0.8rem',
              fontWeight: 600,
              borderRadius: '8px',
              background: '#D97706',
              border: 'none',
              color: '#FFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'none',
              cursor: 'pointer',
              flexShrink: 0
            }}
            onClick={confirmSetup}
          >
            <span>{getTr('confirmPlatform', 'Onayla')}</span>
          </button>
          <button
            style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#EF4444', cursor: 'pointer', width: '24px', height: '24px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            onClick={() => withVaultAuth(() => handleDeleteBlock(block.id))}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="password-widget" style={{ borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', padding: '8px 10px', gap: '5px', margin: '2px 0' }} onClick={(e) => e.stopPropagation()}>
      <div className="password-header" style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
        <div style={{ width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(234, 179, 8, 0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706', flexShrink: 0 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="7.5" cy="15.5" r="5.5" />
            <path d="M21 2l-9.6 9.6" />
            <path d="M15.5 7.5l3 3" />
          </svg>
        </div>
        <span style={{
          fontWeight: 600,
          fontSize: '0.85rem',
          flex: 1,
          color: 'var(--text-primary)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          lineHeight: 1.2
        }}>
          {title || t('pwdPlatform')}
        </span>
        <button
          style={{ background: 'rgba(239, 68, 68, 0.08)', border: 'none', color: '#EF4444', cursor: 'pointer', width: '22px', height: '22px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          onClick={() => withVaultAuth(() => handleDeleteBlock(block.id))}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="password-fields" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div className="password-input-wrapper" style={{ padding: '1px 4px 1px 8px', borderRadius: '8px', minHeight: '30px' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)', marginRight: '6px', flexShrink: 0, opacity: 0.75 }}>
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <input
            className="password-field-input"
            style={{ fontSize: '0.83rem', fontWeight: 500, padding: '4px 2px' }}
            placeholder={t('pwdUserPlaceholder')}
            value={username}
            onChange={e => handleUpdateBlock(block.id, { username: e.target.value })}
          />
          <button
            className={`password-action-btn ${pfs.copiedField === 'username' ? 'copied' : ''}`}
            style={{ width: '24px', height: '24px', borderRadius: '6px' }}
            onClick={() => handleCopy('username', username)}
          >
            {pfs.copiedField === 'username' ? (
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            ) : (
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            )}
          </button>
        </div>

        <div className="password-input-wrapper" style={{ padding: '1px 4px 1px 8px', borderRadius: '8px', minHeight: '30px' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)', marginRight: '6px', flexShrink: 0, opacity: 0.75 }}>
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <input
            className="password-field-input"
            style={{ fontSize: isVisible ? '0.83rem' : '0.92rem', fontWeight: isVisible ? 500 : 700, letterSpacing: isVisible ? 'normal' : '0.1em', padding: '4px 2px' }}
            type={isVisible ? "text" : "password"}
            placeholder={t('pwdPass')}
            value={decryptedPassword}
            onChange={e => handlePasswordChange(e.target.value)}
          />
          <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
            <button
              className="password-action-btn"
              style={{ width: '24px', height: '24px', borderRadius: '6px' }}
              onClick={handleToggleVisible}
            >
              {isVisible ? (
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
              ) : (
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              )}
            </button>
            <button
              className={`password-action-btn ${pfs.copiedField === 'password' ? 'copied' : ''}`}
              style={{ width: '24px', height: '24px', borderRadius: '6px' }}
              onClick={() => handleCopy('password', decryptedPassword)}
            >
              {pfs.copiedField === 'password' ? (
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              ) : (
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(PasswordWidget);

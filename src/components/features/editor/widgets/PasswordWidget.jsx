import React, { useState, useEffect } from 'react';
import { CryptoService } from '../../../../services/cryptoService';
import PasswordStrengthBar from './password/PasswordStrengthBar';

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


  if (isSetupForm) {
    return (
      <div className="password-widget animate-fade-in" style={{ borderRadius: '18px', border: '1.5px solid rgba(234, 179, 8, 0.35)', background: 'var(--bg-card)', padding: '16px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="password-header" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '11px', background: 'linear-gradient(135deg, #EAB308, #CA8A04)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', flexShrink: 0, boxShadow: '0 3px 10px rgba(234, 179, 8, 0.35)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="7.5" cy="15.5" r="5.5" />
              <path d="M21 2l-9.6 9.6" />
              <path d="M15.5 7.5l3 3" />
            </svg>
          </div>
          <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)', flex: 1 }}>Şifre Kasası</span>
          <button
            style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#EF4444', cursor: 'pointer', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            onClick={() => withVaultAuth(() => handleDeleteBlock(block.id))}
            title="Bloğu Sil"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Platform Name Input */}
        <div style={{ marginBottom: '12px' }}>
          <input
            id={`password-title-${block.id}`}
            className="input-field"
            style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 600, boxSizing: 'border-box', border: title.trim() ? '1.5px solid rgba(234,179,8,0.5)' : undefined }}
            placeholder="Örn: Google, Netflix, Instagram..."
            value={title}
            onChange={e => handleUpdateBlock(block.id, { title: e.target.value })}
          />
        </div>

        {/* Info Hint Box */}
        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', background: 'rgba(234, 179, 8, 0.08)', border: '1px solid rgba(234, 179, 8, 0.15)', borderRadius: '12px', padding: '10px 12px', lineHeight: 1.5, display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '14px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EAB308" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <span>Hesap şifrelerinizi ve kullanıcı bilgilerinizi güvenli bir şekilde tek bir yerden saklayın.</span>
        </div>

        {/* Confirm Action Button */}
        <button
          type="button"
          className="btn-primary"
          style={{
            width: '100%',
            padding: '13px',
            fontSize: '0.95rem',
            fontWeight: 800,
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #F59E0B, #D97706)',
            border: '1.5px solid rgba(245,158,11,0.4)',
            color: '#FFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 6px 20px rgba(234, 179, 8, 0.45)',
            cursor: 'pointer',
            transition: 'all 0.25s ease',
            letterSpacing: '0.02em'
          }}
          onClick={() => {
            if (!title.trim()) {
              const el = document.getElementById(`password-title-${block.id}`);
              if (el) {
                el.focus();
                el.style.borderColor = '#F59E0B';
                el.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.4)';
                el.style.backgroundColor = 'rgba(245, 158, 11, 0.08)';
                setTimeout(() => {
                  el.style.borderColor = '';
                  el.style.boxShadow = '';
                  el.style.backgroundColor = '';
                }, 1200);
              }
              if (triggerHaptic) triggerHaptic('warning');
              return;
            }
            if (triggerHaptic) triggerHaptic('success');
            handleUpdateBlock(block.id, { setupDone: true });
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>Platformu Onayla</span>
        </button>
      </div>
    );
  }

  return (
    <div className="password-widget" style={{ borderRadius: '18px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', padding: '16px' }} onClick={(e) => e.stopPropagation()}>
      <div className="password-header" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg, #EAB308, #CA8A04)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', flexShrink: 0, boxShadow: '0 2px 8px rgba(234, 179, 8, 0.3)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="7.5" cy="15.5" r="5.5" />
            <path d="M21 2l-9.6 9.6" />
            <path d="M15.5 7.5l3 3" />
          </svg>
        </div>
        {/* Read-only platform name after setup is confirmed */}
        <span style={{
          fontWeight: 800,
          fontSize: '0.95rem',
          flex: 1,
          color: 'var(--text-primary)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {title || t('pwdPlatform')}
        </span>
        <button
          style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#EF4444', cursor: 'pointer', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          onClick={() => withVaultAuth(() => handleDeleteBlock(block.id))}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="password-fields" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div className="password-field-group">
          <label className="password-field-label" style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px', display: 'block' }}>{t('pwdUser')}</label>
          <div className="password-input-wrapper">
            <input
              className="password-field-input"
              style={{ fontSize: '0.85rem', padding: '10px 12px', borderRadius: '10px' }}
              placeholder={t('pwdUserPlaceholder')}
              value={username}
              onChange={e => handleUpdateBlock(block.id, { username: e.target.value })}
            />
            <button
              className={`password-action-btn ${pfs.copiedField === 'username' ? 'copied' : ''}`}
              onClick={() => handleCopy('username', username)}
            >
              {pfs.copiedField === 'username' ? (
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              ) : (
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              )}
            </button>
          </div>
        </div>

        <div className="password-field-group">
          <label className="password-field-label" style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px', display: 'block' }}>{t('pwdPass')}</label>
          <div className="password-input-wrapper">
            <input
              className="password-field-input"
              style={{ fontSize: '0.85rem', padding: '10px 12px', borderRadius: '10px' }}
              type={isVisible ? "text" : "password"}
              placeholder={t('pwdPass')}
              value={decryptedPassword}
              onChange={e => handlePasswordChange(e.target.value)}
            />
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                className="password-action-btn"
                onClick={handleToggleVisible}
              >
                {isVisible ? (
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                )}
              </button>
              <button
                className={`password-action-btn ${pfs.copiedField === 'password' ? 'copied' : ''}`}
                onClick={() => handleCopy('password', decryptedPassword)}
              >
                {pfs.copiedField === 'password' ? (
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                )}
              </button>
            </div>
            <PasswordStrengthBar password={decryptedPassword} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordWidget;

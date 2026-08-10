import React, { useState, useEffect } from 'react';
import { getPaymentGraceStatus, getDataRetentionStatus } from '../../../utils/subscriptionGraceUtils';

const cleanText = (text) => {
  if (typeof text !== 'string') return text || '';
  return text.replace(/<[^>]*>/g, '').trim();
};

const AccountSubTab = ({
  user,
  setShowAvatarPicker,
  profileName,
  handleUpdateProfileName,
  userPlan,
  setShowPaywall,
  getStorageUsageBytes,
  PLAN_STORAGE_LIMITS,
  formatBytes,
  isLight,
  DEFAULT_AVATARS,
  deletedNotesCount = 0,
  handleTabClick,
  triggerHaptic,
  handleLogout,
  lang,
  t,
}) => {
  const [tempName, setTempName] = useState(profileName || user?.name || '');

  useEffect(() => {
    setTempName(profileName || user?.name || '');
  }, [profileName, user?.name]);

  const isNameChanged = tempName.trim() !== '' && tempName.trim() !== (profileName || user?.name || '');

  const usedBytes = getStorageUsageBytes();
  const limitBytes = PLAN_STORAGE_LIMITS[userPlan] || PLAN_STORAGE_LIMITS.lite;
  const percent = Math.min(100, Math.round((usedBytes / limitBytes) * 100));
  const limitText = formatBytes(limitBytes);

  const paymentGrace = getPaymentGraceStatus(userPlan);
  const dataRetention = getDataRetentionStatus(usedBytes, limitBytes);

  return (
    <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* HERO PROFILE CARD */}
      <div style={{
        padding: '24px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: isLight ? 'rgba(255,255,255,0.85)' : 'rgba(24, 24, 37, 0.75)',
        backdropFilter: 'blur(16px)',
        borderRadius: '20px',
        border: isLight ? '1px solid rgba(0,0,0,0.06)' : '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
        position: 'relative'
      }}>
        
        {/* Avatar with Edit Badge */}
        <div 
          onClick={() => setShowAvatarPicker(true)} 
          style={{ cursor: 'pointer', position: 'relative', width: '90px', height: '90px', marginBottom: '14px' }}
        >
          <img 
            src={user.photoURL} 
            alt="Avatar" 
            style={{
              width: '90px',
              height: '90px',
              borderRadius: '50%',
              border: '3px solid var(--btn-primary-bg)',
              objectFit: 'cover',
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)'
            }}
            onError={(e) => {
              e.target.src = DEFAULT_AVATARS[0].url;
            }} 
          />
          <div style={{
            position: 'absolute',
            right: '2px',
            bottom: '2px',
            background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            border: '2px solid #FFF'
          }}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </div>
        </div>

        {/* User Info */}
        <div style={{ textAlign: 'center', width: '100%', marginBottom: '16px' }}>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: isLight ? '#0F172A' : '#FFFFFF' }}>{user.name}</span>
          <span style={{ fontSize: '0.85rem', color: isLight ? '#1E293B' : '#CBD5E1', fontWeight: 700, display: 'block', marginTop: '2px' }}>{user.email}</span>
        </div>

        {/* Profile Name Input with Apply Button */}
        <div style={{ width: '100%', borderTop: isLight ? '1px solid rgba(0,0,0,0.06)' : '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
          <label style={{ fontSize: '0.78rem', fontWeight: 800, color: isLight ? '#1E293B' : '#CBD5E1', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {t('profileNameLabel')}
          </label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
            <input 
              type="text" 
              className="input-field" 
              placeholder={t('profileNamePlaceholder')} 
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && isNameChanged) {
                  triggerHaptic('medium');
                  handleUpdateProfileName(tempName);
                }
              }}
              style={{ 
                flex: 1,
                padding: '10px 14px',
                borderRadius: '12px',
                fontSize: '0.9rem',
                fontWeight: 700,
                color: isLight ? '#0F172A' : '#FFFFFF',
                background: isLight ? '#F8FAFC' : 'rgba(0,0,0,0.2)',
                border: isLight ? '1px solid #CBD5E1' : '1px solid rgba(255,255,255,0.1)'
              }}
            />
            <button
              onClick={() => {
                if (isNameChanged) {
                  triggerHaptic('medium');
                  handleUpdateProfileName(tempName);
                }
              }}
              disabled={!isNameChanged}
              style={{
                padding: '10px 16px',
                borderRadius: '12px',
                border: 'none',
                fontSize: '0.85rem',
                fontWeight: 800,
                cursor: isNameChanged ? 'pointer' : 'not-allowed',
                background: isNameChanged 
                  ? 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)' 
                  : (isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)'),
                color: isNameChanged ? '#FFFFFF' : (isLight ? '#94A3B8' : '#64748B'),
                boxShadow: isNameChanged ? '0 4px 14px rgba(59,130,246,0.35)' : 'none',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                opacity: isNameChanged ? 1 : 0.6
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {lang === 'tr' ? 'Uygula' : 'Apply'}
            </button>
          </div>
        </div>
      </div>

      {/* PLAN STATUS BANNER (Tam Arka Plan & Marka Renkleri ile Uyumlu) */}
      <div
        onClick={() => setShowPaywall(true)}
        style={{
          position: 'relative',
          background: userPlan === 'lite'
            ? (isLight 
                ? 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)' 
                : 'linear-gradient(135deg, #181825 0%, #0F0F1A 100%)')
            : userPlan === 'ultra'
              ? (isLight ? 'linear-gradient(135deg, #FFFBEB, #FEF3C7)' : 'linear-gradient(135deg, #2d1f00, #1a1200)')
              : (isLight ? 'linear-gradient(135deg, #EFF6FF, #DBEAFE)' : 'linear-gradient(135deg, #0f172a, #1e3a5f)'),
          borderRadius: '20px',
          padding: '16px 18px',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          overflow: 'hidden',
          boxShadow: isLight 
            ? '0 6px 20px rgba(0, 0, 0, 0.04)' 
            : (userPlan === 'lite' ? '0 8px 24px rgba(0, 0, 0, 0.25)' : '0 0 25px rgba(59,130,246,0.18)'),
          border: userPlan === 'lite'
            ? (isLight ? '1px solid #E2E8F0' : '1px solid rgba(255, 255, 255, 0.08)')
            : `1.5px solid ${userPlan === 'ultra' ? 'rgba(245,158,11,0.5)' : 'rgba(59,130,246,0.5)'}`,
          transition: 'all 0.2s ease',
        }}
      >
        {/* Radial Background Glow Accent for Lite Plan */}
        {userPlan === 'lite' && (
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: isLight 
              ? 'radial-gradient(circle, rgba(249, 115, 22, 0.12) 0%, rgba(255,255,255,0) 70%)'
              : 'radial-gradient(circle, rgba(249, 115, 22, 0.25) 0%, rgba(139, 92, 246, 0) 70%)',
            pointerEvents: 'none'
          }} />
        )}

        {/* ÜST SATIR: İkon + Başlık + Buton */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
            {/* 3D Icon Badge */}
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: userPlan === 'lite'
                ? 'linear-gradient(135deg, #F97316, #FB923C)'
                : userPlan === 'ultra'
                  ? 'linear-gradient(135deg, #F59E0B, #D97706)'
                  : 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: userPlan === 'lite'
                ? '0 4px 14px rgba(249, 115, 22, 0.35)'
                : '0 4px 14px rgba(0,0,0,0.15)',
              fontSize: '1.3rem'
            }}>
              {userPlan === 'ultra' ? '👑' : userPlan === 'pro' ? '⚡' : '🚀'}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, minWidth: 0 }}>
              <span style={{
                fontSize: '0.68rem',
                color: isLight ? '#64748B' : '#94A3B8',
                fontWeight: 800,
                letterSpacing: '0.6px',
                textTransform: 'uppercase'
              }}>
                Mevcut Abonelik
              </span>

              <span style={{
                fontSize: '1.08rem',
                fontWeight: 800,
                letterSpacing: '-0.2px',
                color: userPlan === 'lite' 
                  ? (isLight ? '#0F172A' : '#FFFFFF') 
                  : (userPlan === 'ultra' ? '#D97706' : (isLight ? '#0F172A' : '#F1F5F9')),
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {userPlan === 'ultra' && 'NoteUp Ultra'}
                {userPlan === 'pro' && 'NoteUp Pro'}
                {userPlan === 'lite' && 'NoteUp Lite'}
              </span>
            </div>
          </div>

          {/* CTA Button */}
          <div style={{
            background: userPlan === 'ultra'
              ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
              : userPlan === 'pro'
              ? 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)'
              : 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
            color: '#FFFFFF',
            border: 'none',
            fontSize: '0.84rem',
            fontWeight: 800,
            padding: '9px 16px',
            borderRadius: '12px',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            boxShadow: userPlan === 'ultra'
              ? '0 4px 14px rgba(245, 158, 11, 0.4)'
              : userPlan === 'pro'
              ? '0 4px 14px rgba(59, 130, 246, 0.4)'
              : '0 4px 14px rgba(249, 115, 22, 0.4)'
          }}>
            {userPlan === 'lite' ? 'Yükselt' : 'Planı Gör'}
          </div>
        </div>

        {/* ALT SATIR BANNER: "7 gün ücretsiz dene" Uyumlu Alt Şerit */}
        {userPlan === 'lite' && (
          <div style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: '10px',
            background: isLight ? 'rgba(249, 115, 22, 0.06)' : 'rgba(249, 115, 22, 0.12)',
            border: isLight ? '1px dashed rgba(249, 115, 22, 0.25)' : '1px dashed rgba(249, 115, 22, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            fontSize: '0.78rem',
            fontWeight: 700,
            color: isLight ? '#EA580C' : '#FB923C',
            zIndex: 1
          }}>
            <span>7 Gün Ücretsiz Dene · İstediğin Zaman İptal Et</span>
          </div>
        )}
      </div>

      {/* 7-DAY PAYMENT GRACE PERIOD BANNER */}
      {paymentGrace.inPaymentGrace && (
        <div style={{
          padding: '14px 16px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(217, 119, 6, 0.08))',
          border: '1.5px solid rgba(245, 158, 11, 0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #F59E0B, #D97706)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFF',
            fontWeight: 800,
            fontSize: '1.1rem',
            flexShrink: 0
          }}>
            ⚡
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', fontWeight: 800, color: isLight ? '#92400E' : '#FBBF24', margin: 0 }}>
              7 Günlük Ödeme Esnekliği Aktif (Kalan: {paymentGrace.daysRemaining} Gün)
            </p>
            <p style={{ fontSize: '0.72rem', color: isLight ? '#78350F' : '#FDE68A', margin: '3px 0 0 0', lineHeight: 1.35 }}>
              Abonelik ödemeniz yenilenemedi. Tüm Ultra/Pro haklarınız {paymentGrace.graceUntilDate} tarihine kadar açık tutuluyor. Lütfen ödeme bilgilerinizi güncelleyin.
            </p>
          </div>
        </div>
      )}

      {/* 30-DAY OVER-QUOTA DATA RETENTION & SILME UYARISI BANNER */}
      {dataRetention.isOverQuota && (
        <div style={{
          padding: '14px 16px',
          borderRadius: '16px',
          background: dataRetention.isDeletionDue
            ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(185, 28, 28, 0.08))'
            : 'linear-gradient(135deg, rgba(249, 115, 22, 0.15), rgba(194, 65, 12, 0.08))',
          border: dataRetention.isDeletionDue
            ? '1.5px solid rgba(239, 68, 68, 0.5)'
            : '1.5px solid rgba(249, 115, 22, 0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: dataRetention.isDeletionDue ? 'linear-gradient(135deg, #EF4444, #B91C1C)' : 'linear-gradient(135deg, #F97316, #C2410C)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFF',
            fontWeight: 800,
            fontSize: '1.1rem',
            flexShrink: 0
          }}>
            {dataRetention.isDeletionDue ? '🗑️' : '📦'}
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', fontWeight: 800, color: dataRetention.isDeletionDue ? '#EF4444' : (isLight ? '#C2410C' : '#FB923C'), margin: 0 }}>
              {dataRetention.isDeletionDue
                ? '⚠️ 30 Günlük Süre Doldu - Silme Uyarısı'
                : `📦 30 Günlük Veri Saklama Süresi (Kalan: ${dataRetention.daysRemaining} Gün)`}
            </p>
            <p style={{ fontSize: '0.72rem', color: isLight ? '#7C2D12' : '#FFEDD5', margin: '3px 0 0 0', lineHeight: 1.35 }}>
              {dataRetention.isDeletionDue
                ? `Depolama limitiniz (${limitText}) aşıldığı ve 30 günlük yedekleme süreniz dolduğu için kotayı aşan medya dosyalarınız otomatik olarak silinecektir. Lütfen plan yükseltin.`
                : `100MB depolama limitini aştınız. Mevcut dosyalarınızı ${dataRetention.retentionEndDate} tarihine kadar görüntüleyebilir ve indirebilirsiniz. Yeni dosya eklemek için plan yükseltin.`}
            </p>
          </div>
        </div>
      )}

      {/* CLOUD STORAGE CARD */}
      <div style={{
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        background: isLight ? 'rgba(255,255,255,0.85)' : 'rgba(24, 24, 37, 0.75)',
        backdropFilter: 'blur(12px)',
        borderRadius: '16px',
        border: isLight ? '1px solid rgba(0,0,0,0.06)' : '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: isLight ? 'linear-gradient(135deg, #3B82F6, #1D4ED8)' : 'linear-gradient(135deg, #1E40AF, #1E3A8A)',
              border: isLight ? 'none' : '1px solid rgba(96, 165, 250, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: isLight ? '0 2px 8px rgba(59, 130, 246, 0.3)' : '0 2px 8px rgba(30, 64, 175, 0.3)'
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
              </svg>
            </div>
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: isLight ? '#0F172A' : '#FFFFFF' }}>Bulut Depolama</span>
          </div>

          <span style={{ fontSize: '0.8rem', color: isLight ? '#1E293B' : '#CBD5E1', fontWeight: 800 }}>
            {formatBytes(usedBytes)} / {limitText} ({percent}%)
          </span>
        </div>

        <div style={{ width: '100%', height: '8px', background: isLight ? '#E2E8F0' : 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{
            width: `${percent}%`,
            height: '100%',
            background: percent > 85 ? 'linear-gradient(90deg, #EF4444, #DC2626)' : percent > 60 ? 'linear-gradient(90deg, #F59E0B, #D97706)' : 'linear-gradient(90deg, #3B82F6, #2563EB)',
            borderRadius: '4px',
            transition: 'width 0.4s ease'
          }} />
        </div>
      </div>

      {/* TRASH / RECENTLY DELETED CARD */}
      <div 
        onClick={() => {
          if (triggerHaptic) triggerHaptic('light');
          if (handleTabClick) handleTabClick('trash');
        }}
        style={{
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: isLight ? 'rgba(255,255,255,0.85)' : 'rgba(24, 24, 37, 0.75)',
          backdropFilter: 'blur(12px)',
          borderRadius: '16px',
          border: isLight ? '1px solid rgba(0,0,0,0.06)' : '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: isLight ? 'linear-gradient(135deg, #EF4444, #DC2626)' : 'linear-gradient(135deg, #991B1B, #7F1D1D)',
            border: isLight ? 'none' : '1px solid rgba(248, 113, 113, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: isLight ? '0 4px 12px rgba(239, 68, 68, 0.3)' : '0 4px 12px rgba(153, 27, 27, 0.3)'
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: isLight ? '#0F172A' : '#FFFFFF' }}>
              {lang === 'tr' ? 'Çöp Kutusu' : 'Trash'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            fontSize: '0.8rem',
            fontWeight: 800,
            width: '26px',
            height: '26px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: deletedNotesCount > 0 ? 'rgba(239, 68, 68, 0.12)' : (isLight ? '#F1F5F9' : 'rgba(255,255,255,0.08)'),
            color: deletedNotesCount > 0 ? '#EF4444' : 'var(--text-muted)',
            border: deletedNotesCount > 0 ? '1px solid rgba(239, 68, 68, 0.25)' : 'none',
            flexShrink: 0
          }}>
            {deletedNotesCount}
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)' }}>
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      </div>

      {/* SECTION: Sign Out Action */}
      <div style={{ marginTop: '8px' }}>
        <button 
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '16px',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            background: isLight ? 'rgba(254, 242, 242, 0.9)' : 'rgba(239, 68, 68, 0.08)',
            color: '#EF4444',
            fontSize: '0.9rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.1)'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          {cleanText(t('signOutBtn'))}
        </button>
      </div>

    </div>
  );
};

export default AccountSubTab;

import React, { useState } from 'react';

const TrashHeaderBar = ({
  deletedNotesCount,
  isSelectMode,
  setIsSelectMode,
  selectedCount,
  handleSelectAll,
  handleCancelSelection,
  onEmptyTrash,
  isLight,
  lang,
  t
}) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      marginBottom: '20px',
      gap: '12px'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: isLight ? '#0F172A' : '#FFFFFF' }}>{t('trashBin')}</h2>
        <span style={{ fontSize: '0.78rem', color: isLight ? '#64748B' : 'var(--text-muted)', fontWeight: 500 }}>{t('trashRetentionSub')}</span>
      </div>

      {deletedNotesCount > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {!isSelectMode ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowMenu(prev => !prev)}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  border: isLight ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(255,255,255,0.12)',
                  background: isLight ? '#FFFFFF' : 'rgba(255,255,255,0.08)',
                  color: isLight ? '#0F172A' : '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: isLight ? '0 2px 8px rgba(0,0,0,0.04)' : 'none',
                  transition: 'all 0.15s ease'
                }}
                title="Seçenekler"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="1.2" />
                  <circle cx="12" cy="5" r="1.2" />
                  <circle cx="12" cy="19" r="1.2" />
                </svg>
              </button>

              {showMenu && (
                <>
                  <div 
                    onClick={() => setShowMenu(false)} 
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 998 }} 
                  />

                  <div style={{
                    position: 'absolute',
                    top: '46px',
                    right: 0,
                    width: '180px',
                    background: isLight ? '#FFFFFF' : 'rgba(18, 24, 36, 0.95)',
                    backdropFilter: 'blur(16px)',
                    border: isLight ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '14px',
                    padding: '6px',
                    boxShadow: isLight ? '0 10px 25px rgba(0,0,0,0.1)' : '0 10px 25px rgba(0,0,0,0.5)',
                    zIndex: 999,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    animation: 'slide-up 0.15s ease forwards'
                  }}>
                    <button
                      onClick={() => {
                        setIsSelectMode(true);
                        setShowMenu(false);
                      }}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: 'none',
                        background: 'transparent',
                        color: isLight ? '#0F172A' : '#FFFFFF',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        textAlign: 'left'
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 11 12 14 22 4" />
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                      </svg>
                      {t('selectAllNotes')}
                    </button>

                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onEmptyTrash();
                      }}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: 'none',
                        background: 'transparent',
                        color: '#EF4444',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        textAlign: 'left'
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                      {t('deleteAllNotes')}
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <button
                onClick={handleSelectAll}
                style={{
                  padding: '8px 14px',
                  borderRadius: '12px',
                  border: isLight ? '1px solid #BFDBFE' : '1px solid rgba(59, 130, 246, 0.4)',
                  background: isLight ? '#EFF6FF' : 'rgba(59, 130, 246, 0.15)',
                  color: isLight ? '#1D4ED8' : '#60A5FA',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {selectedCount === deletedNotesCount 
                  ? (lang === 'tr' ? 'Seçimi Kaldır' : 'Deselect All') 
                  : (lang === 'tr' ? 'Hepsini Seç' : 'Select All')}
              </button>
              <button
                onClick={handleCancelSelection}
                style={{
                  padding: '8px 14px',
                  borderRadius: '12px',
                  border: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.15)',
                  background: isLight ? '#F8FAFC' : 'rgba(255,255,255,0.06)',
                  color: isLight ? '#64748B' : '#94A3B8',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {t('cancelBtn')}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TrashHeaderBar;

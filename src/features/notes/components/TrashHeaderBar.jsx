import React from 'react';

const TrashHeaderBar = ({
  deletedNotesCount,
  isSelectMode,
  setIsSelectMode,
  selectedCount,
  handleSelectAll,
  handleCancelSelection,
  onEmptyTrash,
  onBack,
  isLight,
  lang,
  t,
  // FIX: separate callback for entering select mode so parent can reset selectedIds cleanly
  onEnterSelectMode,
}) => {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '12px',
      marginBottom: '16px'
    }}>
      {/* Top Header Row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '10px'
      }}>
        {/* Left: Back Button + Title + Count Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {typeof onBack === 'function' && !isSelectMode && (
            <button
              onClick={onBack}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '12px',
                border: isLight ? '1px solid rgba(0, 0, 0, 0.08)' : '1px solid rgba(255, 255, 255, 0.1)',
                background: isLight ? '#FFFFFF' : 'rgba(255, 255, 255, 0.08)',
                color: isLight ? '#1E293B' : '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                flexShrink: 0
              }}
              title="Geri"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ 
              fontSize: '1.35rem', 
              fontWeight: 800, 
              margin: 0, 
              color: isLight ? '#0F172A' : '#FFFFFF',
              letterSpacing: '-0.02em'
            }}>
              {isSelectMode ? (
                <span>{selectedCount} {lang === 'tr' ? 'Seçildi' : 'Selected'}</span>
              ) : (
                t('trashBin') || 'Çöp Kutusu'
              )}
            </h2>

            {!isSelectMode && deletedNotesCount > 0 && (
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '10px',
                background: isLight ? '#E2E8F0' : 'rgba(255, 255, 255, 0.1)',
                color: isLight ? '#475569' : '#CBD5E1'
              }}>
                {deletedNotesCount}
              </span>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        {deletedNotesCount > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {!isSelectMode ? (
              <>
                <button
                  onClick={() => {
                    // FIX: use dedicated callback so parent can also reset selectedIds
                    if (typeof onEnterSelectMode === 'function') {
                      onEnterSelectMode();
                    } else {
                      setIsSelectMode(true);
                    }
                  }}
                  style={{
                    padding: '7px 13px',
                    borderRadius: '11px',
                    border: isLight ? '1px solid #BFDBFE' : '1px solid rgba(59, 130, 246, 0.3)',
                    background: isLight ? '#EFF6FF' : 'rgba(59, 130, 246, 0.12)',
                    color: isLight ? '#1D4ED8' : '#60A5FA',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 11 12 14 22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                  {lang === 'tr' ? 'Seç' : 'Select'}
                </button>

                <button
                  onClick={onEmptyTrash}
                  style={{
                    padding: '7px 12px',
                    borderRadius: '11px',
                    border: isLight ? '1px solid #FECACA' : '1px solid rgba(239, 68, 68, 0.25)',
                    background: isLight ? '#FEF2F2' : 'rgba(239, 68, 68, 0.12)',
                    color: isLight ? '#DC2626' : '#FCA5A5',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    transition: 'all 0.15s ease'
                  }}
                  title={t('emptyTrashBtn') || 'Çöpü Boşalt'}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  {lang === 'tr' ? 'Boşalt' : 'Empty'}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSelectAll}
                  style={{
                    padding: '7px 12px',
                    borderRadius: '11px',
                    border: isLight ? '1px solid #BFDBFE' : '1px solid rgba(59, 130, 246, 0.3)',
                    background: isLight ? '#EFF6FF' : 'rgba(59, 130, 246, 0.12)',
                    color: isLight ? '#1D4ED8' : '#60A5FA',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {selectedCount === deletedNotesCount 
                    ? (lang === 'tr' ? 'Seçimi Bırak' : 'Deselect All') 
                    : (lang === 'tr' ? 'Tümünü Seç' : 'Select All')}
                </button>

                <button
                  onClick={handleCancelSelection}
                  style={{
                    padding: '7px 12px',
                    borderRadius: '11px',
                    border: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.12)',
                    background: isLight ? '#F8FAFC' : 'rgba(255,255,255,0.06)',
                    color: isLight ? '#64748B' : '#94A3B8',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {t('cancelBtn') || 'Vazgeç'}
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Modern Info Strip (When not in select mode) */}
      {!isSelectMode && deletedNotesCount > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          borderRadius: '12px',
          background: isLight ? '#F8FAFC' : 'rgba(255, 255, 255, 0.04)',
          border: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255, 255, 255, 0.06)'
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isLight ? '#64748B' : '#94A3B8'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <span style={{
            fontSize: '0.76rem',
            color: isLight ? '#64748B' : 'rgba(255, 255, 255, 0.6)',
            fontWeight: 500,
            lineHeight: '1.3'
          }}>
            {t('trashRetentionSub') || 'Silinen notlar 30 gün boyunca saklanır, ardından otomatik kalıcı olarak silinir.'}
          </span>
        </div>
      )}
    </div>
  );
};

export default TrashHeaderBar;

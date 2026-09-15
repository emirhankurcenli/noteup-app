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
    <div 
      className="trash-header-container"
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '6px',
        marginBottom: '14px'
      }}
    >
      {/* Top Header Row — single line, never wraps */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px',
        minWidth: 0
      }}>
        {/* Left: Back Button + Title + Count Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, overflow: 'hidden' }}>
            <h2 style={{ 
              fontSize: '1.25rem', 
              fontWeight: 800, 
              margin: 0, 
              color: isLight ? '#0F172A' : '#FFFFFF',
              letterSpacing: '-0.02em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {isSelectMode ? (
                <span>{selectedCount} {lang === 'tr' ? 'Seçildi' : 'Selected'}</span>
              ) : (
                t('trashBin') || 'Çöp Kutusu'
              )}
            </h2>

            {!isSelectMode && deletedNotesCount > 0 && (
              <span style={{
                fontSize: '0.74rem',
                fontWeight: 700,
                padding: '2px 7px',
                borderRadius: '10px',
                background: isLight ? '#F1F5F9' : 'rgba(255, 255, 255, 0.1)',
                color: isLight ? '#475569' : '#CBD5E1',
                flexShrink: 0
              }}>
                {deletedNotesCount}
              </span>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        {deletedNotesCount > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
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
                    padding: '6px 12px',
                    borderRadius: '10px',
                    border: isLight ? '1px solid #BFDBFE' : '1px solid rgba(59, 130, 246, 0.3)',
                    background: isLight ? '#EFF6FF' : 'rgba(59, 130, 246, 0.12)',
                    color: isLight ? '#1D4ED8' : '#60A5FA',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 11 12 14 22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                  {lang === 'tr' ? 'Seç' : 'Select'}
                </button>

                <button
                  onClick={onEmptyTrash}
                  style={{
                    padding: '6px 11px',
                    borderRadius: '10px',
                    border: isLight ? '1px solid #FECACA' : '1px solid rgba(239, 68, 68, 0.25)',
                    background: isLight ? '#FEF2F2' : 'rgba(239, 68, 68, 0.12)',
                    color: isLight ? '#DC2626' : '#FCA5A5',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease'
                  }}
                  title={t('emptyTrashBtn') || 'Çöpü Boşalt'}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
                    padding: '6px 11px',
                    borderRadius: '10px',
                    border: isLight ? '1px solid #BFDBFE' : '1px solid rgba(59, 130, 246, 0.3)',
                    background: isLight ? '#EFF6FF' : 'rgba(59, 130, 246, 0.12)',
                    color: isLight ? '#1D4ED8' : '#60A5FA',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {selectedCount === deletedNotesCount 
                    ? (lang === 'tr' ? 'Bırak' : 'Deselect') 
                    : (lang === 'tr' ? 'Tümü' : 'All')}
                </button>

                <button
                  onClick={handleCancelSelection}
                  style={{
                    padding: '6px 11px',
                    borderRadius: '10px',
                    border: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.12)',
                    background: isLight ? '#F8FAFC' : 'rgba(255,255,255,0.06)',
                    color: isLight ? '#64748B' : '#94A3B8',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
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

      {/* Subtle inline notice — no heavy box */}
      {!isSelectMode && deletedNotesCount > 0 && (
        <span style={{
          fontSize: '0.74rem',
          color: isLight ? '#94A3B8' : 'rgba(255, 255, 255, 0.4)',
          fontWeight: 500,
          lineHeight: '1.35'
        }}>
          {lang === 'tr'
            ? 'Silinen notlar 30 gün sonra otomatik olarak kalıcı silinir.'
            : 'Deleted notes will be permanently removed after 30 days.'}
        </span>
      )}
    </div>
  );
};

export default TrashHeaderBar;

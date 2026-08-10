import React, { useState, useEffect } from 'react';

const TrashTab = ({
  notes,
  handleRestoreNote,
  handlePermanentDelete,
  handleBulkRestoreNotes,
  handleBulkPermanentDelete,
  openEditingNote,
  setActiveTab,
  theme = 'light',
  lang,
  t
}) => {
  const isLight = theme === 'light';
  const deletedNotes = (notes || []).filter(n => n && n.deletedAt);
  
  const [selectedIds, setSelectedIds] = useState([]);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Scroll to top when Trash tab opens
  useEffect(() => {
    window.scrollTo(0, 0);
    const scrollContainer = document.querySelector('.app-content') || document.querySelector('.workspace-container');
    if (scrollContainer) {
      scrollContainer.scrollTop = 0;
    }
  }, []);

  // Toggle single selection
  const toggleSelectNote = (noteId) => {
    setSelectedIds(prev => {
      if (prev.includes(noteId)) {
        const next = prev.filter(id => id !== noteId);
        if (next.length === 0) setIsSelectMode(false);
        return next;
      } else {
        return [...prev, noteId];
      }
    });
  };

  // Start selection mode
  const enterSelectMode = (initialNoteId) => {
    setIsSelectMode(true);
    setSelectedIds([initialNoteId]);
  };

  // Select all currently in trash
  const handleSelectAll = () => {
    if (selectedIds.length === deletedNotes.length) {
      setSelectedIds([]);
      setIsSelectMode(false);
    } else {
      setSelectedIds(deletedNotes.map(n => n.id));
      setIsSelectMode(true);
    }
  };

  // Cancel selection mode
  const handleCancelSelection = () => {
    setSelectedIds([]);
    setIsSelectMode(false);
  };

  // Perform bulk restore of selected
  const onBulkRestore = (e) => {
    if (e) e.stopPropagation();
    if (selectedIds.length === 0) return;
    handleBulkRestoreNotes(selectedIds);
    handleCancelSelection();
  };

  // Perform bulk delete of selected
  const onBulkDelete = (e) => {
    if (e) e.stopPropagation();
    if (selectedIds.length === 0) return;
    handleBulkPermanentDelete(selectedIds);
    handleCancelSelection();
  };

  // Perform empty trash
  const onEmptyTrash = () => {
    const allIds = deletedNotes.map(n => n.id);
    if (allIds.length === 0) return;
    handleBulkPermanentDelete(allIds);
  };

  return (
    <div className="animate-slide-up" style={{ position: 'relative', paddingBottom: isSelectMode ? '160px' : '24px' }}>
      
      {/* HEADER SECTION */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px',
        gap: '12px'
      }}>
        {/* Title & Subtitle */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: isLight ? '#0F172A' : '#FFFFFF' }}>{t('trashBin')}</h2>
          <span style={{ fontSize: '0.78rem', color: isLight ? '#64748B' : 'var(--text-muted)', fontWeight: 500 }}>{t('trashRetentionSub')}</span>
        </div>

        {/* TOP ACTIONS MENU */}
        {deletedNotes.length > 0 && (
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

                {/* DROPDOWN MENU */}
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
                      background: isLight ? '#FFFFFF' : 'rgba(24, 24, 37, 0.95)',
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
                        {lang === 'tr' ? 'Notları Seç' : 'Select Notes'}
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
                        {lang === 'tr' ? 'Hepsini Sil' : 'Delete All'}
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
                  {selectedIds.length === deletedNotes.length 
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
                  {lang === 'tr' ? 'İptal' : 'Cancel'}
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* NOTE LIST */}
      <div className="note-list">
        {deletedNotes.length > 0 ? (
          deletedNotes.map(note => {
            const daysLeft = 30 - Math.floor((Date.now() - note.deletedAt) / (1000 * 60 * 60 * 24));
            const isSelected = selectedIds.includes(note.id);
            
            // Handle card click based on mode
            const handleCardClick = () => {
              if (isSelectMode) {
                toggleSelectNote(note.id);
              } else {
                window.history.pushState({ page: 'editor', noteId: note.id }, ''); 
                openEditingNote(note); 
              }
            };

            // Long press support for mobile
            let pressTimer;
            const startPress = () => {
              if (isSelectMode) return;
              pressTimer = setTimeout(() => {
                enterSelectMode(note.id);
              }, 500);
            };
            const endPress = () => {
              clearTimeout(pressTimer);
            };

            return (
              <div 
                key={note.id} 
                className={`trash-card ${isSelected ? 'selected' : ''}`}
                onClick={handleCardClick}
                onTouchStart={startPress}
                onTouchEnd={endPress}
                onMouseDown={startPress}
                onMouseUp={endPress}
                onMouseLeave={endPress}
                style={{ 
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  textAlign: 'left',
                  gap: '14px',
                  border: isSelected 
                    ? '2px solid #3B82F6' 
                    : isLight ? '1px solid rgba(0, 0, 0, 0.06)' : '1px solid rgba(255, 255, 255, 0.08)',
                  background: isSelected 
                    ? (isLight ? '#EFF6FF' : 'rgba(59, 130, 246, 0.12)') 
                    : (isLight ? 'rgba(255, 255, 255, 0.9)' : 'rgba(24, 24, 37, 0.75)'),
                  backdropFilter: 'blur(12px)',
                  padding: '16px',
                  borderRadius: '16px',
                  marginBottom: '12px',
                  position: 'relative',
                  transition: 'all 0.2s ease',
                  boxShadow: isSelected 
                    ? '0 4px 16px rgba(59, 130, 246, 0.2)' 
                    : (isLight ? '0 4px 16px rgba(0,0,0,0.03)' : '0 4px 16px rgba(0,0,0,0.2)'),
                  userSelect: 'none'
                }}
              >
                {/* CONTENT AREA ON LEFT */}
                <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <h3 style={{ 
                      fontSize: '1rem', 
                      fontWeight: 800, 
                      margin: 0, 
                      color: isLight ? '#0F172A' : '#FFFFFF',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      flex: 1
                    }}>
                      {note.title || t('untitledNote')}
                    </h3>
                    <span style={{ 
                      fontSize: '0.72rem', 
                      fontWeight: 700, 
                      padding: '3px 9px',
                      borderRadius: '12px',
                      background: daysLeft <= 3 
                        ? (isLight ? '#FEE2E2' : 'rgba(239, 68, 68, 0.2)') 
                        : (isLight ? '#F1F5F9' : 'rgba(255, 255, 255, 0.08)'),
                      color: daysLeft <= 3 
                        ? (isLight ? '#DC2626' : '#FCA5A5') 
                        : (isLight ? '#64748B' : '#94A3B8'),
                      flexShrink: 0
                    }}>
                      {daysLeft > 0 ? `${daysLeft} ${t('daysRemaining')}` : t('willBeDeletedToday')}
                    </span>
                  </div>

                  {note.blocks && note.blocks.length > 0 ? (() => {
                    const textBlock = note.blocks.find(b => b.type === 'text');
                    return (
                      <p style={{ 
                        fontSize: '0.82rem', 
                        color: isLight ? '#475569' : 'rgba(255, 255, 255, 0.6)', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        display: '-webkit-box', 
                        WebkitLineClamp: 2, 
                        WebkitBoxOrient: 'vertical', 
                        margin: 0,
                        lineHeight: '1.4'
                      }}>
                        {textBlock ? textBlock.content : ''}
                      </p>
                    );
                  })() : (
                    <p style={{ fontSize: '0.82rem', color: isLight ? '#475569' : 'rgba(255, 255, 255, 0.6)', margin: 0, lineHeight: '1.4' }}>{note.content}</p>
                  )}

                  {/* RESTORE & DELETE SINGLE ACTION BUTTONS (ONLY SHOW IF NOT IN SELECT MODE) */}
                  {!isSelectMode && (
                    <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          handleRestoreNote(note.id); 
                        }}
                        style={{
                          padding: '7px 14px',
                          borderRadius: '10px',
                          border: isLight ? '1px solid #A7F3D0' : '1px solid rgba(52, 211, 153, 0.3)',
                          background: isLight ? '#ECFDF5' : 'rgba(16, 185, 129, 0.15)',
                          color: isLight ? '#047857' : '#34D399',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="1 4 1 10 7 10" />
                          <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                        </svg>
                        {t('restoreBtn')}
                      </button>
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          handlePermanentDelete(note.id); 
                        }}
                        style={{
                          padding: '7px 14px',
                          borderRadius: '10px',
                          border: isLight ? '1px solid #FECACA' : '1px solid rgba(248, 113, 113, 0.3)',
                          background: isLight ? '#FEF2F2' : 'rgba(239, 68, 68, 0.15)',
                          color: isLight ? '#B91C1C' : '#FCA5A5',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                        {t('deletePermanentlyBtn')}
                      </button>
                    </div>
                  )}
                </div>

                {/* SELECT CHECKBOX ON FAR RIGHT - VERTICALLY CENTERED */}
                {isSelectMode && (
                  <div style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    border: isSelected ? 'none' : (isLight ? '2.5px solid #94A3B8' : '2.5px solid rgba(255, 255, 255, 0.3)'),
                    background: isSelected ? 'linear-gradient(135deg, #3B82F6, #1D4ED8)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    alignSelf: 'center',
                    boxShadow: isSelected ? '0 3px 10px rgba(59, 130, 246, 0.35)' : 'none',
                    transition: 'all 0.15s ease'
                  }}>
                    {isSelected && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <p style={{ textAlign: 'center', padding: '40px 0', color: isLight ? '#94A3B8' : 'var(--text-muted)' }}>{t('trashEmpty')}</p>
        )}
      </div>

      {/* FLOATING ACTION BAR FOR BULK ACTIONS AT THE BOTTOM */}
      {isSelectMode && (
        <div style={{
          position: 'fixed',
          bottom: 'calc(72px + env(safe-area-inset-bottom, 0px) + 6px)',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 32px)',
          maxWidth: '420px',
          background: isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(24, 24, 37, 0.95)',
          backdropFilter: 'blur(16px)',
          border: isLight ? '1px solid rgba(0, 0, 0, 0.1)' : '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '20px',
          padding: '12px 18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: isLight ? '0 12px 32px rgba(0, 0, 0, 0.12)' : '0 12px 32px rgba(0, 0, 0, 0.6)',
          zIndex: 999,
          animation: 'slide-up 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 800, color: isLight ? '#0F172A' : '#FFFFFF' }}>
              {selectedIds.length} {lang === 'tr' ? 'Not Seçildi' : 'Notes Selected'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={onBulkRestore}
              disabled={selectedIds.length === 0}
              style={{
                padding: '9px 16px',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                color: '#FFFFFF',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: selectedIds.length === 0 ? 'not-allowed' : 'pointer',
                opacity: selectedIds.length === 0 ? 0.5 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: selectedIds.length > 0 ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
              </svg>
              {lang === 'tr' ? 'Kurtar' : 'Restore'}
            </button>
            <button
              onClick={onBulkDelete}
              disabled={selectedIds.length === 0}
              style={{
                padding: '9px 16px',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                color: '#FFFFFF',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: selectedIds.length === 0 ? 'not-allowed' : 'pointer',
                opacity: selectedIds.length === 0 ? 0.5 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: selectedIds.length > 0 ? '0 4px 12px rgba(239, 68, 68, 0.3)' : 'none'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              {lang === 'tr' ? 'Sil' : 'Delete'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrashTab;

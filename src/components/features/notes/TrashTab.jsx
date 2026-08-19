import React, { useState, useEffect } from 'react';
import TrashHeaderBar from './TrashHeaderBar';
import TrashNoteCard from './TrashNoteCard';

const TrashTab = ({
  notes,
  handleRestoreNote,
  handlePermanentDelete,
  handleBulkRestoreNotes,
  handleBulkPermanentDelete,
  openEditingNote,
  theme = 'light',
  lang,
  t
}) => {
  const isLight = theme === 'light';
  const deletedNotes = (notes || []).filter(n => n && n.deletedAt);
  
  const [selectedIds, setSelectedIds] = useState([]);
  const [isSelectMode, setIsSelectMode] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const scrollContainer = document.querySelector('.app-content') || document.querySelector('.workspace-container');
    if (scrollContainer) {
      scrollContainer.scrollTop = 0;
    }
  }, []);

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

  const enterSelectMode = (initialNoteId) => {
    setIsSelectMode(true);
    setSelectedIds([initialNoteId]);
  };

  const handleSelectAll = () => {
    if (selectedIds.length === deletedNotes.length) {
      setSelectedIds([]);
      setIsSelectMode(false);
    } else {
      setSelectedIds(deletedNotes.map(n => n.id));
      setIsSelectMode(true);
    }
  };

  const handleCancelSelection = () => {
    setSelectedIds([]);
    setIsSelectMode(false);
  };

  const onBulkRestore = (e) => {
    if (e) e.stopPropagation();
    if (selectedIds.length === 0) return;
    handleBulkRestoreNotes(selectedIds);
    handleCancelSelection();
  };

  const onBulkDelete = (e) => {
    if (e) e.stopPropagation();
    if (selectedIds.length === 0) return;
    handleBulkPermanentDelete(selectedIds);
    handleCancelSelection();
  };

  const onEmptyTrash = () => {
    const allIds = deletedNotes.map(n => n.id);
    if (allIds.length === 0) return;
    handleBulkPermanentDelete(allIds);
  };

  return (
    <div className="animate-slide-up" style={{ position: 'relative', paddingBottom: isSelectMode ? '160px' : '24px' }}>
      
      <TrashHeaderBar 
        deletedNotesCount={deletedNotes.length}
        isSelectMode={isSelectMode}
        setIsSelectMode={setIsSelectMode}
        selectedCount={selectedIds.length}
        handleSelectAll={handleSelectAll}
        handleCancelSelection={handleCancelSelection}
        onEmptyTrash={onEmptyTrash}
        isLight={isLight}
        lang={lang}
        t={t}
      />

      <div className="note-list">
        {deletedNotes.length > 0 ? (
          deletedNotes.map(note => (
            <TrashNoteCard 
              key={note.id}
              note={note}
              isSelected={selectedIds.includes(note.id)}
              isSelectMode={isSelectMode}
              toggleSelectNote={toggleSelectNote}
              enterSelectMode={enterSelectMode}
              openEditingNote={openEditingNote}
              handleRestoreNote={handleRestoreNote}
              handlePermanentDelete={handlePermanentDelete}
              isLight={isLight}
              t={t}
            />
          ))
        ) : (
          <p style={{ textAlign: 'center', padding: '40px 0', color: isLight ? '#94A3B8' : 'var(--text-muted)' }}>{t('trashEmpty')}</p>
        )}
      </div>

      {isSelectMode && (
        <div style={{
          position: 'fixed',
          bottom: 'calc(72px + env(safe-area-inset-bottom, 0px) + 6px)',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 32px)',
          maxWidth: '420px',
          background: isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(18, 24, 36, 0.90)',
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

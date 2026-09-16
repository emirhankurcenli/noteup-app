import React, { useState, useEffect } from 'react';
import TrashHeaderBar from './TrashHeaderBar';
import TrashNoteCard from './TrashNoteCard';
import TrashPreviewModal from './TrashPreviewModal';
import { htmlToPlainText, normalizeTurkish } from '@shared/utils/textUtils';

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
  const allDeletedNotes = (notes || []).filter(n => n && n.deletedAt);

  const [selectedIds, setSelectedIds] = useState([]);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewNote, setPreviewNote] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const scrollContainer = document.querySelector('.app-content') || document.querySelector('.workspace-container');
    if (scrollContainer) scrollContainer.scrollTop = 0;
  }, []);

  const deletedNotes = allDeletedNotes.filter(note => {
    if (!searchQuery.trim()) return true;
    const query = normalizeTurkish(searchQuery.trim());
    const titleMatch = normalizeTurkish(note.title || '').includes(query);
    const contentText = (note.blocks || []).map(b => b.content || '').join(' ') + ' ' + (note.content || '');
    const contentMatch = normalizeTurkish(htmlToPlainText(contentText)).includes(query);
    return titleMatch || contentMatch;
  });

  const toggleSelectNote = (noteId) => {
    setSelectedIds(prev => {
      if (prev.includes(noteId)) {
        const next = prev.filter(id => id !== noteId);
        if (next.length === 0) setIsSelectMode(false);
        return next;
      }
      return [...prev, noteId];
    });
  };

  const enterSelectMode = (initialNoteId) => {
    setIsSelectMode(true);
    setSelectedIds(initialNoteId ? [initialNoteId] : []);
  };

  const onEnterSelectMode = () => {
    setSelectedIds([]);
    setIsSelectMode(true);
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
    const allIds = allDeletedNotes.map(n => n.id);
    if (allIds.length === 0) return;
    handleBulkPermanentDelete(allIds);
  };

  const onRestoreAll = () => {
    const allIds = allDeletedNotes.map(n => n.id);
    if (allIds.length === 0) return;
    handleBulkRestoreNotes(allIds);
  };

  const onBack = () => {
    if (typeof setActiveTab === 'function') {
      setActiveTab('profile');
    } else {
      window.history.back();
    }
  };

  const hasNotes = allDeletedNotes.length > 0;

  return (
    <div
      className="animate-slide-up"
      style={{
        position: 'relative',
        paddingBottom: isSelectMode
          ? 'calc(180px + env(safe-area-inset-bottom, 0px))'
          : 'calc(100px + env(safe-area-inset-bottom, 0px))',
      }}
    >
      {/* Header Bar */}
      <TrashHeaderBar
        deletedNotesCount={allDeletedNotes.length}
        isSelectMode={isSelectMode}
        setIsSelectMode={setIsSelectMode}
        selectedCount={selectedIds.length}
        handleSelectAll={handleSelectAll}
        handleCancelSelection={handleCancelSelection}
        onEmptyTrash={onEmptyTrash}
        onEnterSelectMode={onEnterSelectMode}
        onBack={onBack}
        isLight={isLight}
        lang={lang}
        t={t}
      />

      {/* Search Bar */}
      {hasNotes && !isSelectMode && (
        <div style={{
          position: 'relative',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
        }}>
          <div style={{
            position: 'absolute',
            left: '14px',
            display: 'flex',
            alignItems: 'center',
            pointerEvents: 'none',
            color: isLight ? '#94A3B8' : 'rgba(255,255,255,0.4)',
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'tr' ? 'Çöp kutusunda ara...' : 'Search in trash...'}
            style={{
              width: '100%',
              padding: '10px 36px 10px 38px',
              borderRadius: '14px',
              border: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.1)',
              background: isLight ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.05)',
              color: isLight ? '#0F172A' : '#FFFFFF',
              fontSize: '0.87rem',
              outline: 'none',
              boxShadow: isLight ? '0 2px 8px rgba(0,0,0,0.03)' : 'none',
              transition: 'all 0.2s ease',
              boxSizing: 'border-box',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '12px',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                border: 'none',
                background: isLight ? '#E2E8F0' : 'rgba(255,255,255,0.2)',
                color: isLight ? '#64748B' : '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '11px',
              }}
            >
              ✕
            </button>
          )}
        </div>
      )}

      {/* Note Content */}
      {allDeletedNotes.length === 0 ? (
        /* Empty State */
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '70px 20px',
          textAlign: 'center',
        }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '22px',
            background: isLight ? '#F1F5F9' : 'rgba(255,255,255,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '18px',
            color: isLight ? '#94A3B8' : 'rgba(255,255,255,0.3)',
          }}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </div>
          <h3 style={{ fontSize: '1.08rem', fontWeight: 800, margin: '0 0 8px 0', color: isLight ? '#1E293B' : '#F8FAFC' }}>
            {t('trashEmptyMsg') || 'Çöp Kutusu Boş'}
          </h3>
          <p style={{
            fontSize: '0.84rem',
            color: isLight ? '#64748B' : 'rgba(255,255,255,0.5)',
            margin: 0,
            maxWidth: '260px',
            lineHeight: '1.5',
          }}>
            {t('trashSubtitle') || 'Silinen notlarınız burada 30 gün boyunca güvenle saklanır.'}
          </p>
        </div>
      ) : deletedNotes.length === 0 ? (
        /* Search No Results */
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '0.9rem', color: isLight ? '#64748B' : 'rgba(255,255,255,0.6)', margin: '0 0 12px 0' }}>
            {lang === 'tr'
              ? `"${searchQuery}" ile eşleşen not bulunamadı.`
              : `No notes matching "${searchQuery}".`}
          </p>
          <button
            onClick={() => setSearchQuery('')}
            style={{
              padding: '8px 16px',
              borderRadius: '12px',
              border: isLight ? '1px solid #CBD5E1' : '1px solid rgba(255,255,255,0.15)',
              background: isLight ? '#FFFFFF' : 'rgba(255,255,255,0.08)',
              color: isLight ? '#0F172A' : '#FFFFFF',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {lang === 'tr' ? 'Aramayı Temizle' : 'Clear Search'}
          </button>
        </div>
      ) : (
        /* ─── 2-Column Masonry Grid ─── */
        <div style={{
          columns: 2,
          columnGap: '10px',
        }}>
          {deletedNotes.map(note => (
            <TrashNoteCard
              key={note.id}
              note={note}
              isSelected={selectedIds.includes(note.id)}
              isSelectMode={isSelectMode}
              toggleSelectNote={toggleSelectNote}
              enterSelectMode={enterSelectMode}
              openPreviewNote={(n) => setPreviewNote(n)}
              handleRestoreNote={handleRestoreNote}
              handlePermanentDelete={handlePermanentDelete}
              isLight={isLight}
              lang={lang}
              t={t}
            />
          ))}
        </div>
      )}

      {/* Note Preview Modal */}
      {previewNote && (
        <TrashPreviewModal
          note={previewNote}
          onClose={() => setPreviewNote(null)}
          handleRestoreNote={handleRestoreNote}
          handlePermanentDelete={handlePermanentDelete}
          openEditingNote={openEditingNote}
          isLight={isLight}
          lang={lang}
          t={t}
        />
      )}

      {/* ── Floating Action Bar — Select Mode ── */}
      {isSelectMode && (
        <div style={{
          position: 'fixed',
          bottom: 'calc(76px + env(safe-area-inset-bottom, 0px))',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 32px)',
          maxWidth: '430px',
          background: isLight ? 'rgba(255,255,255,0.94)' : 'rgba(18,24,36,0.93)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: isLight ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(255,255,255,0.12)',
          borderRadius: '20px',
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: isLight ? '0 12px 36px rgba(0,0,0,0.13)' : '0 14px 40px rgba(0,0,0,0.65)',
          zIndex: 999,
          animation: 'slide-up 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 800, color: isLight ? '#0F172A' : '#FFFFFF' }}>
              {selectedIds.length} {lang === 'tr' ? 'Not Seçildi' : 'Selected'}
            </span>
            <span style={{ fontSize: '0.72rem', color: isLight ? '#64748B' : 'rgba(255,255,255,0.5)' }}>
              {selectedIds.length === deletedNotes.length
                ? (lang === 'tr' ? 'Tümü seçildi' : 'All selected')
                : (lang === 'tr' ? `${deletedNotes.length - selectedIds.length} not kaldı` : `${deletedNotes.length - selectedIds.length} remaining`)}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={onBulkRestore}
              disabled={selectedIds.length === 0}
              style={{
                padding: '9px 15px',
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
                boxShadow: selectedIds.length > 0 ? '0 4px 12px rgba(16,185,129,0.3)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
              </svg>
              {t('restoreBtn') || 'Geri Yükle'} ({selectedIds.length})
            </button>

            <button
              onClick={onBulkDelete}
              disabled={selectedIds.length === 0}
              style={{
                padding: '9px 15px',
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
                boxShadow: selectedIds.length > 0 ? '0 4px 12px rgba(239,68,68,0.3)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              {lang === 'tr' ? 'Kalıcı Sil' : 'Delete'} ({selectedIds.length})
            </button>
          </div>
        </div>
      )}

      {/* Normal mode floating bar removed per user request */}
    </div>
  );
};

export default TrashTab;

import React, { useState, useEffect } from 'react';

const NoteFormatToolbar = ({
  showFormatToolbar,
  setShowFormatToolbar,
  activeFormatBlockId,
  setActiveFormatBlockId,
  editingNote,
  handleUpdateBlock,
  handleUpdateNote,
  theme,
}) => {
  const [showFontPickerModal, setShowFontPickerModal] = useState(false);
  const [activeColor, setActiveColor] = useState('var(--text-primary)');
  const [isBoldActive, setIsBoldActive] = useState(false);
  const [activeFont, setActiveFont] = useState('inherit');

  const activeBlock = (editingNote?.blocks || []).find(b => b.id === activeFormatBlockId);

  const colors = [
    { value: 'var(--text-primary)', label: 'Varsayılan' },
    { value: '#EF4444', label: 'Kırmızı' },
    { value: '#3B82F6', label: 'Mavi' },
    { value: '#10B981', label: 'Yeşil' },
    { value: '#F59E0B', label: 'Turuncu' },
    { value: '#8B5CF6', label: 'Mor' },
    { value: '#EC4899', label: 'Pembe' },
    { value: '#94A3B8', label: 'Gri' }
  ];

  const normColor = (c) => {
    if (!c) return '';
    if (c.startsWith('var(')) return 'default';
    if (c.startsWith('#')) {
      const hex = c.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return `rgb(${r},${g},${b})`;
    }
    return c.replace(/\s+/g, '').toLowerCase();
  };

  const isSameColor = (c1, c2) => {
    if (!c1 || !c2) return false;
    if (c1 === c2) return true;
    const n1 = normColor(c1);
    const n2 = normColor(c2);
    if (n1 === n2) return true;
    if (n1 === 'default' && (n2.includes('15,23,42') || n2.includes('240,245,250') || n2.includes('0,0,0') || n2.includes('255,255,255'))) return true;
    if (n2 === 'default' && (n1.includes('15,23,42') || n1.includes('240,245,250') || n1.includes('0,0,0') || n1.includes('255,255,255'))) return true;
    return false;
  };

  useEffect(() => {
    const syncState = () => {
      if (activeBlock) {
        let currentColor = activeBlock.color || 'var(--text-primary)';

        if (document.queryCommandValue) {
          try {
            const cmdColor = document.queryCommandValue('foreColor');
            if (cmdColor) currentColor = cmdColor;
          } catch (e) {}
        } else {
          const sel = window.getSelection();
          if (sel && sel.anchorNode) {
            const parentEl = sel.anchorNode.nodeType === 3 ? sel.anchorNode.parentElement : sel.anchorNode;
            if (parentEl) {
              const compColor = window.getComputedStyle(parentEl).color;
              if (compColor) currentColor = compColor;
            }
          }
        }

        const matched = colors.find(c => isSameColor(c.value, currentColor));
        if (matched) {
          setActiveColor(matched.value);
        } else {
          setActiveColor(currentColor);
        }

        let isBold = activeBlock.fontWeight === 'bold' || activeBlock.isBold === true;
        if (document.queryCommandState) {
          try {
            if (document.queryCommandState('bold')) isBold = true;
          } catch (e) {}
        }
        setIsBoldActive(isBold);
        setActiveFont(activeBlock.fontFamily || 'inherit');
      }
    };

    syncState();
    document.addEventListener('selectionchange', syncState);
    return () => document.removeEventListener('selectionchange', syncState);
  }, [activeFormatBlockId, activeBlock?.color, activeBlock?.fontWeight, activeBlock?.isBold, activeBlock?.fontFamily]);

  if (!showFormatToolbar || !activeFormatBlockId || editingNote?.deletedAt) return null;
  if (!activeBlock || activeBlock.type !== 'text') return null;

  const isLight = theme === 'light';

  const focusActiveTextarea = (targetId = activeFormatBlockId) => {
    if (!targetId) return;
    const focusNow = () => {
      const el = document.querySelector(`textarea[data-block-id="${targetId}"]`);
      if (el) {
        try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); }
      }
    };
    queueMicrotask(focusNow);
    setTimeout(focusNow, 30);
  };

  const applyFormatChange = (updatedProp) => {
    const el = document.querySelector(`[data-block-id="${activeFormatBlockId}"]`);
    if (el) {
      try { el.focus(); } catch (err) {}
    }

    try { document.execCommand('styleWithCSS', false, true); } catch (e) {}

    if (updatedProp.hasOwnProperty('fontWeight')) {
      try { document.execCommand('bold', false, null); } catch (e) {}
    } else if (updatedProp.hasOwnProperty('color')) {
      try { document.execCommand('foreColor', false, updatedProp.color); } catch (e) {}
    } else if (updatedProp.hasOwnProperty('fontFamily')) {
      try { document.execCommand('fontName', false, updatedProp.fontFamily || 'inherit'); } catch (e) {}
    }

    if (el) {
      const plainText = (el.innerText || el.textContent || '').replace(/\u8203/g, '').trim();
      let nextProps = {};

      // If block is empty, set block-level default fallback
      if (plainText === '') {
        if (updatedProp.hasOwnProperty('fontWeight')) {
          nextProps.fontWeight = updatedProp.fontWeight;
          nextProps.isBold = updatedProp.fontWeight === 'bold';
        }
        if (updatedProp.hasOwnProperty('color')) {
          nextProps.color = updatedProp.color;
        }
        if (updatedProp.hasOwnProperty('fontFamily')) {
          nextProps.fontFamily = updatedProp.fontFamily;
        }
      }

      handleUpdateBlock(activeFormatBlockId, { ...nextProps, content: el.innerHTML }, true);
    }
  };


  const fonts = [
    { label: 'System UI', value: 'inherit', description: 'Standart Mobil Font', preview: 'Aa Bb Cc 123 — Harika Notlar' },
    { label: 'Inter', value: 'Inter', description: 'Modern & Temiz Sans-serif', preview: 'Aa Bb Cc 123 — Harika Notlar' },
    { label: 'Roboto', value: 'Roboto', description: 'Klasik Android Tipografisi', preview: 'Aa Bb Cc 123 — Harika Notlar' },
    { label: 'Playfair Display', value: 'Playfair Display', description: 'Şık & Zarif Serif', preview: 'Aa Bb Cc 123 — Harika Notlar' },
    { label: 'Fira Code', value: 'Fira Code', description: 'Yazılımcı & Daktilo Stili', preview: 'Aa Bb Cc 123 — Harika Notlar' },
    { label: 'Pacifico', value: 'Pacifico', description: 'Estetik El Yazısı', preview: 'Aa Bb Cc 123 — Harika Notlar' },
    { label: 'Montserrat', value: 'Montserrat', description: 'Güçlü & Geometrik', preview: 'Aa Bb Cc 123 — Harika Notlar' },
    { label: 'Outfit', value: 'Outfit', description: 'Futurist & Premium', preview: 'Aa Bb Cc 123 — Harika Notlar' }
  ];



  const currentFontObj = fonts.find(f => f.value === activeFont) || fonts[0];

  return (
    <>
      <div 
        className="editor-format-bar animate-pop" 
        onMouseDown={(e) => e.preventDefault()}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'sticky',
          top: '6px',
          zIndex: 120,
          margin: '10px 0 16px 0',
          padding: '16px',
          borderRadius: '22px',
          background: isLight ? '#FFFFFF' : 'var(--bg-card, #1E293B)',
          border: isLight ? '1.5px solid rgba(203, 213, 225, 0.9)' : '1.5px solid rgba(255, 255, 255, 0.14)',
          boxShadow: isLight ? '0 14px 36px rgba(0, 0, 0, 0.1)' : '0 16px 45px rgba(0, 0, 0, 0.45)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        {/* ROW 1: Font Trigger Button + Bold & Bullet Buttons + Close Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
          {/* Custom Font Picker Trigger Button */}
          <button
            onClick={() => setShowFontPickerModal(true)}
            onMouseDown={(e) => e.preventDefault()}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
              padding: '8px 12px',
              borderRadius: '12px',
              background: isLight ? '#F1F5F9' : 'rgba(255,255,255,0.08)',
              border: isLight ? '1.5px solid #CBD5E1' : '1.5px solid rgba(255,255,255,0.15)',
              color: isLight ? '#0F172A' : '#F8FAFC',
              cursor: 'pointer',
              minWidth: 0,
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <div style={{
                width: '26px',
                height: '26px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFF',
                flexShrink: 0,
                boxShadow: '0 2px 8px rgba(139, 92, 246, 0.3)'
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="4 7 4 4 20 4 20 7" />
                  <line x1="9" y1="20" x2="15" y2="20" />
                  <line x1="12" y1="4" x2="12" y2="20" />
                </svg>
              </div>

              <span style={{ 
                fontSize: '0.85rem', 
                fontWeight: 800, 
                fontFamily: currentFontObj.value,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {currentFontObj.label}
              </span>
            </div>

            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, opacity: 0.7 }}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {/* Bold Button */}
          <button
            className={`format-btn ${isBoldActive ? 'active' : ''}`}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              border: isBoldActive ? 'none' : (isLight ? '1px solid #CBD5E1' : '1px solid rgba(255,255,255,0.15)'),
              background: isBoldActive
                ? 'linear-gradient(135deg, #8B5CF6, #6D28D9)'
                : (isLight ? '#F1F5F9' : 'rgba(255,255,255,0.06)'),
              color: isBoldActive ? '#FFF' : (isLight ? '#0F172A' : '#F8FAFC'),
              fontWeight: 800,
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: isBoldActive ? '0 4px 12px rgba(139, 92, 246, 0.35)' : 'none'
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const nextBold = !isBoldActive;
              setIsBoldActive(nextBold);
              applyFormatChange({ fontWeight: nextBold ? 'bold' : 'normal' });
            }}
            onMouseDown={(e) => e.preventDefault()}
            title="Bold"
          >
            B
          </button>

          {/* Bullet List Button */}
          <button
            className={`format-btn ${activeBlock.bullet ? 'active' : ''}`}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              border: activeBlock.bullet ? 'none' : (isLight ? '1px solid #CBD5E1' : '1px solid rgba(255,255,255,0.15)'),
              background: activeBlock.bullet
                ? 'linear-gradient(135deg, #8B5CF6, #6D28D9)'
                : (isLight ? '#F1F5F9' : 'rgba(255,255,255,0.06)'),
              color: activeBlock.bullet ? '#FFF' : (isLight ? '#0F172A' : '#F8FAFC'),
              fontWeight: 800,
              fontSize: '1.2rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: activeBlock.bullet ? '0 4px 12px rgba(139, 92, 246, 0.35)' : 'none'
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const content = activeBlock.content || '';
              const hasHtmlLines = /<br\s*[\/]?>|<\/div>|<\/p>|\n/i.test(content);
              
              if (!activeBlock.bullet && hasHtmlLines) {
                const normalized = content
                  .replace(/<br\s*[\/]?>/gi, '\n')
                  .replace(/<\/p>/gi, '\n')
                  .replace(/<\/div>/gi, '\n')
                  .replace(/<p[^>]*>/gi, '')
                  .replace(/<div[^>]*>/gi, '');
                
                const lines = normalized.split('\n').filter(line => line.trim() !== '');

                if (lines.length > 0) {
                  const blocks = editingNote.blocks || [];
                  const idx = blocks.findIndex(b => b.id === activeFormatBlockId);
                  
                  const newBlocks = lines.map((line, lIdx) => ({
                    id: 'b-' + (Date.now() + lIdx),
                    type: 'text',
                    content: line,
                    fontFamily: activeBlock.fontFamily,
                    fontWeight: activeBlock.fontWeight,
                    color: activeBlock.color,
                    bullet: true
                  }));

                  const updated = [...blocks];
                  updated.splice(idx, 1, ...newBlocks);
                  handleUpdateNote('blocks', updated, true);
                  setActiveFormatBlockId(newBlocks[newBlocks.length - 1].id);
                  focusActiveTextarea();
                  return;
                }
              }

              handleUpdateBlock(activeFormatBlockId, { 
                bullet: !activeBlock.bullet 
              }, true);
              focusActiveTextarea();
            }}
            onMouseDown={(e) => e.preventDefault()}
            title="Bullet List"
          >
            •
          </button>

          {/* Close Button */}
          {setShowFormatToolbar && (
            <button
              onClick={() => {
                setShowFormatToolbar(false);
                // Toolbar kapanınca odak kaybı istenebilir, textarea'ya geri dönme
              }}
              onMouseDown={(e) => e.preventDefault()}
              onTouchStart={(e) => e.preventDefault()}
              style={{
                background: isLight ? 'rgba(241, 245, 249, 0.9)' : 'rgba(255,255,255,0.08)',
                border: isLight ? '1px solid #CBD5E1' : '1px solid rgba(255,255,255,0.12)',
                color: isLight ? '#475569' : '#94A3B8',
                cursor: 'pointer',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
              title="Kapat"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* ROW 2: Text Color Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '8px', borderTop: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.08)' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: isLight ? '#64748B' : '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            METİN RENGİ
          </span>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '6px' }}>
            {colors.map(c => {
              const isSelected = isSameColor(activeColor, c.value);
              const dotBg = c.value === 'var(--text-primary)' 
                ? (isLight ? '#0F172A' : '#F8FAFC') 
                : c.value;

              return (
                <div
                  key={c.value}
                  className={`color-dot ${isSelected ? 'active' : ''}`}
                  onMouseDown={(e) => e.preventDefault()}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: dotBg,
                    cursor: 'pointer',
                    flexShrink: 0,
                    boxShadow: isSelected ? `0 0 0 3px ${isLight ? '#FFF' : '#1E293B'}, 0 0 0 5px ${dotBg}` : 'none',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: c.value === 'var(--text-primary)' ? (isLight ? '1px solid #CBD5E1' : '1px solid rgba(255,255,255,0.2)') : 'none'
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActiveColor(c.value);
                    applyFormatChange({ color: c.value });
                  }}
                  title={c.label}
                >
                  {isSelected && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={c.value === 'var(--text-primary)' ? (isLight ? '#FFF' : '#000') : '#FFF'} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ULTRA PREMIUM FONT PICKER MODAL */}
      {showFontPickerModal && (
        <div 
          className="modal-overlay animate-fade-in"
          onClick={() => setShowFontPickerModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 99999,
            background: isLight ? 'rgba(15, 23, 42, 0.45)' : 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div 
            className="modal-content animate-pop"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '360px',
              maxHeight: '80vh',
              borderRadius: '24px',
              background: isLight ? '#FFFFFF' : 'var(--bg-card, #1E293B)',
              border: isLight ? '1px solid rgba(226, 232, 240, 0.9)' : '1px solid var(--border-color, rgba(255,255,255,0.12))',
              boxShadow: isLight ? '0 20px 45px rgba(0, 0, 0, 0.14)' : '0 24px 60px rgba(0, 0, 0, 0.45)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            {/* Modal Header */}
            <div style={{ 
              padding: '20px 20px 14px 20px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              borderBottom: isLight ? '1px solid #F1F5F9' : '1px solid rgba(255,255,255,0.08)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFF',
                  boxShadow: '0 4px 12px rgba(139, 92, 246, 0.35)'
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="4 7 4 4 20 4 20 7" />
                    <line x1="9" y1="20" x2="15" y2="20" />
                    <line x1="12" y1="4" x2="12" y2="20" />
                  </svg>
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: isLight ? '#0F172A' : '#F8FAFC', margin: 0 }}>
                    Yazı Tipi Seçin
                  </h3>
                  <p style={{ fontSize: '0.72rem', color: isLight ? '#64748B' : '#94A3B8', margin: 0, fontWeight: 600 }}>
                    Canlı önizleyerek stilinizi belirleyin
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowFontPickerModal(false)}
                onMouseDown={(e) => e.preventDefault()}
                style={{
                  background: isLight ? 'rgba(241, 245, 249, 0.9)' : 'rgba(255, 255, 255, 0.08)',
                  border: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255, 255, 255, 0.12)',
                  color: isLight ? '#475569' : '#94A3B8',
                  cursor: 'pointer',
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Scrollable Font Options - Minimalist & Compact */}
            <div style={{ 
              padding: '12px 16px 20px 16px', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '8px',
              overflowY: 'auto',
              maxHeight: 'calc(80vh - 80px)'
            }}>
              {fonts.map(f => {
                const isSelected = activeFont === f.value;

                return (
                  <div
                    key={f.value}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setActiveFont(f.value);
                      applyFormatChange({ fontFamily: f.value });
                      setShowFontPickerModal(false);
                    }}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '14px',
                      border: isSelected 
                        ? '1.5px solid #8B5CF6' 
                        : (isLight ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.08)'),
                      background: isSelected 
                        ? (isLight ? '#F5F3FF' : 'rgba(139, 92, 246, 0.14)') 
                        : (isLight ? '#F8FAFC' : 'rgba(255,255,255,0.03)'),
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, minWidth: 0 }}>
                      <span style={{ 
                        fontSize: '1.05rem', 
                        fontWeight: 700, 
                        color: isSelected ? '#7C3AED' : (isLight ? '#0F172A' : '#F8FAFC'),
                        fontFamily: f.value,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {f.label}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: isLight ? '#64748B' : '#94A3B8', fontWeight: 500 }}>
                        {f.description}
                      </span>
                    </div>

                    {/* Radio Checkmark Icon */}
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      border: isSelected ? 'none' : (isLight ? '1.5px solid #CBD5E1' : '1.5px solid #64748B'),
                      background: isSelected ? 'linear-gradient(135deg, #8B5CF6, #6D28D9)' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFF',
                      flexShrink: 0,
                      boxShadow: isSelected ? '0 3px 10px rgba(139, 92, 246, 0.4)' : 'none'
                    }}>
                      {isSelected && (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NoteFormatToolbar;

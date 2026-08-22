import React, { useState, useEffect } from 'react';
import { FONTS, ToolbarFontSelector } from './toolbar/ToolbarFontSelector';
import { ToolbarTextStyleButtons } from './toolbar/ToolbarTextStyleButtons';
import { COLORS, ToolbarColorPickerRow } from './toolbar/ToolbarColorPickerRow';
import { applyRichFormat } from '../../../utils/selectionUtils';

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

  const blocks = editingNote?.blocks || [];
  const textBlocks = blocks.filter(b => b.type === 'text');
  const targetBlockId = activeFormatBlockId || (textBlocks[0] ? textBlocks[0].id : null);
  const activeBlock = blocks.find(b => b.id === targetBlockId);

  useEffect(() => {
    if (showFormatToolbar && !activeFormatBlockId && targetBlockId && setActiveFormatBlockId) {
      setActiveFormatBlockId(targetBlockId);
    }
  }, [showFormatToolbar, activeFormatBlockId, targetBlockId, setActiveFormatBlockId]);

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

  const isListActive = Boolean(
    activeBlock?.bullet || 
    (activeBlock?.content && (activeBlock.content.toLowerCase().includes('<ul') || activeBlock.content.toLowerCase().includes('<li')))
  );

  useEffect(() => {
    if (activeBlock) {
      let currentColor = activeBlock.color || 'var(--text-primary)';
      const matched = COLORS.find(c => isSameColor(c.value, currentColor));
      if (matched) {
        setActiveColor(matched.value);
      } else {
        setActiveColor(currentColor);
      }

      const isBold = activeBlock.fontWeight === 'bold' || activeBlock.isBold === true;
      setIsBoldActive(isBold);
      setActiveFont(activeBlock.fontFamily || 'inherit');
    }
  }, [activeBlock?.id, activeBlock?.color, activeBlock?.fontWeight, activeBlock?.isBold, activeBlock?.fontFamily]);

  if (!showFormatToolbar || editingNote?.deletedAt || !activeBlock) return null;

  const isLight = theme === 'light';

  const applyFormatChange = (updatedProp) => {
    if (!targetBlockId) return;

    if (updatedProp.hasOwnProperty('fontWeight')) {
      const nextBold = updatedProp.fontWeight === 'bold';
      applyRichFormat({
        command: 'bold',
        targetBlockId,
        onUpdateContent: (content) => {
          handleUpdateBlock(targetBlockId, { content }, true);
        }
      });
      setIsBoldActive(nextBold);
    } else if (updatedProp.hasOwnProperty('color')) {
      applyRichFormat({
        command: 'foreColor',
        value: updatedProp.color,
        targetBlockId,
        onUpdateContent: (content) => {
          handleUpdateBlock(targetBlockId, { content }, true);
        }
      });
      setActiveColor(updatedProp.color);
    } else if (updatedProp.hasOwnProperty('fontFamily')) {
      applyRichFormat({
        command: 'fontName',
        value: updatedProp.fontFamily || 'inherit',
        targetBlockId,
        onUpdateContent: (content) => {
          handleUpdateBlock(targetBlockId, { content }, true);
        }
      });
      setActiveFont(updatedProp.fontFamily);
    }
  };

  const handleToggleBulletList = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!targetBlockId) return;

    applyRichFormat({
      command: 'insertUnorderedList',
      targetBlockId,
      onUpdateContent: (content) => {
        const hasList = content.toLowerCase().includes('<ul') || content.toLowerCase().includes('<li');
        handleUpdateBlock(targetBlockId, { content, bullet: hasList }, true);
      }
    });
  };

  return (
    <>
      <div 
        className="editor-format-bar animate-pop" 
        onMouseDown={(e) => e.preventDefault()}
        onTouchStart={(e) => e.preventDefault()}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'sticky',
          top: '6px',
          zIndex: 120,
          margin: '10px 0 16px 0',
          padding: '14px 16px',
          borderRadius: '20px',
          background: isLight ? '#FFFFFF' : 'var(--bg-card, #1E293B)',
          border: isLight ? '1.5px solid rgba(203, 213, 225, 0.9)' : '1.5px solid rgba(255, 255, 255, 0.14)',
          boxShadow: isLight ? '0 14px 36px rgba(0, 0, 0, 0.1)' : '0 16px 45px rgba(0, 0, 0, 0.45)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        {/* ROW 1: Font Trigger Button + Bold & Bullet Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
          <ToolbarFontSelector
            activeFont={activeFont}
            setShowFontPickerModal={setShowFontPickerModal}
            isLight={isLight}
          />
          
          <ToolbarTextStyleButtons
            isBoldActive={isBoldActive}
            applyFormatChange={applyFormatChange}
            isLight={isLight}
          />

          {/* Bullet List Button */}
          <button
            type="button"
            className={`format-btn ${isListActive ? 'active' : ''}`}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              border: isListActive ? 'none' : (isLight ? '1px solid #CBD5E1' : '1px solid rgba(255,255,255,0.15)'),
              background: isListActive
                ? 'linear-gradient(135deg, #8B5CF6, #6D28D9)'
                : (isLight ? '#F1F5F9' : 'rgba(255,255,255,0.06)'),
              color: isListActive ? '#FFF' : (isLight ? '#0F172A' : '#F8FAFC'),
              fontWeight: 800,
              fontSize: '1.2rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: isListActive ? '0 4px 12px rgba(139, 92, 246, 0.35)' : 'none'
            }}
            onClick={handleToggleBulletList}
            onMouseDown={(e) => e.preventDefault()}
            onTouchStart={(e) => e.preventDefault()}
            title="Madde İşareti (Bullet List)"
          >
            •
          </button>

          {/* Close Button */}
          {setShowFormatToolbar && (
            <button
              type="button"
              onClick={() => {
                setShowFormatToolbar(false);
              }}
              onMouseDown={(e) => e.preventDefault()}
              onTouchStart={(e) => e.preventDefault()}
              style={{
                background: isLight ? 'rgba(241, 245, 249, 0.9)' : 'rgba(255,255,255,0.08)',
                border: isLight ? '1px solid #CBD5E1' : '1px solid rgba(255,255,255,0.12)',
                color: isLight ? '#475569' : '#94A3B8',
                cursor: 'pointer',
                width: '34px',
                height: '34px',
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
        <ToolbarColorPickerRow
          activeColor={activeColor}
          applyFormatChange={applyFormatChange}
          isSameColor={isSameColor}
          isLight={isLight}
        />
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
                type="button"
                onClick={() => setShowFontPickerModal(false)}
                onMouseDown={(e) => e.preventDefault()}
                onTouchStart={(e) => e.preventDefault()}
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

            {/* Scrollable Font Options */}
            <div style={{ 
              padding: '12px 16px 20px 16px', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '8px',
              overflowY: 'auto',
              maxHeight: 'calc(80vh - 80px)'
            }}>
              {FONTS.map(f => {
                const isSelected = activeFont === f.value;

                return (
                  <div
                    key={f.value}
                    onMouseDown={(e) => e.preventDefault()}
                    onTouchStart={(e) => e.preventDefault()}
                    onClick={() => {
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

import React, { useRef, useState } from 'react';

const TodoWidget = ({
  block,
  blockFormStates,
  updateBlockForm,
  handleTodoTitleChange,
  handleDeleteBlock,
  activeTodoItemId,
  setActiveTodoItemId,
  handleToggleTodoItem,
  handleDeleteTodoItem,
  handleAddTodoItem,
  handleUpdateBlock,
  triggerHaptic,
}) => {
  const [isInsertingHeader, setIsInsertingHeader] = useState(false);
  const textareaRef = useRef(null);
  const fs = blockFormStates[block.id] || {};
  const items = block.items || [];
  const taskItems = items.filter(i => !i.isHeader);
  const doneCount = taskItems.filter(i => i.done).length;
  const total = taskItems.length;
  const progress = total === 0 ? 0 : Math.round((doneCount / total) * 100);
  const isAllDone = total > 0 && doneCount === total;

  const onToggleItem = (e, item) => {
    e.stopPropagation();
    const willBeDone = !item.done;
    const remainingUndone = items.filter(i => i.id !== item.id && !i.done);

    if (willBeDone && remainingUndone.length === 0) {
      if (triggerHaptic) triggerHaptic('success');
    } else {
      if (triggerHaptic) triggerHaptic('medium');
    }

    handleToggleTodoItem(block.id, item.id);
  };

  const onDeleteItem = (e, itemId) => {
    e.stopPropagation();
    if (triggerHaptic) triggerHaptic('warning');
    handleDeleteTodoItem(block.id, itemId);
  };

  const onAddItem = () => {
    if (triggerHaptic) triggerHaptic('light');
    handleAddTodoItem(block.id);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.style.height = '38px';
      }
    }, 50);
  };

  const onDeleteBlock = () => {
    if (triggerHaptic) triggerHaptic('warning');
    handleDeleteBlock(block.id);
  };

  const onInsertHeaderAt = (index) => {
    if (triggerHaptic) triggerHaptic('success');
    const newItem = {
      id: 'h-' + Date.now(),
      text: 'Yeni Alt Başlık',
      isHeader: true
    };
    const updatedItems = [...items];
    updatedItems.splice(index, 0, newItem);
    handleUpdateBlock(block.id, { items: updatedItems });
    setIsInsertingHeader(false);
  };

  const handleHeaderChange = (itemId, newText) => {
    const updatedItems = items.map(i => i.id === itemId ? { ...i, text: newText } : i);
    handleUpdateBlock(block.id, { items: updatedItems });
  };

  const toggleHeaderCollapse = (itemId) => {
    if (triggerHaptic) triggerHaptic('light');
    const updatedItems = items.map(i => 
      i.id === itemId ? { ...i, collapsed: !i.collapsed } : i
    );
    handleUpdateBlock(block.id, { items: updatedItems });
  };

  // Returns { done, total } for all tasks following this header until the next header
  const getSectionStats = (headerIndex) => {
    let done = 0;
    let total = 0;
    for (let i = headerIndex + 1; i < items.length; i++) {
      if (items[i].isHeader) break;
      total++;
      if (items[i].done) done++;
    }
    return { done, total };
  };

  let currentSectionCollapsed = false;

  const isSetupForm = block.setupDone !== undefined ? !block.setupDone : (items.length === 0 && !block.title);

  if (isSetupForm) {
    return (
      <div 
        className="todo-widget animate-fade-in" 
        style={{ 
          borderRadius: '18px', 
          border: '1.5px solid rgba(6, 182, 212, 0.35)', 
          background: 'var(--bg-card)', 
          padding: '16px' 
        }} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Setup Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <div 
            style={{ 
              width: '34px', 
              height: '34px', 
              borderRadius: '11px', 
              background: 'linear-gradient(135deg, #06B6D4, #0891B2)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: '#FFF', 
              flexShrink: 0, 
              boxShadow: '0 3px 10px rgba(6, 182, 212, 0.35)' 
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 11 12 14 22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </div>

          <span style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--text-primary)' }}>
            Görev Listesi
          </span>

          <button 
            type="button"
            style={{ 
              background: 'rgba(239, 68, 68, 0.1)', 
              border: 'none', 
              color: '#EF4444', 
              cursor: 'pointer', 
              width: '28px', 
              height: '28px', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              flexShrink: 0, 
              marginLeft: 'auto' 
            }}
            onClick={onDeleteBlock}
            title="Bloğu Sil"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Info Hint Box */}
        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', background: 'rgba(6, 182, 212, 0.08)', border: '1px solid rgba(6, 182, 212, 0.15)', borderRadius: '12px', padding: '10px 12px', lineHeight: 1.5, display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '14px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#06B6D4" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <span>Günlük yapacaklarınızı, işlerinizi ve hedeflerinizi düzenli olarak takip edin.</span>
        </div>

        {/* Setup Action Button */}
        <button
          type="button"
          className="btn-primary"
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '0.92rem',
            fontWeight: 800,
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #06B6D4, #0891B2)',
            border: 'none',
            color: '#FFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 4px 14px rgba(6, 182, 212, 0.35)',
            cursor: 'pointer'
          }}
          onClick={() => {
            if (triggerHaptic) triggerHaptic('success');
            handleUpdateBlock(block.id, { setupDone: true });
          }}
        >
          <span>✓ Listeye Başla</span>
        </button>
      </div>
    );
  }

  return (
    <div className={`todo-widget ${isAllDone ? 'todo-widget-completed animate-pop' : ''}`} style={{ borderRadius: '18px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', padding: '16px' }} onClick={(e) => e.stopPropagation()}>
      <div className="todo-widget-header" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg, #06B6D4, #0891B2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', flexShrink: 0, boxShadow: '0 2px 8px rgba(6, 182, 212, 0.3)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 11 12 14 22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
        </div>

        <div className="todo-widget-title" style={{ flex: 1, overflow: 'hidden', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="text"
            value={block.title || ''}
            placeholder="Görev Listesi"
            onChange={(e) => handleTodoTitleChange(block.id, e.target.value)}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.95rem',
              fontWeight: 800,
              fontFamily: 'var(--font-family)',
              flex: 1,
              minWidth: 0,
              cursor: 'text',
            }}
          />
          {total > 0 && (
            <div 
              style={{
                position: 'relative',
                minWidth: '64px',
                height: '24px',
                padding: '0 8px',
                borderRadius: '12px',
                background: 'rgba(6, 182, 212, 0.08)',
                border: '1px solid rgba(6, 182, 212, 0.25)',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginLeft: 'auto',
                boxShadow: isAllDone ? '0 0 10px rgba(16, 185, 129, 0.3)' : 'none'
              }}
            >
              <div 
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: `${progress}%`,
                  background: isAllDone 
                    ? 'linear-gradient(90deg, #10B981, #059669)' 
                    : 'linear-gradient(90deg, #06B6D4, #0891B2)',
                  transition: 'width 0.3s ease',
                  zIndex: 1
                }}
              />
              <span 
                style={{
                  position: 'relative',
                  zIndex: 2,
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  color: '#FFF',
                  textShadow: '0 1px 2px rgba(0,0,0,0.6)',
                  lineHeight: 1,
                  letterSpacing: '0.03em'
                }}
              >
                {doneCount}/{total}
              </span>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
          {/* Subheading Insert Toggle Button */}
          <button
            style={{
              padding: '5px 10px',
              borderRadius: '10px',
              fontSize: '0.76rem',
              fontWeight: 800,
              background: isInsertingHeader 
                ? 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)' 
                : 'rgba(6, 182, 212, 0.12)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              color: isInsertingHeader ? '#FFFFFF' : '#06B6D4',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              transition: 'all 0.2s ease',
              boxShadow: isInsertingHeader ? '0 2px 8px rgba(6, 182, 212, 0.35)' : 'none'
            }}
            onClick={() => {
              if (triggerHaptic) triggerHaptic('light');
              setIsInsertingHeader(!isInsertingHeader);
            }}
            title="Alt Başlık Ekleme Modu"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Başlık</span>
          </button>

          <button
            style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#EF4444', cursor: 'pointer', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            onClick={onDeleteBlock}
            title="Bloğu Sil"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>



      {/* Styles for glowing dividers and headers */}
      <style>{`
        @keyframes glowCyanGlobal {
          0% {
            box-shadow: 0 0 4px rgba(6, 182, 212, 0.2);
            border-color: rgba(6, 182, 212, 0.3);
            background-color: rgba(6, 182, 212, 0.04);
          }
          100% {
            box-shadow: 0 0 12px rgba(6, 182, 212, 0.7), 0 0 20px rgba(6, 182, 212, 0.3);
            border-color: rgba(6, 182, 212, 0.9);
            background-color: rgba(6, 182, 212, 0.12);
          }
        }
        .glow-divider {
          height: 10px;
          margin: 4px 0;
          border: 1.5px dashed rgba(6, 182, 212, 0.5);
          border-radius: 6px;
          cursor: pointer;
          animation: glowCyanGlobal 0.8s infinite alternate;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justifyContent: center;
        }
        .glow-divider:hover {
          transform: scaleY(1.3);
          background-color: rgba(6, 182, 212, 0.25) !important;
        }
      `}</style>

      <div className="todo-list" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {isInsertingHeader && (
          <div 
            className="glow-divider" 
            onClick={() => onInsertHeaderAt(0)}
            title="Alt Başlığı Buraya Ekle"
          />
        )}
        
        {items.map((item, index) => {
          if (item.isHeader) {
            currentSectionCollapsed = !!item.collapsed;
          }
          const shouldHide = currentSectionCollapsed && !item.isHeader;
          if (shouldHide) return null;

          return (
            <React.Fragment key={item.id}>
              {item.isHeader ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  gap: '8px',
                  padding: '10px 14px',
                  background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(8, 145, 178, 0.05) 100%)',
                  borderRadius: '12px',
                  border: '1px solid rgba(6, 182, 212, 0.18)',
                  marginTop: '12px',
                  marginBottom: '4px',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Section checkbox */}
                {(() => {
                  const stats = getSectionStats(index);
                  const secAllDone = stats.total > 0 && stats.done === stats.total;
                  return (
                    <div style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '5px',
                      border: `2px solid ${secAllDone ? 'transparent' : 'rgba(6, 182, 212, 0.5)'}`,
                      background: secAllDone
                        ? 'linear-gradient(135deg, #10B981, #059669)'
                        : 'var(--bg-card)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      boxShadow: secAllDone ? '0 2px 6px rgba(16, 185, 129, 0.4)' : 'none'
                    }}>
                      {secAllDone && (
                        <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                  );
                })()}

                {/* Subtle left glow accent */}
                <div style={{
                  width: '3px',
                  height: '20px',
                  borderRadius: '4px',
                  background: 'linear-gradient(180deg, #06B6D4, #0891B2)',
                  flexShrink: 0,
                  boxShadow: '0 0 6px rgba(6, 182, 212, 0.5)'
                }} />

                {(() => {
                  const stats = getSectionStats(index);
                  const secAllDone = stats.total > 0 && stats.done === stats.total;
                  return (
                    <input
                      type="text"
                      value={item.text}
                      placeholder="Alt Başlık..."
                      onChange={(e) => handleHeaderChange(item.id, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && (!item.text || item.text.trim() === '')) {
                          e.preventDefault();
                          onDeleteItem(e, item.id);
                        }
                      }}
                      style={{
                        flex: 1,
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        color: secAllDone ? 'var(--text-muted)' : 'var(--text-primary)',
                        fontSize: '0.95rem',
                        fontWeight: 900,
                        fontFamily: 'var(--font-family)',
                        width: '100%',
                        minWidth: 0,
                        padding: '0',
                        letterSpacing: '0.02em',
                        textTransform: 'uppercase',
                        textDecoration: secAllDone ? 'line-through' : 'none',
                        transition: 'color 0.2s, text-decoration 0.2s'
                      }}
                    />
                  );
                })()}

                {(() => {
                  const stats = getSectionStats(index);
                  const allDone = stats.total > 0 && stats.done === stats.total;
                  return stats.total > 0 ? (
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: allDone ? '#10B981' : '#06B6D4',
                      background: allDone
                        ? 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.1))'
                        : 'linear-gradient(135deg, rgba(6,182,212,0.18), rgba(8,145,178,0.1))',
                      border: `1px solid ${allDone ? 'rgba(16,185,129,0.25)' : 'rgba(6,182,212,0.25)'}`,
                      padding: '2px 8px',
                      borderRadius: '20px',
                      flexShrink: 0,
                      whiteSpace: 'nowrap'
                    }}>
                      {stats.done}/{stats.total}
                    </span>
                  ) : null;
                })()}

                {/* Collapse / Expand Toggle Button */}
                <button
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'rgba(6, 182, 212, 0.7)',
                    width: '24px',
                    height: '24px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.15s ease',
                    marginLeft: '4px'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleHeaderCollapse(item.id);
                  }}
                  title={item.collapsed ? "Görevleri Göster" : "Görevleri Gizle"}
                >
                  <svg 
                    width="14" 
                    height="14" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    style={{
                      transform: item.collapsed ? 'rotate(0deg)' : 'rotate(180deg)',
                      transition: 'transform 0.2s ease'
                    }}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                <button
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: 'none',
                    color: '#EF4444',
                    width: '22px',
                    height: '22px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                  onClick={(e) => onDeleteItem(e, item.id)}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ) : (
              <div
                className={`todo-item ${item.done ? 'todo-item-done' : ''} ${activeTodoItemId === item.id ? 'todo-item-active' : ''}`}
                onClick={() => {
                  if (triggerHaptic) triggerHaptic('light');
                  setActiveTodoItemId(activeTodoItemId === item.id ? null : item.id);
                }}
                style={{ padding: '8px 12px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}
              >
                <button
                  className={`todo-checkbox ${item.done ? 'checked' : ''}`}
                  onClick={(e) => onToggleItem(e, item)}
                >
                  {item.done && (
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                </button>
                <span className="todo-item-text" style={{ flex: 1, fontSize: '0.85rem' }}>{item.text}</span>
                <button
                  style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#EF4444', width: '22px', height: '22px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                  onClick={(e) => onDeleteItem(e, item.id)}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            )}
            
            {isInsertingHeader && (
              <div 
                className="glow-divider" 
                onClick={() => onInsertHeaderAt(index + 1)}
                title="Alt Başlığı Buraya Ekle"
              />
            )}
          </React.Fragment>
        );
      })}
      </div>

      <div className="todo-input-row" style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
        <textarea
          ref={textareaRef}
          className="input-field"
          style={{ padding: '8px 12px', fontSize: '0.85rem', flex: 1, resize: 'none', minHeight: '38px', maxHeight: '120px', lineHeight: '1.5', overflowY: 'auto', borderRadius: '10px' }}
          placeholder="Yeni görev ekle..."
          rows={1}
          value={fs.todoInput || ''}
          onChange={(e) => {
            updateBlockForm(block.id, { todoInput: e.target.value });
            e.target.style.height = 'auto';
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onAddItem();
            }
          }}
        />
        <button
          className="btn-primary"
          style={{ padding: '8px 16px', fontSize: '1rem', fontWeight: 700, flexShrink: 0, borderRadius: '10px', background: 'linear-gradient(135deg, #06B6D4, #0891B2)', border: 'none', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={onAddItem}
          onMouseDown={(e) => e.preventDefault()}
          onTouchStart={(e) => e.preventDefault()}
        >+</button>
      </div>
    </div>
  );
};

export default TodoWidget;

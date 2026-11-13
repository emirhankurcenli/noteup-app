import React, { useRef, useState, useMemo } from 'react';

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
  t,
  lang = 'tr',
}) => {
  const [isInsertingHeader, setIsInsertingHeader] = useState(false);
  const textareaRef = useRef(null);
  const fs = blockFormStates[block.id] || {};
  const items = block.items || [];

  const getTr = (key, fallback) => {
    if (typeof t === 'function') {
      const val = t(key);
      if (val && val !== key) return val;
    }
    return fallback;
  };
  const { taskItems, doneCount, total, progress, isAllDone } = useMemo(() => {
    const tasks = items.filter(i => !i.isHeader);
    const done = tasks.filter(i => i.done).length;
    const tot = tasks.length;
    const prog = tot === 0 ? 0 : Math.round((done / tot) * 100);
    return {
      taskItems: tasks,
      doneCount: done,
      total: tot,
      progress: prog,
      isAllDone: tot > 0 && done === tot
    };
  }, [items]);

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
      text: getTr('newSubheading', lang === 'tr' ? 'Alt Başlık' : 'Section'),
      isHeader: true
    };
    const updatedItems = [...items];
    updatedItems.splice(index, 0, newItem);
    handleUpdateBlock(block.id, { items: updatedItems, setupDone: true });
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

  return (
    <div className={`todo-widget ${isAllDone ? 'todo-widget-completed animate-pop' : ''}`} style={{ borderRadius: '16px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', padding: '16px' }} onClick={(e) => e.stopPropagation()}>
      <div className="todo-widget-header" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: 'rgba(6, 182, 212, 0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0891B2', flexShrink: 0 }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 11 12 14 22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
        </div>

        <div className="todo-widget-title" style={{ flex: 1, overflow: 'hidden', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="text"
            value={block.title || ''}
            placeholder={getTr('todoList', lang === 'tr' ? 'Yapılacaklar Listesi' : 'To-Do List')}
            onChange={(e) => handleTodoTitleChange(block.id, e.target.value)}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.94rem',
              fontWeight: 700,
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
                minWidth: '52px',
                height: '22px',
                padding: '0 8px',
                borderRadius: '10px',
                background: isAllDone ? 'rgba(16, 185, 129, 0.14)' : 'rgba(6, 182, 212, 0.12)',
                border: `1px solid ${isAllDone ? 'rgba(16, 185, 129, 0.3)' : 'rgba(6, 182, 212, 0.25)'}`,
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginLeft: 'auto',
              }}
            >
              <span 
                style={{
                  position: 'relative',
                  zIndex: 2,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: isAllDone ? '#10B981' : '#0891B2',
                  lineHeight: 1,
                }}
              >
                {doneCount}/{total}
              </span>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
          {/* Subheading Insert Toggle Button */}
          <button
            style={{
              padding: '5px 10px',
              borderRadius: '8px',
              fontSize: '0.75rem',
              fontWeight: 600,
              background: isInsertingHeader ? '#0891B2' : 'rgba(6, 182, 212, 0.1)',
              border: '1px solid rgba(6, 182, 212, 0.25)',
              color: isInsertingHeader ? '#FFFFFF' : '#0891B2',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              transition: 'all 0.15s ease',
            }}
            onClick={() => {
              if (triggerHaptic) triggerHaptic('light');
              setIsInsertingHeader(!isInsertingHeader);
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>{getTr('subheadingBtn', lang === 'tr' ? 'Alt Başlık' : 'Section')}</span>
          </button>

          <button
            style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#EF4444', cursor: 'pointer', width: '28px', height: '28px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            onClick={onDeleteBlock}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      <div className="todo-list" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {isInsertingHeader && (
          <button
            type="button"
            onClick={() => onInsertHeaderAt(0)}
            style={{
              width: '100%',
              padding: '6px 10px',
              margin: '2px 0',
              borderRadius: '8px',
              border: '1px dashed rgba(6, 182, 212, 0.45)',
              background: 'rgba(6, 182, 212, 0.06)',
              color: '#0891B2',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              textAlign: 'center',
            }}
          >
            + {getTr('subheadingBtn', lang === 'tr' ? 'Buraya Alt Başlık Ekle' : 'Insert Section Here')}
          </button>
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
                  padding: '8px 10px',
                  background: 'var(--bg-tertiary, rgba(148, 163, 184, 0.08))',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  marginTop: index === 0 ? '4px' : '10px',
                  marginBottom: '2px',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {(() => {
                  const stats = getSectionStats(index);
                  const secAllDone = stats.total > 0 && stats.done === stats.total;
                  return (
                    <input
                      type="text"
                      value={item.text}
                      placeholder={getTr('subheadingPlaceholder', lang === 'tr' ? 'Alt Başlık...' : 'Section title...')}
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
                        fontSize: '0.88rem',
                        fontWeight: 600,
                        fontFamily: 'var(--font-family)',
                        width: '100%',
                        minWidth: 0,
                        padding: '0',
                        textDecoration: secAllDone ? 'line-through' : 'none',
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
                      fontWeight: 600,
                      color: allDone ? '#10B981' : 'var(--text-secondary)',
                      background: allDone ? 'rgba(16,185,129,0.12)' : 'rgba(148,163,184,0.12)',
                      padding: '2px 7px',
                      borderRadius: '8px',
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
                    color: 'var(--text-secondary)',
                    width: '24px',
                    height: '24px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleHeaderCollapse(item.id);
                  }}
                >
                  <svg 
                    width="14" 
                    height="14" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2.2" 
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
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
                style={{ padding: '8px 10px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}
              >
                <button
                  className={`todo-checkbox ${item.done ? 'checked' : ''}`}
                  onClick={(e) => onToggleItem(e, item)}
                >
                  {item.done && (
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                </button>
                <span className="todo-item-text" style={{ flex: 1, fontSize: '0.88rem' }}>{item.text}</span>
                <button
                  style={{ background: 'rgba(239, 68, 68, 0.08)', border: 'none', color: '#EF4444', width: '22px', height: '22px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                  onClick={(e) => onDeleteItem(e, item.id)}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            )}
            
            {isInsertingHeader && (
              <button
                type="button"
                onClick={() => onInsertHeaderAt(index + 1)}
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  margin: '2px 0',
                  borderRadius: '8px',
                  border: '1px dashed rgba(6, 182, 212, 0.45)',
                  background: 'rgba(6, 182, 212, 0.06)',
                  color: '#0891B2',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                + {getTr('subheadingBtn', lang === 'tr' ? 'Buraya Alt Başlık Ekle' : 'Insert Section Here')}
              </button>
            )}
          </React.Fragment>
        );
      })}
      </div>

      <div className="todo-input-row" style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
        <textarea
          ref={textareaRef}
          className="input-field"
          style={{ padding: '8px 12px', fontSize: '0.86rem', fontWeight: 500, flex: 1, resize: 'none', minHeight: '38px', maxHeight: '120px', lineHeight: '1.5', overflowY: 'auto', borderRadius: '10px' }}
          placeholder={getTr('newTaskPlaceholder', lang === 'tr' ? 'Yeni görev ekle...' : 'Add a task...')}
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
          style={{ width: '38px', height: '38px', padding: 0, flexShrink: 0, borderRadius: '10px', background: '#0891B2', border: 'none', color: '#FFF', boxShadow: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={onAddItem}
          onMouseDown={(e) => e.preventDefault()}
          onTouchStart={(e) => e.preventDefault()}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default React.memo(TodoWidget);

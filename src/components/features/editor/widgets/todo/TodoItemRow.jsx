import React from 'react';

const TodoItemRow = ({
  item,
  index,
  itemRef,
  isDraggingThis,
  isDragOverThis,
  onDragStart,
  onDragOver,
  onDragEnd,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onToggleItem,
  onTextChange,
  onKeyDown,
  onDeleteItem,
}) => {
  return (
    <div
      ref={itemRef}
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDragEnd={onDragEnd}
      onTouchStart={(e) => onTouchStart(e, index)}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '7px 10px',
        background: isDraggingThis
          ? 'rgba(6, 182, 212, 0.18)'
          : isDragOverThis
          ? 'rgba(6, 182, 212, 0.12)'
          : item.completed
          ? 'var(--bg-tertiary)'
          : 'var(--bg-card)',
        borderRadius: '10px',
        border: isDragOverThis
          ? '1.5px dashed #06B6D4'
          : item.completed
          ? '1px solid transparent'
          : '1px solid var(--border-color)',
        opacity: isDraggingThis ? 0.4 : 1,
        transition: 'background 0.15s ease, border 0.15s ease, opacity 0.15s ease',
        cursor: 'grab',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Drag Handle */}
      <span
        style={{
          cursor: 'grab',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          opacity: 0.4,
          paddingRight: '2px',
          userSelect: 'none',
          flexShrink: 0,
        }}
        title="Sürükleyip Sırala"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="9" cy="6" r="2" />
          <circle cx="15" cy="6" r="2" />
          <circle cx="9" cy="12" r="2" />
          <circle cx="15" cy="12" r="2" />
          <circle cx="9" cy="18" r="2" />
          <circle cx="15" cy="18" r="2" />
        </svg>
      </span>

      {/* Checkbox */}
      <div
        onClick={() => onToggleItem(item.id)}
        style={{
          width: '20px',
          height: '20px',
          borderRadius: '6px',
          border: `2px solid ${item.completed ? 'transparent' : 'var(--border-color)'}`,
          background: item.completed
            ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
            : 'var(--bg-card)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          flexShrink: 0,
          transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
          boxShadow: item.completed ? '0 2px 6px rgba(16, 185, 129, 0.35)' : 'none',
        }}
      >
        {item.completed && (
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </div>

      {/* Text Input */}
      <input
        type="text"
        value={item.text}
        placeholder="Yapılacak bir iş ekleyin..."
        onChange={(e) => onTextChange(item.id, e.target.value)}
        onKeyDown={(e) => onKeyDown(e, item.id, index)}
        style={{
          flex: 1,
          background: 'transparent',
          border: 'none',
          outline: 'none',
          color: item.completed ? 'var(--text-muted)' : 'var(--text-primary)',
          textDecoration: item.completed ? 'line-through' : 'none',
          fontSize: '0.9rem',
          fontFamily: 'var(--font-family)',
          width: '100%',
          minWidth: 0,
          padding: '0',
          transition: 'color 0.2s ease, text-decoration 0.2s ease',
        }}
      />

      {/* Delete Item Button */}
      <button
        onClick={() => onDeleteItem(item.id)}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          opacity: 0.5,
          padding: '2px',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'opacity 0.15s ease, color 0.15s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.5')}
        title="Sil"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
};

export default TodoItemRow;

import React from 'react';
import DebtWidget from './widgets/DebtWidget';
import TodoWidget from './widgets/TodoWidget';
import SplitWidget from './widgets/SplitWidget';
import BillWidget from './widgets/BillWidget';
import PasswordWidget from './widgets/PasswordWidget';
import ParkingWidget from './widgets/ParkingWidget';
import ExamWidget from './widgets/ExamWidget';
import ExpenseWidget from './widgets/ExpenseWidget';

const getFileIconInfo = (filename = '', isLight = true) => {
  const ext = filename.includes('.') ? filename.split('.').pop()?.toLowerCase() || '' : '';
  if (['pdf'].includes(ext)) {
    return {
      typeLabel: 'PDF',
      bgColor: isLight ? 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)' : 'linear-gradient(135deg, #991B1B 0%, #7F1D1D 100%)',
      borderColor: isLight ? 'transparent' : 'rgba(248, 113, 113, 0.4)',
      glowColor: isLight ? 'rgba(239, 68, 68, 0.35)' : 'rgba(153, 27, 27, 0.3)',
      badgeColor: '#FFFFFF',
      svg: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="file-card-svg">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="9" y1="13" x2="15" y2="13"></line>
          <line x1="9" y1="17" x2="13" y2="17"></line>
        </svg>
      )
    };
  }
  if (['doc', 'docx', 'rtf'].includes(ext)) {
    return {
      typeLabel: 'DOC',
      bgColor: isLight ? 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)' : 'linear-gradient(135deg, #1E40AF 0%, #1E3A8A 100%)',
      borderColor: isLight ? 'transparent' : 'rgba(96, 165, 250, 0.4)',
      glowColor: isLight ? 'rgba(59, 130, 246, 0.35)' : 'rgba(30, 64, 175, 0.3)',
      badgeColor: '#FFFFFF',
      svg: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="file-card-svg">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <line x1="10" y1="9" x2="8" y2="9"></line>
        </svg>
      )
    };
  }
  if (['xls', 'xlsx', 'csv'].includes(ext)) {
    return {
      typeLabel: 'EXCEL',
      bgColor: isLight ? 'linear-gradient(135deg, #10B981 0%, #047857 100%)' : 'linear-gradient(135deg, #065F46 0%, #064E3B 100%)',
      borderColor: isLight ? 'transparent' : 'rgba(52, 211, 153, 0.4)',
      glowColor: isLight ? 'rgba(16, 185, 129, 0.35)' : 'rgba(6, 95, 70, 0.3)',
      badgeColor: '#FFFFFF',
      svg: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="file-card-svg">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <rect x="8" y="12" width="8" height="6" rx="1"></rect>
          <line x1="12" y1="12" x2="12" y2="18"></line>
        </svg>
      )
    };
  }
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
    return {
      typeLabel: 'ZIP',
      bgColor: isLight ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' : 'linear-gradient(135deg, #92400E 0%, #78350F 100%)',
      borderColor: isLight ? 'transparent' : 'rgba(251, 191, 36, 0.4)',
      glowColor: isLight ? 'rgba(245, 158, 11, 0.35)' : 'rgba(146, 64, 14, 0.3)',
      badgeColor: '#FFFFFF',
      svg: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="file-card-svg">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
          <line x1="12" y1="22.08" x2="12" y2="12"></line>
        </svg>
      )
    };
  }
  if (['txt'].includes(ext)) {
    return {
      typeLabel: 'TXT',
      bgColor: isLight ? 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)' : 'linear-gradient(135deg, #155E75 0%, #164E63 100%)',
      borderColor: isLight ? 'transparent' : 'rgba(103, 232, 249, 0.4)',
      glowColor: isLight ? 'rgba(6, 182, 212, 0.35)' : 'rgba(21, 94, 117, 0.3)',
      badgeColor: '#FFFFFF',
      svg: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="file-card-svg">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
        </svg>
      )
    };
  }
  return {
    typeLabel: ext.toUpperCase() || 'FILE',
    bgColor: isLight ? 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)' : 'linear-gradient(135deg, #5B21B6 0%, #4C1D95 100%)',
    borderColor: isLight ? 'transparent' : 'rgba(192, 132, 252, 0.4)',
    glowColor: isLight ? 'rgba(139, 92, 246, 0.35)' : 'rgba(91, 33, 182, 0.3)',
    badgeColor: '#FFFFFF',
    svg: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="file-card-svg">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
      </svg>
    )
  };
};

const EncryptedImage = ({ src, alt, className, onClick }) => {
  const [displaySrc, setDisplaySrc] = React.useState(src);

  React.useEffect(() => {
    setDisplaySrc(src);
  }, [src]);

  return (
    <img 
      src={displaySrc} 
      alt={alt} 
      className={className} 
      onError={() => console.warn("Image load error:", displaySrc)}
      onClick={() => onClick && onClick(displaySrc)} 
    />
  );
};

const BlockListRenderer = ({
  editingNote,
  t,
  lang,
  theme = 'dark',
  focusedBlockRef,
  setActiveFormatBlockId,
  ensureElementVisible,
  handleTextareaKeyDown,
  handleUpdateBlock,
  setLightboxUrl,
  handleDeleteBlock,
  handleOpenFile,
  handlePlayPauseAudio,
  activeAudioPlayingId,
  setActiveAudioPlayingId,
  activeAudioProgress,
  currentAudioRef,
  blockFormStates,
  setBlockFormStates,
  updateBlockForm,
  handleAddDebtItem,
  handleDeleteDebtItem,
  handleAddExpenseItem,
  handleDeleteExpenseItem,
  handleExpenseTitleChange,
  handleTodoTitleChange,
  activeTodoItemId,
  setActiveTodoItemId,
  handleToggleTodoItem,
  handleDeleteTodoItem,
  handleAddTodoItem,
  handleSetupSplit,
  handleAddSplitExpense,
  handleDeleteSplitExpense,
  triggerHaptic,
  setToast,
  handleDeleteExamBlock,
  checkAndRequestNotificationPermission,
  setQuickReminderTitle,
  setQuickReminderTime,
  setPendingWidgetAlarmCtx,
  reminders,
  now,
  handleDeleteBillBlock,
  handlePayBill,
  isRecording,
  recordingSeconds,
  cancelRecording,
  stopRecording,
  vaultUnlocked,
  setVaultUnlocked,
  requestBiometricAuth,
  checkAndRequestPermission,
  showPermissionDialog,
}) => {
  const blocks = editingNote?.blocks || [];
  const focusedBlockId = focusedBlockRef?.current?.id;
  const focusedIdx = blocks.findIndex(b => b.id === focusedBlockId);
  const targetRecordIdx = focusedIdx >= 0 ? focusedIdx : blocks.length - 1;

  const renderLiveRecordingBar = () => (
    <div 
      className="recording-bar-inline animate-pop" 
      onClick={(e) => e.stopPropagation()} 
      style={{
        margin: '12px 0 16px 0',
        width: '100%',
        boxSizing: 'border-box',
        background: 'var(--bg-card)',
        border: '1.5px solid rgba(239, 68, 68, 0.35)',
        borderRadius: '18px',
        padding: '12px 14px',
        boxShadow: '0 8px 24px rgba(239, 68, 68, 0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px',
        overflow: 'hidden'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #EF4444, #DC2626)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFF',
          flexShrink: 0,
          boxShadow: '0 3px 10px rgba(239, 68, 68, 0.35)'
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          </svg>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444', flexShrink: 0, boxShadow: '0 0 8px #EF4444' }} className="animate-pulse" />
            <span style={{ fontWeight: 700, fontSize: '0.78rem', color: '#EF4444', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {t('recordingStatus') || 'Ses Kaydediliyor...'}
            </span>
          </div>
          <span style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--text-primary)', fontFamily: 'monospace', lineHeight: 1.1 }}>
            {Math.floor((recordingSeconds || 0) / 60).toString().padStart(2, '0')}:{((recordingSeconds || 0) % 60).toString().padStart(2, '0')}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
        <button 
          style={{ padding: '6px 10px', fontSize: '0.78rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#EF4444', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }} 
          onClick={cancelRecording} 
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          İptal
        </button>
        <button 
          className="btn-primary" 
          style={{ padding: '6px 12px', fontSize: '0.8rem', background: 'linear-gradient(135deg, #10B981, #059669)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 3px 10px rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', gap: '4px' }} 
          onClick={stopRecording}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Tamam
        </button>
      </div>
    </div>
  );

  return (
    <div className="blocks-container">
      {isRecording && blocks.length === 0 && renderLiveRecordingBar()}
      {blocks.map((block, idx) => (
        <React.Fragment key={block.id}>
          <div 
            className="block-wrapper"
            onFocus={() => { if (focusedBlockRef?.current) focusedBlockRef.current.id = block.id; }}
            onClick={() => { if (focusedBlockRef?.current) focusedBlockRef.current.id = block.id; }}
          >
            {block.type === 'text' && (() => {
              const textComponent = (
                <div
                  className="block-textarea content-editable-block"
                  contentEditable="true"
                  suppressContentEditableWarning={true}
                  data-placeholder={idx === 0 ? t('noteBodyPlaceholder') : ""}
                  data-block-id={block.id}
                  style={{
                    fontFamily: block.fontFamily || 'inherit',
                    color: block.color || 'var(--text-primary)',
                    ...(block.content && block.content.includes('<') ? {} : { fontWeight: (block.fontWeight === 'bold' || block.isBold) ? 'bold' : 'normal' })
                  }}
                  ref={(el) => {
                    if (el) {
                      if (el.dataset.initializedId !== block.id) {
                        el.innerHTML = block.content || '';
                        el.dataset.initializedId = block.id;
                      }
                    }
                  }}
                  onKeyDown={(e) => handleTextareaKeyDown(e, block, idx)}
                  onFocus={(e) => { 
                    if (focusedBlockRef?.current) focusedBlockRef.current.id = block.id;
                    setActiveFormatBlockId(block.id);
                    ensureElementVisible(e.target);
                  }}
                  onInput={(e) => {
                    const el = e.target;
                    const html = el.innerHTML;
                    if (focusedBlockRef?.current) focusedBlockRef.current.id = block.id;
                    handleUpdateBlock(block.id, { content: html });
                  }}
                  onPaste={(e) => {
                    e.preventDefault();
                    const text = (e.clipboardData || window.clipboardData).getData('text/plain');
                    document.execCommand('insertText', false, text);
                  }}
                />
              );

              return (
                <div className="block-wrapper-bullet" style={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
                  <span 
                    className="block-bullet-dot" 
                    style={{ 
                      display: block.bullet ? 'inline-block' : 'none',
                      userSelect: 'none', 
                      pointerEvents: 'none' 
                    }}
                  >
                    •
                  </span>
                  {textComponent}
                </div>
              );
            })()}

            {block.type === 'image' && (
              <div className="image-block-container" onClick={(e) => e.stopPropagation()}>
                <EncryptedImage
                  src={block.url || block.localUrl}
                  alt={block.name}
                  className="image-block-img"
                  onClick={(decryptedUrl) => setLightboxUrl(decryptedUrl)}
                />
                <button className="image-delete-btn" onClick={() => handleDeleteBlock(block.id)} title="Görseli Sil">
                  ×
                </button>
              </div>
            )}

            {block.type === 'file' && (() => {
              const isLight = theme === 'light';
              const iconInfo = getFileIconInfo(block.name, isLight);
              return (
                <div className="file-block-card" onClick={(e) => e.stopPropagation()}>
                  <div 
                    className="file-card-icon-badge"
                    style={{
                      background: iconInfo.bgColor,
                      border: isLight ? 'none' : `1px solid ${iconInfo.borderColor}`,
                      boxShadow: `0 4px 14px ${iconInfo.glowColor}`,
                      color: '#FFFFFF'
                    }}
                  >
                    {iconInfo.svg}
                    <span className="file-card-type-tag" style={{ color: '#FFFFFF' }}>{iconInfo.typeLabel}</span>
                  </div>
                  <div className="file-info">
                    <span className="file-name" title={block.name}>{block.name}</span>
                    <div className="file-meta">
                      <span className="file-size-badge">{block.size || 'Belge'}</span>
                    </div>
                  </div>
                  <div className="file-actions">
                    <button 
                      className="file-open-btn"
                      onClick={() => handleOpenFile(block)}
                      title="Aç"
                    >
                      Aç
                    </button>
                    <button 
                      className="file-delete-btn" 
                      onClick={() => handleDeleteBlock(block.id)} 
                      title="Belgeyi Sil"
                    >
                      ×
                    </button>
                  </div>
                </div>
              );
            })()}

            {block.type === 'audio' && (() => {
              const isLight = theme === 'light';
              const isPlaying = activeAudioPlayingId === block.id;
              const progress = activeAudioProgress[block.id] || 0;
              return (
                <div 
                  className="audio-block-player animate-fade-in" 
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    borderRadius: '18px',
                    border: '1.5px solid rgba(99, 102, 241, 0.25)',
                    background: 'var(--bg-card)',
                    padding: '12px 14px',
                    margin: '12px 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    boxShadow: '0 8px 24px rgba(99, 102, 241, 0.1)',
                    position: 'relative'
                  }}
                >
                  {/* Sleek Play/Pause Button on Left */}
                  <button 
                    className="audio-play-btn" 
                    onClick={() => handlePlayPauseAudio(block)}
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      border: isLight ? 'none' : isPlaying ? '1px solid rgba(248, 113, 113, 0.4)' : '1px solid rgba(129, 140, 248, 0.4)',
                      background: isLight 
                        ? (isPlaying ? 'linear-gradient(135deg, #EF4444, #DC2626)' : 'linear-gradient(135deg, #6366F1, #4F46E5)')
                        : (isPlaying ? 'linear-gradient(135deg, #991B1B, #7F1D1D)' : 'linear-gradient(135deg, #3730A3, #1E1B4B)'),
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: isPlaying ? '0 4px 14px rgba(239, 68, 68, 0.35)' : '0 4px 14px rgba(99, 102, 241, 0.35)',
                      flexShrink: 0,
                      padding: 0
                    }}
                  >
                    {isPlaying ? (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="6" y="4" width="4" height="16" rx="1" />
                        <rect x="14" y="4" width="4" height="16" rx="1" />
                      </svg>
                    ) : (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: '2px' }}>
                        <polygon points="5,3 19,12 5,21" />
                      </svg>
                    )}
                  </button>

                  {/* Info & Progress Bar in Center */}
                  <div className="file-info" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px', minWidth: 0 }}>
                    <span className="file-name" style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={block.name}>
                      {block.name}
                    </span>
                    
                    <div className="audio-waveform-sim" style={{ width: '100%', display: 'flex', alignItems: 'center' }}>
                      <div className="audio-bar" style={{ width: '100%', height: '6px', borderRadius: '3px', background: 'rgba(99, 102, 241, 0.15)', overflow: 'hidden' }}>
                        <div 
                          className="audio-bar-progress" 
                          style={{ width: progress + '%', height: '100%', background: 'linear-gradient(90deg, #6366F1, #8B5CF6)', borderRadius: '3px', transition: 'width 0.15s linear' }}
                        />
                      </div>
                    </div>

                    <span className="file-size" style={{ fontSize: '0.68rem', fontWeight: 700, color: '#6366F1', background: 'rgba(99, 102, 241, 0.1)', padding: '2px 8px', borderRadius: '6px', alignSelf: 'flex-start' }}>
                      {block.size || 'Ses Kaydı'}
                    </span>
                  </div>

                  {/* Delete Button on Right (Red X Icon) */}
                  <button 
                    style={{ background: 'rgba(239, 68, 68, 0.12)', border: 'none', color: '#EF4444', cursor: 'pointer', width: '28px', height: '28px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: 'auto' }}
                    onClick={() => {
                      if (isPlaying && currentAudioRef?.current) {
                        currentAudioRef.current.pause();
                        currentAudioRef.current = null;
                        setActiveAudioPlayingId(null);
                      }
                      handleDeleteBlock(block.id);
                    }} 
                    title="Sesi Sil"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              );
            })()}

            {/* DEBT BLOCK */}
            {block.type === 'debt' && (
              <DebtWidget
                block={block}
                blockFormStates={blockFormStates}
                updateBlockForm={updateBlockForm}
                handleUpdateBlock={handleUpdateBlock}
                handleDeleteBlock={handleDeleteBlock}
                handleAddDebtItem={handleAddDebtItem}
                handleDeleteDebtItem={handleDeleteDebtItem}
                triggerHaptic={triggerHaptic}
                theme={theme}
                t={t}
              />
            )}

            {/* EXPENSE TRACKER BLOCK */}
            {block.type === 'expense' && (
              <ExpenseWidget
                block={block}
                blockFormStates={blockFormStates}
                updateBlockForm={updateBlockForm}
                handleExpenseTitleChange={handleExpenseTitleChange}
                handleAddExpenseItem={handleAddExpenseItem}
                handleDeleteExpenseItem={handleDeleteExpenseItem}
                handleDeleteBlock={handleDeleteBlock}
                handleUpdateBlock={handleUpdateBlock}
                triggerHaptic={triggerHaptic}
                theme={theme}
              />
            )}

            {/* TODO BLOCK */}
            {block.type === 'todo' && (
              <TodoWidget
                block={block}
                blockFormStates={blockFormStates}
                updateBlockForm={updateBlockForm}
                handleTodoTitleChange={handleTodoTitleChange}
                handleDeleteBlock={handleDeleteBlock}
                activeTodoItemId={activeTodoItemId}
                setActiveTodoItemId={setActiveTodoItemId}
                handleToggleTodoItem={handleToggleTodoItem}
                handleDeleteTodoItem={handleDeleteTodoItem}
                handleAddTodoItem={handleAddTodoItem}
                handleUpdateBlock={handleUpdateBlock}
                triggerHaptic={triggerHaptic}
              />
            )}

            {/* SPLIT BLOCK */}
            {block.type === 'split' && (
              <SplitWidget
                block={block}
                blockFormStates={blockFormStates}
                setBlockFormStates={setBlockFormStates}
                updateBlockForm={updateBlockForm}
                handleDeleteBlock={handleDeleteBlock}
                handleSetupSplit={handleSetupSplit}
                handleAddSplitExpense={handleAddSplitExpense}
                handleDeleteSplitExpense={handleDeleteSplitExpense}
                triggerHaptic={triggerHaptic}
                t={t}
              />
            )}

            {/* PASSWORD BLOCK */}
            {block.type === 'password' && (
              <PasswordWidget
                block={block}
                blockFormStates={blockFormStates}
                updateBlockForm={updateBlockForm}
                handleUpdateBlock={handleUpdateBlock}
                handleDeleteBlock={handleDeleteBlock}
                triggerHaptic={triggerHaptic}
                vaultUnlocked={vaultUnlocked}
                setVaultUnlocked={setVaultUnlocked}
                requestBiometricAuth={requestBiometricAuth}
                t={t}
              />
            )}

            {/* PARKING BLOCK */}
            {block.type === 'parking' && (
              <ParkingWidget
                block={block}
                blockFormStates={blockFormStates}
                updateBlockForm={updateBlockForm}
                handleUpdateBlock={handleUpdateBlock}
                handleDeleteBlock={handleDeleteBlock}
                triggerHaptic={triggerHaptic}
                setToast={setToast}
                checkAndRequestPermission={checkAndRequestPermission}
                showPermissionDialog={showPermissionDialog}
                t={t}
              />
            )}

            {/* EXAM BLOCK */}
            {block.type === 'exam' && (
              <ExamWidget
                block={block}
                blockFormStates={blockFormStates}
                updateBlockForm={updateBlockForm}
                handleDeleteExamBlock={handleDeleteExamBlock}
                checkAndRequestNotificationPermission={checkAndRequestNotificationPermission}
                setToast={setToast}
                setQuickReminderTitle={setQuickReminderTitle}
                setQuickReminderTime={setQuickReminderTime}
                setPendingWidgetAlarmCtx={setPendingWidgetAlarmCtx}
                reminders={reminders}
                editingNote={editingNote}
                now={now}
                lang={lang}
                triggerHaptic={triggerHaptic}
                theme={theme}
                t={t}
              />
            )}

            {/* BILL BLOCK */}
            {block.type === 'bill' && (
              <BillWidget
                block={block}
                blockFormStates={blockFormStates}
                updateBlockForm={updateBlockForm}
                handleDeleteBillBlock={handleDeleteBillBlock}
                checkAndRequestNotificationPermission={checkAndRequestNotificationPermission}
                setToast={setToast}
                setQuickReminderTitle={setQuickReminderTitle}
                setQuickReminderTime={setQuickReminderTime}
                setPendingWidgetAlarmCtx={setPendingWidgetAlarmCtx}
                handlePayBill={handlePayBill}
                editingNote={editingNote}
                lang={lang}
                triggerHaptic={triggerHaptic}
                theme={theme}
                t={t}
              />
            )}
          </div>

          {/* Render live recording bar inline right after the focused / target block */}
          {isRecording && idx === targetRecordIdx && renderLiveRecordingBar()}
        </React.Fragment>
      ))}
    </div>
  );
};

export default BlockListRenderer;

import React from 'react';
import { ensureElementVisible as ensureElementVisibleUtil } from '../../../utils/editorKeyboardUtils';
import { TextBlock } from './blocks/TextBlock';
import { AudioBlock } from './blocks/AudioBlock';
import { ImageBlock } from './blocks/ImageBlock';
import { FileBlock } from './blocks/FileBlock';
import { WidgetBlock } from './blocks/WidgetBlock';

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
            {block.type === 'text' && (
              <TextBlock
                block={block}
                idx={idx}
                t={t}
                setActiveFormatBlockId={setActiveFormatBlockId}
                ensureElementVisible={ensureElementVisible || ensureElementVisibleUtil}
                handleTextareaKeyDown={handleTextareaKeyDown}
                handleUpdateBlock={handleUpdateBlock}
              />
            )}

            {block.type === 'image' && (
              <ImageBlock
                block={block}
                setLightboxUrl={setLightboxUrl}
                handleDeleteBlock={handleDeleteBlock}
              />
            )}

            {block.type === 'file' && (
              <FileBlock
                block={block}
                handleOpenFile={handleOpenFile}
                handleDeleteBlock={handleDeleteBlock}
              />
            )}

            {block.type === 'audio' && (
              <AudioBlock
                block={block}
                activeAudioPlayingId={activeAudioPlayingId}
                activeAudioProgress={activeAudioProgress[block.id] || 0}
                handlePlayPauseAudio={handlePlayPauseAudio}
                handleDeleteBlock={handleDeleteBlock}
              />
            )}

            {['todo', 'debt', 'split', 'bill', 'password', 'parking', 'exam', 'expense'].includes(block.type) && (
              <WidgetBlock
                block={block}
                idx={idx}
                theme={theme}
                t={t}
                lang={lang}
                editingNote={editingNote}
                handleUpdateBlock={handleUpdateBlock}
                handleDeleteBlock={handleDeleteBlock}
                blockFormStates={blockFormStates || {}}
                setBlockFormStates={setBlockFormStates}
                updateBlockForm={updateBlockForm}
                handleAddDebtItem={handleAddDebtItem}
                handleDeleteDebtItem={handleDeleteDebtItem}
                handleAddExpenseItem={handleAddExpenseItem}
                handleDeleteExpenseItem={handleDeleteExpenseItem}
                handleExpenseTitleChange={handleExpenseTitleChange}
                handleTodoTitleChange={handleTodoTitleChange}
                activeTodoItemId={activeTodoItemId}
                setActiveTodoItemId={setActiveTodoItemId}
                handleToggleTodoItem={handleToggleTodoItem}
                handleDeleteTodoItem={handleDeleteTodoItem}
                handleAddTodoItem={handleAddTodoItem}
                handleSetupSplit={handleSetupSplit}
                handleAddSplitExpense={handleAddSplitExpense}
                handleDeleteSplitExpense={handleDeleteSplitExpense}
                triggerHaptic={triggerHaptic}
                setToast={setToast}
                handleDeleteExamBlock={handleDeleteExamBlock}
                checkAndRequestNotificationPermission={checkAndRequestNotificationPermission}
                setQuickReminderTitle={setQuickReminderTitle}
                setQuickReminderTime={setQuickReminderTime}
                setPendingWidgetAlarmCtx={setPendingWidgetAlarmCtx}
                reminders={reminders}
                now={now}
                handleDeleteBillBlock={handleDeleteBillBlock}
                handlePayBill={handlePayBill}
                vaultUnlocked={vaultUnlocked}
                setVaultUnlocked={setVaultUnlocked}
                requestBiometricAuth={requestBiometricAuth}
                checkAndRequestPermission={checkAndRequestPermission}
                showPermissionDialog={showPermissionDialog}
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

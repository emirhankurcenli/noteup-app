import React, { useState, useEffect } from 'react';
import NoteCard from './NoteCard';
import { PinnedNotesSection } from './PinnedNotesSection';
import { FolderTabBar } from './FolderTabBar';

const ThreeDotsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '1.25rem', height: '1.25rem' }}>
    <circle cx="12" cy="12" r="1.5"></circle>
    <circle cx="12" cy="5" r="1.5"></circle>
    <circle cx="12" cy="19" r="1.5"></circle>
  </svg>
);

const cleanText = (str) => {
  if (!str) return '';
  return str.replace(/^[\s\p{Extended_Pictographic}\u2300-\u23FF\u2600-\u27BF]+/gu, '').trim();
};

const LockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginRight: '4px' }}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const PinIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginRight: '4px' }}>
    <line x1="12" y1="17" x2="12" y2="22" />
    <path d="M5 17h14l-1.5-6H6.5L5 17z" />
    <path d="M9 11V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v7" />
  </svg>
);

const ClockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginRight: '4px' }}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const WalletIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginRight: '4px' }}>
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <circle cx="12" cy="12" r="2" />
    <path d="M6 12h.01M18 12h.01" />
  </svg>
);

const SnippetIcon = ({ type }) => {
  const style = { flexShrink: 0, marginRight: '6px', verticalAlign: '-2px' };
  switch (type) {
    case 'debt':
      return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={style}><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2" /></svg>;
    case 'todo':
      return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#06B6D4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={style}><polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>;
    case 'bill':
      return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={style}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>;
    case 'split':
      return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={style}><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><polyline points="17 8 20 11 23 8" /></svg>;
    case 'password':
      return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EAB308" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={style}><circle cx="7.5" cy="15.5" r="5.5" /><path d="M21 2l-9.6 9.6" /><path d="M15.5 7.5l3 3" /></svg>;
    case 'parking':
      return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={style}><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C2.0 10.9 2 11.5 2 11.5V16c0 .6.4 1 1 1h2" /><circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" /></svg>;
    case 'exam':
      return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={style}><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
    case 'image':
      return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0EA5E9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={style}><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>;
    case 'audio':
      return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={style}><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /></svg>;
    case 'file':
      return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={style}><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>;
    default:
      return null;
  }
};

const getNoteSnippet = (note, t) => {
  if (note.isLocked) {
    return (
      <span style={{ fontStyle: 'italic', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center' }}>
        <LockIcon /> {cleanText(t('lockedContent'))}
      </span>
    );
  }

  const blocks = note.blocks || [];
  
  const textBlock = blocks.find(b => {
    if (!b || b.type !== 'text') return false;
    const clean = (b.content || '')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/gi, ' ')
      .replace(/[\u200B\u8203\r\n]/g, '')
      .trim();
    return clean.length > 0;
  });

  if (textBlock && textBlock.content) {
    const cleanTextStr = textBlock.content
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/gi, ' ')
      .replace(/[\u200B\u8203\r\n]/g, '')
      .trim();
    if (cleanTextStr) return cleanTextStr;
  }

  // 2. Metin boşsa ilk eklentiye/bloğa bak ve eklenti adını şık SVG ile göster
  const firstWidget = blocks.find(b => b && b.type && b.type !== 'text');
  if (firstWidget) {
    let label = '';
    switch (firstWidget.type) {
      case 'debt':
        label = `${cleanText(t('debtTracking'))}${firstWidget.name ? `: ${firstWidget.name}` : ''}`;
        break;
      case 'todo':
        label = `${cleanText(t('todoList'))}${firstWidget.title ? `: ${firstWidget.title}` : ''}`;
        break;
      case 'bill':
        label = `${cleanText(t('billTracking'))}${firstWidget.name ? `: ${firstWidget.name}` : ''}`;
        break;
      case 'split':
        label = cleanText(t('billSplitter'));
        break;
      case 'password':
        label = `${cleanText(t('myPasswords'))}${firstWidget.title ? `: ${firstWidget.title}` : ''}`;
        break;
      case 'parking':
        label = cleanText(t('whereIsMyCar'));
        break;
      case 'exam':
        label = `${cleanText(t('examTracking'))}${firstWidget.course ? `: ${firstWidget.course}` : ''}`;
        break;
      case 'image':
        label = 'Görsel';
        break;
      case 'audio':
        label = 'Ses Kaydı';
        break;
      case 'file':
        label = firstWidget.name || 'Dosya';
        break;
      default:
        label = cleanText(t('emptyContent'));
        break;
    }

    return (
      <span style={{ display: 'inline-flex', alignItems: 'center' }}>
        <SnippetIcon type={firstWidget.type} />
        {label}
      </span>
    );
  }

  // 3. Hiçbir içerik yoksa
  return <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>{cleanText(t('emptyContent'))}</span>;
};

const getBadgeCountdown = (targetTimeMs, nowMs) => {
  const diffMs = targetTimeMs - nowMs;
  if (diffMs <= 0) return null;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  const hours = diffHour % 24;
  const mins = diffMin % 60;
  const secs = diffSec % 60;

  if (diffDay > 0) {
    return `${diffDay}g ${hours}sa`;
  } else if (diffHour > 0) {
    return `${diffHour}sa ${mins}dk`;
  } else if (diffMin > 0) {
    return `${diffMin}dk ${secs}s`;
  } else {
    return `${diffSec}s`;
  }
};

const NotesGrid = ({
  visibleNotes,
  reminders,
  activeMenuNoteId,
  setActiveMenuNoteId,
  requestBiometricAuth,
  setNotes,
  persistNotes,
  setToast,
  getRemainingTimeText,
  handleMoveToTrash,
  openEditingNote,
  setReminderNoteId,
  setShowReminderModal,
  handleCancelReminder,
  setActiveShareNoteId,
  setNudgeTargetNote,
  checkAndRequestNotificationPermission,
  lang,
  t
}) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const sortedNotes = [...(visibleNotes || [])].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return (b.updatedAt || 0) - (a.updatedAt || 0);
  });

  return (
    <div className="animate-slide-up">
      <div className="section-title">
        <h2>{t('allNotes')}</h2>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{sortedNotes.length} {t('notes')}</span>
      </div>

      <div className="note-list">
        {sortedNotes.length > 0 ? (
          sortedNotes.map(note => {
            const netDebt = (note.debts || []).reduce((acc, curr) => acc + curr.amount, 0);

            return (
              <div
                key={note.id}
                className="glass-panel-interactive note-card"
                style={{ position: 'relative', zIndex: activeMenuNoteId === note.id ? 10 : 1 }}
                onClick={async () => {
                  if (note.isLocked) {
                    const ok = await requestBiometricAuth(
                      t('noteLocked'),
                      t('authToOpenNote')
                    );
                    if (!ok) {
                      setToast({ title: '🔒', msg: t('authFailed') });
                      return;
                    }
                  }
                  window.history.pushState({ page: 'editor', noteId: note.id }, '');
                  openEditingNote(note);
                }}
              >
                <div className="note-card-header" style={{ position: 'relative' }}>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-primary)' }}>
                      {note.title || t('untitledNote')}
                    </h3>
                    <div className="note-badges" style={{ marginTop: '4px' }}>
                      {note.isPinned && (
                        <span className="badge badge-shared" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8B5CF6', display: 'inline-flex', alignItems: 'center' }}>
                          <PinIcon /> {cleanText(t('pinnedBadge') || 'Sabitlendi')}
                        </span>
                      )}
                      {note.isLocked && (
                        <span className="badge badge-reminder" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', display: 'inline-flex', alignItems: 'center' }}>
                          <LockIcon /> {cleanText(t('locked'))}
                        </span>
                      )}
                      {note.isShared && (
                        note.sharedFrom ? (
                          <span className="badge badge-shared" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8B5CF6' }}>
                            📥 {note.sharedFromName || note.sharedFrom || cleanText(t('sharedWithMe') || 'Gelen')}
                          </span>
                        ) : (
                          <span className="badge badge-shared" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981' }}>
                            📤 {cleanText(t('ownerBadge') || 'Sahip')}
                          </span>
                        )
                      )}
                      {(() => {
                        const activeRem = reminders.find(r => r.noteId === note.id && r.active && new Date(r.time).getTime() > now);
                        if (!activeRem) return null;
                        const targetMs = new Date(activeRem.time).getTime();
                        const countdownStr = getBadgeCountdown(targetMs, now);
                        const isNotif = activeRem.modes?.notification;
                        const isAlarm = activeRem.modes?.alarm;
                        let modeLabel = cleanText(t('reminderLabel'));
                        if (isNotif && isAlarm) {
                          modeLabel += `: ${cleanText(t('notificationAndAlarm'))}`;
                        } else if (isAlarm) {
                          modeLabel += `: ${cleanText(t('alarmType'))}`;
                        } else if (isNotif) {
                          modeLabel += `: ${cleanText(t('notificationType'))}`;
                        }
                        const fullText = countdownStr ? `${modeLabel} (${countdownStr})` : modeLabel;
                        return (
                          <span className="badge badge-reminder" style={{ display: 'inline-flex', alignItems: 'center' }}>
                            <ClockIcon /> {fullText}
                          </span>
                        );
                      })()}
                      {note.debts && note.debts.length > 0 && (
                        <span className={`badge ${netDebt >= 0 ? 'badge-shared' : 'trash-btn-delete'}`} style={{ border: 'none', display: 'inline-flex', alignItems: 'center' }}>
                          <WalletIcon /> {netDebt > 0 ? `+${netDebt}` : netDebt} TL
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    className="three-dots-btn"
                    style={{ marginLeft: '12px', alignSelf: 'flex-start', padding: '6px' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuNoteId(activeMenuNoteId === note.id ? null : note.id);
                    }}
                  >
                    <ThreeDotsIcon />
                  </button>

                  {/* Floating Context Menu */}
                  {activeMenuNoteId === note.id && (
                    <div className="context-menu-dropdown">
                      <button
                        className="context-menu-btn"
                        onClick={async (e) => {
                          e.stopPropagation();
                          setActiveMenuNoteId(null);
                          const isLocking = !note.isLocked;
                          const title = isLocking ? t('lockNoteAuthTitle') : t('unlockNoteAuthTitle');
                          const subtitle = isLocking ? t('lockNoteAuthSub') : t('unlockNoteAuthSub');

                          const ok = await requestBiometricAuth(title, subtitle);
                          if (ok) {
                            setNotes(prev => {
                              const upd = prev.map(n => n.id === note.id ? { ...n, isLocked: isLocking, updatedAt: Date.now() } : n);
                              persistNotes(upd);
                              return upd;
                            });
                            setToast({
                              title: isLocking ? '🔒' : '🔓',
                              msg: isLocking ? t('noteLockedToast') : t('noteUnlockedToast')
                            });
                          } else {
                            setToast({ title: '⚠️', msg: t('authFailed') });
                          }
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px' }}>
                          {note.isLocked ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                              <path d="M7 11V7a5 5 0 0 1 9.9-1"/>
                            </svg>
                          ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                              <path d="M7 11V7a5 5 0 0 1 9.9-1"/>
                              <circle cx="12" cy="16" r="1" fill="currentColor"/>
                            </svg>
                          )}
                        </span>
                        {note.isLocked ? cleanText(t('unlockNote')) : cleanText(t('lockNote'))}
                      </button>
                      <button
                        className="context-menu-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuNoteId(null);
                          const isPinning = !note.isPinned;
                          setNotes(prev => {
                            const upd = prev.map(n => n.id === note.id ? { ...n, isPinned: isPinning, updatedAt: Date.now() } : n);
                            persistNotes(upd);
                            return upd;
                          });
                          setToast({
                            title: isPinning ? t('notePinnedToast') : t('noteUnpinnedToast'),
                            msg: ''
                          });
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="17" x2="12" y2="22" />
                            <path d="M5 17h14l-1.5-6H6.5L5 17z" />
                            <path d="M9 11V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v7" />
                          </svg>
                        </span>
                        {note.isPinned ? cleanText(t('unpinNote')) : cleanText(t('pinNote'))}
                      </button>
                      {(() => {
                        const activeRem = (reminders || []).find(r => r.noteId === note.id && r.active && new Date(r.time).getTime() > now);
                        return (
                          <button
                            className="context-menu-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuNoteId(null);
                              if (activeRem) {
                                if (typeof handleCancelReminder === 'function') {
                                  handleCancelReminder(activeRem);
                                }
                              } else {
                                if (typeof setReminderNoteId === 'function') setReminderNoteId(note.id);
                                if (typeof setShowReminderModal === 'function') setShowReminderModal(true);
                              }
                            }}
                          >
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px' }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="13" r="8" />
                                <polyline points="12 9 12 13 15 15" />
                                <line x1="5" y1="3" x2="2" y2="6" />
                                <line x1="19" y1="3" x2="22" y2="6" />
                              </svg>
                            </span>
                            {activeRem 
                              ? t('removeReminder')
                              : cleanText(t('remind'))
                            }
                          </button>
                        );
                      })()}
                      {!note.sharedFrom && (
                        <button
                          className="context-menu-btn"
                          onClick={async (e) => {
                            e.stopPropagation();
                            setActiveMenuNoteId(null);
                            if (checkAndRequestNotificationPermission) {
                              const granted = await checkAndRequestNotificationPermission();
                              if (!granted) return;
                            }
                            if (note.isLocked) {
                              const title = t('lockedNoteAuthTitle');
                              const subtitle = t('lockedNoteAuthSub');
                              const ok = await requestBiometricAuth(title, subtitle);
                              if (!ok) {
                                setToast?.({ title: '⚠️', msg: t('authFailed') });
                                return;
                              }
                            }
                            if (typeof setActiveShareNoteId === 'function') {
                              setActiveShareNoteId(note.id);
                            }
                          }}
                        >
                          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                              <circle cx="9" cy="7" r="4" />
                              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                          </span>
                          {cleanText(t('shareWithFriend'))}
                        </button>
                      )}
                      {(note.isShared || (note.sharedWith && note.sharedWith.length > 0) || note.sharedFrom) && (
                        <button
                          className="context-menu-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuNoteId(null);
                            if (typeof setNudgeTargetNote === 'function') {
                              setNudgeTargetNote(note);
                            }
                          }}
                        >
                          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                            </svg>
                          </span>
                          {t('sendNotifBtn')}
                        </button>
                      )}
                      <div className="context-menu-divider" />
                      <button
                        className="context-menu-btn danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuNoteId(null);
                          handleMoveToTrash(note.id);
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px' }}>
                          {note.sharedFrom ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                              <polyline points="16 17 21 12 16 7" />
                              <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                          ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                              <path d="M10 11v6"/>
                              <path d="M14 11v6"/>
                              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                            </svg>
                          )}
                        </span>
                        {note.sharedFrom ? cleanText(t('leaveCollabBtn') || 'Paylaşımdan Ayrıl') : cleanText(t('deleteBtn'))}
                      </button>
                    </div>
                  )}
                </div>
                <p className="note-card-excerpt">
                  {getNoteSnippet(note, t)}
                </p>
                <div className="note-card-footer">
                  <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })
        ) : (
          <p style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{cleanText(t('noNotesYet'))}</p>
        )}
      </div>
    </div>
  );
};

export default NotesGrid;

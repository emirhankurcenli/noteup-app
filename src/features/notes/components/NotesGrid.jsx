import React, { useState, useEffect } from 'react';
import NoteCard from './NoteCard';
import { PinnedNotesSection } from './PinnedNotesSection';
import { FolderTabBar } from './FolderTabBar';
import { cleanText, htmlToPlainText } from '@shared/utils/textUtils';
import {
  ThreeDotsIcon,
  LockIcon,
  PinIcon,
  ClockIcon,
  WalletIcon,
  OwnerIcon,
  SharedWithMeIcon,
  PendingShareIcon,
  SnippetIcon
} from '@shared/components/Icons';


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
    return htmlToPlainText(b.content).length > 0;
  });

  if (textBlock && textBlock.content) {
    const cleanTextStr = htmlToPlainText(textBlock.content);
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
  theme = 'light',
  lang,
  t
}) => {
  const isLight = theme === 'light';
  const [now, setNow] = useState(Date.now());
  const [menuDirection, setMenuDirection] = useState('down');

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!activeMenuNoteId) return;
    const handleScroll = () => setActiveMenuNoteId(null);
    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, [activeMenuNoteId, setActiveMenuNoteId]);

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
                style={{ position: 'relative', zIndex: activeMenuNoteId === note.id ? 100 : 1 }}
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
                      {note.hasPendingShare && !note.isShared && !note.sharedFrom && (
                        <span className="badge badge-reminder" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', display: 'inline-flex', alignItems: 'center' }}>
                          <PendingShareIcon /> {cleanText(t('pendingApproval') || 'Paylaşım Bekliyor')}
                        </span>
                      )}
                      {note.isShared && (
                        note.sharedFrom ? (
                          <span className="badge badge-shared" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8B5CF6', display: 'inline-flex', alignItems: 'center' }}>
                            <SharedWithMeIcon /> {note.sharedFromName || note.sharedFrom || cleanText(t('sharedWithMe') || 'Gelen')}
                          </span>
                        ) : (
                          <span className="badge badge-shared" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', display: 'inline-flex', alignItems: 'center' }}>
                            <OwnerIcon /> {cleanText(t('ownerBadge') || 'Not Sahibi')}
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
                      if (activeMenuNoteId === note.id) {
                        setActiveMenuNoteId(null);
                      } else {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const spaceBelow = window.innerHeight - rect.bottom;
                        setMenuDirection(spaceBelow < 300 ? 'up' : 'down');
                        setActiveMenuNoteId(note.id);
                      }
                    }}
                  >
                    <ThreeDotsIcon />
                  </button>

                  {/* Floating Context Menu */}
                  {activeMenuNoteId === note.id && (
                    <div className={`context-menu-dropdown ${menuDirection === 'up' ? 'open-upward' : ''}`}>
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
                          <LockIcon size={16} />
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
                          <PinIcon size={16} />
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

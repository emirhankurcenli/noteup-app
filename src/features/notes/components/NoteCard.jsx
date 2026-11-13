import React, { useState } from 'react';
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
  SnippetIcon,
} from '@shared/components/Icons';

export const formatReminderTarget = (targetTime, t = (k) => k) => {
  if (!targetTime) return '';
  const date = new Date(targetTime);
  if (isNaN(date.getTime())) return '';

  const now = new Date();
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const isToday = date.toDateString() === now.toDateString();

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  if (isToday) {
    return `${cleanText(t('today') || 'Bugün')}, ${timeStr}`;
  }
  if (isTomorrow) {
    return `${cleanText(t('tomorrow') || 'Yarın')}, ${timeStr}`;
  }

  // Same year -> "9 Kas, 22:01"
  if (date.getFullYear() === now.getFullYear()) {
    const monthDay = date.toLocaleDateString([], { day: 'numeric', month: 'short' });
    return `${monthDay}, ${timeStr}`;
  }

  // Different year -> "9 Kas 2027, 22:01"
  const fullDate = date.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
  return `${fullDate}, ${timeStr}`;
};

export const ReminderBadge = React.memo(({ activeRem, t }) => {
  if (!activeRem || !activeRem.time) return null;

  const targetFormatted = formatReminderTarget(activeRem.time, t);
  if (!targetFormatted) return null;

  const isNotif = activeRem.modes?.notification;
  const isAlarm = activeRem.modes?.alarm;

  let modeTag = '';
  if (isNotif && isAlarm) {
    modeTag = ` (${cleanText(t('notificationAndAlarm') || 'Bildirim & Alarm')})`;
  } else if (isAlarm) {
    modeTag = ` (${cleanText(t('alarmType') || 'Alarm')})`;
  } else if (isNotif) {
    modeTag = ` (${cleanText(t('notificationType') || 'Bildirim')})`;
  }

  return (
    <span
      className="badge badge-reminder"
      style={{ display: 'inline-flex', alignItems: 'center' }}
      title={activeRem.time}
    >
      <ClockIcon /> {targetFormatted}{modeTag}
    </span>
  );
});

export const getNoteSnippet = (note, t = (k) => k) => {
  if (note.isLocked) {
    return (
      <span style={{ fontStyle: 'italic', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center' }}>
        <LockIcon /> {cleanText(t('lockedContent'))}
      </span>
    );
  }

  const blocks = note.blocks || [];

  const textBlock = blocks.find((b) => {
    if (!b || b.type !== 'text') return false;
    return htmlToPlainText(b.content).length > 0;
  });

  if (textBlock && textBlock.content) {
    const cleanTextStr = htmlToPlainText(textBlock.content);
    if (cleanTextStr) return cleanTextStr;
  }

  const firstWidget = blocks.find((b) => b && b.type && b.type !== 'text');
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

  return <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>{cleanText(t('emptyContent'))}</span>;
};

const NoteCardComponent = ({
  note,
  activeMenuNoteId,
  setActiveMenuNoteId,
  requestBiometricAuth,
  setNotes,
  persistNotes,
  setToast,
  handleMoveToTrash,
  openEditingNote,
  setReminderNoteId,
  setShowReminderModal,
  handleCancelReminder,
  setActiveShareNoteId,
  setNudgeTargetNote,
  checkAndRequestNotificationPermission,
  reminders = [],
  now = Date.now(),
  lang = 'tr',
  t = (k) => k,
}) => {
  const [menuDirection, setMenuDirection] = useState('down');

  const netDebt = (note.debts || []).reduce((acc, curr) => acc + (curr?.amount || 0), 0);
  const activeRem = (reminders || []).find(
    (r) => r && r.noteId === note.id && r.active && new Date(r.time).getTime() > Date.now()
  );

  const handleCardClick = async () => {
    if (note.isLocked) {
      if (typeof requestBiometricAuth === 'function') {
        const ok = await requestBiometricAuth(t('noteLocked'), t('authToOpenNote'));
        if (!ok) {
          if (typeof setToast === 'function') {
            setToast({ title: '🔒', msg: t('authFailed') });
          }
          return;
        }
      }
    }
    window.history.pushState({ page: 'editor', noteId: note.id }, '');
    if (typeof openEditingNote === 'function') {
      openEditingNote(note);
    }
  };

  const handleToggleMenu = (e) => {
    e.stopPropagation();
    if (activeMenuNoteId === note.id) {
      if (typeof setActiveMenuNoteId === 'function') setActiveMenuNoteId(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setMenuDirection(spaceBelow < 300 ? 'up' : 'down');
      if (typeof setActiveMenuNoteId === 'function') setActiveMenuNoteId(note.id);
    }
  };

  return (
    <div
      className="glass-panel-interactive note-card"
      style={{ position: 'relative', zIndex: activeMenuNoteId === note.id ? 100 : 1 }}
      onClick={handleCardClick}
    >
      <div className="note-card-header" style={{ position: 'relative' }}>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <h3
            style={{
              fontSize: '1.05rem',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              color: 'var(--text-primary)',
            }}
          >
            {note.title || t('untitledNote')}
          </h3>
          <div className="note-badges" style={{ marginTop: '4px' }}>
            {note.isPinned && (
              <span
                className="badge badge-shared"
                style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8B5CF6', display: 'inline-flex', alignItems: 'center' }}
              >
                <PinIcon /> {cleanText(t('pinnedBadge') || 'Sabitlendi')}
              </span>
            )}
            {note.isLocked && (
              <span
                className="badge badge-reminder"
                style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', display: 'inline-flex', alignItems: 'center' }}
              >
                <LockIcon /> {cleanText(t('locked'))}
              </span>
            )}
            {note.hasPendingShare && !note.isShared && !note.sharedFrom && (
              <span
                className="badge badge-reminder"
                style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', display: 'inline-flex', alignItems: 'center' }}
              >
                <PendingShareIcon /> {cleanText(t('pendingApproval') || 'Paylaşım Bekliyor')}
              </span>
            )}
            {note.isShared &&
              (note.sharedFrom ? (
                <span
                  className="badge badge-shared"
                  style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8B5CF6', display: 'inline-flex', alignItems: 'center' }}
                >
                  <SharedWithMeIcon /> {note.sharedFromName || note.sharedFrom || cleanText(t('sharedWithMe') || 'Gelen')}
                </span>
              ) : (
                <span
                  className="badge badge-shared"
                  style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', display: 'inline-flex', alignItems: 'center' }}
                >
                  <OwnerIcon /> {cleanText(t('ownerBadge') || 'Not Sahibi')}
                </span>
              ))}
            {note.sharedFrom && note.permission === 'view' && (
              <span
                className="badge"
                style={{ background: 'rgba(59, 130, 246, 0.14)', color: '#3B82F6', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                {t('viewOnlyBadge') !== 'viewOnlyBadge' ? cleanText(t('viewOnlyBadge')) : (lang === 'tr' ? 'Salt Okunur' : 'View Only')}
              </span>
            )}
            {activeRem && <ReminderBadge activeRem={activeRem} t={t} />}
            {note.debts && note.debts.length > 0 && (
              <span
                className={`badge ${netDebt >= 0 ? 'badge-shared' : 'trash-btn-delete'}`}
                style={{ border: 'none', display: 'inline-flex', alignItems: 'center' }}
              >
                <WalletIcon /> {netDebt > 0 ? `+${netDebt}` : netDebt} TL
              </span>
            )}
          </div>
        </div>

        {typeof setActiveMenuNoteId === 'function' && (
          <button
            className="three-dots-btn"
            style={{ marginLeft: '12px', alignSelf: 'flex-start', padding: '6px' }}
            onClick={handleToggleMenu}
          >
            <ThreeDotsIcon />
          </button>
        )}

        {/* Floating Context Menu */}
        {activeMenuNoteId === note.id && (
          <div className={`context-menu-dropdown ${menuDirection === 'up' ? 'open-upward' : ''}`}>
            {/* Lock / Unlock */}
            <button
              className="context-menu-btn"
              onClick={async (e) => {
                e.stopPropagation();
                if (typeof setActiveMenuNoteId === 'function') setActiveMenuNoteId(null);
                const isLocking = !note.isLocked;
                const title = isLocking ? t('lockNoteAuthTitle') : t('unlockNoteAuthTitle');
                const subtitle = isLocking ? t('lockNoteAuthSub') : t('unlockNoteAuthSub');

                if (typeof requestBiometricAuth === 'function') {
                  const ok = await requestBiometricAuth(title, subtitle);
                  if (ok) {
                    if (typeof setNotes === 'function') {
                      setNotes((prev) => {
                        const upd = prev.map((n) =>
                          n.id === note.id ? { ...n, isLocked: isLocking, updatedAt: Date.now() } : n
                        );
                        if (typeof persistNotes === 'function') persistNotes(upd);
                        return upd;
                      });
                    }
                    if (typeof setToast === 'function') {
                      setToast({
                        title: isLocking ? '🔒' : '🔓',
                        msg: isLocking ? t('noteLockedToast') : t('noteUnlockedToast'),
                      });
                    }
                  } else {
                    if (typeof setToast === 'function') {
                      setToast({ title: '⚠️', msg: t('authFailed') });
                    }
                  }
                }
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px' }}>
                <LockIcon size={16} />
              </span>
              {note.isLocked ? cleanText(t('unlockNote')) : cleanText(t('lockNote'))}
            </button>

            {/* Pin / Unpin */}
            <button
              className="context-menu-btn"
              onClick={(e) => {
                e.stopPropagation();
                if (typeof setActiveMenuNoteId === 'function') setActiveMenuNoteId(null);
                const isPinning = !note.isPinned;
                if (typeof setNotes === 'function') {
                  setNotes((prev) => {
                    const upd = prev.map((n) =>
                      n.id === note.id ? { ...n, isPinned: isPinning, updatedAt: Date.now() } : n
                    );
                    if (typeof persistNotes === 'function') persistNotes(upd);
                    return upd;
                  });
                }
                if (typeof setToast === 'function') {
                  setToast({
                    title: isPinning ? t('notePinnedToast') : t('noteUnpinnedToast'),
                    msg: '',
                  });
                }
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px' }}>
                <PinIcon size={16} />
              </span>
              {note.isPinned ? cleanText(t('unpinNote')) : cleanText(t('pinNote'))}
            </button>

            {/* Reminder */}
            <button
              className="context-menu-btn"
              onClick={(e) => {
                e.stopPropagation();
                if (typeof setActiveMenuNoteId === 'function') setActiveMenuNoteId(null);
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
              {activeRem ? t('removeReminder') : cleanText(t('remind'))}
            </button>

            {/* Share with Friend */}
            {!note.sharedFrom && typeof setActiveShareNoteId === 'function' && (
              <button
                className="context-menu-btn"
                onClick={async (e) => {
                  e.stopPropagation();
                  if (typeof setActiveMenuNoteId === 'function') setActiveMenuNoteId(null);
                  if (checkAndRequestNotificationPermission) {
                    const granted = await checkAndRequestNotificationPermission();
                    if (!granted) return;
                  }
                  if (note.isLocked && typeof requestBiometricAuth === 'function') {
                    const title = t('lockedNoteAuthTitle');
                    const subtitle = t('lockedNoteAuthSub');
                    const ok = await requestBiometricAuth(title, subtitle);
                    if (!ok) {
                      setToast?.({ title: '⚠️', msg: t('authFailed') });
                      return;
                    }
                  }
                  setActiveShareNoteId(note.id);
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

            {/* Nudge / Send Notification */}
            {(note.isShared || (note.sharedWith && note.sharedWith.length > 0) || note.sharedFrom) &&
              typeof setNudgeTargetNote === 'function' && (
                <button
                  className="context-menu-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (typeof setActiveMenuNoteId === 'function') setActiveMenuNoteId(null);
                    setNudgeTargetNote(note);
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                  </span>
                  {cleanText(t('sendNotifBtn'))}
                </button>
              )}

            <div className="context-menu-divider" />

            {/* Move to Trash / Leave Collab */}
            {typeof handleMoveToTrash === 'function' && (
              <button
                className="context-menu-btn danger"
                onClick={(e) => {
                  e.stopPropagation();
                  if (typeof setActiveMenuNoteId === 'function') setActiveMenuNoteId(null);
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
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6" />
                      <path d="M14 11v6" />
                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                    </svg>
                  )}
                </span>
                {note.sharedFrom ? cleanText(t('leaveCollabBtn') || 'Paylaşımdan Ayrıl') : cleanText(t('deleteBtn'))}
              </button>
            )}
          </div>
        )}
      </div>

      <p className="note-card-excerpt">{getNoteSnippet(note, t)}</p>

      <div className="note-card-footer">
        <span>{new Date(note.updatedAt || Date.now()).toLocaleDateString()}</span>
      </div>
    </div>
  );
};

export const NoteCard = React.memo(NoteCardComponent, (prevProps, nextProps) => {
  if (prevProps.note !== nextProps.note) return false;
  if (prevProps.activeMenuNoteId !== nextProps.activeMenuNoteId) {
    if (prevProps.activeMenuNoteId === prevProps.note.id || nextProps.activeMenuNoteId === nextProps.note.id) {
      return false;
    }
  }
  if (prevProps.theme !== nextProps.theme) return false;
  if (prevProps.lang !== nextProps.lang) return false;
  const prevRem = prevProps.reminders?.find((r) => r?.noteId === prevProps.note.id);
  const nextRem = nextProps.reminders?.find((r) => r?.noteId === nextProps.note.id);
  if (prevRem !== nextRem) return false;
  return true;
});
export default NoteCard;

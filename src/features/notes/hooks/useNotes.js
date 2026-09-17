import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@src/supabaseClient';
import { cancelLocalNotification } from '@shared/services/notificationService';
import { registerPlugin } from '@capacitor/core';
import useNoteUndoRedo from '@features/notes/hooks/useNoteUndoRedo';
import { sanitizeNoteContent, sanitizeSingleLine, noteHasPasswordVault } from '@shared/utils/securityUtils';
import { mergeNoteBlocks, ensureBlockTimestamps, enforceTrailingTextBlock } from '@shared/utils/blockMergeUtils';
import { cleanText } from '@shared/utils/textUtils';
import { isR2MediaUrl } from '@shared/utils/mediaUtils';
import { STORAGE_KEYS } from '@shared/utils/storageKeys';
import useNotesPersistence from '@features/notes/hooks/useNotesPersistence';

export default function useNotes({
  user,
  notes,
  setNotes,
  reminders,
  setReminders,
  setToast,
  getUserScopedKey,
  t,
  setConfirmDialog,
  deleteFromR2,
  requestBiometricAuth,
  lang,
  myCode,
  handleLeaveShare
}) {
  // --- STATES ---
  const [editingNote, setEditingNote] = useState(null);
  const [lastEditingNoteId, setLastEditingNoteId] = useState(null);
  const [activeFormatBlockId, setActiveFormatBlockId] = useState(null);
  const [showFormatToolbar, setShowFormatToolbar] = useState(false);

  // --- PERSISTENCE (Delegated to Single-Responsibility Hook) ---
  const { persistNotes, debouncedPersistNotes, flushPersist, saveNotes } = useNotesPersistence({
    user,
    getUserScopedKey,
    setNotes
  });


  // Realtime Live Synchronization for Editing Note and Share Statuses (Block-Level Merging)

  useEffect(() => {
    const handleLiveNoteUpdate = (e) => {
      const updatedNote = e.detail;
      if (!updatedNote || !updatedNote.id) return;

      if (updatedNote.deletedAt) {
        // Close editor if this note is open
        setEditingNote((prev) => (prev && prev.id === updatedNote.id ? null : prev));
        // Move note to trash (keep in state with deletedAt) instead of removing entirely
        setNotes((prevNotes) => {
          const index = prevNotes.findIndex((n) => n.id === updatedNote.id);
          if (index === -1) return prevNotes;
          const updated = [...prevNotes];
          updated[index] = { ...updated[index], deletedAt: updatedNote.deletedAt };
          try {
            const key = getUserScopedKey(STORAGE_KEYS.NOTES);
            localStorage.setItem(key, JSON.stringify(updated));
          } catch (_) {}
          return updated;
        });
        return;
      }

      setEditingNote((prev) => {
        if (prev && prev.id === updatedNote.id) {
          if (prev.updatedAt && updatedNote.updatedAt && prev.updatedAt > updatedNote.updatedAt) {
            return prev;
          }
          const mergedBlocks = mergeNoteBlocks(prev.blocks, updatedNote.blocks);
          return {
            ...prev,
            title: updatedNote.title !== undefined ? updatedNote.title : prev.title,
            blocks: mergedBlocks,
            isShared: updatedNote.isShared !== undefined ? updatedNote.isShared : prev.isShared,
            updatedAt: updatedNote.updatedAt || Date.now(),
          };
        }
        return prev;
      });

      setNotes((prevNotes) => {
        const index = prevNotes.findIndex((n) => n.id === updatedNote.id);
        if (index === -1) {
          return prevNotes;
        }

        const existing = prevNotes[index];
        if (existing.updatedAt && updatedNote.updatedAt && existing.updatedAt > updatedNote.updatedAt) {
          return prevNotes;
        }

        const mergedBlocks = mergeNoteBlocks(existing.blocks, updatedNote.blocks);
        const updated = [...prevNotes];
        updated[index] = {
          ...existing,
          title: updatedNote.title !== undefined ? updatedNote.title : existing.title,
          blocks: mergedBlocks,
          isShared: updatedNote.isShared !== undefined ? updatedNote.isShared : existing.isShared,
          updatedAt: updatedNote.updatedAt || Date.now(),
        };

        try {
          const key = getUserScopedKey(STORAGE_KEYS.NOTES);
          localStorage.setItem(key, JSON.stringify(updated));
        } catch (_) {}

        return updated;
      });
    };

    const handleRevokedOrRemoved = (e) => {
      const { noteId } = e.detail || {};
      if (!noteId) return;

      setEditingNote((prev) => (prev && prev.id === noteId ? null : prev));
      setNotes((prevNotes) => {
        const filtered = prevNotes.filter((n) => n.id !== noteId);
        try {
          const key = getUserScopedKey(STORAGE_KEYS.NOTES);
          localStorage.setItem(key, JSON.stringify(filtered));
        } catch (_) {}
        return filtered;
      });
    };

    const handleInviteAccepted = (e) => {
      const { noteId, collaboratorCode } = e.detail || {};
      if (!noteId || !collaboratorCode) return;

      setNotes((prevNotes) => {
        const updated = prevNotes.map((n) => {
          if (n.id === noteId) {
            const prevShared = Array.isArray(n.sharedWith) ? n.sharedWith : [];
            const prevPending = Array.isArray(n.pendingShares) ? n.pendingShares : [];
            const nextShared = prevShared.includes(collaboratorCode) ? prevShared : [...prevShared, collaboratorCode];
            const nextPending = prevPending.filter((c) => c !== collaboratorCode);
            return {
              ...n,
              isShared: true,
              sharedWith: nextShared,
              pendingShares: nextPending,
              hasPendingShare: nextPending.length > 0,
              updatedAt: Date.now(),
            };
          }
          return n;
        });
        persistNotes(updated);
        return updated;
      });

      setEditingNote((prev) => {
        if (prev && prev.id === noteId) {
          const prevShared = Array.isArray(prev.sharedWith) ? prev.sharedWith : [];
          const prevPending = Array.isArray(prev.pendingShares) ? prev.pendingShares : [];
          const nextShared = prevShared.includes(collaboratorCode) ? prevShared : [...prevShared, collaboratorCode];
          const nextPending = prevPending.filter((c) => c !== collaboratorCode);
          return {
            ...prev,
            isShared: true,
            sharedWith: nextShared,
            pendingShares: nextPending,
            hasPendingShare: nextPending.length > 0,
            updatedAt: Date.now(),
          };
        }
        return prev;
      });
    };

    const handleInviteRejected = (e) => {
      const { noteId, collaboratorCode } = e.detail || {};
      if (!noteId || !collaboratorCode) return;

      setNotes((prevNotes) => {
        const updated = prevNotes.map((n) => {
          if (n.id === noteId) {
            const prevShared = Array.isArray(n.sharedWith) ? n.sharedWith : [];
            const prevPending = Array.isArray(n.pendingShares) ? n.pendingShares : [];
            const nextShared = prevShared.filter((c) => c !== collaboratorCode);
            const nextPending = prevPending.filter((c) => c !== collaboratorCode);
            const isStillShared = nextShared.length > 0;
            return {
              ...n,
              isShared: isStillShared,
              sharedWith: nextShared,
              pendingShares: nextPending,
              hasPendingShare: nextPending.length > 0,
              updatedAt: Date.now(),
            };
          }
          return n;
        });
        persistNotes(updated);
        return updated;
      });

      setEditingNote((prev) => {
        if (prev && prev.id === noteId) {
          const prevShared = Array.isArray(prev.sharedWith) ? prev.sharedWith : [];
          const prevPending = Array.isArray(prev.pendingShares) ? prev.pendingShares : [];
          const nextShared = prevShared.filter((c) => c !== collaboratorCode);
          const nextPending = prevPending.filter((c) => c !== collaboratorCode);
          return {
            ...prev,
            isShared: nextShared.length > 0,
            sharedWith: nextShared,
            pendingShares: nextPending,
            hasPendingShare: nextPending.length > 0,
            updatedAt: Date.now(),
          };
        }
        return prev;
      });
    };

    const handleOutgoingSharesSynced = (e) => {
      const { shares } = e.detail || {};
      if (!Array.isArray(shares)) return;

      setNotes((prevNotes) => {
        let changed = false;
        const updated = prevNotes.map((n) => {
          if (n.sharedFrom) return n; // Skip notes owned by others

          const noteShares = shares.filter((s) => s.note_id === n.id);
          if (noteShares.length === 0 && !n.isShared && (!n.sharedWith || n.sharedWith.length === 0) && (!n.pendingShares || n.pendingShares.length === 0)) {
            return n;
          }

          const acceptedCodes = noteShares.filter((s) => s.status === 'accepted').map((s) => s.to_code);
          const pendingCodes = noteShares.filter((s) => s.status === 'pending').map((s) => s.to_code);
          const isShared = acceptedCodes.length > 0;
          const hasPendingShare = pendingCodes.length > 0;

          const isDiff =
            n.isShared !== isShared ||
            JSON.stringify(n.sharedWith || []) !== JSON.stringify(acceptedCodes) ||
            JSON.stringify(n.pendingShares || []) !== JSON.stringify(pendingCodes);

          if (isDiff) {
            changed = true;
            return {
              ...n,
              isShared,
              sharedWith: acceptedCodes,
              pendingShares: pendingCodes,
              hasPendingShare,
            };
          }
          return n;
        });

        if (changed) {
          try {
            const key = getUserScopedKey(STORAGE_KEYS.NOTES);
            localStorage.setItem(key, JSON.stringify(updated));
          } catch (_) {}
          return updated;
        }
        return prevNotes;
      });
    };

    window.addEventListener('noteup_shared_note_live_update', handleLiveNoteUpdate);
    window.addEventListener('noteup_shared_note_revoked', handleRevokedOrRemoved);
    window.addEventListener('noteup_shared_note_removed', handleRevokedOrRemoved);
    window.addEventListener('noteup_shared_invite_accepted', handleInviteAccepted);
    window.addEventListener('noteup_shared_invite_rejected', handleInviteRejected);
    window.addEventListener('noteup_outgoing_shares_synced', handleOutgoingSharesSynced);

    return () => {
      window.removeEventListener('noteup_shared_note_live_update', handleLiveNoteUpdate);
      window.removeEventListener('noteup_shared_note_revoked', handleRevokedOrRemoved);
      window.removeEventListener('noteup_shared_note_removed', handleRevokedOrRemoved);
      window.removeEventListener('noteup_shared_invite_accepted', handleInviteAccepted);
      window.removeEventListener('noteup_shared_invite_rejected', handleInviteRejected);
      window.removeEventListener('noteup_outgoing_shares_synced', handleOutgoingSharesSynced);
    };
  }, []);

  // --- OTOMATİK ÇÖPKUTUSU TEMİZLEME ---
  // Çöp kutusunda 30 günden fazla kalan notları kalıcı olarak sil.
  // Uygulama açılışında bir kez çalışır (user veya notes değiştiğinde de tetiklenir).
  useEffect(() => {
    if (!user || !user.uid || !notes || notes.length === 0) return;

    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
    const now = Date.now();

    const expiredNotes = notes.filter(
      n => n.deletedAt && (now - n.deletedAt) >= THIRTY_DAYS_MS
    );

    if (expiredNotes.length === 0) return;

    const expiredIds = expiredNotes.map(n => n.id);

    // localStorage ve state'ten kaldır
    setNotes(prevNotes => {
      const remaining = prevNotes.filter(n => !expiredIds.includes(n.id));
      try {
        const key = getUserScopedKey(STORAGE_KEYS.NOTES);
        localStorage.setItem(key, JSON.stringify(remaining));
      } catch (_) {}
      return remaining;
    });

    // Supabase'den kalıcı olarak sil
    (async () => {
      try {
        await supabase.from('notes').delete().in('id', expiredIds);
        await supabase.from('note_shares').delete().in('note_id', expiredIds);
      } catch (err) {
        console.warn('[AutoTrashClean] Supabase cleanup error:', err);
      }
    })();

  }, [user?.uid]); // Sadece user değişince tetikle — notes'u dep'e almak döngü yaratır

  // --- HELPERS ---



  // --- SUB-HOOKS ---
  const undoRedo = useNoteUndoRedo({
    editingNote,
    setEditingNote,
    setNotes,
    persistNotes,
  });

  // --- ACTIONS ---
  const handleCreateNote = () => {
    const firstBlockId = 'b-' + Date.now();
    const newNote = {
      id: 'n-' + Date.now(),
      title: '',
      blocks: [{ id: firstBlockId, type: 'text', content: '' }],
      isShared: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    setNotes(prevNotes => {
      const updated = [newNote, ...prevNotes];
      persistNotes(updated);
      return updated;
    });

    window.history.pushState({ page: 'editor', noteId: newNote.id }, '');
    setEditingNote(newNote);
  };

  const handleUpdateNote = (field, value, instantHistory = false) => {
    setEditingNote(prevEditingNote => {
      if (!prevEditingNote) return null;

      let cleanValue = value;
      if (field === 'title' && typeof value === 'string') {
        cleanValue = sanitizeSingleLine(value, 150, false);
      } else if (field === 'blocks' && Array.isArray(value)) {
        cleanValue = value.map(b => {
          if (!b) return b;
          if (b.type === 'text' && typeof b.content === 'string') {
            return { ...b, content: sanitizeNoteContent(b.content) };
          }
          return b;
        });
      }

      const finalBlocks = (field === 'blocks' && Array.isArray(cleanValue)) 
        ? enforceTrailingTextBlock(cleanValue) 
        : (prevEditingNote.blocks || []);

      const updatedNote = {
        ...prevEditingNote,
        [field]: cleanValue,
        blocks: finalBlocks,
        updatedAt: Date.now()
      };

      if (field === 'title' || field === 'blocks') {
        if (instantHistory) {
          undoRedo.captureUndoSnapshot(prevEditingNote);
          undoRedo.isTypingRef.current = false;
        } else {
          const getNoteTotalLength = (note) => {
            if (!note) return 0;
            const titleLen = (note.title || '').length;
            const blocksLen = (note.blocks || []).reduce((acc, b) => acc + (b.content || '').length, 0);
            return titleLen + blocksLen;
          };

          const prevLength = getNoteTotalLength(prevEditingNote);
          const newLength = getNoteTotalLength(updatedNote);
          const diff = Math.abs(newLength - undoRedo.lastLengthRef.current);

          let lastChar = '';
          if (field === 'title') {
            lastChar = (value || '').slice(-1);
          } else if (field === 'blocks' && Array.isArray(value)) {
            const prevBlocks = prevEditingNote.blocks || [];
            const modifiedBlock = value.find((b, i) => prevBlocks[i] && prevBlocks[i].content !== b.content);
            if (modifiedBlock) {
              lastChar = (modifiedBlock.content || '').slice(-1);
            }
          }

          const isBoundary = lastChar === ' ' || lastChar === '.' || lastChar === ',' || lastChar === '?' || lastChar === '!' || lastChar === '\n';

          if (!undoRedo.isTypingRef.current) {
            undoRedo.captureUndoSnapshot(prevEditingNote);
            undoRedo.isTypingRef.current = true;
            undoRedo.lastLengthRef.current = prevLength;
          } else if (diff >= 6 || isBoundary) {
            undoRedo.captureUndoSnapshot(prevEditingNote);
            undoRedo.lastLengthRef.current = newLength;
          }

          if (undoRedo.undoTimeoutRef.current) clearTimeout(undoRedo.undoTimeoutRef.current);
          undoRedo.undoTimeoutRef.current = setTimeout(() => {
            undoRedo.isTypingRef.current = false;
          }, 1200);
        }
      }

      setNotes(prevNotes => {
        const updatedNotes = prevNotes.map(n => n.id === prevEditingNote.id ? updatedNote : n);
        // Debounce: Her tus vurusunda degil, 1500ms duraklama sonrasi Supabase'e yazar
        debouncedPersistNotes(updatedNotes);
        return updatedNotes;
      });

      return updatedNote;
    });
  };

  const handleMoveToTrash = async (noteId) => {
    const targetNote = (notes || []).find(n => n.id === noteId);
    if (!targetNote) return;

    // Rule: If user is NOT the owner (sharedFrom exists), prompt to leave share instead of moving to trash!
    if (targetNote.sharedFrom) {
      setConfirmDialog({
        title: t('leaveCollabTitle') || 'Paylaşımdan Ayrıl',
        message: t('leaveCollabMsg') || 'Bu notun sahibi siz değilsiniz. Notu çöp kutusuna taşıyamazsınız, fakat paylaşımdan ayrılabilirsiniz. Not listenizden kaldırılacaktır.',
        icon: '👋',
        confirmText: t('leaveCollabBtn') || 'Paylaşımdan Ayrıl',
        cancelText: t('confirmCancel') || 'Vazgeç',
        danger: true,
        onConfirm: async () => {
          if (typeof handleLeaveShare === 'function') {
            await handleLeaveShare(noteId);
          } else {
            try {
              if (myCode) {
                await supabase.from('note_shares').delete().eq('note_id', noteId).eq('to_code', myCode);
              }
            } catch (err) {}
            const updatedNotes = (notes || []).filter(n => n.id !== noteId);
            saveNotes(updatedNotes);
            setToast?.({
              title: "👋 Paylaşımdan Ayrıldınız",
              msg: `"${targetNote.title || 'Not'}" listenizden kaldırıldı.`
            });
          }

          if (editingNote?.id === noteId) {
            if (window.history.state && window.history.state.page === 'editor') {
              window.history.replaceState({ page: 'root' }, '');
            }
            setEditingNote(null);
          }
        }
      });
      return;
    }

    // Standard trash logic for owned notes...
    const hasPasswordVault = noteHasPasswordVault(targetNote);
    const requiresBiometric = targetNote.isLocked || hasPasswordVault;

    if (requiresBiometric && typeof requestBiometricAuth === 'function') {
      const authTitle = hasPasswordVault
        ? (lang === 'tr' ? '🔑 Şifre Kasası Güvenliği' : '🔑 Password Vault Security')
        : (lang === 'tr' ? '🔒 Kilitli Notu Sil' : '🔒 Delete Locked Note');

      const authSub = hasPasswordVault
        ? (lang === 'tr' ? 'Bu not kayıtlı hesap şifreleri içermektedir. Notu silmek için parmak izinizi veya telefon şifrenizi doğrulayın.' : 'This note contains saved passwords. Authenticate to delete.')
        : (lang === 'tr' ? 'Kilitli notu silmek için parmak izi, yüz tanıma veya telefon şifrenizi girin.' : 'Authenticate to delete locked note.');

      const ok = await requestBiometricAuth(authTitle, authSub);
      if (!ok) {
        if (typeof setToast === 'function') setToast({ title: '⚠️', msg: t('authFailed') || (lang === 'tr' ? 'Doğrulama Başarısız' : 'Authentication Failed') });
        return;
      }
    }

    const trashMessage = hasPasswordVault
      ? (lang === 'tr' ? '⚠️ Bu not kayıtlı hesap şifreleri (Şifre Kasası) içermektedir. Çöp kutusuna taşımak istediğinize emin misiniz?' : '⚠️ This note contains saved passwords (Password Vault). Are you sure you want to move it to trash?')
      : '';

    setConfirmDialog({
      title: t('confirmMoveTrashTitle'),
      message: trashMessage,
      icon: hasPasswordVault ? '🔑' : '🗑️',
      confirmText: t('confirmMoveTrashBtn'),
      cancelText: t('confirmCancel'),
      danger: true,
      onConfirm: async () => {
        // 1. If note was shared, revoke all shares in Supabase so recipients lose access
        if (targetNote.isShared || (targetNote.sharedWith && targetNote.sharedWith.length > 0)) {
          try {
            await supabase
              .from('note_shares')
              .update({ status: 'revoked', updated_at: new Date().toISOString() })
              .eq('note_id', noteId);
          } catch (revokeErr) {
            console.warn("Error revoking shares on trash:", revokeErr);
          }
        }

        // 2. If it is a received note, leave the share cleanly
        if (targetNote.sharedFrom && typeof handleLeaveShare === 'function') {
          handleLeaveShare(noteId);
        }

        // Not: deleted_at, is_shared ve updated_at alanları persistNotes içindeki
        // upsert ile Supabase'e yazılmaktadır. Burada ayrıca update() çağırmak
        // gereksiz çift yazma (race condition) oluşturuyordu.

        const noteReminders = reminders.filter(r => r.noteId === noteId);
        for (const rem of noteReminders) {
          try {
            await cancelLocalNotification(rem.numericId);
          } catch (err) {}
          try {
            await registerPlugin('Alarm').cancelAlarm({ id: rem.id });
          } catch (err) {}
        }
        if (noteReminders.length > 0) {
          const updatedReminders = reminders.filter(r => r.noteId !== noteId);
          setReminders(updatedReminders);
          const remindersKey = getUserScopedKey(STORAGE_KEYS.REMINDERS);
          localStorage.setItem(remindersKey, JSON.stringify(updatedReminders));
          if (user && user.uid) {
            try {
              await supabase.from('reminders').delete().eq('note_id', noteId);
            } catch (err) {}
          }
        }

        setNotes(prevNotes => {
          const updatedNotes = prevNotes.map(n => n.id === noteId ? { ...n, isLocked: false, deletedAt: Date.now() } : n);
          persistNotes(updatedNotes);
          return updatedNotes;
        });

        if (editingNote?.id === noteId) {
          if (window.history.state && window.history.state.page === 'editor') {
            window.history.replaceState({ page: 'root' }, '');
          }
          setEditingNote(null);
        }
      }
    });
  };

  const handleRestoreNote = (noteId) => {
    const updated = notes.map(n => n.id === noteId ? { ...n, deletedAt: null } : n);
    saveNotes(updated);
    setToast({
      title: "🔄 Not Kurtarıldı",
      msg: "Not başarıyla geri yüklendi."
    });
  };

  const handleBulkRestoreNotes = (noteIds) => {
    if (!noteIds || noteIds.length === 0) return;
    const updated = notes.map(n => noteIds.includes(n.id) ? { ...n, deletedAt: null } : n);
    saveNotes(updated);
    setToast({
      title: "🔄 Notlar Kurtarıldı",
      msg: `${noteIds.length} not başarıyla geri yüklendi.`
    });
  };

  const getValidText = (key, fallback) => {
    const txt = cleanText(t(key));
    if (!txt || txt === key) return fallback;
    return txt;
  };

  const handleBulkPermanentDelete = (noteIds) => {
    if (!noteIds || noteIds.length === 0) return;
    const notesToDelete = (notes || []).filter(n => noteIds.includes(n.id));

    const count = noteIds.length;
    const hasVault = notesToDelete.some(noteHasPasswordVault);
    const hasLocked = notesToDelete.some(n => n.isLocked);

    const rawMsg = getValidText('confirmPermanentDeleteMsg', lang === 'tr' ? `${count} notu kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.` : `Are you sure you want to permanently delete ${count} note(s)? This action cannot be undone.`);
    let formattedMsg = (rawMsg && rawMsg.includes('{count}'))
      ? rawMsg.replace('{count}', count)
      : (lang === 'tr' ? `${count} notu kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.` : `Are you sure you want to permanently delete ${count} note(s)? This action cannot be undone.`);

    if (hasVault) {
      formattedMsg += (lang === 'tr'
        ? '\n\n⚠️ DİKKAT: Silinecek notlar arasında Şifre Kasası bulunmaktadır. Bu işlem geri alınamaz ve tüm hesap şifreleriniz kalıcı olarak yok edilir!'
        : '\n\n⚠️ WARNING: Selected notes include Password Vaults. Permanent deletion will permanently erase your saved credentials!');
    }

    setConfirmDialog({
      title: getValidText('confirmPermanentDeleteTitle', lang === 'tr' ? 'Kalıcı Olarak Sil' : 'Delete Permanently'),
      message: formattedMsg,
      icon: hasVault ? '🔑' : '🗑️',
      confirmText: getValidText('confirmPermanentDeleteBtn', lang === 'tr' ? 'Kalıcı Olarak Sil' : 'Delete Permanently'),
      cancelText: getValidText('confirmCancel', lang === 'tr' ? 'İptal' : 'Cancel'),
      danger: true,
      onConfirm: async () => {
        if ((hasVault || hasLocked) && typeof requestBiometricAuth === 'function') {
          const authTitle = hasVault
            ? (lang === 'tr' ? '🔑 Şifre Kasası Güvenliği' : '🔑 Password Vault Security')
            : (lang === 'tr' ? '🔒 Kilitli Notları Sil' : '🔒 Delete Locked Notes');

          const authSub = hasVault
            ? (lang === 'tr' ? 'Seçilen notlar kayıtlı hesap şifreleri içermektedir. Kalıcı olarak silmek için doğrulama yapın.' : 'Selected notes contain saved passwords. Authenticate to permanently delete.')
            : (lang === 'tr' ? 'Kilitli notları kalıcı olarak silmek için doğrulama yapın.' : 'Authenticate to permanently delete locked notes.');

          const ok = await requestBiometricAuth(authTitle, authSub);
          if (!ok) {
            if (typeof setToast === 'function') setToast({ title: '⚠️', msg: t('authFailed') || (lang === 'tr' ? 'Doğrulama Başarısız' : 'Authentication Failed') });
            return;
          }
        }

        // Helper to extract ALL R2 media URLs from notes
        const extractAllR2UrlsFromNotes = (notesList) => {
          if (!Array.isArray(notesList)) return [];
          const urls = new Set();
          const addIfUrl = (val) => {
            if (typeof val === 'string' && val.trim().length > 0) {
              if (isR2MediaUrl(val)) {
                urls.add(val.trim());
              }
            }
          };

          notesList.forEach(n => {
            if (!n) return;
            if (n.coverImage) addIfUrl(n.coverImage);
            if (n.fileUrl) addIfUrl(n.fileUrl);
            if (n.audioUrl) addIfUrl(n.audioUrl);
            if (n.imageUrl) addIfUrl(n.imageUrl);

            if (Array.isArray(n.blocks)) {
              n.blocks.forEach(b => {
                if (!b) return;
                if (b.url) addIfUrl(b.url);
                if (b.fileUrl) addIfUrl(b.fileUrl);
                if (b.publicUrl) addIfUrl(b.publicUrl);
                if (b.src) addIfUrl(b.src);
                if (b.image) addIfUrl(b.image);
                if (b.audio) addIfUrl(b.audio);

                if (Array.isArray(b.items)) {
                  b.items.forEach(item => {
                    if (!item) return;
                    if (item.url) addIfUrl(item.url);
                    if (item.fileUrl) addIfUrl(item.fileUrl);
                  });
                }
              });
            }
          });

          return Array.from(urls);
        };

        // 1. Extract ALL Cloud R2 media URLs across all notes to delete
        const allMediaUrls = extractAllR2UrlsFromNotes(notesToDelete);

        // 2. Delete ALL cloud files from R2 and WAIT for all network deletions to finish!
        if (allMediaUrls.length > 0 && typeof deleteFromR2 === 'function') {
          console.log(`[R2 Permanent Delete] Purging ${allMediaUrls.length} cloud files:`, allMediaUrls);
          try {
            await Promise.allSettled(allMediaUrls.map(url => deleteFromR2(url)));
          } catch (r2Err) {
            console.error("[R2 Permanent Delete] Error during bulk file deletion:", r2Err);
          }
        }

        // 3. Cancel alarms & notifications
        for (const noteToDelete of notesToDelete) {
          const noteReminders = reminders.filter(r => r.noteId === noteToDelete.id);
          for (const rem of noteReminders) {
            try {
              await cancelLocalNotification(rem.numericId);
            } catch (err) {}
            try {
              await registerPlugin('Alarm').cancelAlarm({ id: rem.id });
            } catch (err) {}
          }
        }

        // Remove from reminders local state & storage if needed
        const allDeletedIds = notesToDelete.map(n => n.id);
        const remainingReminders = reminders.filter(r => !allDeletedIds.includes(r.noteId));
        if (remainingReminders.length !== reminders.length) {
          setReminders(remainingReminders);
          const remindersKey = getUserScopedKey(STORAGE_KEYS.REMINDERS);
          localStorage.setItem(remindersKey, JSON.stringify(remainingReminders));
        }

        setNotes(prevNotes => {
          const updatedNotes = prevNotes.filter(n => !allDeletedIds.includes(n.id));
          const key = getUserScopedKey(STORAGE_KEYS.NOTES);
          localStorage.setItem(key, JSON.stringify(updatedNotes));
          return updatedNotes;
        });

        if (user && user.uid) {
          try {
            await supabase.from('notes').delete().in('id', allDeletedIds);
            await supabase.from('note_shares').delete().in('note_id', allDeletedIds);
          } catch (err) {
            console.error("Error permanently deleting notes from Supabase:", err);
          }
        }

        if (editingNote && allDeletedIds.includes(editingNote.id)) {
          if (window.history.state && window.history.state.page === 'editor') {
            window.history.replaceState({ page: 'root' }, '');
          }
          setEditingNote(null);
        }

        setToast({
          title: "🗑️ Kalıcı Olarak Silindi",
          msg: lang === 'tr' ? `${noteIds.length} not başarıyla temizlendi.` : `${noteIds.length} notes successfully cleared.`
        });
      }
    });
  };

  const handlePermanentDelete = (noteId) => {
    handleBulkPermanentDelete([noteId]);
  };

  return {
    editingNote,
    setEditingNote,
    lastEditingNoteId,
    setLastEditingNoteId,
    activeFormatBlockId,
    setActiveFormatBlockId,
    showFormatToolbar,
    setShowFormatToolbar,
    editorUndoStack: undoRedo.editorUndoStack,
    editorRedoStack: undoRedo.editorRedoStack,
    persistNotes,
    flushPersist,
    saveNotes,
    handleUndo: undoRedo.handleUndo,
    handleRedo: undoRedo.handleRedo,
    handleCreateNote,
    handleUpdateNote,
    handleMoveToTrash,
    handleRestoreNote,
    handlePermanentDelete,
    handleBulkRestoreNotes,
    handleBulkPermanentDelete,
    enforceTrailingTextBlock
  };
}


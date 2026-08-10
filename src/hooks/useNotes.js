import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { cancelLocalNotification } from '../services/notificationService';
import { registerPlugin } from '@capacitor/core';
import useNoteUndoRedo from './useNoteUndoRedo';
import { sanitizeNoteContent, sanitizeSingleLine } from '../utils/securityUtils';

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
  lang
}) {
  // --- STATES ---
  const [editingNote, setEditingNote] = useState(null);
  const [lastEditingNoteId, setLastEditingNoteId] = useState(null);
  const [activeFormatBlockId, setActiveFormatBlockId] = useState(null);
  const [showFormatToolbar, setShowFormatToolbar] = useState(false);

  // --- HELPERS ---
  const enforceTrailingTextBlock = (blocks = []) => {
    if (blocks.length === 0) {
      return [{ id: 'b-' + Date.now(), type: 'text', content: '' }];
    }
    const last = blocks[blocks.length - 1];
    if (last && last.type !== 'text') {
      return [...blocks, { id: 'b-' + Date.now() + '-trail', type: 'text', content: '' }];
    }
    return blocks;
  };

  // --- PERSISTENCE ---
  const persistNotes = async (updatedNotes) => {
    try {
      const key = getUserScopedKey('s23_notes');
      const cleanNotes = updatedNotes.map(n => ({
        ...n,
        blocks: (n.blocks || []).map(b => {
          if (!b) return b;
          const { localUrl, base64, ...cleanBlock } = b;
          return cleanBlock;
        })
      }));

      try {
        localStorage.setItem(key, JSON.stringify(cleanNotes));
      } catch (lsErr) {
        console.warn("LocalStorage quota exceeded or unavailable:", lsErr);
      }

      if (user && user.uid) {
        const notesToUpsert = cleanNotes.map(n => ({
          id: n.id,
          user_id: user.uid,
          title: n.title || '',
          blocks: n.blocks || [],
          is_shared: n.isShared || false,
          is_locked: n.isLocked || false,
          is_pinned: Boolean(n.isPinned),
          deleted_at: n.deletedAt ? Number(n.deletedAt) : null,
          updated_at: n.updatedAt ? new Date(n.updatedAt).toISOString() : new Date().toISOString()
        }));

        let { error } = await supabase
          .from('notes')
          .upsert(notesToUpsert);

        if (error && error.message && error.message.toLowerCase().includes('is_pinned')) {
          const fallbackToUpsert = notesToUpsert.map(({ is_pinned, ...rest }) => rest);
          const res = await supabase.from('notes').upsert(fallbackToUpsert);
          error = res.error;
        }

        if (error) console.error("Error upserting notes to Supabase:", error);
      }
    } catch (err) {
      console.error("Notes persistence error:", err);
    }
  };

  const saveNotes = async (updatedNotes) => {
    setNotes(updatedNotes);
    await persistNotes(updatedNotes);
  };

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
        cleanValue = sanitizeSingleLine(value, 150);
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
        persistNotes(updatedNotes);
        return updatedNotes;
      });

      return updatedNote;
    });
  };

  const handleMoveToTrash = async (noteId) => {
    const targetNote = (notes || []).find(n => n.id === noteId);

    if (targetNote && targetNote.isLocked && typeof requestBiometricAuth === 'function') {
      const ok = await requestBiometricAuth(
        lang === 'tr' ? 'Kilitli Notu Sil' : 'Delete Locked Note',
        lang === 'tr' ? 'Kilitli notu silmek için parmak izi, yüz tanıma veya telefon şifrenizi girin' : 'Authenticate to delete locked note'
      );
      if (!ok) {
        if (typeof setToast === 'function') setToast({ title: '⚠️', msg: t('authFailed') });
        return;
      }
    }

    setConfirmDialog({
      title: t('confirmMoveTrashTitle'),
      message: '',
      icon: '🗑️',
      confirmText: t('confirmMoveTrashBtn'),
      cancelText: t('confirmCancel'),
      danger: true,
      onConfirm: async () => {
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
          const remindersKey = getUserScopedKey('s23_reminders');
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

  const cleanText = (txt) => typeof txt === 'string' ? txt.replace(/[\u200B-\u200D\uFEFF]/g, '').trim() : txt;
  const getValidText = (key, fallback) => {
    const txt = cleanText(t(key));
    if (!txt || txt === key) return fallback;
    return txt;
  };

  const handleBulkPermanentDelete = (noteIds) => {
    if (!noteIds || noteIds.length === 0) return;
    const notesToDelete = (notes || []).filter(n => noteIds.includes(n.id));

    const count = noteIds.length;
    const rawMsg = getValidText('confirmPermanentDeleteMsg', lang === 'tr' ? `${count} notu kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.` : `Are you sure you want to permanently delete ${count} note(s)? This action cannot be undone.`);
    const formattedMsg = (rawMsg && rawMsg.includes('{count}'))
      ? rawMsg.replace('{count}', count)
      : (lang === 'tr' ? `${count} notu kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.` : `Are you sure you want to permanently delete ${count} note(s)? This action cannot be undone.`);

    setConfirmDialog({
      title: getValidText('confirmPermanentDeleteTitle', lang === 'tr' ? 'Kalıcı Olarak Sil' : 'Delete Permanently'),
      message: formattedMsg,
      icon: '🗑️',
      confirmText: getValidText('confirmPermanentDeleteBtn', lang === 'tr' ? 'Kalıcı Olarak Sil' : 'Delete Permanently'),
      cancelText: getValidText('confirmCancel', lang === 'tr' ? 'İptal' : 'Cancel'),
      danger: true,
      onConfirm: async () => {
        const hasLocked = notesToDelete.some(n => n.isLocked);
        if (hasLocked && typeof requestBiometricAuth === 'function') {
          const ok = await requestBiometricAuth(
            lang === 'tr' ? 'Kilitli Notları Sil' : 'Delete Locked Notes',
            lang === 'tr' ? 'Kilitli notları kalıcı olarak silmek için doğrulama yapın' : 'Authenticate to permanently delete locked notes'
          );
          if (!ok) {
            if (typeof setToast === 'function') setToast({ title: '⚠️', msg: t('authFailed') });
            return;
          }
        }

        // Helper to extract ALL R2 media URLs from notes
        const extractAllR2UrlsFromNotes = (notesList) => {
          if (!Array.isArray(notesList)) return [];
          const urls = new Set();
          const addIfUrl = (val) => {
            if (typeof val === 'string' && val.trim().length > 0) {
              if (val.includes('workers.dev') || val.includes('/users/') || val.startsWith('http://') || val.startsWith('https://')) {
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
          const remindersKey = getUserScopedKey('s23_reminders');
          localStorage.setItem(remindersKey, JSON.stringify(remainingReminders));
        }

        setNotes(prevNotes => {
          const updatedNotes = prevNotes.filter(n => !allDeletedIds.includes(n.id));
          const key = getUserScopedKey('s23_notes');
          localStorage.setItem(key, JSON.stringify(updatedNotes));
          return updatedNotes;
        });

        if (user && user.uid) {
          try {
            await supabase.from('notes').delete().in('id', allDeletedIds);
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

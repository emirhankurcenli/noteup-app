/**
 * useNotesPersistence — Single Responsibility: only handles saving/syncing notes.
 *
 * Extracted from useNotes.js (SRP violation fix).
 * Handles: localStorage write, Supabase upsert, debounce, flush.
 */
import { useRef, useCallback, useEffect } from 'react';
import { supabase } from '@src/supabaseClient';
import { ensureBlockTimestamps } from '@shared/utils/blockMergeUtils';
import { STORAGE_KEYS } from '@shared/utils/storageKeys';

export default function useNotesPersistence({ user, getUserScopedKey, setNotes }) {
  const persistDebounceRef = useRef(null);
  const pendingNotesRef = useRef(null);
  const lastSyncedTimestampsRef = useRef(new Map());

  const persistNotes = useCallback(async (updatedNotes, forceSyncAll = false) => {
    try {
      const key = getUserScopedKey(STORAGE_KEYS.NOTES);
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
        console.warn('LocalStorage quota exceeded or unavailable:', lsErr);
      }

      if (user && user.uid) {
        // Delta Eşitleme: Sadece son eşitlemeden sonra güncellenen notları seç
        const dirtyNotes = forceSyncAll
          ? cleanNotes
          : cleanNotes.filter((n) => {
              const noteTime = n.updatedAt ? new Date(n.updatedAt).getTime() : 0;
              const lastSynced = lastSyncedTimestampsRef.current.get(n.id) || 0;
              return noteTime > lastSynced;
            });

        if (dirtyNotes.length === 0) return;

        const ownedDirtyNotes = dirtyNotes.filter((n) => !n.sharedFrom);
        const receivedDirtyNotes = dirtyNotes.filter((n) => Boolean(n.sharedFrom));

        if (ownedDirtyNotes.length > 0) {
          const notesToUpsert = ownedDirtyNotes.map((n) => ({
            id: n.id,
            user_id: user.uid,
            title: n.title || '',
            blocks: ensureBlockTimestamps(n.blocks || []),
            is_shared: n.isShared || false,
            is_locked: n.isLocked || false,
            is_pinned: Boolean(n.isPinned),
            deleted_at: n.deletedAt ? Number(n.deletedAt) : null,
            updated_at: n.updatedAt ? new Date(n.updatedAt).toISOString() : new Date().toISOString(),
          }));

          let { error } = await supabase.from('notes').upsert(notesToUpsert);

          if (error && error.message && error.message.toLowerCase().includes('is_pinned')) {
            const fallbackToUpsert = notesToUpsert.map(({ is_pinned, ...rest }) => rest);
            const res = await supabase.from('notes').upsert(fallbackToUpsert);
            error = res.error;
          }

          if (error) {
            console.error('Error upserting notes to Supabase:', error);
          } else {
            ownedDirtyNotes.forEach((n) => {
              const t = n.updatedAt ? new Date(n.updatedAt).getTime() : Date.now();
              lastSyncedTimestampsRef.current.set(n.id, t);
            });
          }
        }

        // Received notes: Sadece kullanıcının bu oturumda bizzat değiştirdiği gelen notları gönder
        for (const rn of receivedDirtyNotes) {
          try {
            const updateTime = rn.updatedAt ? new Date(rn.updatedAt).toISOString() : new Date().toISOString();
            const { error: updateErr } = await supabase
              .from('notes')
              .update({
                title: rn.title || '',
                blocks: ensureBlockTimestamps(rn.blocks || []),
                updated_at: updateTime,
              })
              .eq('id', rn.id);

            if (!updateErr) {
              const t = rn.updatedAt ? new Date(rn.updatedAt).getTime() : Date.now();
              lastSyncedTimestampsRef.current.set(rn.id, t);
            } else {
              console.warn('Shared note remote update error:', updateErr);
            }
          } catch (updateErr) {
            console.warn('Shared note remote update error:', updateErr);
          }
        }
      }
    } catch (err) {
      console.error('Notes persistence error:', err);
    }
  }, [user, getUserScopedKey]);

  const debouncedPersistNotes = useCallback((updatedNotes) => {
    pendingNotesRef.current = updatedNotes;
    if (persistDebounceRef.current) clearTimeout(persistDebounceRef.current);
    persistDebounceRef.current = setTimeout(() => {
      persistNotes(pendingNotesRef.current);
      pendingNotesRef.current = null;
    }, 1500);
  }, [persistNotes]);

  const flushPersist = useCallback(() => {
    if (persistDebounceRef.current) {
      clearTimeout(persistDebounceRef.current);
      persistDebounceRef.current = null;
    }
    if (pendingNotesRef.current) {
      persistNotes(pendingNotesRef.current);
      pendingNotesRef.current = null;
    }
  }, [persistNotes]);

  const saveNotes = useCallback(async (arg1, arg2) => {
    const targetNotes = arg2 !== undefined ? arg2 : arg1;
    const targetSetNotes = arg2 !== undefined ? arg1 : setNotes;
    if (typeof targetSetNotes === 'function') {
      targetSetNotes(targetNotes);
    }
    await persistNotes(targetNotes);
  }, [persistNotes, setNotes]);

  // Otomatik Çevrimdışı -> Çevrimiçi Yeniden Senkronizasyon (Auto Online Re-sync)
  useEffect(() => {
    const handleOnline = async () => {
      flushPersist();

      try {
        const key = getUserScopedKey(STORAGE_KEYS.NOTES);
        const raw = localStorage.getItem(key);
        if (raw) {
          const storedNotes = JSON.parse(raw);
          if (Array.isArray(storedNotes) && storedNotes.length > 0) {
            await persistNotes(storedNotes, false);
          }
        }
      } catch (err) {
        console.warn('[Online Re-sync] Error checking offline notes:', err);
      }
    };

    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [flushPersist, getUserScopedKey, persistNotes]);

  return { persistNotes, debouncedPersistNotes, flushPersist, saveNotes };
}
import { supabase } from '../supabaseClient';

const useSupabaseSync = ({
  user,
  setNotes,
  setReminders,
}) => {
  const getUserScopedKey = (baseKey, uidOverride) => {
    let targetUid = uidOverride;
    if (!targetUid) {
      if (user && user.uid) {
        targetUid = user.uid;
      } else {
        try {
          const localUser = localStorage.getItem('s23_user');
          targetUid = localUser ? JSON.parse(localUser)?.uid : 'guest';
        } catch (e) {
          targetUid = 'guest';
        }
      }
    }
    return `${baseKey}_${targetUid || 'guest'}`;
  };

  const getScopedStorageItem = (baseKey, uidOverride) => {
    const scopedKey = getUserScopedKey(baseKey, uidOverride);
    const scopedData = localStorage.getItem(scopedKey);
    if (scopedData !== null) return scopedData;
    const legacyData = localStorage.getItem(baseKey);
    if (legacyData !== null) {
      localStorage.setItem(scopedKey, legacyData);
      localStorage.removeItem(baseKey);
      return legacyData;
    }
    return null;
  };

  const syncDataFromSupabase = async (userId) => {
    try {
      // 1. Fetch user's own notes from Supabase
      const { data: dbNotes, error: nErr } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', userId);

      const { data: dbReminders, error: rErr } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', userId);

      // 2. Fetch user's profile to get friend code for shared notes
      let myFriendCode = null;
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('friend_code, my_code')
          .eq('id', userId)
          .maybeSingle();
        myFriendCode = profile?.friend_code || profile?.my_code;
      } catch (pErr) {
        console.warn('Error fetching profile friend code:', pErr);
      }

      if (!myFriendCode) {
        try {
          const localUser = localStorage.getItem('s23_user');
          myFriendCode = localUser ? JSON.parse(localUser)?.myCode : null;
        } catch (e) {}
      }

      // 3. Fetch accepted shared notes for this user
      let acceptedSharedNotes = [];
      if (myFriendCode) {
        try {
          const { data: shares, error: sErr } = await supabase
            .from('note_shares')
            .select('*')
            .eq('to_code', myFriendCode)
            .eq('status', 'accepted');

          if (!sErr && shares && shares.length > 0) {
            const sharedNoteIds = shares.map(s => s.note_id).filter(Boolean);
            let sharedNotesFromDb = [];
            if (sharedNoteIds.length > 0) {
              const { data: notesData } = await supabase
                .from('notes')
                .select('*')
                .in('id', sharedNoteIds);
              sharedNotesFromDb = notesData || [];
            }
            const sharedNotesMap = new Map(sharedNotesFromDb.map(n => [n.id, n]));

            acceptedSharedNotes = shares.map(share => {
              const originNote = sharedNotesMap.get(share.note_id);
              let parsedBlocks = [];
              try {
                const rawBlocks = originNote ? originNote.blocks : share.note_blocks;
                if (Array.isArray(rawBlocks)) parsedBlocks = rawBlocks;
                else if (typeof rawBlocks === 'string') parsedBlocks = JSON.parse(rawBlocks);
              } catch (e) {
                parsedBlocks = [];
              }
              return {
                id: share.note_id,
                title: originNote?.title ?? share.note_title ?? '',
                blocks: parsedBlocks,
                isShared: true,
                sharedFrom: share.from_code,
                sharedFromName: share.from_name || 'Arkadaş',
                sharedWith: [share.from_code],
                isLocked: originNote?.is_locked || false,
                isPinned: Boolean(originNote?.is_pinned),
                deletedAt: originNote?.deleted_at ? Number(originNote.deleted_at) : null,
                updatedAt: originNote?.updated_at ? new Date(originNote.updated_at).getTime() : new Date(share.updated_at || share.created_at).getTime(),
                createdAt: originNote?.created_at ? new Date(originNote.created_at).getTime() : Date.now(),
              };
            }).filter(n => !n.deletedAt); // Exclude if owner deleted it
          }
        } catch (shareFetchErr) {
          console.warn('Error fetching shared notes from Supabase:', shareFetchErr);
        }
      }

      if (!nErr && dbNotes) {
        let localNotes = [];
        try {
          const localKey = getUserScopedKey('s23_notes', userId);
          const raw = localStorage.getItem(localKey);
          if (raw) localNotes = JSON.parse(raw);
        } catch (e) {}
        const localMap = new Map(localNotes.map(n => [n.id, n]));

        const formattedOwnedNotes = dbNotes.map(n => {
          let parsedBlocks = [];
          try {
            if (Array.isArray(n.blocks)) {
              parsedBlocks = n.blocks;
            } else if (typeof n.blocks === 'string') {
              parsedBlocks = JSON.parse(n.blocks);
            }
          } catch (e) {
            parsedBlocks = [];
          }
          parsedBlocks = (parsedBlocks || []).map(b => {
            if (b && (b.type === 'image' || b.type === 'file' || b.type === 'audio')) {
              if (b.url && (b.localUrl || '').startsWith('blob:')) {
                const { localUrl, ...rest } = b;
                return rest;
              }
            }
            return b;
          });
          const localN = localMap.get(n.id);
          return {
            id: n.id,
            title: n.title || '',
            blocks: parsedBlocks,
            isShared: n.is_shared,
            sharedWith: localN?.sharedWith || [],
            isLocked: n.is_locked || false,
            isPinned: n.is_pinned !== undefined && n.is_pinned !== null ? Boolean(n.is_pinned) : Boolean(localN?.isPinned),
            deletedAt: n.deleted_at ? Number(n.deleted_at) : null,
            updatedAt: n.updated_at ? new Date(n.updated_at).getTime() : Date.now()
          };
        });

        // Merge owned notes and accepted shared notes
        const combinedNotesMap = new Map();
        formattedOwnedNotes.forEach(n => combinedNotesMap.set(n.id, n));
        acceptedSharedNotes.forEach(n => {
          if (!combinedNotesMap.has(n.id)) {
            combinedNotesMap.set(n.id, n);
          }
        });

        // Also preserve any existing local shared notes that are active
        localNotes.forEach(localN => {
          if (localN.sharedFrom && !combinedNotesMap.has(localN.id) && !localN.deletedAt) {
            combinedNotesMap.set(localN.id, localN);
          }
        });

        const finalCombinedNotes = Array.from(combinedNotesMap.values());
        setNotes(finalCombinedNotes);
        const key = getUserScopedKey('s23_notes', userId);
        localStorage.setItem(key, JSON.stringify(finalCombinedNotes));
      }
      if (!rErr && dbReminders) {
        const formattedReminders = dbReminders.map(r => ({
          id: r.id,
          noteId: r.note_id,
          time: r.time,
          active: r.active
        }));
        setReminders(formattedReminders);
        const key = getUserScopedKey('s23_reminders', userId);
        localStorage.setItem(key, JSON.stringify(formattedReminders));
      }
    } catch (err) {
      console.error("Data sync failed:", err);
    }
  };

  return {
    getUserScopedKey,
    getScopedStorageItem,
    syncDataFromSupabase,
  };
};

export default useSupabaseSync;

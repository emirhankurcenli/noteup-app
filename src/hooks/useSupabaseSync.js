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
      const { data: dbNotes, error: nErr } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', userId);

      const { data: dbReminders, error: rErr } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', userId);
      if (!nErr && dbNotes) {
        let localNotes = [];
        try {
          const localKey = getUserScopedKey('s23_notes', userId);
          const raw = localStorage.getItem(localKey);
          if (raw) localNotes = JSON.parse(raw);
        } catch (e) {}
        const localMap = new Map(localNotes.map(n => [n.id, n]));

        const formattedNotes = dbNotes.map(n => {
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
            isLocked: n.is_locked || false,
            isPinned: n.is_pinned !== undefined && n.is_pinned !== null ? Boolean(n.is_pinned) : Boolean(localN?.isPinned),
            deletedAt: n.deleted_at ? Number(n.deleted_at) : null,
            updatedAt: n.updated_at ? new Date(n.updated_at).getTime() : Date.now()
          };
        });
        setNotes(formattedNotes);
        const key = getUserScopedKey('s23_notes', userId);
        localStorage.setItem(key, JSON.stringify(formattedNotes));
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

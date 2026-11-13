import { useEffect, useRef, useState } from 'react';
import { supabase } from '@src/supabaseClient';

/**
 * useNotePresence
 * Tracks who is currently viewing/editing a shared note using Supabase Realtime Presence.
 */
export const useNotePresence = ({ noteId, myCode, profileName, isShared }) => {
  const [presentUsers, setPresentUsers] = useState([]);
  const channelRef = useRef(null);

  useEffect(() => {
    // Only track presence for shared notes with valid IDs
    if (!noteId || !myCode || !isShared) {
      setPresentUsers([]);
      return;
    }

    const myNormalizedCode = String(myCode).trim().toUpperCase();
    const channelName = `presence_note_${noteId}`;
    
    try {
      const ch = supabase.channel(channelName, {
        config: { presence: { key: myNormalizedCode } }
      });

      ch.on('presence', { event: 'sync' }, () => {
        try {
          const state = ch.presenceState();
          const users = Object.values(state)
            .flat()
            .map((u) => ({
              code: u.code,
              name: u.name,
              joinedAt: u.joinedAt,
            }))
            .filter((u) => u.code && u.code !== myNormalizedCode);
          setPresentUsers(users);
        } catch (_) {}
      });

      ch.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          try {
            await ch.track({
              code: myNormalizedCode,
              name: profileName || myCode,
              joinedAt: Date.now(),
            });
          } catch (_) {}
        }
      });

      channelRef.current = ch;
    } catch (err) {
      console.warn('Presence channel error:', err);
    }

    return () => {
      if (channelRef.current) {
        try {
          channelRef.current.untrack();
          supabase.removeChannel(channelRef.current);
        } catch (_) {}
        channelRef.current = null;
      }
      setPresentUsers([]);
    };
  }, [noteId, myCode, profileName, isShared]);

  return { presentUsers };
};

export default useNotePresence;

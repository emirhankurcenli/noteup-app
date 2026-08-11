import { useEffect } from 'react';
import { createNotificationChannels, addNotificationListener } from '../services/notificationService';
import { playChime } from '../services/soundService';
import { triggerHaptic } from '../services/haptics';

export default function useInitialDataLoad({
  setMyCode,
  setProfileName,
  setFriends,
  setFriendRequests,
  setNotes,
  setReminders,
  syncDismissedAlarms,
  updatePermissionStates,
  requestAllPermissionsAtStartup,
  getScopedStorageItem
}) {
  useEffect(() => {
    const generateUserCode = () => {
      const chars = '0123456789ABCDEF';
      let part1 = '';
      let part2 = '';
      for (let i = 0; i < 4; i++) {
        part1 += chars[Math.floor(Math.random() * chars.length)];
        part2 += chars[Math.floor(Math.random() * chars.length)];
      }
      return `HUB-${part1}-${part2}`;
    };

    const loadInitialData = async () => {
      let code = localStorage.getItem('s23_my_code');
      if (!code || !code.startsWith('HUB-')) {
        code = generateUserCode();
        localStorage.setItem('s23_my_code', code);
      }
      setMyCode(code);

      const storedName = localStorage.getItem('s23_profile_name');
      setProfileName(storedName || 'Kullanıcı');

      const storedFriends = localStorage.getItem('s23_friends_' + code);
      if (storedFriends) {
        try {
          setFriends(JSON.parse(storedFriends));
        } catch (e) {}
      }
      try {
        setFriendRequests(JSON.parse(localStorage.getItem('s23_friend_requests') || '[]'));
      } catch (e) {}

      const activeUid = JSON.parse(localStorage.getItem('s23_user') || '{}')?.uid || 'guest';
      
      // Automatic Notes Rescue: Scan ALL localStorage keys (legacy s23_notes, s23_notes_guest, s23_notes_<uid>)
      // to recover any lost or orphan notes and merge them into the active user session!
      const rescueAllNotes = () => {
        const rescued = [];
        const seenIds = new Set();

        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key === 's23_notes' || key.startsWith('s23_notes_'))) {
            try {
              const raw = localStorage.getItem(key);
              if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                  parsed.forEach(note => {
                    if (note && note.id && !seenIds.has(note.id)) {
                      seenIds.add(note.id);
                      rescued.push(note);
                    }
                  });
                }
              }
            } catch (e) {}
          }
        }
        return rescued;
      };

      const migrateNote = (note) => {
        let blocks = note.blocks;
        if (!blocks) {
          blocks = [];
          if (note.content) {
            blocks.push({ id: 'b-m1-' + note.id, type: 'text', content: note.content });
          }
          if (note.debts && note.debts.length > 0) {
            blocks.push({ id: 'b-m2-' + note.id, type: 'debt', items: note.debts });
          }
          if (blocks.length === 0) {
            blocks.push({ id: 'b-m1-' + note.id, type: 'text', content: '' });
          }
        }

        const sanitizedBlocks = blocks.map(b => {
          if (b && (b.type === 'image' || b.type === 'file' || b.type === 'audio')) {
            if (b.url && (b.localUrl || '').startsWith('blob:')) {
              const { localUrl, ...rest } = b;
              return rest;
            }
          }
          return b;
        });

        const { content: _c, debts: _d, hasDebtWidget: _h, ...rest } = note;
        return { ...rest, blocks: sanitizedBlocks };
      };

      try {
        const allRescuedNotes = rescueAllNotes().map(migrateNote);
        setNotes(allRescuedNotes);
        
        // Save to active scoped key
        const userScopedKey = `s23_notes_${activeUid}`;
        localStorage.setItem(userScopedKey, JSON.stringify(allRescuedNotes));
        localStorage.setItem('s23_notes', JSON.stringify(allRescuedNotes));
      } catch (e) {
        console.error('Notes recovery error:', e);
      }

      if (storedReminders) {
        try {
          const parsed = JSON.parse(storedReminders);
          setReminders(parsed);
          if (syncDismissedAlarms) syncDismissedAlarms(parsed);
        } catch (e) {
          console.error('Corrupted reminders data, resetting:', e);
          localStorage.removeItem('s23_reminders');
          setReminders([]);
        }
      }
    };

    loadInitialData();

    createNotificationChannels();

    const foregroundListener = addNotificationListener(
      'localNotificationReceived',
      () => { playChime(); triggerHaptic('success'); }
    );

    if (updatePermissionStates) updatePermissionStates();

    return () => {
      foregroundListener.then(l => l.remove()).catch(() => {});
    };
  }, []);
}

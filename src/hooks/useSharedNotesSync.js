import { useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { playChime } from '../services/soundService';

export const useSharedNotesSync = ({
  myCode,
  notes,
  saveNotes,
  setToast,
  setIncomingRequest,
  setFriendRequests,
  setFriends,
}) => {
  useEffect(() => {
    if (!myCode) return;

    // Fetch pending incoming note share invitations from Supabase
    const fetchIncomingNoteShares = async () => {
      try {
        const { data, error } = await supabase
          .from('note_shares')
          .select('*')
          .eq('to_code', myCode)
          .eq('status', 'pending')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const firstReq = data[0];
          setIncomingRequest({
            id: firstReq.id,
            fromCode: firstReq.from_code,
            fromName: firstReq.from_name || 'Arkadaş',
            toCode: firstReq.to_code,
            noteId: firstReq.note_id,
            noteTitle: firstReq.note_title,
            noteBlocks: firstReq.note_blocks,
            timestamp: new Date(firstReq.created_at).getTime(),
            processed: false,
          });
        }
      } catch (err) {
        console.warn('Error fetching note shares from Supabase:', err);
      }
    };

    fetchIncomingNoteShares();

    // Supabase Realtime channel for instant note share alerts
    let shareChannel = null;
    try {
      const activeChannels = supabase.getChannels();
      activeChannels.forEach((ch) => {
        if (ch && ch.topic && ch.topic.includes(`note_shares_${myCode}`)) {
          try {
            supabase.removeChannel(ch);
          } catch (e) {}
        }
      });

      const shareChannelName = `note_shares_${myCode}_${Date.now()}`;
      shareChannel = supabase.channel(shareChannelName);

      shareChannel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'note_shares',
        },
        (payload) => {
          const recNew = payload.new;
          const recOld = payload.old;

          // 1. Incoming share invitation (INSERT to_code == myCode)
          if (payload.eventType === 'INSERT' && recNew && recNew.to_code === myCode && recNew.status === 'pending') {
            setIncomingRequest({
              id: recNew.id,
              fromCode: recNew.from_code,
              fromName: recNew.from_name || 'Arkadaş',
              toCode: recNew.to_code,
              noteId: recNew.note_id,
              noteTitle: recNew.note_title,
              noteBlocks: recNew.note_blocks,
              timestamp: new Date(recNew.created_at).getTime(),
              processed: false,
            });
            playChime();
          }

          // 2. Share response alert (UPDATE from_code == myCode)
          if (payload.eventType === 'UPDATE' && recNew && recNew.from_code === myCode) {
            if (recNew.status === 'accepted') {
              setToast?.({
                title: '🎉 Davet Kabul Edildi!',
                msg: `Arkadaşınız "${recNew.note_title || 'Not'}" paylaşım davetinizi kabul etti.`,
              });
              playChime();
            } else if (recNew.status === 'rejected') {
              setToast?.({
                title: '❌ Davet Reddedildi',
                msg: `Arkadaşınız "${recNew.note_title || 'Not'}" paylaşım davetinizi reddetti.`,
              });
            }
          }

          // 3. Share removal (DELETE to_code == myCode)
          if (payload.eventType === 'DELETE' && recOld && recOld.to_code === myCode) {
            if (notes && Array.isArray(notes) && typeof saveNotes === 'function') {
              const updatedNotes = notes.filter((n) => {
                if (n.sharedFrom === recOld.from_code && (n.id === recOld.note_id || !recOld.note_id)) {
                  return false;
                }
                return true;
              });
              if (updatedNotes.length !== notes.length) {
                saveNotes(updatedNotes);
              }
            }
          }
        }
      );

      shareChannel.subscribe((status, err) => {
        if (err) {
          console.warn(`[Realtime] note_shares status: ${status}`, err);
        }
      });
    } catch (e) {
      console.warn('[Realtime] Failed to initialize note_shares channel:', e);
    }

    const handleStorageChange = (e) => {
      if (e.key === 's23_friend_requests' && typeof setFriendRequests === 'function') {
        const reqs = JSON.parse(e.newValue || '[]');
        setFriendRequests(reqs);

        const acceptedSentRequest = reqs.find((r) => r.fromCode === myCode && r.status === 'accepted');
        if (acceptedSentRequest) {
          const newFriendCode = acceptedSentRequest.toCode;
          const currentFriends = JSON.parse(localStorage.getItem('s23_friends_' + myCode) || '[]');
          if (!currentFriends.some((f) => f.code === newFriendCode)) {
            const newFriend = {
              code: newFriendCode,
              name: acceptedSentRequest.toName || 'Arkadaş (' + newFriendCode.substring(9) + ')',
            };
            const updatedFriends = [...currentFriends, newFriend];
            if (typeof setFriends === 'function') setFriends(updatedFriends);
            localStorage.setItem('s23_friends_' + myCode, JSON.stringify(updatedFriends));
            setToast?.({
              title: '🎉 Davet Kabul Edildi',
              msg: `${newFriend.name} arkadaşlık davetinizi kabul etti!`,
            });
            playChime();
          }
        }
      }
      if (e.key === `s23_friends_${myCode}` && typeof setFriends === 'function') {
        setFriends(JSON.parse(e.newValue || '[]'));
      }
      if (e.key === `s23_nudge_${myCode}`) {
        const nudge = JSON.parse(e.newValue || '{}');
        if (nudge.fromName) {
          const customNoteMsg = nudge.customMessage ? `"${nudge.customMessage}"` : 'Sana bu notla ilgili bir bildirim gönderdi!';
          setToast?.({
            title: `🔔 Paylaşımlı Not Bildirimi`,
            msg: `${nudge.fromName} ("${nudge.noteTitle}"): ${customNoteMsg}`,
          });
          playChime();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      if (shareChannel) {
        try {
          supabase.removeChannel(shareChannel);
        } catch (e) {}
      }
    };
  }, [myCode, notes, saveNotes, setToast, setIncomingRequest, setFriendRequests, setFriends]);
};

export default useSharedNotesSync;

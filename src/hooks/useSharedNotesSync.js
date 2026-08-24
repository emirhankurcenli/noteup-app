import { useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { playChime } from '../services/soundService';

export const useSharedNotesSync = ({
  myCode,
  setToast,
  setIncomingRequest,
  setFriendRequests,
  setFriends,
}) => {
  const processedRequestIdsRef = useRef(new Set());
  const notifiedAcceptedSharesRef = useRef(new Set());

  useEffect(() => {
    if (!myCode) return;

    // 1. Fetch pending incoming note share invitations from Supabase
    const fetchIncomingNoteShares = async () => {
      try {
        const { data, error } = await supabase
          .from('note_shares')
          .select('*')
          .eq('to_code', myCode)
          .eq('status', 'pending')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const firstUnprocessed = data.find(req => !processedRequestIdsRef.current.has(req.id));
          if (firstUnprocessed) {
            processedRequestIdsRef.current.add(firstUnprocessed.id);
            setIncomingRequest({
              id: firstUnprocessed.id,
              fromCode: firstUnprocessed.from_code,
              fromName: firstUnprocessed.from_name || 'Arkadaş',
              toCode: firstUnprocessed.to_code,
              noteId: firstUnprocessed.note_id,
              noteTitle: firstUnprocessed.note_title,
              noteBlocks: firstUnprocessed.note_blocks,
              timestamp: new Date(firstUnprocessed.created_at).getTime(),
              processed: false,
            });
          }
        }
      } catch (err) {
        console.warn('Error fetching note shares from Supabase:', err);
      }
    };

    fetchIncomingNoteShares();

    // 2. Supabase Realtime channel for instant note share alerts and shared notes sync
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

      // Listen to note_shares table changes
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
          if (
            payload.eventType === 'INSERT' &&
            recNew &&
            recNew.to_code === myCode &&
            recNew.status === 'pending'
          ) {
            if (!processedRequestIdsRef.current.has(recNew.id)) {
              processedRequestIdsRef.current.add(recNew.id);
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
          }

          // 2. Share response alert (UPDATE from_code == myCode) - Only fire ONCE per acceptance
          if (payload.eventType === 'UPDATE' && recNew && recNew.from_code === myCode) {
            const isFreshAccept = (recOld?.status === 'pending' || !notifiedAcceptedSharesRef.current.has(recNew.id)) && recNew.status === 'accepted';
            if (isFreshAccept) {
              notifiedAcceptedSharesRef.current.add(recNew.id);
              setToast?.({
                title: '🎉 Davet Kabul Edildi!',
                msg: `Arkadaşınız "${recNew.note_title || 'Not'}" paylaşım davetinizi kabul etti.`,
              });
              playChime();
            } else if (recOld?.status === 'pending' && recNew.status === 'rejected') {
              setToast?.({
                title: '❌ Davet Reddedildi',
                msg: `Arkadaşınız "${recNew.note_title || 'Not'}" paylaşım davetinizi reddetti.`,
              });
            }
          }

          // 3. Live content update from note_shares (when either party updates note_blocks)
          if (
            payload.eventType === 'UPDATE' &&
            recNew &&
            recNew.status === 'accepted' &&
            (recNew.to_code === myCode || recNew.from_code === myCode)
          ) {
            let parsedBlocks = [];
            try {
              if (Array.isArray(recNew.note_blocks)) parsedBlocks = recNew.note_blocks;
              else if (typeof recNew.note_blocks === 'string') parsedBlocks = JSON.parse(recNew.note_blocks);
            } catch (_) {
              parsedBlocks = [];
            }

            window.dispatchEvent(
              new CustomEvent('noteup_shared_note_live_update', {
                detail: {
                  id: recNew.note_id,
                  title: recNew.note_title || '',
                  blocks: parsedBlocks,
                  isShared: true,
                  updatedAt: recNew.updated_at ? new Date(recNew.updated_at).getTime() : Date.now(),
                },
              })
            );
          }

          // 4. Share revoked / terminated by Owner (UPDATE to_code == myCode status == 'revoked')
          if (
            payload.eventType === 'UPDATE' &&
            recNew &&
            recNew.to_code === myCode &&
            recNew.status === 'revoked'
          ) {
            window.dispatchEvent(
              new CustomEvent('noteup_shared_note_revoked', {
                detail: { noteId: recNew.note_id, fromCode: recNew.from_code },
              })
            );
            setToast?.({
              title: '🔒 Paylaşım Sonlandırıldı',
              msg: `"${recNew.note_title || 'Not'}" notunun sahibi paylaşımı sonlandırdı.`,
            });
          }

          // 5. Share record deleted (DELETE to_code == myCode)
          if (payload.eventType === 'DELETE' && recOld && recOld.to_code === myCode) {
            window.dispatchEvent(
              new CustomEvent('noteup_shared_note_removed', {
                detail: { noteId: recOld.note_id, fromCode: recOld.from_code },
              })
            );
          }
        }
      );

      // Listen to notes table changes for live content synchronization
      shareChannel.on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notes',
        },
        (payload) => {
          const recNew = payload.new;
          if (recNew && recNew.is_shared) {
            let parsedBlocks = [];
            try {
              if (Array.isArray(recNew.blocks)) parsedBlocks = recNew.blocks;
              else if (typeof recNew.blocks === 'string') parsedBlocks = JSON.parse(recNew.blocks);
            } catch (e) {
              parsedBlocks = [];
            }

            window.dispatchEvent(
              new CustomEvent('noteup_shared_note_live_update', {
                detail: {
                  id: recNew.id,
                  title: recNew.title || '',
                  blocks: parsedBlocks,
                  isShared: recNew.is_shared,
                  deletedAt: recNew.deleted_at ? Number(recNew.deleted_at) : null,
                  updatedAt: recNew.updated_at ? new Date(recNew.updated_at).getTime() : Date.now(),
                },
              })
            );
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
  }, [myCode, setToast, setIncomingRequest, setFriendRequests, setFriends]);
};

export default useSharedNotesSync;

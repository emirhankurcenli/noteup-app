import { useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { playChime } from '../services/soundService';

export const useSharedNotesSync = ({
  myCode,
  setToast,
  setPendingShareRequests,
  setFriendRequests,
  setFriends,
}) => {
  const processedRequestIdsRef = useRef(new Set());
  const notifiedAcceptedSharesRef = useRef(new Set());
  const lastDispatchedMapRef = useRef(new Map());

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

        if (!error && data && Array.isArray(data)) {
          const formatted = data.map((item) => ({
            id: item.id,
            fromCode: item.from_code,
            fromName: item.from_name || 'Arkadaş',
            toCode: item.to_code,
            noteId: item.note_id,
            noteTitle: item.note_title,
            noteBlocks: item.note_blocks,
            timestamp: new Date(item.created_at).getTime(),
            processed: false,
          }));

          setPendingShareRequests(formatted);
        }
      } catch (err) {
        console.warn('Error fetching note shares from Supabase:', err);
      }
    };

    // 2. Fetch outgoing note share statuses from Supabase (to sync pending vs accepted)
    const fetchOutgoingNoteShares = async () => {
      try {
        const { data, error } = await supabase
          .from('note_shares')
          .select('*')
          .eq('from_code', myCode);

        if (!error && data && Array.isArray(data)) {
          window.dispatchEvent(
            new CustomEvent('noteup_outgoing_shares_synced', {
              detail: { shares: data },
            })
          );
        }
      } catch (err) {
        console.warn('Error fetching outgoing note shares from Supabase:', err);
      }
    };

    fetchIncomingNoteShares();
    fetchOutgoingNoteShares();

    // 3. Supabase Realtime channel for instant note share alerts and shared notes sync
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

          // A. Incoming share invitation (INSERT to_code == myCode)
          if (
            payload.eventType === 'INSERT' &&
            recNew &&
            recNew.to_code === myCode &&
            recNew.status === 'pending'
          ) {
            const newReq = {
              id: recNew.id,
              fromCode: recNew.from_code,
              fromName: recNew.from_name || 'Arkadaş',
              toCode: recNew.to_code,
              noteId: recNew.note_id,
              noteTitle: recNew.note_title,
              noteBlocks: recNew.note_blocks,
              timestamp: new Date(recNew.created_at).getTime(),
              processed: false,
            };

            setPendingShareRequests((prev) => {
              const existing = prev.some((r) => r.id === newReq.id);
              if (existing) return prev;
              return [newReq, ...prev];
            });

            if (!processedRequestIdsRef.current.has(recNew.id)) {
              processedRequestIdsRef.current.add(recNew.id);
              setToast?.({
                title: '🔔 Paylaşılan Not Daveti',
                msg: `"${recNew.from_name || 'Arkadaşınız'}" sizinle "${recNew.note_title || 'Not'}" notunu paylaştı. Paylaşılanlar sekmesinden kabul edebilirsiniz.`,
              });
              playChime();
            }
          }

          // B. Share response alert (UPDATE from_code == myCode) - Realtime status transitions
          if (payload.eventType === 'UPDATE' && recNew && recNew.from_code === myCode) {
            const isFreshAccept = (recOld?.status === 'pending' || !notifiedAcceptedSharesRef.current.has(recNew.id)) && recNew.status === 'accepted';
            if (isFreshAccept) {
              notifiedAcceptedSharesRef.current.add(recNew.id);
              window.dispatchEvent(
                new CustomEvent('noteup_shared_invite_accepted', {
                  detail: {
                    noteId: recNew.note_id,
                    collaboratorCode: recNew.to_code,
                    shareId: recNew.id,
                  },
                })
              );
              setToast?.({
                title: '🎉 Davet Kabul Edildi!',
                msg: `Arkadaşınız "${recNew.note_title || 'Not'}" paylaşım davetinizi kabul etti.`,
              });
              playChime();
            } else if (recNew.status === 'rejected') {
              window.dispatchEvent(
                new CustomEvent('noteup_shared_invite_rejected', {
                  detail: {
                    noteId: recNew.note_id,
                    collaboratorCode: recNew.to_code,
                    shareId: recNew.id,
                  },
                })
              );
              if (recOld?.status === 'pending') {
                setToast?.({
                  title: '❌ Davet Reddedildi',
                  msg: `Arkadaşınız "${recNew.note_title || 'Not'}" paylaşım davetinizi reddetti.`,
                });
              }
            }
          }

          // C. Live content update from note_shares (when either party updates note_blocks)
          if (
            payload.eventType === 'UPDATE' &&
            recNew &&
            recNew.status === 'accepted' &&
            (recNew.to_code === myCode || recNew.from_code === myCode)
          ) {
            const noteId = recNew.note_id;
            const updatedTime = recNew.updated_at ? new Date(recNew.updated_at).getTime() : Date.now();
            const lastTime = lastDispatchedMapRef.current.get(noteId) || 0;

            if (updatedTime > lastTime) {
              lastDispatchedMapRef.current.set(noteId, updatedTime);

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
                    id: noteId,
                    title: recNew.note_title || '',
                    blocks: parsedBlocks,
                    isShared: true,
                    updatedAt: updatedTime,
                  },
                })
              );
            }
          }

          // D. Share revoked / terminated by Owner
          if (
            payload.eventType === 'UPDATE' &&
            recNew &&
            recNew.status === 'revoked'
          ) {
            setPendingShareRequests((prev) => prev.filter((r) => r.id !== recNew.id && r.noteId !== recNew.note_id));
            window.dispatchEvent(
              new CustomEvent('noteup_shared_note_revoked', {
                detail: { noteId: recNew.note_id, fromCode: recNew.from_code, toCode: recNew.to_code },
              })
            );
            if (recNew.to_code === myCode) {
              setToast?.({
                title: '🔒 Paylaşım Sonlandırıldı',
                msg: `"${recNew.note_title || 'Not'}" notunun sahibi paylaşımı sonlandırdı.`,
              });
            }
          }

          // E. Share record deleted
          if (payload.eventType === 'DELETE') {
            const deletedNoteId = recOld?.note_id || payload.old?.note_id;
            const deletedId = recOld?.id || payload.old?.id;
            const toCode = recOld?.to_code || payload.old?.to_code;
            if (deletedId || deletedNoteId) {
              setPendingShareRequests((prev) => prev.filter((r) => r.id !== deletedId && r.noteId !== deletedNoteId));
            }
            if (deletedNoteId) {
              if (recOld?.from_code === myCode && toCode) {
                window.dispatchEvent(
                  new CustomEvent('noteup_shared_invite_rejected', {
                    detail: { noteId: deletedNoteId, collaboratorCode: toCode, shareId: deletedId },
                  })
                );
              }
              window.dispatchEvent(
                new CustomEvent('noteup_shared_note_removed', {
                  detail: { noteId: deletedNoteId },
                })
              );
            }
          }
        }
      );

      // Listen to notes table changes for live content synchronization and deletion
      shareChannel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notes',
        },
        (payload) => {
          const recNew = payload.new;
          const recOld = payload.old;

          if (payload.eventType === 'DELETE') {
            const deletedId = recOld?.id || payload.old?.id;
            if (deletedId) {
              window.dispatchEvent(
                new CustomEvent('noteup_shared_note_removed', {
                  detail: { noteId: deletedId },
                })
              );
            }
            return;
          }

          if (recNew) {
            if (recNew.deleted_at) {
              window.dispatchEvent(
                new CustomEvent('noteup_shared_note_revoked', {
                  detail: { noteId: recNew.id },
                })
              );
              return;
            }

            if (recNew.is_shared) {
              const noteId = recNew.id;
              const updatedTime = recNew.updated_at ? new Date(recNew.updated_at).getTime() : Date.now();
              const lastTime = lastDispatchedMapRef.current.get(noteId) || 0;

              // Only dispatch if not already dispatched from note_shares in the same update tick
              if (updatedTime > lastTime) {
                lastDispatchedMapRef.current.set(noteId, updatedTime);

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
                      id: noteId,
                      title: recNew.title || '',
                      blocks: parsedBlocks,
                      isShared: recNew.is_shared,
                      deletedAt: recNew.deleted_at ? Number(recNew.deleted_at) : null,
                      updatedAt: updatedTime,
                    },
                  })
                );
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

    // 4. Supabase Realtime for Friend Requests
    let friendsChannel = null;
    try {
      const activeChannels = supabase.getChannels();
      activeChannels.forEach((ch) => {
        if (ch && ch.topic && ch.topic.includes(`friends_sync_${myCode}`)) {
          try {
            supabase.removeChannel(ch);
          } catch (e) {}
        }
      });

      const friendsChannelName = `friends_sync_${myCode}_${Date.now()}`;
      friendsChannel = supabase.channel(friendsChannelName);

      friendsChannel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friend_requests',
        },
        (payload) => {
          const recNew = payload.new;
          const recOld = payload.old;

          if (payload.eventType === 'INSERT' && recNew && recNew.to_code === myCode && recNew.status === 'pending') {
            setFriendRequests((prev) => {
              const exists = prev.some((r) => r.id === recNew.id);
              if (exists) return prev;
              return [
                {
                  id: recNew.id,
                  fromCode: recNew.from_code,
                  fromName: recNew.from_name,
                  toCode: recNew.to_code,
                  toName: recNew.to_name,
                  status: 'pending',
                  timestamp: new Date(recNew.created_at).getTime(),
                },
                ...prev,
              ];
            });

            setToast?.({
              title: '👋 Yeni Arkadaşlık İsteği',
              msg: `"${recNew.from_name || 'Bir kullanıcı'}" size arkadaşlık isteği gönderdi.`,
            });
            playChime();
          }

          if (payload.eventType === 'UPDATE' && recNew && recNew.from_code === myCode && recNew.status === 'accepted') {
            setToast?.({
              title: '🎉 Arkadaşlık Kabul Edildi!',
              msg: `"${recNew.to_name || 'Arkadaşınız'}" isteğinizi kabul etti.`,
            });
            playChime();
          }

          if (payload.eventType === 'UPDATE' && recNew && recNew.to_code === myCode && recNew.status !== 'pending') {
            setFriendRequests((prev) => prev.filter((r) => r.id !== recNew.id));
          }
        }
      );

      friendsChannel.subscribe();
    } catch (e) {
      console.warn('[Realtime] Failed to initialize friends channel:', e);
    }

    return () => {
      if (shareChannel) {
        try {
          supabase.removeChannel(shareChannel);
        } catch (e) {}
      }
      if (friendsChannel) {
        try {
          supabase.removeChannel(friendsChannel);
        } catch (e) {}
      }
    };
  }, [myCode]);
};

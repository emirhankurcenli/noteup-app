import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@src/supabaseClient';
import { playChime } from '@shared/services/soundService';
import { App as CapApp } from '@capacitor/app';

export const useSharedNotesSync = ({
  myCode,
  user,
  setToast,
  setPendingShareRequests,
  setFriendRequests,
  setFriends,
  setNotes,
}) => {
  const processedRequestIdsRef = useRef(new Set());
  const notifiedAcceptedSharesRef = useRef(new Set());
  const lastDispatchedMapRef = useRef(new Map());
  // Polling için: hangi shared note ID'lerini takip ettiğimizi saklar
  const acceptedSharedNoteIdsRef = useRef([]);
  const pollingIntervalRef = useRef(null);

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

            // FIX: is_shared === true kontrolü kaldırıldı.
            // Artık "biz bu notu paylaşımlı olarak takip ediyorsak" güncelliyoruz.
            // acceptedSharedNoteIdsRef: hem gelen (sharedFrom) hem paylaşılan (sharedWith) note ID'lerini tutar.
            const noteId = recNew.id;
            const isTracked = acceptedSharedNoteIdsRef.current.includes(noteId);
            if (isTracked) {
              const updatedTime = recNew.updated_at ? new Date(recNew.updated_at).getTime() : Date.now();
              const lastTime = lastDispatchedMapRef.current.get(noteId) || 0;

              // note_shares kanalından aynı tick'te dispatch edilmediyse gönder
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

      // FIX: friendsChannel ayrı bir WebSocket kanalı açmak yerine
      // mevcut shareChannel üzerine friend_requests dinleyicisi ekleniyor.
      // Böylece 3 kanal → 2 kanala düşürüldü.
      shareChannel.on(
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

      // Tüm .on() listener'ları eklendikten sonra tek seferde subscribe et
      shareChannel.subscribe((status, err) => {
        if (err) {
          console.warn(`[Realtime] note_shares status: ${status}`, err);
        }
      });
    } catch (e) {
      console.warn('[Realtime] Failed to initialize note_shares channel:', e);
    }

    return () => {
      if (shareChannel) {
        try {
          supabase.removeChannel(shareChannel);
        } catch (e) {}
      }
    };
  }, [myCode]);

  // ─────────────────────────────────────────────────────────────────────────────
  // POLLING FALLBACK + FOREGROUND SYNC
  // Realtime bağlantısı koptuğunda veya paket kaçırdığında devreye girer.
  // Her 30 saniyede bir paylaşımlı notların güncel halini Supabase'den çeker.
  // ─────────────────────────────────────────────────────────────────────────────
  const pollSharedNotes = useCallback(async () => {
    if (!myCode) return;
    try {
      // 1. Hangi notları takip ettiğimizi öğren
      const { data: shares } = await supabase
        .from('note_shares')
        .select('note_id, from_code, from_name')
        .or(`to_code.eq.${myCode},from_code.eq.${myCode}`)
        .eq('status', 'accepted');

      const acceptedShares = Array.isArray(shares) ? shares : [];
      const sharedNoteIds = [...new Set(acceptedShares.map((s) => s.note_id).filter(Boolean))];

      // Takip listesini güncelle (Realtime listener bu liste sayesinde filtre yapıyor)
      acceptedSharedNoteIdsRef.current = sharedNoteIds;

      if (sharedNoteIds.length === 0) return;

      // 2. Bu notların güncel hallerini çek
      const { data: notesData } = await supabase
        .from('notes')
        .select('*')
        .in('id', sharedNoteIds);

      if (!notesData || notesData.length === 0) return;

      notesData.forEach((remoteNote) => {
        // Silinmiş notları yakala
        if (remoteNote.deleted_at) {
          window.dispatchEvent(
            new CustomEvent('noteup_shared_note_revoked', {
              detail: { noteId: remoteNote.id },
            })
          );
          return;
        }

        let parsedBlocks = [];
        try {
          if (Array.isArray(remoteNote.blocks)) parsedBlocks = remoteNote.blocks;
          else if (typeof remoteNote.blocks === 'string') parsedBlocks = JSON.parse(remoteNote.blocks);
        } catch (_) {}

        const updatedTime = remoteNote.updated_at
          ? new Date(remoteNote.updated_at).getTime()
          : Date.now();

        // Son dispatch edilen zamandan daha yeniyse güncelle
        const lastTime = lastDispatchedMapRef.current.get(remoteNote.id) || 0;
        if (updatedTime > lastTime) {
          lastDispatchedMapRef.current.set(remoteNote.id, updatedTime);
          window.dispatchEvent(
            new CustomEvent('noteup_shared_note_live_update', {
              detail: {
                id: remoteNote.id,
                title: remoteNote.title || '',
                blocks: parsedBlocks,
                isShared: remoteNote.is_shared,
                deletedAt: remoteNote.deleted_at ? Number(remoteNote.deleted_at) : null,
                updatedAt: updatedTime,
              },
            })
          );
        }
      });
    } catch (err) {
      // Polling sessizce başarısız olabilir — Realtime devrededir
    }
  }, [myCode]);

  useEffect(() => {
    if (!myCode) return;

    // İlk yüklemede hemen çalıştır
    pollSharedNotes();

    // Her 30 saniyede bir polling (Realtime fallback)
    pollingIntervalRef.current = setInterval(pollSharedNotes, 30_000);

    // Uygulama arka plandan öne geldiğinde hemen sync et
    let appStateListener = null;
    try {
      CapApp.addListener('appStateChange', ({ isActive }) => {
        if (isActive) {
          // Ön plana gelindiğinde lastDispatchedMap'i sıfırla → zorla güncelleme
          lastDispatchedMapRef.current.clear();
          pollSharedNotes();
        }
      }).then((listener) => {
        appStateListener = listener;
      });
    } catch (_) {
      // Web ortamında CapApp çalışmaz — sessizce geç
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          lastDispatchedMapRef.current.clear();
          pollSharedNotes();
        }
      });
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      if (appStateListener) {
        try { appStateListener.remove(); } catch (_) {}
      }
    };
  }, [myCode, pollSharedNotes]);
};

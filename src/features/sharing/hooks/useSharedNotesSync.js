import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@src/supabaseClient';
import { playChime } from '@shared/services/soundService';
import { sendShareInviteNotification } from '@shared/services/notificationService';
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

  // 1. Reusable & resilient fetch for pending incoming note share invitations
  const syncIncomingPendingShares = useCallback(async (isInitial = false) => {
    if (!myCode) return;
    try {
      const myCodeUpper = String(myCode).trim().toUpperCase();
      const { data, error } = await supabase
        .from('note_shares')
        .select('*')
        .or(`to_code.eq.${myCodeUpper},to_code.eq.${myCode}`)
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

        // Notify user for newly discovered pending invitations
        data.forEach((item) => {
          if (!processedRequestIdsRef.current.has(item.id)) {
            processedRequestIdsRef.current.add(item.id);
            setToast?.({
              title: '🔔 Paylaşılan Not Daveti',
              msg: `"${item.from_name || 'Arkadaşınız'}" sizinle "${item.note_title || 'Not'}" notunu paylaştı. Paylaşılanlar sekmesinden kabul edebilirsiniz.`,
            });
            playChime();
            sendShareInviteNotification({
              fromName: item.from_name || 'Arkadaşınız',
              noteTitle: item.note_title || 'Paylaşılan Not',
              noteId: item.note_id,
            });
          }
        });
      }
    } catch (err) {
      console.warn('Error syncing incoming pending shares:', err);
    }
  }, [myCode, setToast, setPendingShareRequests]);

  useEffect(() => {
    if (!myCode) return;

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

    syncIncomingPendingShares(true);
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
          const toCodeMatches = recNew && (
            String(recNew.to_code).trim().toUpperCase() === String(myCode).trim().toUpperCase()
          );

          if (
            payload.eventType === 'INSERT' &&
            toCodeMatches &&
            recNew.status === 'pending'
          ) {
            syncIncomingPendingShares(false);
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
        if (err || status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          console.warn(`[Realtime] note_shares status: ${status}`, err);
          // Fallback on error: poll immediately so no shares are missed
          syncIncomingPendingShares(false);
          pollSharedNotes();
        }
      });
    } catch (e) {
      console.warn('[Realtime] Failed to initialize note_shares channel:', e);
      syncIncomingPendingShares(false);
      pollSharedNotes();
    }

    return () => {
      if (shareChannel) {
        try {
          supabase.removeChannel(shareChannel);
        } catch (e) {}
      }
    };
  }, [myCode, syncIncomingPendingShares]);

  // ─────────────────────────────────────────────────────────────────────────────
  // POLLING FALLBACK + FOREGROUND SYNC
  // Realtime bağlantısı koptuğunda veya paket kaçırdığında devreye girer.
  // Her 10 saniyede bir paylaşımlı notların ve gelen davetlerin güncel halini Supabase'den çeker.
  // ─────────────────────────────────────────────────────────────────────────────
  const pollSharedNotes = useCallback(async () => {
    if (!myCode) return;
    try {
      // 1. Bekleyen davetleri tazele
      await syncIncomingPendingShares(false);

      // 2. Hangi notları takip ettiğimizi öğren
      const myCodeUpper = String(myCode).trim().toUpperCase();
      const { data: shares } = await supabase
        .from('note_shares')
        .select('note_id, from_code, from_name')
        .or(`to_code.eq.${myCodeUpper},to_code.eq.${myCode},from_code.eq.${myCodeUpper},from_code.eq.${myCode}`)
        .eq('status', 'accepted');

      const acceptedShares = Array.isArray(shares) ? shares : [];
      const sharedNoteIds = [...new Set(acceptedShares.map((s) => s.note_id).filter(Boolean))];

      // Takip listesini güncelle (Realtime listener bu liste sayesinde filtre yapıyor)
      acceptedSharedNoteIdsRef.current = sharedNoteIds;

      if (sharedNoteIds.length === 0) return;

      // 3. Bu notların güncel hallerini çek
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
      // Polling sessizce başarısız olabilir
    }
  }, [myCode, syncIncomingPendingShares]);

  useEffect(() => {
    if (!myCode) return;

    // İlk yüklemede hemen çalıştır
    syncIncomingPendingShares(true);
    pollSharedNotes();

    // Her 10 saniyede bir periyodik polling
    pollingIntervalRef.current = setInterval(() => {
      syncIncomingPendingShares(false);
      pollSharedNotes();
    }, 10_000);

    // Sekme geçişi veya manuel yenileme eventi dinleyicisi
    const handleManualRefresh = () => {
      syncIncomingPendingShares(false);
      pollSharedNotes();
    };
    window.addEventListener('noteup_refresh_shares', handleManualRefresh);

    // Uygulama arka plandan öne geldiğinde hemen sync et
    let appStateListener = null;
    try {
      CapApp.addListener('appStateChange', ({ isActive }) => {
        if (isActive) {
          lastDispatchedMapRef.current.clear();
          syncIncomingPendingShares(false);
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
          syncIncomingPendingShares(false);
          pollSharedNotes();
        }
      });
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      window.removeEventListener('noteup_refresh_shares', handleManualRefresh);
      if (appStateListener) {
        try { appStateListener.remove(); } catch (_) {}
      }
    };
  }, [myCode, pollSharedNotes, syncIncomingPendingShares]);
};

import { useState, useEffect } from 'react';
import useFriendManager from './useFriendManager';
import { useSharedNotesSync } from './useSharedNotesSync';
import { PLAN_LIMITS } from '../constants/paywallPlans';
import { sanitizeSingleLine, sanitizeNoteContent } from '../utils/securityUtils';
import { supabase } from '../supabaseClient';

/**
 * useSharing - Manages friends, friend requests, real-time sync, and note/folder collaboration.
 */
export default function useSharing({
  user,
  myCode,
  profileName,
  userPlan,
  setUserPlan,
  notes,
  saveNotes,
  setToast,
  setShowPaywall,
  setShowRewardedAdModal,
}) {
  const [incomingRequest, setIncomingRequest] = useState(null);
  const [pendingShareReward, setPendingShareReward] = useState(null);

  // --- SUB-HOOK: FRIEND MANAGER ---
  const friendMgr = useFriendManager({
    myCode,
    profileName,
    userPlan,
    setUserPlan,
    setToast,
  });

  // Delegate Realtime shared notes WebSocket sync to single-responsibility hook
  useSharedNotesSync({
    myCode,
    notes,
    saveNotes,
    setToast,
    setIncomingRequest,
    setFriendRequests: friendMgr.setFriendRequests,
    setFriends: friendMgr.setFriends,
  });

  // --- AUTOMATIC SHARED NOTE CLEANUP WHEN FRIEND LIST CHANGES ---
  useEffect(() => {
    if (!friendMgr.friends || !notes || !Array.isArray(notes) || typeof saveNotes !== 'function') return;

    const activeFriendCodes = new Set((friendMgr.friends || []).map(f => f.code));
    let needsUpdate = false;

    const cleanedNotes = notes
      // 1. Remove notes shared with me by a user who is no longer a friend
      .filter(n => {
        if (n.sharedFrom && !activeFriendCodes.has(n.sharedFrom)) {
          needsUpdate = true;
          return false;
        }
        return true;
      })
      // 2. Remove non-friends from sharedWith array on my notes and update isShared
      .map(n => {
        if (!n.sharedFrom) {
          const currentSharedWith = Array.isArray(n.sharedWith) ? n.sharedWith : [];
          const validSharedWith = currentSharedWith.filter(code => activeFriendCodes.has(code));
          const shouldBeShared = validSharedWith.length > 0;

          if (n.isShared !== shouldBeShared || validSharedWith.length !== currentSharedWith.length) {
            needsUpdate = true;
            return {
              ...n,
              sharedWith: validSharedWith,
              isShared: shouldBeShared,
              updatedAt: Date.now(),
            };
          }
        }
        return n;
      });

    if (needsUpdate) {
      saveNotes(cleanedNotes);
    }
  }, [friendMgr.friends, notes]);

  // --- REWARDED AD CALLBACK ---
  // Reklam tamamlandıktan sonra çağrılır
  const handleRewardedShareCallback = (rewardData) => {
    const data = rewardData || pendingShareReward;
    if (!data) return;

    // Durum 1: Modal içinde arkadaş seçimi sırasında izlenen reklam (+1 hak)
    if (data.type === 'select_friend') {
      const { codeToSelect, onGranted } = data;
      if (onGranted && codeToSelect) {
        onGranted(codeToSelect);
      }
      setToast({
        title: '🎉 +1 Ekstra Davet Hakkı!',
        msg: 'Reklamı izlediğiniz için ekstra davet hakkı kazandınız.',
      });
      return;
    }

    // Durum 2: Doğrudan not paylaşımı
    const { noteId, codes } = data;
    if (!noteId || !Array.isArray(codes)) return;
    const noteToShare = notes.find(n => n.id === noteId);
    if (!noteToShare) return;

    const updatedNotes = notes.map(n =>
      n.id === noteId
        ? { ...n, isShared: true, sharedWith: codes, updatedAt: Date.now() }
        : n
    );
    saveNotes(updatedNotes);

    codes.forEach(code => {
      const currentReqs = JSON.parse(localStorage.getItem('s23_share_requests') || '[]');
      if (!currentReqs.some(r => r.toCode === code && r.noteId === noteId)) {
        const req = {
          id: 'req-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
          fromCode: myCode,
          fromName: profileName || 'Arkadaş',
          toCode: code,
          noteId: noteId,
          noteTitle: noteToShare.title,
          timestamp: Date.now(),
          processed: false,
        };
        localStorage.setItem('s23_share_requests', JSON.stringify([...currentReqs, req]));
        window.dispatchEvent(new StorageEvent('storage', {
          key: 's23_share_requests',
          newValue: JSON.stringify([...currentReqs, req]),
        }));
      }
    });

    setToast({
      title: '🎉 Davet Gönderildi!',
      msg: 'Reklamı izlediğiniz için davet başarıyla gönderildi.',
    });
  };

  // --- ACTIONS ---

  const handleSendShareInvitation = (activeShareNoteId) => {
    if (!activeShareNoteId) return;
    const noteToShare = notes.find(n => n.id === activeShareNoteId);
    if (!noteToShare) return;

    // Rule 1: Only the original owner (the creator) of the note can invite / manage sharing!
    if (noteToShare.sharedFrom) {
      setToast({
        title: "⚠️ Paylaşım Yetkisi",
        msg: "Bu notun sahibi siz değilsiniz. Sadece notun asıl sahibi davet gönderebilir!"
      });
      return;
    }

    // Rule 1.5: Locked notes cannot be shared with friends
    if (noteToShare.isLocked) {
      setToast({
        title: "🔒 Kilitli Not",
        msg: "Kilitli notlar başkalarıyla paylaşılamaz. Lütfen önce notun kilidini kaldırın."
      });
      return;
    }

    const isShared = friendMgr.selectedFriendCodes.length > 0;

    // Rule 2: Limit how many friends can be invited based on plan
    if (isShared) {
      const selectedCount = friendMgr.selectedFriendCodes.length;

      // Plan limitleri: Lite=1, Pro=8, Ultra/VIP=20
      const planLimits = { lite: 1, pro: 8, ultra: 20, vip: 20 };
      const limit = planLimits[userPlan] ?? 1;

      if (selectedCount > limit) {
        // Limit+1 (sadece 1 fazla) → Ödüllü reklam
        if (selectedCount === limit + 1 && setPendingShareReward && setShowRewardedAdModal) {
          setPendingShareReward({ noteId: activeShareNoteId, codes: friendMgr.selectedFriendCodes });
          setShowRewardedAdModal(true);
        } else {
          // Limitin çok üzerinde → Paywall
          setToast({
            title: '⚠️ Paylaşım Sınırı',
            msg: `Bu planında bir notaya en fazla ${limit + 1} kişi davet edebilirsiniz (${limit + 1}. için reklam izlemeniz gerekir).`,
          });
          setShowPaywall(true);
        }
        return;
      }

      // Lite: paylaşımlı not sınırı (5)
      if (userPlan === 'lite') {
        const totalSharedNotes = notes.filter(n => n.isShared && n.id !== activeShareNoteId).length;
        if (totalSharedNotes >= 5) {
          setToast({
            title: '⚠️ Paylaşımlı Not Sınırı',
            msg: 'Lite planında en fazla 5 paylaşımlı nota sahip olabilirsiniz. Pro\'ya geçerek limiti kaldırın.',
          });
          setShowPaywall(true);
          return;
        }
      }
    }

    
    // Update note locally
    const updatedNotes = notes.map(n => 
      n.id === activeShareNoteId 
        ? { ...n, isShared: isShared, sharedWith: friendMgr.selectedFriendCodes, updatedAt: Date.now() } 
        : n
    );
    saveNotes(updatedNotes);

    // 1. Delete share invitations/connections for friends that were removed
    const previousSharedWith = noteToShare.sharedWith || [];
    const removedCodes = previousSharedWith.filter(code => !friendMgr.selectedFriendCodes.includes(code));
    removedCodes.forEach(async (code) => {
      try {
        await supabase.from('note_shares').delete()
          .eq('from_code', myCode)
          .eq('note_id', noteToShare.id)
          .eq('to_code', code);
      } catch (err) {
        console.warn("Supabase note share delete error:", err);
      }
    });

    // 2. Send invitations to newly checked friends via Supabase
    const newlyAddedCodes = friendMgr.selectedFriendCodes.filter(code => !previousSharedWith.includes(code));
    newlyAddedCodes.forEach(async (code) => {
      try {
        await supabase.from('note_shares').insert([{
          from_code: myCode,
          from_name: profileName || ('Arkadaş (' + myCode.substring(9) + ')'),
          to_code: code,
          note_id: noteToShare.id,
          note_title: noteToShare.title || 'Paylaşılan Not',
          note_blocks: noteToShare.blocks || [],
          status: 'pending'
        }]);
      } catch (err) {
        console.warn("Supabase note share insert error:", err);
      }
    });

    friendMgr.setSelectedFriendCodes([]);
    setToast({
      title: isShared ? "📩 Paylaşım Güncellendi" : "🔒 Not Özel Yapıldı",
      msg: isShared ? "Not paylaşım ayarları kaydedildi." : "Not paylaşımı kapatıldı."
    });
  };

  const handleAcceptShare = async () => {
    if (!incomingRequest) return;
    
    // Check if we already have this note
    if (notes.some(n => n.id === incomingRequest.noteId)) {
      if (incomingRequest.id) {
        try {
          await supabase.from('note_shares').update({ status: 'accepted' }).eq('id', incomingRequest.id);
        } catch (err) {}
      }
      setIncomingRequest(null);
      setToast({ title: "ℹ️ Bilgi", msg: "Bu not zaten listenizde ekli." });
      return;
    }

    // Rule: Enforce maxSharedNotes limit (e.g. 5 for Lite)
    const limits = PLAN_LIMITS[userPlan] || PLAN_LIMITS.lite;
    const currentSharedCount = (notes || []).filter(n => n.isShared && !n.deletedAt).length;
    if (currentSharedCount >= limits.maxSharedNotes) {
      setToast({
        title: "⚠️ Paylaşımlı Not Sınırı",
        msg: `Lite planında en fazla ${limits.maxSharedNotes} paylaşımlı nota sahip olabilirsiniz. Sınırsız paylaşım için Pro'ya geçin!`
      });
      if (typeof setShowPaywall === 'function') setShowPaywall(true);
      return;
    }

    const sharedBlocks = incomingRequest.noteBlocks 
      ? incomingRequest.noteBlocks
      : (() => {
          const blks = [];
          if (incomingRequest.noteContent) blks.push({ id: 'b-s1-' + incomingRequest.noteId, type: 'text', content: incomingRequest.noteContent });
          if (incomingRequest.noteDebts?.length > 0) blks.push({ id: 'b-s2-' + incomingRequest.noteId, type: 'debt', items: incomingRequest.noteDebts });
          if (blks.length === 0) blks.push({ id: 'b-s1-' + incomingRequest.noteId, type: 'text', content: '' });
          return blks;
        })();

    const cleanBlocks = (sharedBlocks || []).map(b => {
      if (b && b.type === 'text' && typeof b.content === 'string') {
        return { ...b, content: sanitizeNoteContent(b.content) };
      }
      return b;
    });

    const newSharedNote = {
      id: incomingRequest.noteId,
      title: sanitizeSingleLine(incomingRequest.noteTitle || 'Paylaşılan Not', 150),
      blocks: cleanBlocks,
      isShared: true,
      sharedWith: [incomingRequest.fromCode],
      sharedFrom: incomingRequest.fromCode, // This node accepted it from original owner
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    saveNotes([newSharedNote, ...notes]);

    // Mark request as processed in Supabase DB
    if (incomingRequest.id) {
      try {
        await supabase.from('note_shares').update({ status: 'accepted' }).eq('id', incomingRequest.id);
      } catch (err) {}
    }
    
    setIncomingRequest(null);
    setToast({
      title: "✅ Davet Kabul Edildi",
      msg: `"${incomingRequest.noteTitle}" notu başarıyla paylaşıldı.`
    });
    friendMgr.playChime();
  };

  const handleRejectShare = async () => {
    if (!incomingRequest) return;
    
    // Mark request as rejected in Supabase DB
    if (incomingRequest.id) {
      try {
        await supabase.from('note_shares').update({ status: 'rejected' }).eq('id', incomingRequest.id);
      } catch (err) {}
    }
    
    setIncomingRequest(null);
    setToast({
      title: "❌ Davet Reddedildi",
      msg: "Paylaşım isteği reddedildi."
    });
  };

  const handleDisconnect = async (friendCode) => {
    if (!friendCode) return;

    // 1. Friend manager disconnect (UI + friend_requests + remove_friend RPC)
    await friendMgr.handleDisconnect(friendCode);

    // 2. Delete note_shares records in Supabase (in both directions)
    try {
      if (myCode) {
        await supabase.from('note_shares').delete().eq('from_code', myCode).eq('to_code', friendCode);
        await supabase.from('note_shares').delete().eq('from_code', friendCode).eq('to_code', myCode);
      }
    } catch (err) {
      console.warn("Supabase note_shares cleanup error on disconnect:", err);
    }

    // 3. Clean up local notes
    if (notes && Array.isArray(notes) && typeof saveNotes === 'function') {
      const activeFriendCodes = new Set(
        (friendMgr.friends || []).filter(f => f.code !== friendCode).map(f => f.code)
      );

      const updatedNotes = notes
        // Remove notes that were shared WITH me BY this friend
        .filter(n => n.sharedFrom !== friendCode)
        // For notes owned by me, remove friendCode from n.sharedWith. If empty, set isShared = false
        .map(n => {
          if (!n.sharedFrom) {
            const currentSharedWith = Array.isArray(n.sharedWith) ? n.sharedWith : [];
            const validSharedWith = currentSharedWith.filter(code => code !== friendCode && activeFriendCodes.has(code));
            const shouldBeShared = validSharedWith.length > 0;
            return {
              ...n,
              sharedWith: validSharedWith,
              isShared: shouldBeShared,
              updatedAt: Date.now(),
            };
          }
          return n;
        });

      saveNotes(updatedNotes);
    }
  };

  return {
    partnerCodeInput: friendMgr.partnerCodeInput,
    setPartnerCodeInput: friendMgr.setPartnerCodeInput,
    friends: friendMgr.friends,
    setFriends: friendMgr.setFriends,
    friendRequests: friendMgr.friendRequests,
    setFriendRequests: friendMgr.setFriendRequests,
    selectedFriendCodes: friendMgr.selectedFriendCodes,
    setSelectedFriendCodes: friendMgr.setSelectedFriendCodes,
    incomingRequest,
    setIncomingRequest,
    isSendingRequest: friendMgr.isSendingRequest,
    handleSendFriendRequest: friendMgr.handleSendFriendRequest,
    handleAcceptFriendRequest: friendMgr.handleAcceptFriendRequest,
    handleRejectFriendRequest: friendMgr.handleRejectFriendRequest,
    handleCancelFriendRequest: friendMgr.handleCancelFriendRequest,
    handleDisconnect,
    handleSendNudge: friendMgr.handleSendNudge,
    handleSendShareInvitation,
    handleAcceptShare,
    handleRejectShare,
    handleRewardedShareCallback,
    pendingShareReward,
    setPendingShareReward,
    grantedUltraFriendCode: friendMgr.grantedUltraFriendCode,
    ultraGiftFrom: friendMgr.ultraGiftFrom,
    isPrimaryUltra: friendMgr.isPrimaryUltra,
    isGiftedUltra: friendMgr.isGiftedUltra,
    handleGrantUltraGift: friendMgr.handleGrantUltraGift,
  };
}

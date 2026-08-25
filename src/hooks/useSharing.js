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
  const [pendingShareRequests, setPendingShareRequests] = useState([]);
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
    setToast,
    setPendingShareRequests,
    setFriendRequests: friendMgr.setFriendRequests,
    setFriends: friendMgr.setFriends,
  });

  // --- LISTEN TO REALTIME LIVE NOTE UPDATES & REVOCATIONS ---
  useEffect(() => {
    const handleLiveUpdate = (e) => {
      const updatedNote = e.detail;
      if (!updatedNote || !updatedNote.id) return;

      if (notes && Array.isArray(notes) && typeof saveNotes === 'function') {
        const existing = notes.find(n => n.id === updatedNote.id);
        if (existing) {
          if (updatedNote.deletedAt) {
            const filtered = notes.filter(n => n.id !== updatedNote.id);
            if (filtered.length !== notes.length) {
              saveNotes(filtered);
            }
            return;
          }
          const updated = notes.map(n => {
            if (n.id === updatedNote.id) {
              return {
                ...n,
                title: updatedNote.title !== undefined ? updatedNote.title : n.title,
                blocks: updatedNote.blocks || n.blocks,
                isShared: updatedNote.isShared !== undefined ? updatedNote.isShared : n.isShared,
                updatedAt: updatedNote.updatedAt || Date.now(),
              };
            }
            return n;
          });
          saveNotes(updated);
        }
      }
    };

    const handleRevokedOrRemoved = (e) => {
      const { noteId } = e.detail || {};
      if (!noteId) return;

      if (notes && Array.isArray(notes) && typeof saveNotes === 'function') {
        const filtered = notes.filter(n => n.id !== noteId);
        if (filtered.length !== notes.length) {
          saveNotes(filtered);
        }
      }
    };

    window.addEventListener('noteup_shared_note_live_update', handleLiveUpdate);
    window.addEventListener('noteup_shared_note_revoked', handleRevokedOrRemoved);
    window.addEventListener('noteup_shared_note_removed', handleRevokedOrRemoved);

    return () => {
      window.removeEventListener('noteup_shared_note_live_update', handleLiveUpdate);
      window.removeEventListener('noteup_shared_note_revoked', handleRevokedOrRemoved);
      window.removeEventListener('noteup_shared_note_removed', handleRevokedOrRemoved);
    };
  }, [notes, saveNotes]);

  // --- REWARDED AD CALLBACK ---
  const handleRewardedShareCallback = (rewardData) => {
    const data = rewardData || pendingShareReward;
    if (!data) return;

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
      const planLimits = { lite: 1, pro: 8, ultra: 20, vip: 20 };
      const limit = planLimits[userPlan] ?? 1;

      if (selectedCount > limit) {
        if (selectedCount === limit + 1 && setPendingShareReward && setShowRewardedAdModal) {
          setPendingShareReward({ noteId: activeShareNoteId, codes: friendMgr.selectedFriendCodes });
          setShowRewardedAdModal(true);
        } else {
          setToast({
            title: '⚠️ Paylaşım Sınırı',
            msg: `Bu planda bir nota en fazla ${limit + 1} kişi davet edebilirsiniz (${limit + 1}. için reklam izlemeniz gerekir).`,
          });
          setShowPaywall(true);
        }
        return;
      }

      if (userPlan === 'lite') {
        const totalSharedNotes = notes.filter(n => n.isShared && n.id !== activeShareNoteId && !n.deletedAt).length;
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

  const handleAcceptShare = async (targetRequest) => {
    const req = targetRequest || pendingShareRequests[0];
    if (!req) return;

    // Instantly remove from pending list
    setPendingShareRequests(prev => prev.filter(r => r.id !== req.id && r.noteId !== req.noteId));

    // Enforce maxSharedNotes limit for Lite
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

    const sharedBlocks = req.noteBlocks 
      ? req.noteBlocks
      : (() => {
          const blks = [];
          if (req.noteContent) blks.push({ id: 'b-s1-' + req.noteId, type: 'text', content: req.noteContent });
          if (req.noteDebts?.length > 0) blks.push({ id: 'b-s2-' + req.noteId, type: 'debt', items: req.noteDebts });
          if (blks.length === 0) blks.push({ id: 'b-s1-' + req.noteId, type: 'text', content: '' });
          return blks;
        })();

    const cleanBlocks = (sharedBlocks || []).map(b => {
      if (b && b.type === 'text' && typeof b.content === 'string') {
        return { ...b, content: sanitizeNoteContent(b.content) };
      }
      return b;
    });

    const newSharedNote = {
      id: req.noteId,
      title: sanitizeSingleLine(req.noteTitle || 'Paylaşılan Not', 150),
      blocks: cleanBlocks,
      isShared: true,
      sharedWith: [req.fromCode],
      sharedFrom: req.fromCode,
      sharedFromName: req.fromName || 'Arkadaş',
      createdAt: req.timestamp || Date.now(),
      updatedAt: Date.now()
    };

    // If note already in local list, update it; otherwise prepend
    const noteExists = (notes || []).some(n => n.id === req.noteId);
    const updatedNotes = noteExists
      ? (notes || []).map(n => n.id === req.noteId ? { ...n, ...newSharedNote } : n)
      : [newSharedNote, ...(notes || [])];

    saveNotes(updatedNotes);

    // Update status in Supabase
    if (req.id) {
      try {
        await supabase
          .from('note_shares')
          .update({ status: 'accepted', updated_at: new Date().toISOString() })
          .eq('id', req.id);
      } catch (err) {
        console.warn('Supabase note_shares update error on accept:', err);
      }
    }

    setToast({
      title: "✅ Davet Kabul Edildi",
      msg: `"${req.noteTitle || 'Not'}" listenize eklendi.`
    });
    friendMgr.playChime();
  };

  const handleRejectShare = async (targetRequest) => {
    const req = targetRequest || pendingShareRequests[0];
    if (!req) return;

    // Instantly remove from pending list
    setPendingShareRequests(prev => prev.filter(r => r.id !== req.id && r.noteId !== req.noteId));

    // Clean up if this note was previously added to state/storage mistakenly
    if (notes && Array.isArray(notes)) {
      const filtered = notes.filter(n => !(n.id === req.noteId && n.sharedFrom));
      if (filtered.length !== notes.length) {
        saveNotes(filtered);
      }
    }

    if (req.id) {
      try {
        await supabase
          .from('note_shares')
          .update({ status: 'rejected', updated_at: new Date().toISOString() })
          .eq('id', req.id);
      } catch (err) {
        console.warn('Supabase note_shares update error on reject:', err);
      }
    }

    setToast({
      title: "❌ Davet Reddedildi",
      msg: "Paylaşım isteği reddedildi."
    });
  };

  const handleLeaveShare = async (noteId) => {
    if (!noteId) return;
    const noteToLeave = (notes || []).find(n => n.id === noteId);
    if (!noteToLeave) return;

    // 1. Delete note_shares row in Supabase
    try {
      if (myCode) {
        await supabase
          .from('note_shares')
          .delete()
          .eq('note_id', noteId)
          .eq('to_code', myCode);
      }
    } catch (err) {
      console.warn("Supabase note_shares cleanup on leave:", err);
    }

    // 2. Remove locally
    const updatedNotes = (notes || []).filter(n => n.id !== noteId);
    saveNotes(updatedNotes);

    setToast({
      title: "👋 Paylaşımdan Ayrıldınız",
      msg: `"${noteToLeave.title || 'Not'}" listenizden kaldırıldı.`
    });
  };

  const handleDisconnect = async (friendCode) => {
    if (!friendCode) return;

    await friendMgr.handleDisconnect(friendCode);

    try {
      if (myCode) {
        await supabase.from('note_shares').delete().eq('from_code', myCode).eq('to_code', friendCode);
        await supabase.from('note_shares').delete().eq('from_code', friendCode).eq('to_code', myCode);
      }
    } catch (err) {
      console.warn("Supabase note_shares cleanup error on disconnect:", err);
    }

    if (notes && Array.isArray(notes) && typeof saveNotes === 'function') {
      const activeFriendCodes = new Set(
        (friendMgr.friends || []).filter(f => f.code !== friendCode).map(f => f.code)
      );

      const updatedNotes = notes
        .filter(n => n.sharedFrom !== friendCode)
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
    pendingShareRequests,
    setPendingShareRequests,
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
    handleLeaveShare,
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

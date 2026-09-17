import { useState } from 'react';
import useFriendManager from '@features/social/hooks/useFriendManager';
import { useSharedNotesSync } from '@features/sharing/hooks/useSharedNotesSync';
import { sanitizeSingleLine, sanitizeNoteContent } from '@shared/utils/securityUtils';
import { supabase } from '@src/supabaseClient';

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
}) {
  const [pendingShareRequests, setPendingShareRequests] = useState([]);

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
    user,
    setToast,
    setPendingShareRequests,
    setFriendRequests: friendMgr.setFriendRequests,
    setFriends: friendMgr.setFriends,
  });

  // --- ACTIONS ---

  const handleSendShareInvitation = (activeShareNoteId, customSelectedCodes) => {
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

    const currentSelectedCodes = Array.isArray(customSelectedCodes) 
      ? customSelectedCodes 
      : (friendMgr.selectedFriendCodes || []);

    const isShared = currentSelectedCodes.length > 0;

    // Compute accepted vs pending codes
    const previousSharedWith = noteToShare.sharedWith || [];
    const previousPending = noteToShare.pendingShares || [];
    const selectedCodes = currentSelectedCodes;

    const removedCodes = [...previousSharedWith, ...previousPending].filter(code => !selectedCodes.includes(code));
    const newlyAddedCodes = selectedCodes.filter(code => !previousSharedWith.includes(code) && !previousPending.includes(code));
    const activeSharedWith = previousSharedWith.filter(code => selectedCodes.includes(code));
    const activePendingShares = [...previousPending.filter(code => selectedCodes.includes(code)), ...newlyAddedCodes];

    const isActivelyShared = activeSharedWith.length > 0;
    const hasPendingShare = activePendingShares.length > 0;

    // Update note locally
    const updatedNotes = notes.map(n => 
      n.id === activeShareNoteId 
        ? {
            ...n,
            isShared: isActivelyShared,
            sharedWith: activeSharedWith,
            pendingShares: activePendingShares,
            hasPendingShare: hasPendingShare,
            updatedAt: Date.now()
          } 
        : n
    );
    saveNotes(updatedNotes);

    // 1. Mark share as revoked first so Supabase Realtime broadcasts full removal payload to collaborator, then delete
    removedCodes.forEach(async (code) => {
      try {
        await supabase
          .from('note_shares')
          .update({ status: 'revoked', updated_at: new Date().toISOString() })
          .eq('from_code', myCode)
          .eq('note_id', noteToShare.id)
          .eq('to_code', code);

        // Delete from database after a short delay so Realtime event finishes dispatching
        setTimeout(async () => {
          try {
            await supabase.from('note_shares').delete()
              .eq('from_code', myCode)
              .eq('note_id', noteToShare.id)
              .eq('to_code', code);
          } catch (_) {}
        }, 3000);
      } catch (err) {
        console.warn("Supabase note share revoke error:", err);
      }
    });

    // 2. Send invitations to newly checked friends via Supabase
    const codesToInvite = selectedCodes.filter(code => !activeSharedWith.includes(code));
    codesToInvite.forEach(async (code) => {
      const normalizedToCode = String(code).trim().toUpperCase();
      const normalizedFromCode = String(myCode).trim().toUpperCase();
      try {
        // Delete any existing row first to guarantee a clean state and trigger Realtime INSERT
        await supabase
          .from('note_shares')
          .delete()
          .eq('from_code', normalizedFromCode)
          .eq('to_code', normalizedToCode)
          .eq('note_id', noteToShare.id);

        await supabase.from('note_shares').insert([{
          from_code: normalizedFromCode,
          from_name: profileName || ('Arkadaş (' + normalizedFromCode.substring(9) + ')'),
          to_code: normalizedToCode,
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
      title: (isActivelyShared || hasPendingShare) ? "📩 Davet Gönderildi" : "🔒 Not Özel Yapıldı",
      msg: hasPendingShare
        ? "Paylaşım daveti gönderildi, arkadaşınızın onayı bekleniyor."
        : (isActivelyShared ? "Not paylaşım ayarları güncellendi." : "Not paylaşımı kapatıldı.")
    });
  };

  const handleAcceptShare = async (targetRequest) => {
    const req = targetRequest || pendingShareRequests[0];
    if (!req) return;

    // Instantly remove from pending list
    setPendingShareRequests(prev => prev.filter(r => r.id !== req.id && r.noteId !== req.noteId));

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
  };
}

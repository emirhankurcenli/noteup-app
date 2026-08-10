import { useState, useEffect } from 'react';
import useFriendManager from './useFriendManager';
import { PLAN_LIMITS } from '../constants/paywallPlans';
import { sanitizeSingleLine, sanitizeNoteContent } from '../utils/securityUtils';

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

  // --- CROSS-TAB SYNC & NOTIFICATION LISTENER ---
  useEffect(() => {
    if (!myCode) return;

    const handleStorageChange = (e) => {
      if (e.key === 's23_friend_requests') {
        const reqs = JSON.parse(e.newValue || '[]');
        friendMgr.setFriendRequests(reqs);

        // Process accepted friend requests sent by me
        const acceptedSentRequest = reqs.find(r => r.fromCode === myCode && r.status === 'accepted');
        if (acceptedSentRequest) {
          const newFriendCode = acceptedSentRequest.toCode;
          const currentFriends = JSON.parse(localStorage.getItem('s23_friends_' + myCode) || '[]');
          if (!currentFriends.some(f => f.code === newFriendCode)) {
            const newFriend = {
              code: newFriendCode,
              name: acceptedSentRequest.toName || 'Arkadaş (' + newFriendCode.substring(9) + ')'
            };
            const updatedFriends = [...currentFriends, newFriend];
            friendMgr.setFriends(updatedFriends);
            localStorage.setItem('s23_friends_' + myCode, JSON.stringify(updatedFriends));
            setToast({
              title: "🎉 Davet Kabul Edildi",
              msg: `${newFriend.name} arkadaşlık davetinizi kabul etti!`
            });
            friendMgr.playChime();
          }
        }
      }
      if (e.key === `s23_friends_${myCode}`) {
        friendMgr.setFriends(JSON.parse(e.newValue || '[]'));
      }
      if (e.key === `s23_nudge_${myCode}`) {
        const nudge = JSON.parse(e.newValue || '{}');
        if (nudge.fromName) {
          const customNoteMsg = nudge.customMessage ? `"${nudge.customMessage}"` : 'Sana bu notla ilgili bir bildirim gönderdi!';
          setToast({
            title: `🔔 Paylaşımlı Not Bildirimi`,
            msg: `${nudge.fromName} ("${nudge.noteTitle}"): ${customNoteMsg}`
          });
          friendMgr.playChime();
        }
      }
      if (e.key === 's23_share_requests') {
        const requests = JSON.parse(e.newValue || '[]');
        const myRequest = requests.find(r => r.toCode === myCode && !r.processed);
        if (myRequest) {
          setIncomingRequest(myRequest);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Initial check for incoming requests
    const requests = JSON.parse(localStorage.getItem('s23_share_requests') || '[]');
    const myRequest = requests.find(r => r.toCode === myCode && !r.processed);
    if (myRequest) {
      setIncomingRequest(myRequest);
    }

    return () => window.removeEventListener('storage', handleStorageChange);
  }, [myCode]);

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

    // Send invitations to newly checked friends
    friendMgr.selectedFriendCodes.forEach(code => {
      const currentReqs = JSON.parse(localStorage.getItem('s23_share_requests') || '[]');
      if (!currentReqs.some(r => r.toCode === code && r.noteId === noteToShare.id)) {
        const req = {
          id: 'req-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
          fromCode: myCode,
          fromName: profileName || 'Arkadaş (' + myCode.substring(9) + ')',
          toCode: code,
          noteId: noteToShare.id,
          noteTitle: noteToShare.title,
          noteContent: noteToShare.content,
          noteDebts: noteToShare.debts || [],
          processed: false
        };
        localStorage.setItem('s23_share_requests', JSON.stringify([...currentReqs, req]));
      }
    });

    friendMgr.setSelectedFriendCodes([]);
    setToast({
      title: isShared ? "🌐 Ortak Paylaşım Güncellendi" : "🔒 Not Özel Yapıldı",
      msg: isShared ? "Paylaşım daveti seçilen arkadaşlara gönderildi." : "Not paylaşımı kapatıldı."
    });
  };

  const handleAcceptShare = () => {
    if (!incomingRequest) return;
    
    // Check if we already have this note
    if (notes.some(n => n.id === incomingRequest.noteId)) {
      const reqs = JSON.parse(localStorage.getItem('s23_share_requests') || '[]');
      const updatedReqs = reqs.map(r => r.id === incomingRequest.id ? { ...r, processed: true } : r);
      localStorage.setItem('s23_share_requests', JSON.stringify(updatedReqs));
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

    // Mark request as processed
    const reqs = JSON.parse(localStorage.getItem('s23_share_requests') || '[]');
    const updatedReqs = reqs.map(r => r.id === incomingRequest.id ? { ...r, processed: true } : r);
    localStorage.setItem('s23_share_requests', JSON.stringify(updatedReqs));
    
    setIncomingRequest(null);
    setToast({
      title: "✅ Davet Kabul Edildi",
      msg: `"${incomingRequest.noteTitle}" notu başarıyla paylaşıldı.`
    });
    friendMgr.playChime();
  };

  const handleRejectShare = () => {
    if (!incomingRequest) return;
    
    // Mark request as processed
    const reqs = JSON.parse(localStorage.getItem('s23_share_requests') || '[]');
    const updatedReqs = reqs.map(r => r.id === incomingRequest.id ? { ...r, processed: true } : r);
    localStorage.setItem('s23_share_requests', JSON.stringify(updatedReqs));
    
    setIncomingRequest(null);
    setToast({
      title: "❌ Davet Reddedildi",
      msg: "Paylaşım isteği reddedildi."
    });
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
    handleSendFriendRequest: friendMgr.handleSendFriendRequest,
    handleAcceptFriendRequest: friendMgr.handleAcceptFriendRequest,
    handleRejectFriendRequest: friendMgr.handleRejectFriendRequest,
    handleDisconnect: friendMgr.handleDisconnect,
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

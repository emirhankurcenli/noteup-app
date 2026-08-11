import { useState, useEffect, useRef, useCallback } from 'react';
import { sanitizeFriendCode } from '../utils/securityUtils';
import { supabase } from '../supabaseClient';

// Helper to synthesize a beautiful in-app chime notification sound
const playChime = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const notesList = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 chime
    notesList.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime + idx * 0.08);
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + idx * 0.08 + 0.3);
      osc.start(audioCtx.currentTime + idx * 0.08);
      osc.stop(audioCtx.currentTime + idx * 0.08 + 0.3);
    });
  } catch (e) {
    console.log("Audio chime error:", e);
  }
};

// ── PERIOD & EXPIRATION HELPERS ──────────────────────────────────────────────
const getCurrentMonthKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const getCurrentPeriodEndMs = () => {
  const d = new Date();
  const nextMonth = new Date(d.getFullYear(), d.getMonth() + 1, 1, 0, 0, 0, 0);
  return nextMonth.getTime();
};

const useFriendManager = ({
  myCode,
  profileName,
  userPlan,
  setUserPlan,
  setToast,
}) => {
  const [partnerCodeInput, setPartnerCodeInput] = useState('HUB-');
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [selectedFriendCodes, setSelectedFriendCodes] = useState([]);
  const [isSendingRequest, setIsSendingRequest] = useState(false);
  const [inputErrorCallback, setInputErrorCallback] = useState(null);

  // Polling interval ref for real-time friend request updates
  const pollingRef = useRef(null);
  const prevRequestCountRef = useRef(0);

  // --- ULTRA GIFT RECORD STATE (FOR PRIMARY BUYER) ---
  const [ultraGrantRecord, setUltraGrantRecord] = useState(() => {
    const raw = localStorage.getItem(`s23_ultra_grant_record_${myCode}`);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      // If the grant record is from an old billing period, it resets automatically for new month!
      if (parsed.periodKey !== getCurrentMonthKey()) {
        localStorage.removeItem(`s23_ultra_grant_record_${myCode}`);
        return null;
      }
      return parsed;
    } catch (e) {
      return null;
    }
  });

  // --- ULTRA GIFT RECEIVED STATE (FOR GIFTED FRIEND) ---
  const [ultraGiftFrom, setUltraGiftFrom] = useState(() => {
    const raw = localStorage.getItem(`s23_ultra_gift_received_${myCode}`);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      // Period / Expiration Check: If period has ended or expired, gift is expired!
      if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
        localStorage.removeItem(`s23_ultra_gift_received_${myCode}`);
        return null;
      }
      if (parsed.periodKey && parsed.periodKey !== getCurrentMonthKey()) {
        localStorage.removeItem(`s23_ultra_gift_received_${myCode}`);
        return null;
      }
      return parsed;
    } catch (e) {
      return null;
    }
  });

  // Derived: Current friend code who received Ultra gift in current period
  const grantedUltraFriendCode = ultraGrantRecord?.periodKey === getCurrentMonthKey() ? ultraGrantRecord.targetCode : null;

  // Check if current user is primary Ultra buyer (purchased via store/billing)
  const isPrimaryUltra = userPlan === 'ultra' && !ultraGiftFrom;

  // Check if current user received Ultra as a gift from a friend
  const isGiftedUltra = !!ultraGiftFrom;

  // ── POLL FRIEND REQUESTS & ACCEPTED FRIENDS FROM SUPABASE EVERY 5 SECONDS ─
  const pollFriendRequests = useCallback(async () => {
    if (!myCode) return;

    // 1. Refresh from localStorage for pending requests
    const localReqs = JSON.parse(localStorage.getItem('s23_friend_requests') || '[]');

    // 2. Fetch incoming PENDING requests from Supabase
    try {
      const { data: pendingData } = await supabase
        .from('friend_requests')
        .select('*')
        .eq('to_code', myCode)
        .eq('status', 'pending');

      if (pendingData && pendingData.length > 0) {
        // Collect sender codes to fetch their avatar photo_urls
        const senderCodes = pendingData.map(r => r.from_code);
        const { data: senderProfiles } = await supabase
          .from('profiles')
          .select('friend_code, photo_url, name')
          .in('friend_code', senderCodes);

        const currentLocal = JSON.parse(localStorage.getItem('s23_friend_requests') || '[]');
        let changed = false;
        const merged = [...currentLocal];

        pendingData.forEach(remoteReq => {
          const senderProf = senderProfiles?.find(p => p.friend_code === remoteReq.from_code);
          const alreadyLocalIdx = merged.findIndex(l => l.id === remoteReq.id || (l.fromCode === remoteReq.from_code && l.toCode === remoteReq.to_code && !l.processed));
          
          const reqObj = {
            id: remoteReq.id,
            fromCode: remoteReq.from_code,
            fromName: senderProf?.name || remoteReq.from_name || remoteReq.from_code,
            fromPhotoUrl: senderProf?.photo_url || null,
            toCode: remoteReq.to_code,
            processed: false,
            status: 'pending'
          };

          if (alreadyLocalIdx === -1) {
            merged.push(reqObj);
            changed = true;
          } else if (!merged[alreadyLocalIdx].fromPhotoUrl && senderProf?.photo_url) {
            merged[alreadyLocalIdx].fromPhotoUrl = senderProf.photo_url;
            changed = true;
          }
        });

        if (changed) {
          localStorage.setItem('s23_friend_requests', JSON.stringify(merged));
          setFriendRequests(merged);

          const newPending = merged.filter(r => r.toCode === myCode && !r.processed && r.status === 'pending');
          if (newPending.length > prevRequestCountRef.current) {
            playChime();
            setToast({
              title: "👥 Yeni Arkadaşlık İsteği!",
              msg: `${newPending[newPending.length - 1]?.fromName || 'Birisi'} size arkadaşlık isteği gönderdi.`
            });
          }
          prevRequestCountRef.current = newPending.length;
        }
      }
    } catch (e) {
      setFriendRequests(localReqs);
    }

    // 3. Fetch ACCEPTED requests (where I am sender or recipient) to sync Friends List with Avatars
    try {
      const { data: acceptedData } = await supabase
        .from('friend_requests')
        .select('*')
        .or(`from_code.eq.${myCode},to_code.eq.${myCode}`)
        .eq('status', 'accepted');

      const storedFriends = JSON.parse(localStorage.getItem('s23_friends_' + myCode) || '[]');

      if (acceptedData && acceptedData.length > 0) {
        const friendCodes = acceptedData.map(r => r.from_code === myCode ? r.to_code : r.from_code);
        const validFriendCodesSet = new Set(friendCodes);

        // Fetch fresh profiles (names & photo_urls) for all friends
        const { data: friendProfiles } = await supabase
          .from('profiles')
          .select('friend_code, name, photo_url')
          .in('friend_code', friendCodes);

        let friendsUpdated = false;
        // Keep only friends that are still accepted in Supabase (removes deleted friends)
        const currentFriends = storedFriends.filter(f => validFriendCodesSet.has(f.code));
        if (currentFriends.length !== storedFriends.length) {
          friendsUpdated = true;
        }

        acceptedData.forEach(req => {
          const isMeSender = req.from_code === myCode;
          const friendCode = isMeSender ? req.to_code : req.from_code;
          const friendProf = friendProfiles?.find(p => p.friend_code === friendCode);
          const friendName = friendProf?.name || (isMeSender ? (req.to_name || friendCode) : (req.from_name || friendCode));
          const friendPhotoUrl = friendProf?.photo_url || null;

          const existingIdx = currentFriends.findIndex(f => f.code === friendCode);
          if (existingIdx === -1) {
            currentFriends.push({ code: friendCode, name: friendName, photo_url: friendPhotoUrl });
            friendsUpdated = true;
            playChime();
            setToast({
              title: "🤝 İsteğiniz Kabul Edildi!",
              msg: `${friendName} arkadaşlık isteğinizi kabul etti.`
            });
          } else {
            // Update name / photo_url if changed
            if (currentFriends[existingIdx].photo_url !== friendPhotoUrl || currentFriends[existingIdx].name !== friendName) {
              currentFriends[existingIdx].name = friendName;
              currentFriends[existingIdx].photo_url = friendPhotoUrl;
              friendsUpdated = true;
            }
          }
        });

        if (friendsUpdated) {
          localStorage.setItem('s23_friends_' + myCode, JSON.stringify(currentFriends));
          setFriends(currentFriends);
        }
      } else if (storedFriends.length > 0) {
        // If Supabase has no accepted friends for me, clear local friends list
        localStorage.setItem('s23_friends_' + myCode, JSON.stringify([]));
        setFriends([]);
      }
    } catch (e) {}

    // Notify if local pending count grew (same-device scenario)
    const localPending = localReqs.filter(r => r.toCode === myCode && !r.processed && r.status === 'pending');
    if (localPending.length > prevRequestCountRef.current) {
      playChime();
      setToast({
        title: "👥 Yeni Arkadaşlık İsteği!",
        msg: `${localPending[localPending.length - 1]?.fromName || 'Birisi'} size arkadaşlık isteği gönderdi.`
      });
      prevRequestCountRef.current = localPending.length;
    }
    setFriendRequests(localReqs);
  }, [myCode, setToast]);

  // --- INITIAL LOAD & PERIOD VALIDATION ---
  useEffect(() => {
    if (!myCode) return;
    const storedFriends = localStorage.getItem('s23_friends_' + myCode);
    if (storedFriends) {
      setFriends(JSON.parse(storedFriends));
    } else {
      setFriends([]);
    }

    // Initial load of friend requests
    const initialReqs = JSON.parse(localStorage.getItem('s23_friend_requests') || '[]');
    setFriendRequests(initialReqs);
    const initialPending = initialReqs.filter(r => r.toCode === myCode && !r.processed && r.status === 'pending');
    prevRequestCountRef.current = initialPending.length;

    // Check if someone gifted Ultra to me and if it's still valid for current period
    const giftRaw = localStorage.getItem(`s23_ultra_gift_received_${myCode}`);
    if (giftRaw) {
      try {
        const parsed = JSON.parse(giftRaw);
        const isExpired = (parsed.expiresAt && Date.now() > parsed.expiresAt) || (parsed.periodKey && parsed.periodKey !== getCurrentMonthKey());
        if (isExpired) {
          localStorage.removeItem(`s23_ultra_gift_received_${myCode}`);
          setUltraGiftFrom(null);
          // Fallback to default free plan when gift period ends
          setUserPlan('lite');
          setToast({
            title: "⏳ Ultra Süreniz Doldu",
            msg: "Arkadaşınızın hediye ettiği Ultra planının dönemsel süresi doldu."
          });
        } else {
          setUltraGiftFrom(parsed);
          if (userPlan !== 'ultra') {
            setUserPlan('ultra');
          }
        }
      } catch (e) {}
    }

    // Check primary buyer grant record for current month reset
    const grantRaw = localStorage.getItem(`s23_ultra_grant_record_${myCode}`);
    if (grantRaw) {
      try {
        const parsed = JSON.parse(grantRaw);
        if (parsed.periodKey === getCurrentMonthKey()) {
          setUltraGrantRecord(parsed);
        } else {
          // New period has started: reset gift capability for primary owner!
          localStorage.removeItem(`s23_ultra_grant_record_${myCode}`);
          setUltraGrantRecord(null);
        }
      } catch (e) {}
    }

    // Start polling every 5 seconds for incoming friend requests
    pollingRef.current = setInterval(pollFriendRequests, 5000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [myCode, userPlan, setUserPlan, pollFriendRequests]);

  // --- GRANT ULTRA GIFT TO A FRIEND (Primary Ultra Buyers Only) ---
  const handleGrantUltraGift = (friendCode, friendName) => {
    // SECURITY CHECK 1: Gifted Ultra members CANNOT grant Ultra to others!
    if (isGiftedUltra) {
      setToast({
        title: "🛡️ Güvenlik Kısıtlaması",
        msg: "Hediyeli Ultra üyelerinin başkasına Ultra hediye etme yetkisi bulunmamaktadır. Bu hak sadece Ultra planını doğrudan satın alan asıl üyelere aittir."
      });
      return;
    }

    // SECURITY CHECK 2: Must be a primary Ultra subscriber
    if (userPlan !== 'ultra') {
      setToast({
        title: "👑 NoteUp Ultra Gerekli",
        msg: "Arkadaşlarından birine Ultra plan hediye edebilmek için NoteUp Ultra aboneliğinizin aktif olması gerekmektedir."
      });
      return;
    }

    const currentPeriodKey = getCurrentMonthKey();
    const periodEndMs = getCurrentPeriodEndMs();
    const formattedPeriodEnd = new Date(periodEndMs).toLocaleDateString();

    // RULE 1: Gift cannot be revoked or changed once granted during the active period!
    if (ultraGrantRecord && ultraGrantRecord.periodKey === currentPeriodKey) {
      if (ultraGrantRecord.targetCode === friendCode) {
        setToast({
          title: "🔒 Hediye Bu Ay İçin Aktif",
          msg: `Bu ayki Ultra hediyeniz ${friendName} ile paylaşıldı. Verilen hediye ${formattedPeriodEnd} tarihine kadar geçerlidir ve bu dönem süresince geri alınamaz.`
        });
      } else {
        setToast({
          title: "⚠️ Bu Ayki Hediye Hakkınız Kullanıldı",
          msg: `Bu fatura dönemindeki Ultra hediyenizi ${ultraGrantRecord.targetName} adlı arkadaşınız için kullandınız. Yeni fatura döneminde (${formattedPeriodEnd}) farklı bir arkadaşınızı seçebilirsiniz.`
        });
      }
      return;
    }

    // RULE 2: Grant Ultra gift for current period (Sync period end date with primary buyer's subscription)
    const grantRecordObj = {
      targetCode: friendCode,
      targetName: friendName,
      periodKey: currentPeriodKey,
      expiresAt: periodEndMs,
      grantedAt: Date.now()
    };

    const giftReceivedObj = {
      fromCode: myCode,
      fromName: profileName || 'Arkadaşın',
      periodKey: currentPeriodKey,
      expiresAt: periodEndMs,
      grantedAt: Date.now()
    };

    localStorage.setItem(`s23_ultra_grant_record_${myCode}`, JSON.stringify(grantRecordObj));
    localStorage.setItem(`s23_ultra_gift_received_${friendCode}`, JSON.stringify(giftReceivedObj));

    setUltraGrantRecord(grantRecordObj);

    setToast({
      title: "👑 Ultra Plan Hediye Edildi!",
      msg: `${friendName} artık abonelik döneminiz bitene kadar (${formattedPeriodEnd}) NoteUp Ultra ayrıcalıklarından ücretsiz yararlanacak!`
    });
    playChime();
  };

  // ── SUPABASE REALTIME SUBSCRIPTION FOR INSTANT NOTIFICATIONS ─────────────
  useEffect(() => {
    if (!myCode) return;

    // Realtime channel for instant (sub-second) updates on friend_requests
    const channel = supabase
      .channel(`social_realtime_${myCode}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for INSERT, UPDATE
          schema: 'public',
          table: 'friend_requests'
        },
        () => {
          // Immediately trigger state refresh when DB changes
          pollFriendRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [myCode, pollFriendRequests]);

  // ── SEND FRIEND REQUEST (via Supabase RPC Function) ────────────────────────
  const handleSendFriendRequest = async (onInputError) => {
    if (!partnerCodeInput.trim() || isSendingRequest) return;
    const targetCode = sanitizeFriendCode(partnerCodeInput);

    if (targetCode.length < 5) {
      if (onInputError) onInputError("Geçerli bir profil kodu giriniz.");
      return;
    }
    if (targetCode === myCode) {
      if (onInputError) onInputError("Kendi kodunuza istek gönderemezsiniz.");
      return;
    }

    setIsSendingRequest(true);
    try {
      // Call Postgres Atomic Stored Procedure (send_friend_request)
      const { data: rpcRes, error: rpcErr } = await supabase.rpc('send_friend_request', {
        p_from_code: myCode,
        p_to_code: targetCode,
        p_from_name: profileName || 'Arkadaş (' + myCode.substring(9) + ')'
      });

      if (rpcErr) {
        console.error("RPC send_friend_request error:", rpcErr);
        if (onInputError) onInputError("İstek gönderilemedi. Lütfen bağlantınızı kontrol edin.");
        return;
      }

      if (rpcRes && rpcRes.success === false) {
        // Business logic error returned directly from Database (ALREADY_PENDING, ALREADY_FRIENDS, NOT_FOUND, etc.)
        if (onInputError) onInputError(rpcRes.message || "İstek gönderilemedi.");
        return;
      }

      // Success! Clear input and refresh requests
      setPartnerCodeInput('HUB-');
      setToast({
        title: "✉️ İstek Gönderildi",
        msg: `${rpcRes?.to_name || targetCode} adlı kullanıcıya arkadaşlık daveti gönderildi.`
      });
      playChime();
      pollFriendRequests();
    } catch (err) {
      console.error("handleSendFriendRequest exception:", err);
      if (onInputError) onInputError("Bir hata oluştu.");
    } finally {
      setIsSendingRequest(false);
    }
  };

  const handleAcceptFriendRequest = async (req) => {
    try {
      const { data: res, error: err } = await supabase.rpc('accept_friend_request', {
        p_request_id: req.id,
        p_user_code: myCode
      });

      if (err) console.error("RPC accept_friend_request error:", err);

      const newFriend = {
        code: req.fromCode,
        name: req.fromName,
        photo_url: req.fromPhotoUrl || null
      };
      const updatedFriends = [...friends.filter(f => f.code !== req.fromCode), newFriend];
      setFriends(updatedFriends);
      localStorage.setItem('s23_friends_' + myCode, JSON.stringify(updatedFriends));

      const reqs = JSON.parse(localStorage.getItem('s23_friend_requests') || '[]');
      const updatedReqs = reqs.map(r => r.id === req.id ? { ...r, processed: true, status: 'accepted' } : r);
      localStorage.setItem('s23_friend_requests', JSON.stringify(updatedReqs));
      setFriendRequests(updatedReqs);

      const newPending = updatedReqs.filter(r => r.toCode === myCode && !r.processed && r.status === 'pending');
      prevRequestCountRef.current = newPending.length;

      setToast({
        title: "🤝 Arkadaş Eklendi",
        msg: `${req.fromName} ile artık arkadaşsınız!`
      });
      playChime();
      pollFriendRequests();
    } catch (e) {
      console.error("handleAcceptFriendRequest error:", e);
    }
  };

  const handleRejectFriendRequest = async (req) => {
    try {
      await supabase.rpc('reject_friend_request', {
        p_request_id: req.id,
        p_user_code: myCode
      });

      const reqs = JSON.parse(localStorage.getItem('s23_friend_requests') || '[]');
      const updatedReqs = reqs.map(r => r.id === req.id ? { ...r, processed: true, status: 'declined' } : r);
      localStorage.setItem('s23_friend_requests', JSON.stringify(updatedReqs));
      setFriendRequests(updatedReqs);

      const newPending = updatedReqs.filter(r => r.toCode === myCode && !r.processed && r.status === 'pending');
      prevRequestCountRef.current = newPending.length;

      setToast({
        title: "❌ İstek Reddedildi",
        msg: "Arkadaşlık daveti reddedildi."
      });
      pollFriendRequests();
    } catch (e) {
      console.error("handleRejectFriendRequest error:", e);
    }
  };

  const handleDisconnect = async (friendCode) => {
    if (window.confirm("Bu arkadaşı silmek istiyor musunuz?")) {
      const updated = friends.filter(f => f.code !== friendCode);
      setFriends(updated);
      localStorage.setItem('s23_friends_' + myCode, JSON.stringify(updated));

      try {
        await supabase.rpc('remove_friend', {
          p_user_code: myCode,
          p_friend_code: friendCode
        });
      } catch (err) {
        console.error("remove_friend RPC error:", err);
      }

      setToast({
        title: "❌ Arkadaş Silindi",
        msg: "Bağlantı sonlandırıldı."
      });
      pollFriendRequests();
    }
  };

  const handleSendNudge = (note, customMessage = '') => {
    if (!note) return false;
    
    // Check 10-minute cooldown per note
    const lastNudgeMs = parseInt(localStorage.getItem(`s23_nudge_cooldown_${note.id}`) || '0', 10);
    const nowMs = Date.now();
    const COOLDOWN_MS = 10 * 60 * 1000;

    if (nowMs - lastNudgeMs < COOLDOWN_MS) {
      const remSec = Math.ceil((COOLDOWN_MS - (nowMs - lastNudgeMs)) / 1000);
      const remMins = Math.floor(remSec / 60);
      const remSecsLeft = remSec % 60;
      const timeText = remMins > 0 ? `${remMins} dakika ${remSecsLeft} saniye` : `${remSecsLeft} saniye`;
      
      if (triggerHaptic) triggerHaptic('warning');
      setToast({
        title: "⏳ 10 Dakika Bekleme Süresi",
        msg: `Bu not için tekrar bildirim göndermek için ${timeText} beklemeniz gerekmektedir.`
      });
      return false;
    }

    const recipients = new Set();
    if (note.sharedWith && Array.isArray(note.sharedWith)) {
      note.sharedWith.forEach(code => recipients.add(code));
    }
    if (note.sharedFrom) {
      recipients.add(note.sharedFrom);
    }
    
    if (recipients.size === 0) {
      if (triggerHaptic) triggerHaptic('warning');
      setToast({
        title: "⚠️ Paylaşılan Kişi Yok",
        msg: "Bu not henüz kimseyle paylaşılmamış."
      });
      return false;
    }

    recipients.forEach(friendCode => {
      const nudgePayload = {
        from: myCode,
        fromName: profileName || ('Arkadaş (' + myCode.substring(9) + ')'),
        to: friendCode,
        noteId: note.id,
        noteTitle: note.title || 'Başlıksız Not',
        customMessage: (customMessage || '').trim(),
        timestamp: Date.now()
      };
      localStorage.setItem(`s23_nudge_${friendCode}`, JSON.stringify(nudgePayload));
    });

    localStorage.setItem(`s23_nudge_cooldown_${note.id}`, Date.now().toString());

    if (triggerHaptic) triggerHaptic('success');
    setToast({
      title: "📣 Bildirim Gönderildi",
      msg: "Notun paylaşıldığı arkadaşlarınıza bildiriminiz iletildi."
    });
    return true;
  };

  return {
    partnerCodeInput,
    setPartnerCodeInput,
    friends,
    setFriends,
    friendRequests,
    setFriendRequests,
    selectedFriendCodes,
    setSelectedFriendCodes,
    grantedUltraFriendCode,
    ultraGrantRecord,
    ultraGiftFrom,
    isPrimaryUltra,
    isGiftedUltra,
    isSendingRequest,
    handleGrantUltraGift,
    playChime,
    handleSendFriendRequest,
    handleAcceptFriendRequest,
    handleRejectFriendRequest,
    handleDisconnect,
    handleSendNudge,
  };
};

export default useFriendManager;

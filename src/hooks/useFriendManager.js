import { useState, useEffect, useRef, useCallback } from 'react';
import { sanitizeFriendCode } from '../utils/securityUtils';
import { supabase } from '../supabaseClient';
import { triggerHaptic } from '../services/haptics';
import { playChime } from '../services/soundService';

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

    const localReqs = JSON.parse(localStorage.getItem('s23_friend_requests') || '[]');

    // Fetch ALL pending requests (incoming + outgoing) from Supabase
    try {
      const { data: pendingData } = await supabase
        .from('friend_requests')
        .select('*')
        .or(`to_code.eq.${myCode},from_code.eq.${myCode}`)
        .eq('status', 'pending');

      if (pendingData) {
        // Collect all related codes to fetch fresh profile names/avatars
        const relatedCodes = pendingData.map(r => r.from_code === myCode ? r.to_code : r.from_code);
        const { data: relatedProfiles } = await supabase
          .from('profiles')
          .select('friend_code, photo_url, name')
          .in('friend_code', relatedCodes.length > 0 ? relatedCodes : ['dummy']);

        const merged = [];

        pendingData.forEach(remoteReq => {
          const isIncoming = remoteReq.to_code === myCode;
          const otherCode = isIncoming ? remoteReq.from_code : remoteReq.to_code;
          const otherProf = relatedProfiles?.find(p => p.friend_code === otherCode);

          const reqObj = {
            id: remoteReq.id,
            fromCode: remoteReq.from_code,
            fromName: isIncoming
              ? (otherProf?.name || remoteReq.from_name || remoteReq.from_code)
              : (remoteReq.from_name || myCode),
            toCode: remoteReq.to_code,
            toName: !isIncoming
              ? (otherProf?.name || remoteReq.to_name || remoteReq.to_code)
              : (remoteReq.to_name || myCode),
            fromPhotoUrl: isIncoming ? (otherProf?.photo_url || null) : null,
            processed: false,
            status: 'pending'
          };
          merged.push(reqObj);
        });

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

    // NOTE: Do NOT fall back to localReqs here — Supabase is the source of truth.
    // If Supabase fetch succeeded above, state is already set correctly.
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
    // Filter to only my incoming/outgoing requests to avoid unnecessary polls
    const channel = supabase
      .channel(`social_realtime_${myCode}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friend_requests',
          filter: `to_code=eq.${myCode}`
        },
        () => { pollFriendRequests(); }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friend_requests',
          filter: `from_code=eq.${myCode}`
        },
        () => { pollFriendRequests(); }
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
      // 1. First attempt: Try with Supabase RPC function
      let rpcSuccess = false;
      let targetUserName = targetCode;

      try {
        let { data: rpcRes, error: rpcErr } = await supabase.rpc('send_friend_request', {
          p_from_code: myCode,
          p_to_code: targetCode,
          p_from_name: profileName || 'Arkadaş (' + myCode.substring(9) + ')'
        });

        // Retry unhyphenated if formatted fails
        if (rpcRes && rpcRes.success === false && rpcRes.error === 'Bu profil koduna sahip kullanıcı bulunamadı.') {
          const rawCode = targetCode.replace(/-/g, '');
          const retryRes = await supabase.rpc('send_friend_request', {
            p_from_code: myCode,
            p_to_code: rawCode,
            p_from_name: profileName || 'Arkadaş (' + myCode.substring(9) + ')'
          });
          if (retryRes.data) rpcRes = retryRes.data;
        }

        if (!rpcErr && rpcRes && rpcRes.success !== false) {
          rpcSuccess = true;
          targetUserName = rpcRes.to_name || targetCode;
        } else if (rpcRes && rpcRes.error && rpcRes.error !== 'Bu profil koduna sahip kullanıcı bulunamadı.') {
          if (onInputError) onInputError(rpcRes.error);
          setIsSendingRequest(false);
          return;
        }
      } catch (rpcEx) {
        console.warn("RPC send_friend_request not available, falling back to direct table query:", rpcEx);
      }

      // 2. Direct Table Fallback if RPC didn't handle it
      if (!rpcSuccess) {
        const rawTarget = targetCode.replace(/[^A-Z0-9]/gi, '').toUpperCase();
        const rawWithoutHub = rawTarget.replace(/^HUB/i, '');
        const formattedTarget = rawWithoutHub.length >= 8 
          ? `HUB-${rawWithoutHub.substring(0, 4)}-${rawWithoutHub.substring(4, 8)}` 
          : `HUB-${rawWithoutHub}`;

        // Search profiles table using clean exact equals (avoids PostgREST parser errors)
        let { data: matchedProfiles, error: profErr } = await supabase
          .from('profiles')
          .select('friend_code, my_code, name, id')
          .or(`friend_code.eq.${targetCode},my_code.eq.${targetCode},friend_code.eq.${formattedTarget},my_code.eq.${formattedTarget},friend_code.eq.${rawTarget},my_code.eq.${rawTarget}`)
          .limit(1);

        if (profErr) {
          console.error("Direct profile search error:", profErr);
        }

        let foundProfile = matchedProfiles && matchedProfiles.length > 0 ? matchedProfiles[0] : null;

        // Secondary fallback search if exact match returned nothing
        if (!foundProfile && rawWithoutHub.length > 2) {
          const { data: retryProfiles } = await supabase
            .from('profiles')
            .select('friend_code, my_code, name, id')
            .ilike('friend_code', `%${rawWithoutHub}%`)
            .limit(1);
          
          if (retryProfiles && retryProfiles.length > 0) {
            foundProfile = retryProfiles[0];
          } else {
            const { data: retryMyCode } = await supabase
              .from('profiles')
              .select('friend_code, my_code, name, id')
              .ilike('my_code', `%${rawWithoutHub}%`)
              .limit(1);
            if (retryMyCode && retryMyCode.length > 0) {
              foundProfile = retryMyCode[0];
            }
          }
        }

        if (!foundProfile) {
          if (onInputError) onInputError("Bu profil koduna sahip kullanıcı bulunamadı. Arkadaşınızın uygulamayı açtığından emin olun.");
          setIsSendingRequest(false);
          return;
        }

        const matchedCode = foundProfile.friend_code || foundProfile.my_code || targetCode;

        if (matchedCode === myCode) {
          if (onInputError) onInputError("Kendi kodunuza istek gönderemezsiniz.");
          setIsSendingRequest(false);
          return;
        }

        // Check if request or friendship already exists in friend_requests
        const { data: existingReqs } = await supabase
          .from('friend_requests')
          .select('id, status')
          .or(`and(from_code.eq.${myCode},to_code.eq.${matchedCode}),and(from_code.eq.${matchedCode},to_code.eq.${myCode})`);

        if (existingReqs && existingReqs.length > 0) {
          const accepted = existingReqs.find(r => r.status === 'accepted');
          const pending = existingReqs.find(r => r.status === 'pending');
          if (accepted) {
            if (onInputError) onInputError("Bu kullanıcı zaten arkadaş listenizde.");
            setIsSendingRequest(false);
            return;
          }
          if (pending) {
            if (onInputError) onInputError("Bu kullanıcı ile zaten bekleyen bir davet var.");
            setIsSendingRequest(false);
            return;
          }
        }

        // Insert new request directly into friend_requests table
        // Include explicit id in case the DB column has no DEFAULT set
        const newReqId = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
        const { error: insertErr } = await supabase
          .from('friend_requests')
          .insert({
            id: newReqId,
            from_code: myCode,
            to_code: matchedCode,
            from_name: profileName || 'Arkadaş',
            to_name: foundProfile.name || matchedCode,
            status: 'pending'
          });

        if (insertErr) {
          console.error("Direct friend_requests insert error:", insertErr);
          if (onInputError) onInputError("İstek gönderilirken bir veritabanı hatası oluştu.");
          setIsSendingRequest(false);
          return;
        }

        targetUserName = foundProfile.name || matchedCode;
      }

      // Success! Clear input and refresh requests
      setPartnerCodeInput('HUB-');
      setToast({
        title: "✉️ İstek Gönderildi",
        msg: `${targetUserName} adlı kullanıcıya arkadaşlık daveti gönderildi.`
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
      // 1. Try RPC first
      let rpcOk = false;
      try {
        const { error: rpcErr } = await supabase.rpc('accept_friend_request', {
          p_request_id: req.id,
          p_user_code: myCode
        });
        if (!rpcErr) rpcOk = true;
      } catch (rpcEx) {
        console.warn('accept_friend_request RPC not found, using direct update:', rpcEx);
      }

      // 2. Direct DB update fallback if RPC failed or doesn't exist
      if (!rpcOk) {
        const { error: updateErr } = await supabase
          .from('friend_requests')
          .update({ status: 'accepted' })
          .eq('id', req.id);

        if (updateErr) {
          console.error('Direct accept update error:', updateErr);
          setToast({ title: '❌ Hata', msg: 'İstek kabul edilemedi, lütfen tekrar deneyin.' });
          return;
        }
      }

      // 3. Update local state optimistically
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
        title: '🤝 Arkadaş Eklendi',
        msg: `${req.fromName} ile artık arkadaşsınız!`
      });
      playChime();
      pollFriendRequests();
    } catch (e) {
      console.error('handleAcceptFriendRequest error:', e);
      setToast({ title: '❌ Hata', msg: 'Bir hata oluştu, lütfen tekrar deneyin.' });
    }
  };

  const handleRejectFriendRequest = async (req) => {
    try {
      // 1. Try RPC first
      let rpcOk = false;
      try {
        const { error: rpcErr } = await supabase.rpc('reject_friend_request', {
          p_request_id: req.id,
          p_user_code: myCode
        });
        if (!rpcErr) rpcOk = true;
      } catch (rpcEx) {
        console.warn('reject_friend_request RPC not found, using direct delete:', rpcEx);
      }

      // 2. Direct DB fallback: delete the request row
      if (!rpcOk) {
        const { error: delErr } = await supabase
          .from('friend_requests')
          .delete()
          .eq('id', req.id);

        if (delErr) {
          console.error('Direct reject delete error:', delErr);
          setToast({ title: '❌ Hata', msg: 'İstek reddedilemedi, lütfen tekrar deneyin.' });
          return;
        }
      }

      // 3. Update local state
      const reqs = JSON.parse(localStorage.getItem('s23_friend_requests') || '[]');
      const updatedReqs = reqs.filter(r => r.id !== req.id);
      localStorage.setItem('s23_friend_requests', JSON.stringify(updatedReqs));
      setFriendRequests(updatedReqs);

      const newPending = updatedReqs.filter(r => r.toCode === myCode && !r.processed && r.status === 'pending');
      prevRequestCountRef.current = newPending.length;

      setToast({
        title: '❌ İstek Reddedildi',
        msg: 'Arkadaşlık daveti reddedildi.'
      });
      pollFriendRequests();
    } catch (e) {
      console.error('handleRejectFriendRequest error:', e);
      setToast({ title: '❌ Hata', msg: 'Bir hata oluştu, lütfen tekrar deneyin.' });
    }
  };

  const handleDisconnect = async (friendCode) => {
    const updated = friends.filter(f => f.code !== friendCode);
    setFriends(updated);
    localStorage.setItem('s23_friends_' + myCode, JSON.stringify(updated));

    try {
      // Direct DB deletions (both directions) — no RPC needed
      await supabase.from('friend_requests').delete().eq('from_code', myCode).eq('to_code', friendCode);
      await supabase.from('friend_requests').delete().eq('from_code', friendCode).eq('to_code', myCode);
    } catch (err) {
      console.error('handleDisconnect DB delete error:', err);
    }

    setToast({
      title: '❌ Arkadaş Silindi',
      msg: 'Bağlantı ve paylaşımlı notlar sonlandırıldı.'
    });
    pollFriendRequests();
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

  const handleCancelFriendRequest = async (reqId, toCode) => {
    try {
      // 1. Delete from Supabase friend_requests table
      if (reqId && typeof reqId === 'string' && reqId.length > 5) {
        await supabase.from('friend_requests').delete().eq('id', reqId);
      } else {
        await supabase.from('friend_requests').delete().eq('from_code', myCode).eq('to_code', toCode);
      }

      // 2. Clear from local storage and state
      const localReqs = JSON.parse(localStorage.getItem('s23_friend_requests') || '[]');
      const updatedReqs = localReqs.filter(r => !(r.id === reqId || (r.fromCode === myCode && r.toCode === toCode)));
      localStorage.setItem('s23_friend_requests', JSON.stringify(updatedReqs));
      setFriendRequests(updatedReqs);

      setToast({ title: "🚫 İstek İptal Edildi", msg: "Gönderilen arkadaşlık isteği geri çekildi." });
      pollFriendRequests();
    } catch (e) {
      console.error("Cancel friend request error:", e);
    }
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
    handleCancelFriendRequest,
    handleDisconnect,
    handleSendNudge,
  };
};

export default useFriendManager;

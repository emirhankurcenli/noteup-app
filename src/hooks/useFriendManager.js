import { useState, useEffect } from 'react';
import { sanitizeFriendCode } from '../utils/securityUtils';

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

  // --- INITIAL LOAD & PERIOD VALIDATION ---
  useEffect(() => {
    if (!myCode) return;
    const storedFriends = localStorage.getItem('s23_friends_' + myCode);
    if (storedFriends) {
      setFriends(JSON.parse(storedFriends));
    } else {
      setFriends([]);
    }
    setFriendRequests(JSON.parse(localStorage.getItem('s23_friend_requests') || '[]'));

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
  }, [myCode, userPlan, setUserPlan]);

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

  const handleSendFriendRequest = () => {
    if (!partnerCodeInput.trim()) return;
    const targetCode = sanitizeFriendCode(partnerCodeInput);
    if (targetCode.length < 5) return;
    if (targetCode === myCode) {
      setToast({ title: "⚠️ Hata", msg: "Kendi kodunuza istek gönderemezsiniz." });
      return;
    }
    if (friends.some(f => f.code === targetCode)) {
      setToast({ title: "⚠️ Hata", msg: "Bu arkadaş zaten listenizde ekli." });
      return;
    }

    const currentReqs = JSON.parse(localStorage.getItem('s23_friend_requests') || '[]');
    if (currentReqs.some(r => r.fromCode === myCode && r.toCode === targetCode && !r.processed)) {
      setToast({ title: "⚠️ Hata", msg: "Bu kişiye zaten arkadaşlık isteği gönderilmiş." });
      return;
    }

    const newReq = {
      id: 'freq-' + Date.now(),
      fromCode: myCode,
      fromName: profileName || 'Arkadaş (' + myCode.substring(9) + ')',
      toCode: targetCode,
      processed: false,
      status: 'pending'
    };

    const updatedReqs = [...currentReqs, newReq];
    localStorage.setItem('s23_friend_requests', JSON.stringify(updatedReqs));
    setFriendRequests(updatedReqs);
    setPartnerCodeInput('HUB-');
    setToast({
      title: "✉️ İstek Gönderildi",
      msg: `${targetCode} kodlu kullanıcıya arkadaşlık daveti gönderildi.`
    });
    playChime();
  };

  const handleAcceptFriendRequest = (req) => {
    const newFriend = {
      code: req.fromCode,
      name: req.fromName
    };
    const updatedFriends = [...friends, newFriend];
    setFriends(updatedFriends);
    localStorage.setItem('s23_friends_' + myCode, JSON.stringify(updatedFriends));

    const reqs = JSON.parse(localStorage.getItem('s23_friend_requests') || '[]');
    const updatedReqs = reqs.map(r => r.id === req.id ? { ...r, processed: true, status: 'accepted', toName: profileName } : r);
    localStorage.setItem('s23_friend_requests', JSON.stringify(updatedReqs));
    setFriendRequests(updatedReqs);

    setToast({
      title: "🤝 Arkadaş Eklendi",
      msg: `${req.fromName} ile artık arkadaşsınız!`
    });
    playChime();
  };

  const handleRejectFriendRequest = (req) => {
    const reqs = JSON.parse(localStorage.getItem('s23_friend_requests') || '[]');
    const updatedReqs = reqs.map(r => r.id === req.id ? { ...r, processed: true, status: 'declined' } : r);
    localStorage.setItem('s23_friend_requests', JSON.stringify(updatedReqs));
    setFriendRequests(updatedReqs);

    setToast({
      title: "❌ İstek Reddedildi",
      msg: "Arkadaşlık daveti reddedildi."
    });
  };

  const handleDisconnect = (friendCode) => {
    if (window.confirm("Bu arkadaşı silmek istiyor musunuz?")) {
      const updated = friends.filter(f => f.code !== friendCode);
      setFriends(updated);
      localStorage.setItem('s23_friends_' + myCode, JSON.stringify(updated));
      setToast({
        title: "❌ Arkadaş Silindi",
        msg: "Bağlantı sonlandırıldı."
      });
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

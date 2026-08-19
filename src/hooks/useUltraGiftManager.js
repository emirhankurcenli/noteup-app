import { useState } from 'react';
import { supabase } from '../supabaseClient';

const getCurrentMonthKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const getCurrentPeriodEndMs = () => {
  const d = new Date();
  const nextMonth = new Date(d.getFullYear(), d.getMonth() + 1, 1, 0, 0, 0, 0);
  return nextMonth.getTime();
};

export const useUltraGiftManager = ({ myCode, userPlan, setToast, triggerHaptic }) => {
  // Ultra grant record state for primary buyer
  const [ultraGrantRecord, setUltraGrantRecord] = useState(() => {
    if (!myCode) return null;
    const raw = localStorage.getItem(`s23_ultra_grant_record_${myCode}`);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      if (parsed.periodKey !== getCurrentMonthKey()) {
        localStorage.removeItem(`s23_ultra_grant_record_${myCode}`);
        return null;
      }
      return parsed;
    } catch (e) {
      return null;
    }
  });

  // Ultra gift received state for gifted friend
  const [ultraGiftFrom, setUltraGiftFrom] = useState(() => {
    if (!myCode) return null;
    const raw = localStorage.getItem(`s23_ultra_gift_received_${myCode}`);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
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

  const grantedUltraFriendCode = ultraGrantRecord?.periodKey === getCurrentMonthKey() ? ultraGrantRecord.targetCode : null;
  const isPrimaryUltra = userPlan === 'ultra' && !ultraGiftFrom;
  const isGiftedUltra = !!ultraGiftFrom;

  const handleGrantUltraGift = async (targetFriendCode, targetFriendName = 'Arkadaş') => {
    if (!isPrimaryUltra) {
      if (setToast) setToast({ title: "⚠️ Yetki Yok", msg: "Yalnızca Ultra satın alan asıl aboneler hediye verebilir." });
      return false;
    }

    if (grantedUltraFriendCode && grantedUltraFriendCode !== targetFriendCode) {
      if (setToast) setToast({ title: "⚠️ Kota Dolu", msg: "Bu ayki 1 adet Ultra hediyenizi zaten başka bir arkadaşınıza verdiniz." });
      return false;
    }

    try {
      // Direct DB RPC or record save
      const grantData = {
        periodKey: getCurrentMonthKey(),
        targetCode: targetFriendCode,
        targetName: targetFriendName,
        grantedAt: Date.now(),
        expiresAt: getCurrentPeriodEndMs(),
      };

      localStorage.setItem(`s23_ultra_grant_record_${myCode}`, JSON.stringify(grantData));
      setUltraGrantRecord(grantData);

      // Save gifted payload for target code
      const giftReceivedPayload = {
        fromCode: myCode,
        periodKey: getCurrentMonthKey(),
        expiresAt: getCurrentPeriodEndMs(),
      };
      localStorage.setItem(`s23_ultra_gift_received_${targetFriendCode}`, JSON.stringify(giftReceivedPayload));

      try {
        await supabase.from('profiles').update({ user_plan: 'ultra' }).eq('friend_code', targetFriendCode);
      } catch (e) {}

      if (triggerHaptic) triggerHaptic('success');
      if (setToast) {
        setToast({
          title: "🎁 Ultra Hediye Edildi!",
          msg: `${targetFriendName} artık bu ay boyunca NoteUp Ultra ayrıcalıklarından ücretsiz yararlanabilir!`
        });
      }
      return true;
    } catch (e) {
      console.error("handleGrantUltraGift error:", e);
      return false;
    }
  };

  return {
    grantedUltraFriendCode,
    ultraGrantRecord,
    ultraGiftFrom,
    isPrimaryUltra,
    isGiftedUltra,
    handleGrantUltraGift,
  };
};

export default useUltraGiftManager;

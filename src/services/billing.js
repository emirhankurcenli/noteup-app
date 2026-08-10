import { Purchases, LOG_LEVEL } from '@revenuecat/purchases-capacitor';
import { Capacitor } from '@capacitor/core';

const getRevenueCatApiKey = () => {
  return import.meta.env.VITE_REVENUECAT_KEY || "goog_klpvzugPjsJwnTuzpqHEafDShcM";
};

export const initRevenueCat = async (setUserPlan) => {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await Purchases.setLogLevel({ level: LOG_LEVEL.ERROR });

    const apiKey = getRevenueCatApiKey();
    if (!apiKey) return;
    await Purchases.configure({ apiKey });

    // Try to login with current cached user if available
    const localUserRaw = localStorage.getItem('s23_user');
    if (localUserRaw) {
      try {
        const localUser = JSON.parse(localUserRaw);
        if (localUser && (localUser.uid || localUser.id)) {
          const appUserId = localUser.uid || localUser.id;
          await Purchases.logIn({ appUserID: appUserId });
        }
      } catch (parseErr) {
        // Sessizce devam et
      }
    }

    const customerInfo = await Purchases.getCustomerInfo();
    const active = customerInfo?.entitlements?.active || {};
    let activePlan = null;
    if (active['ultra'] !== undefined || active['NoteUp Ultra'] !== undefined || active['Ultra'] !== undefined) {
      activePlan = 'ultra';
    } else if (active['pro'] !== undefined || active['NoteUp Pro'] !== undefined || active['Pro'] !== undefined) {
      activePlan = 'pro';
    }

    // Yalnızca RevenueCat'te aktif pro/ultra bulunduğunda güncelle (Supabase hediyelerini ezme)
    if (activePlan) {
      setUserPlan(activePlan);
      localStorage.setItem('s23_user_plan', activePlan);
    }
  } catch (err) {
    console.error("RevenueCat configuration failed:", err);
  }
};

export const syncRevenueCatUser = async (user) => {
  if (!Capacitor.isNativePlatform()) return null;
  try {
    if (user) {
      const appUserId = user.id || user.uid;
      await Purchases.logIn({ appUserID: appUserId });
      const customerInfo = await Purchases.getCustomerInfo();
      const active = customerInfo?.entitlements?.active || {};
      let activePlan = 'lite';
      if (active['ultra'] !== undefined || active['NoteUp Ultra'] !== undefined || active['Ultra'] !== undefined) {
        activePlan = 'ultra';
      } else if (active['pro'] !== undefined || active['NoteUp Pro'] !== undefined || active['Pro'] !== undefined) {
        activePlan = 'pro';
      }
      return activePlan;
    } else {
      await Purchases.logOut();
    }
  } catch (err) {
    console.error("RevenueCat user sync failed:", err);
  }
  return null;
};


import { Purchases, LOG_LEVEL } from '@revenuecat/purchases-capacitor';

export const getApiKey = () => {
  return import.meta.env.VITE_REVENUECAT_IOS_KEY || import.meta.env.VITE_REVENUECAT_KEY || "";
};

export const initBilling = async (setUserPlan) => {
  try {
    await Purchases.setLogLevel({ level: LOG_LEVEL.ERROR });
    const apiKey = getApiKey();
    if (!apiKey) return;
    await Purchases.configure({ apiKey });

    const localUserRaw = localStorage.getItem('s23_user');
    if (localUserRaw) {
      try {
        const localUser = JSON.parse(localUserRaw);
        const appUserId = localUser?.uid || localUser?.id;
        if (appUserId) {
          await Purchases.logIn({ appUserID: appUserId });
        }
      } catch (parseErr) {}
    }

    const customerInfo = await Purchases.getCustomerInfo();
    const active = customerInfo?.entitlements?.active || {};
    let activePlan = null;
    if (active['ultra'] !== undefined || active['NoteUp Ultra'] !== undefined || active['Ultra'] !== undefined) {
      activePlan = 'ultra';
    } else if (active['pro'] !== undefined || active['NoteUp Pro'] !== undefined || active['Pro'] !== undefined) {
      activePlan = 'pro';
    }

    if (activePlan) {
      setUserPlan(activePlan);
      localStorage.setItem('s23_user_plan', activePlan);
    }
  } catch (err) {
    console.error("iOS RevenueCat billing init failed:", err);
  }
};

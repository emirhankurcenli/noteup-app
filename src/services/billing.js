import { detectPlatform } from '../platform/detect';
import * as androidBilling from '../platform/android/billing.android';
import * as iosBilling from '../platform/ios/billing.ios';
import * as webBilling from '../platform/web/billing.web';
import { Purchases } from '@revenuecat/purchases-capacitor';
import { Capacitor } from '@capacitor/core';

export const getRevenueCatApiKey = () => {
  const plt = detectPlatform();
  if (plt === 'android') return androidBilling.getApiKey();
  if (plt === 'ios') return iosBilling.getApiKey();
  return webBilling.getApiKey();
};

export const initRevenueCat = async (setUserPlan) => {
  const plt = detectPlatform();
  if (plt === 'android') return await androidBilling.initBilling(setUserPlan);
  if (plt === 'ios') return await iosBilling.initBilling(setUserPlan);
  return await webBilling.initBilling(setUserPlan);
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


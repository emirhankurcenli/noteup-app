import { AdMob } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

export const showInterstitialAd = async (onFallback) => {
  if (Capacitor.isNativePlatform()) {
    try {
      await AdMob.initialize({ requestTrackingAuthorization: true });
      await AdMob.prepareInterstitial({
        adId: 'ca-app-pub-3940256099942544/1033173712', // Test AdMob Interstitial Unit ID
        isTesting: true,
      });
      await AdMob.showInterstitial();
    } catch (err) {
      console.error("AdMob interstitial error:", err);
      if (onFallback) onFallback();
    }
  } else {
    if (onFallback) onFallback();
  }
};

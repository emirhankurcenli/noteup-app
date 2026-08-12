import { AdMob } from '@capacitor-community/admob';

export const showInterstitialAd = async (onFallback) => {
  try {
    await AdMob.initialize({ requestTrackingAuthorization: true });
    await AdMob.prepareInterstitial({
      adId: import.meta.env.VITE_ADMOB_ANDROID_INTERSTITIAL_ID || 'ca-app-pub-3940256099942544/1033173712',
      isTesting: true,
    });
    await AdMob.showInterstitial();
  } catch (err) {
    console.error("AdMob Android interstitial error:", err);
    if (onFallback) onFallback();
  }
};

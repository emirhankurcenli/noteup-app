import { AdMob } from '@capacitor-community/admob';

export const showInterstitialAd = async (onFallback) => {
  let timeoutId = null;

  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error("AdMob request timed out after 8 seconds"));
    }, 8000);
  });

  const adPromise = (async () => {
    await AdMob.initialize({ requestTrackingAuthorization: true });
    await AdMob.prepareInterstitial({
      adId: import.meta.env.VITE_ADMOB_ANDROID_INTERSTITIAL_ID || 'ca-app-pub-3940256099942544/1033173712',
      isTesting: true,
    });
    return await AdMob.showInterstitial();
  })();

  try {
    await Promise.race([adPromise, timeoutPromise]);
  } catch (err) {
    console.warn("AdMob Android interstitial warning/timeout:", err);
    if (onFallback) onFallback();
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
};


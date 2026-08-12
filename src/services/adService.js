import { detectPlatform } from '../platform/detect';
import * as androidAds from '../platform/android/ads.android';
import * as iosAds from '../platform/ios/ads.ios';
import * as webAds from '../platform/web/ads.web';

export const showInterstitialAd = async (onFallback) => {
  const plt = detectPlatform();
  if (plt === 'android') {
    return await androidAds.showInterstitialAd(onFallback);
  } else if (plt === 'ios') {
    return await iosAds.showInterstitialAd(onFallback);
  } else {
    return await webAds.showInterstitialAd(onFallback);
  }
};


import { Capacitor } from '@capacitor/core';

/**
 * Returns the active platform: 'android' | 'ios' | 'web'
 */
export const detectPlatform = () => {
  const plt = Capacitor.getPlatform();
  if (plt === 'android') return 'android';
  if (plt === 'ios') return 'ios';
  return 'web';
};

export const isNativePlatform = () => {
  return Capacitor.isNativePlatform();
};

export default detectPlatform;

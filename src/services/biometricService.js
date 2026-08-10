import { registerPlugin, Capacitor } from '@capacitor/core';

// Helper for biometric / phone lock authentication (Fingerprint, Face ID, PIN, Pattern, Password)
export const requestBiometricAuth = async (
  title = 'Not Kilitli',
  subtitle = 'Notu açmak için parmak izi, yüz tanıma veya telefon şifrenizi girin'
) => {
  try {
    const Biometric = registerPlugin('BiometricPlugin');
    if (Biometric && typeof Biometric.authenticate === 'function') {
      const res = await Biometric.authenticate({ title, subtitle });
      return res && res.success === true;
    }
  } catch (e) {
    console.warn("Biometric authentication failed or cancelled:", e);
    return false;
  }

  // Web dev environment fallback
  if (typeof Capacitor !== 'undefined' && !Capacitor.isNativePlatform()) {
    return true;
  }

  return false;
};

import { detectPlatform } from '../platform/detect';
import * as androidBiometric from '../platform/android/biometric.android';
import * as iosBiometric from '../platform/ios/biometric.ios';
import * as webBiometric from '../platform/web/biometric.web';

// Helper for biometric / phone lock authentication (Fingerprint, Face ID, PIN, Pattern, Password)
export const requestBiometricAuth = async (
  title = 'Not Kilitli',
  subtitle = 'Notu açmak için parmak izi, yüz tanıma veya telefon şifrenizi girin'
) => {
  const plt = detectPlatform();
  if (plt === 'android') {
    return await androidBiometric.authenticate({ title, subtitle });
  } else if (plt === 'ios') {
    return await iosBiometric.authenticate({ title, subtitle });
  } else {
    return await webBiometric.authenticate({ title, subtitle });
  }
};


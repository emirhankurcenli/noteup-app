import { registerPlugin } from '@capacitor/core';

const BiometricPlugin = registerPlugin('BiometricPlugin');

export const authenticate = async (options = {}) => {
  try {
    if (BiometricPlugin && typeof BiometricPlugin.authenticate === 'function') {
      const res = await BiometricPlugin.authenticate({
        title: options.title || 'NoteUp Güvenlik Doğrulaması',
        subtitle: options.subtitle || 'Notlarınıza erişmek için doğrulama yapın',
      });
      return res?.success === true;
    }
    return true;
  } catch (e) {
    console.warn("Android biometric auth error:", e);
    return false;
  }
};

/**
 * CryptoService — Client-Side End-to-End Encryption (AES-256-GCM)
 */

import { deriveKey, bufferToBase64, base64ToBuffer, getFallbackUserKey } from './crypto/keyDerivation';
import { encryptText, decryptText } from './crypto/aesEncryption';

export const CryptoService = {
  deriveKey,
  bufferToBase64,
  base64ToBuffer,
  getFallbackUserKey,
  encrypt: encryptText,
  decrypt: decryptText,

  /**
   * Objedeki belirtilen alanları şifreler
   */
  encryptObjectFields: async (obj, fieldsToEncrypt, secretKey) => {
    if (!obj || typeof obj !== "object") return obj;
    const cloned = { ...obj };

    for (const field of fieldsToEncrypt) {
      if (cloned[field] && typeof cloned[field] === "string") {
        cloned[field] = await encryptText(cloned[field], secretKey);
      }
    }

    return cloned;
  },

  /**
   * Objedeki belirtilen şifreli alanları çözer
   */
  decryptObjectFields: async (obj, fieldsToDecrypt, secretKey) => {
    if (!obj || typeof obj !== "object") return obj;
    const cloned = { ...obj };

    for (const field of fieldsToDecrypt) {
      if (cloned[field] && typeof cloned[field] === "string") {
        cloned[field] = await decryptText(cloned[field], secretKey);
      }
    }

    return cloned;
  },
};

export default CryptoService;

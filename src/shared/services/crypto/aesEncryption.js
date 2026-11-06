import { deriveKey, bufferToBase64, base64ToBuffer } from '@shared/services/crypto/keyDerivation';

const ALGORITHM = "AES-GCM";
const LEGACY_DEFAULT_KEY = "NoteUp_Default_Vault_Key_2026";
const LEGACY_DEVICE_KEY = "NoteUp_Vault_Device_Key_2026";

export const encryptText = async (plainText, secretKey = null) => {
  if (!plainText || typeof plainText !== "string") return plainText;
  if (plainText.startsWith("ENC:v1:")) return plainText;

  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(plainText);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    // secretKey null olduğunda deriveKey otomatik olarak getFallbackUserKey() kullanır (user.uid veya cihaz UUID)
    const key = await deriveKey(secretKey);

    const encryptedBuffer = await window.crypto.subtle.encrypt(
      { name: ALGORITHM, iv: iv },
      key,
      data,
    );

    const ivBase64 = bufferToBase64(iv);
    const cipherBase64 = bufferToBase64(encryptedBuffer);

    return `ENC:v1:${ivBase64}:${cipherBase64}`;
  } catch (err) {
    console.error("[CryptoService] Encryption error:", err);
    throw new Error("Veri şifrelenirken bir hata oluştu");
  }
};

export const decryptText = async (
  encryptedString,
  secretKey = null,
) => {
  if (!encryptedString || typeof encryptedString !== "string") return encryptedString;
  if (!encryptedString.startsWith("ENC:v1:")) return encryptedString;

  const parts = encryptedString.split(":");
  if (parts.length !== 4) return encryptedString;

  const iv = base64ToBuffer(parts[2]);
  const cipherBuffer = base64ToBuffer(parts[3]);

  // 1. Kullanıcı veya cihaza özel birincil anahtarla çözmeyi dene
  try {
    const key = await deriveKey(secretKey);
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: ALGORITHM, iv: iv },
      key,
      cipherBuffer,
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch (err) {
    // 2. Geriye dönük uyumluluk: Eski genel anahtarla şifrelenmiş verileri kurtar
    const fallbackCandidates = [LEGACY_DEFAULT_KEY, LEGACY_DEVICE_KEY];
    for (const fallbackKey of fallbackCandidates) {
      if (secretKey === fallbackKey) continue;
      try {
        const legacyKey = await deriveKey(fallbackKey);
        const decryptedBuffer = await window.crypto.subtle.decrypt(
          { name: ALGORITHM, iv: iv },
          legacyKey,
          cipherBuffer,
        );
        const decoder = new TextDecoder();
        return decoder.decode(decryptedBuffer);
      } catch (_) {}
    }

    console.error("[CryptoService] Decryption failed:", err);
    return "[Şifre Çözülemedi - Hatalı Anahtar]";
  }
};

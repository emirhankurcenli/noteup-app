import { deriveKey, bufferToBase64, base64ToBuffer } from './keyDerivation';

const ALGORITHM = "AES-GCM";
const LEGACY_FALLBACK_KEY = "NoteUp_Vault_Device_Key_2026";

export const encryptText = async (plainText, secretKey = "NoteUp_Default_Vault_Key_2026") => {
  if (!plainText || typeof plainText !== "string") return plainText;
  if (plainText.startsWith("ENC:v1:")) return plainText;

  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(plainText);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
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
  secretKey = "NoteUp_Default_Vault_Key_2026",
) => {
  if (!encryptedString || typeof encryptedString !== "string") return encryptedString;
  if (!encryptedString.startsWith("ENC:v1:")) return encryptedString;

  try {
    const parts = encryptedString.split(":");
    if (parts.length !== 4) return encryptedString;

    const iv = base64ToBuffer(parts[2]);
    const cipherBuffer = base64ToBuffer(parts[3]);
    const key = await deriveKey(secretKey);

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: ALGORITHM, iv: iv },
      key,
      cipherBuffer,
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch (err) {
    if (secretKey !== LEGACY_FALLBACK_KEY) {
      try {
        const parts = encryptedString.split(":");
        const iv = base64ToBuffer(parts[2]);
        const cipherBuffer = base64ToBuffer(parts[3]);
        const legacyKey = await deriveKey(LEGACY_FALLBACK_KEY);
        const decryptedBuffer = await window.crypto.subtle.decrypt(
          { name: ALGORITHM, iv: iv },
          legacyKey,
          cipherBuffer,
        );
        const decoder = new TextDecoder();
        return decoder.decode(decryptedBuffer);
      } catch (legacyErr) {}
    }
    console.error("[CryptoService] Decryption failed:", err);
    return "[Şifre Çözülemedi - Hatalı Anahtar]";
  }
};

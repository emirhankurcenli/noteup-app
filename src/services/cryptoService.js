/**
 * CryptoService — Client-Side End-to-End Encryption (AES-256-GCM)
 *
 * Web Crypto API (window.crypto.subtle) kullanarak verileri istemci tarafında
 * güvenli bir şekilde şifreler ve çözer. Veritabanına veya yerel depolamaya
 * hiçbir zaman düz metin (plaintext) şifre/veri yazılmaz.
 */

const PBKDF2_ITERATIONS = 100000;
const KEY_LENGTH = 256;
const ALGORITHM = "AES-GCM";

// Fallback sabit uygulama tuzu (per-user salt ile güçlendirilebilir)
const DEFAULT_APP_SALT = new Uint8Array([
  78, 111, 116, 101, 85, 112, 95, 83, 101, 99, 117, 114, 101, 95, 83, 97,
]);

/**
 * ArrayBuffer -> Base64 string
 */
function bufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Base64 string -> Uint8Array
 */
function base64ToBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

const getFallbackUserKey = () => {
  try {
    const raw = localStorage.getItem('s23_user');
    if (raw) {
      const u = JSON.parse(raw);
      if (u && (u.uid || u.id)) return `NoteUp_Vault_${u.uid || u.id}`;
    }
  } catch (e) {}
  return "NoteUp_Vault_Device_Key_2026";
};

export const CryptoService = {
  /**
   * Master Paroladan veya User ID'den AES-256 Kriptografik Anahtar türetir
   */
  deriveKey: async (passphrase, customSalt = null) => {
    const effectivePass = passphrase || getFallbackUserKey();
    const encoder = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      "raw",
      encoder.encode(effectivePass),
      { name: "PBKDF2" },
      false,
      ["deriveKey"],
    );

    const salt = customSalt ? base64ToBuffer(customSalt) : DEFAULT_APP_SALT;

    return await window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: PBKDF2_ITERATIONS,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: ALGORITHM, length: KEY_LENGTH },
      false,
      ["encrypt", "decrypt"],
    );
  },

  /**
   * Metni AES-256-GCM ile şifreler
   * @returns {Promise<string>} 'ENC:v1:<iv_base64>:<ciphertext_base64>'
   */
  encrypt: async (plainText, secretKey = "NoteUp_Default_Vault_Key_2026") => {
    if (!plainText || typeof plainText !== "string") return plainText;

    // Zaten şifrelenmişse tekrar şifreleme
    if (plainText.startsWith("ENC:v1:")) return plainText;

    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(plainText);

      // Her şifrelemede benzersiz 12-byte IV (Initialization Vector)
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      const key = await CryptoService.deriveKey(secretKey);

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
  },

  /**
   * AES-256-GCM ile şifrelenmiş metni çözer
   * @param {string} encryptedString 'ENC:v1:<iv_base64>:<ciphertext_base64>'
   */
  decrypt: async (
    encryptedString,
    secretKey = "NoteUp_Default_Vault_Key_2026",
  ) => {
    if (!encryptedString || typeof encryptedString !== "string")
      return encryptedString;

    // Şifreli formatta değilse olduğu gibi döndür (geriye dönük uyumluluk)
    if (!encryptedString.startsWith("ENC:v1:")) return encryptedString;

    try {
      const parts = encryptedString.split(":");
      if (parts.length !== 4) return encryptedString;

      const iv = base64ToBuffer(parts[2]);
      const cipherBuffer = base64ToBuffer(parts[3]);
      const key = await CryptoService.deriveKey(secretKey);

      const decryptedBuffer = await window.crypto.subtle.decrypt(
        { name: ALGORITHM, iv: iv },
        key,
        cipherBuffer,
      );

      const decoder = new TextDecoder();
      return decoder.decode(decryptedBuffer);
    } catch (err) {
      console.error(
        "[CryptoService] Decryption failed (wrong key or corrupted data):",
        err,
      );
      return "[Şifre Çözülemedi - Hatalı Anahtar]";
    }
  },

  /**
   * Objedeki belirtilen alanları şifreler
   */
  encryptObjectFields: async (obj, fieldsToEncrypt, secretKey) => {
    if (!obj || typeof obj !== "object") return obj;
    const cloned = { ...obj };

    for (const field of fieldsToEncrypt) {
      if (cloned[field] && typeof cloned[field] === "string") {
        cloned[field] = await CryptoService.encrypt(cloned[field], secretKey);
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
        cloned[field] = await CryptoService.decrypt(cloned[field], secretKey);
      }
    }

    return cloned;
  },
};

export default CryptoService;

const PBKDF2_ITERATIONS = 100000;
const KEY_LENGTH = 256;
const ALGORITHM = "AES-GCM";

const DEFAULT_APP_SALT = new Uint8Array([
  78, 111, 116, 101, 85, 112, 95, 83, 101, 99, 117, 114, 101, 95, 83, 97,
]);

export function bufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64ToBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

const DEVICE_KEY_STORAGE = "__noteup_device_vault_key";

export const getFallbackUserKey = () => {
  try {
    const raw = localStorage.getItem('s23_user');
    if (raw) {
      const u = JSON.parse(raw);
      if (u && (u.uid || u.id)) return `NoteUp_Vault_${u.uid || u.id}`;
    }
  } catch (e) {}

  try {
    let deviceKey = localStorage.getItem(DEVICE_KEY_STORAGE);
    if (!deviceKey) {
      deviceKey = `NoteUp_Device_${crypto.randomUUID()}_${Date.now()}`;
      localStorage.setItem(DEVICE_KEY_STORAGE, deviceKey);
    }
    return deviceKey;
  } catch (e) {
    return `NoteUp_Session_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  }
};

export const deriveKey = async (passphrase, customSalt = null) => {
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
};

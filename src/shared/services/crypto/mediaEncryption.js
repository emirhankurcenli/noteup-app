import { bufferToBase64, base64ToBuffer } from './keyDerivation.js';

const ALGORITHM = 'AES-GCM';
const IV_LENGTH = 12; // 96-bit IV for AES-GCM

// In-memory decrypted Object URL cache: url -> objectUrl
const mediaBlobCache = new Map();

// In-memory key cache: base64Key -> CryptoKey
const importedKeyCache = new Map();

// Pending decryption deduplication map: url -> Promise<string>
const pendingDecryptions = new Map();

/**
 * Generates a high-entropy 256-bit AES key (Base64 encoded)
 */
export const generateMediaKey = () => {
  const rawKey = window.crypto.getRandomValues(new Uint8Array(32));
  return bufferToBase64(rawKey);
};

/**
 * Imports a Base64 key into a CryptoKey instance with caching
 */
export const importMediaKey = async (base64Key) => {
  if (!base64Key || typeof base64Key !== 'string') {
    throw new Error('Geçersiz şifreleme anahtarı');
  }

  if (importedKeyCache.has(base64Key)) {
    return importedKeyCache.get(base64Key);
  }

  const rawBytes = base64ToBuffer(base64Key);
  const cryptoKey = await window.crypto.subtle.importKey(
    'raw',
    rawBytes,
    { name: ALGORITHM },
    false,
    ['encrypt', 'decrypt']
  );

  importedKeyCache.set(base64Key, cryptoKey);
  return cryptoKey;
};

/**
 * Encrypts a binary Blob using AES-256-GCM
 * Returns an encrypted Blob with a 12-byte IV prepended
 */
export const encryptMediaBlob = async (blob, base64Key) => {
  if (!blob) throw new Error('Şifrelenecek medya dosyası bulunamadı.');
  const key = await importMediaKey(base64Key);

  const arrayBuffer = await blob.arrayBuffer();
  const iv = window.crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  const cipherBuffer = await window.crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    arrayBuffer
  );

  // Prepend 12-byte IV to ciphertext
  const combinedBuffer = new Uint8Array(IV_LENGTH + cipherBuffer.byteLength);
  combinedBuffer.set(iv, 0);
  combinedBuffer.set(new Uint8Array(cipherBuffer), IV_LENGTH);

  return new Blob([combinedBuffer], { type: 'application/octet-stream' });
};

/**
 * Infers appropriate MIME type from filename/URL
 */
export const inferMimeTypeFromUrl = (url, fallback = 'application/octet-stream') => {
  if (!url || typeof url !== 'string') return fallback;
  const clean = url.split('?')[0].toLowerCase();
  if (clean.includes('/audio/') || clean.match(/\.(mp3|m4a|wav|aac|ogg|webm|3gp)(\.enc)?$/)) {
    if (clean.includes('.m4a') || clean.includes('.mp4')) return 'audio/mp4';
    if (clean.includes('.mp3')) return 'audio/mpeg';
    if (clean.includes('.wav')) return 'audio/wav';
    if (clean.includes('.ogg')) return 'audio/ogg';
    if (clean.includes('.aac')) return 'audio/aac';
    return 'audio/webm';
  }
  if (clean.includes('/images/') || clean.match(/\.(jpg|jpeg|png|webp|gif|svg|heic)(\.enc)?$/)) {
    if (clean.includes('.png')) return 'image/png';
    if (clean.includes('.webp')) return 'image/webp';
    if (clean.includes('.gif')) return 'image/gif';
    if (clean.includes('.svg')) return 'image/svg+xml';
    return 'image/jpeg';
  }
  if (clean.includes('.pdf')) return 'application/pdf';
  return fallback;
};

/**
 * Decrypts a binary ArrayBuffer or Blob using AES-256-GCM
 * Extracts the 12-byte IV and decrypts the remaining ciphertext
 */
export const decryptMediaBuffer = async (encryptedData, base64Key, mimeType = null) => {
  let arrayBuffer;
  if (encryptedData instanceof Blob) {
    arrayBuffer = await encryptedData.arrayBuffer();
  } else if (encryptedData instanceof ArrayBuffer) {
    arrayBuffer = encryptedData;
  } else if (ArrayBuffer.isView(encryptedData)) {
    arrayBuffer = encryptedData.buffer.slice(
      encryptedData.byteOffset,
      encryptedData.byteOffset + encryptedData.byteLength
    );
  } else {
    throw new Error('Bilinmeyen şifreli veri formatı');
  }

  if (arrayBuffer.byteLength < IV_LENGTH + 16) {
    throw new Error('Şifreli veri boyutu geçersiz (çok kısa).');
  }

  const key = await importMediaKey(base64Key);
  const iv = new Uint8Array(arrayBuffer, 0, IV_LENGTH);
  const ciphertext = new Uint8Array(arrayBuffer, IV_LENGTH);

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    ciphertext
  );

  const finalMime = mimeType || 'application/octet-stream';
  return new Blob([decryptedBuffer], { type: finalMime });
};

/**
 * Retrieves a decrypted Blob URL, decrypting and caching if not already cached.
 * Deduplicates concurrent calls for the same media URL.
 */
export const getOrDecryptMedia = async (url, base64Key, mimeType = null) => {
  if (!url) return '';

  const effectiveMime = mimeType || inferMimeTypeFromUrl(url, 'image/jpeg');

  // If already a local blob/data URL, or unencrypted legacy URL without key
  if (url.startsWith('blob:') || url.startsWith('data:') || (!base64Key && !url.includes('.enc'))) {
    return url;
  }

  // Check in-memory cache
  if (mediaBlobCache.has(url)) {
    return mediaBlobCache.get(url);
  }

  // Deduplicate in-flight decryption
  if (pendingDecryptions.has(url)) {
    return pendingDecryptions.get(url);
  }

  const decryptPromise = (async () => {
    try {
      if (!base64Key) {
        console.warn('[MediaCrypto] Missing encryption key for encrypted file:', url);
        return url;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Medya indirilemedi (${response.status})`);
      }

      const encryptedBuffer = await response.arrayBuffer();
      const decryptedBlob = await decryptMediaBuffer(encryptedBuffer, base64Key, effectiveMime);
      const objectUrl = URL.createObjectURL(decryptedBlob);

      mediaBlobCache.set(url, objectUrl);
      return objectUrl;
    } catch (err) {
      console.error('[MediaCrypto] Decryption failed for URL:', url, err);
      // Fallback: return raw URL if decryption fails
      return url;
    } finally {
      pendingDecryptions.delete(url);
    }
  })();

  pendingDecryptions.set(url, decryptPromise);
  return decryptPromise;
};

/**
 * Manually prime the cache (e.g. immediately after upload, before any network fetch)
 */
export const cacheDecryptedMedia = (url, objectUrl) => {
  if (url && objectUrl) {
    mediaBlobCache.set(url, objectUrl);
  }
};

/**
 * Get synchronously from cache if present
 */
export const getCachedMediaUrl = (url) => {
  if (!url) return '';
  return mediaBlobCache.get(url) || null;
};

export default {
  generateMediaKey,
  importMediaKey,
  encryptMediaBlob,
  decryptMediaBuffer,
  getOrDecryptMedia,
  cacheDecryptedMedia,
  getCachedMediaUrl,
  mediaBlobCache,
};

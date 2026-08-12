/**
 * MediaStorageService — IndexedDB & Capacitor Filesystem Adapter
 *
 * Resim, ses ve çizim gibi büyük medya içeriklerini 5MB kotalı LocalStorage'dan
 * çıkartıp IndexedDB veya cihazın Filesystem alanında saklar.
 */

import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";

const DB_NAME = "NoteUp_MediaDB";
const DB_VERSION = 1;
const STORE_NAME = "media_store";

// IndexedDB Bağlantısını Açma / Başlatma
function openDB() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error("IndexedDB bu ortamda desteklenmiyor."));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export const MediaStorageService = {
  /**
   * Medya verisini (Base64 veya Blob) güvenli depolama alanına yazar
   * @param {string} mediaId Benzersiz Medya ID (örn. block-id)
   * @param {string} base64Data Base64 Data URI veya ham string
   * @returns {Promise<string>} Depolanan medya referans URI'si ('idb://<mediaId>' veya 'file://...')
   */
  saveMedia: async (mediaId, base64Data) => {
    if (!base64Data || typeof base64Data !== "string") return base64Data;

    // Zaten referans URI ise işlem yapma
    if (
      base64Data.startsWith("idb://") ||
      base64Data.startsWith("file://") ||
      base64Data.startsWith("capacitor://") ||
      base64Data.includes("_capacitor_file_") ||
      base64Data.startsWith("http")
    ) {
      return base64Data;
    }

    try {
      // 1. Native Mobile (Capacitor Filesystem)
      if (Capacitor.isNativePlatform()) {
        const fileName = `media_${mediaId}.bin`;
        await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Data,
        });
        const uriResult = await Filesystem.getUri({
          path: fileName,
          directory: Directory.Data,
        });
        return uriResult.uri || `file://${fileName}`;
      }

      // 2. Web Browser (IndexedDB)
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        const req = store.put(base64Data, mediaId);

        req.onsuccess = () => resolve(`idb://${mediaId}`);
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn(
        "[MediaStorageService] Medya kaydedilirken fallback çalıştı:",
        err,
      );
      return base64Data; // Hata durumunda veri kaybı yaşanmasın diye olduğu gibi dön
    }
  },

  /**
   * Referans URI üzerinden medyayı okur
   * @param {string} mediaUri 'idb://<mediaId>' veya 'file://...'
   * @returns {Promise<string>} Base64 data veya yerel URI
   */
  getMedia: async (mediaUri) => {
    if (!mediaUri || typeof mediaUri !== "string") return mediaUri;

    // Direct HTTP URL or raw base64 data
    const isIdb = mediaUri.startsWith("idb://");
    const isNativeFile =
      mediaUri.startsWith("file://") ||
      mediaUri.startsWith("capacitor://") ||
      mediaUri.includes("_capacitor_file_") ||
      mediaUri.includes("media_");

    if (!isIdb && !isNativeFile) {
      return mediaUri;
    }

    try {
      // 1. IndexedDB
      if (isIdb) {
        const mediaId = mediaUri.replace("idb://", "");
        const db = await openDB();
        return new Promise((resolve, reject) => {
          const transaction = db.transaction(STORE_NAME, "readonly");
          const store = transaction.objectStore(STORE_NAME);
          const req = store.get(mediaId);

          req.onsuccess = () => resolve(req.result || "");
          req.onerror = () => reject(req.error);
        });
      }

      // 2. Capacitor Filesystem
      if (Capacitor.isNativePlatform() && isNativeFile) {
        let fileName = mediaUri.substring(mediaUri.lastIndexOf("/") + 1);
        if (fileName.includes("?")) fileName = fileName.split("?")[0];
        const fileData = await Filesystem.readFile({
          path: fileName,
          directory: Directory.Data,
        });
        return fileData.data;
      }

      return mediaUri;
    } catch (err) {
      console.warn("[MediaStorageService] Medya okuma hatası:", err);
      return mediaUri;
    }
  },

  /**
   * Silinen medyanın depolama alanından temizlenmesi
   */
  deleteMedia: async (mediaUri) => {
    if (!mediaUri || typeof mediaUri !== "string") return;

    try {
      if (mediaUri.startsWith("idb://")) {
        const mediaId = mediaUri.replace("idb://", "");
        const db = await openDB();
        const transaction = db.transaction(STORE_NAME, "readwrite");
        transaction.objectStore(STORE_NAME).delete(mediaId);
      } else if (
        Capacitor.isNativePlatform() &&
        (mediaUri.startsWith("file://") ||
          mediaUri.startsWith("capacitor://") ||
          mediaUri.includes("_capacitor_file_") ||
          mediaUri.includes("media_"))
      ) {
        let fileName = mediaUri.substring(mediaUri.lastIndexOf("/") + 1);
        if (fileName.includes("?")) fileName = fileName.split("?")[0];
        await Filesystem.deleteFile({
          path: fileName,
          directory: Directory.Data,
        });
      }
    } catch (err) {
      console.warn("[MediaStorageService] Medya silme hatası:", err);
    }
  },
};

export default MediaStorageService;

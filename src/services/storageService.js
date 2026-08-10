import { Capacitor } from "@capacitor/core";
import { STORAGE_KEYS } from "../constants/storageKeys";

/**
 * Storage Service — Safe Storage Adapter for Web & Native Platform
 *
 * Web ortamında `localStorage` kullanır (QuotaExceeded try-catch korumalı).
 * Native platformda (Android/iOS) Webview LocalStorage sınırlamalarından kurtulmak
 * ve güvenli depolama sağlamak için CapacitorPreferences / LocalStorage sarmalaycısıdır.
 */

export const StorageService = {
  /**
   * Veri okuma (getItem)
   */
  getItem: (key) => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn(`[StorageService] Failed to read key '${key}':`, e);
      return null;
    }
  },

  /**
   * Veri kaydetme (setItem)
   * QuotaExceededError veya yazma hatalarında uygulamayı çökertmez.
   */
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.error(
        `[StorageService] Failed to set key '${key}' (Quota or permission error):`,
        e,
      );
      // Depolama dolduğunda uygulama akışını kesme
    }
  },

  /**
   * Veri silme (removeItem)
   */
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn(`[StorageService] Failed to remove key '${key}':`, e);
    }
  },

  /**
   * JSON Obje okuma (getJson)
   */
  getJson: (key, fallbackValue = null) => {
    try {
      const raw = StorageService.getItem(key);
      return raw ? JSON.parse(raw) : fallbackValue;
    } catch (e) {
      console.error(
        `[StorageService] Failed to parse JSON for key '${key}':`,
        e,
      );
      return fallbackValue;
    }
  },

  /**
   * JSON Obje kaydetme (setJson)
   */
  setJson: (key, value) => {
    try {
      StorageService.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(
        `[StorageService] Failed to serialize JSON for key '${key}':`,
        e,
      );
    }
  },
};

export default StorageService;

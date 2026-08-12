import { detectPlatform } from "../platform/detect";
import * as androidStorage from "../platform/android/storage.android";
import * as iosStorage from "../platform/ios/storage.ios";
import * as webStorage from "../platform/web/storage.web";
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
  getItem: async (key) => {
    const plt = detectPlatform();
    if (plt === 'android') return await androidStorage.getItem(key);
    if (plt === 'ios') return await iosStorage.getItem(key);
    return await webStorage.getItem(key);
  },

  /**
   * Veri kaydetme (setItem)
   * QuotaExceededError veya yazma hatalarında uygulamayı çökertmez.
   */
  setItem: async (key, value) => {
    const plt = detectPlatform();
    if (plt === 'android') return await androidStorage.setItem(key, value);
    if (plt === 'ios') return await iosStorage.setItem(key, value);
    return await webStorage.setItem(key, value);
  },

  /**
   * Veri silme (removeItem)
   */
  removeItem: async (key) => {
    const plt = detectPlatform();
    if (plt === 'android') return await androidStorage.removeItem(key);
    if (plt === 'ios') return await iosStorage.removeItem(key);
    return await webStorage.removeItem(key);
  },

  /**
   * JSON Obje okuma (getJson)
   */
  getJson: async (key, fallbackValue = null) => {
    try {
      const raw = await StorageService.getItem(key);
      return raw ? JSON.parse(raw) : fallbackValue;
    } catch (e) {
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

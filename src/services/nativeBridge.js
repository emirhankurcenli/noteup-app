import { Capacitor } from "@capacitor/core";
import { registerPlugin } from "@capacitor/core";

// Register the custom AppSettings plugin
export const AppSettings = registerPlugin("AppSettings");

/**
 * Native Bridge Service
 * Encapsulates all native platform calls, permissions, and native hardware interactions.
 */
export const isNativePlatform = () => Capacitor.isNativePlatform();

export const NativeBridge = {
  isNative: () => Capacitor.isNativePlatform(),

  // Settings & Navigation
  openSettings: async () => {
    if (Capacitor.isNativePlatform()) {
      return await AppSettings.openSettings();
    }
  },

  getLaunchNoteId: async () => {
    if (Capacitor.isNativePlatform()) {
      const res = await AppSettings.getLaunchNoteId();
      return res?.noteId || null;
    }
    return null;
  },

  openFile: async (base64, fileName) => {
    if (Capacitor.isNativePlatform()) {
      return await AppSettings.openFile({ base64, fileName });
    }
  },

  // Permissions
  getPermissionStatus: async () => {
    if (Capacitor.isNativePlatform()) {
      return await AppSettings.getPermissionStatus();
    }
    return {
      microphone: "unknown",
      storage: "unknown",
      audio: "unknown",
      location: "unknown",
    };
  },

  requestMicrophonePermission: async () => {
    if (Capacitor.isNativePlatform()) {
      return await AppSettings.requestMicrophonePermission();
    }
    return { microphone: "granted" };
  },

  requestStoragePermission: async () => {
    if (Capacitor.isNativePlatform()) {
      return await AppSettings.requestStoragePermission();
    }
    return { storage: "granted" };
  },

  /**
   * Unified permission gate — single source of truth for ALL permission checks in the app.
   * type: 'microphone' | 'storage'
   * Returns: true if granted, false if denied/error.
   *
   * Usage: const ok = await NativeBridge.checkPermission('microphone');
   */
  checkPermission: async (type) => {
    try {
      if (Capacitor.isNativePlatform()) {
        if (type === "microphone") {
          const res = await AppSettings.requestMicrophonePermission();
          return res?.microphone === "granted";
        }
        if (type === "storage") {
          const res = await AppSettings.requestStoragePermission();
          return res?.storage === "granted";
        }
        return false;
      } else {
        // Web/browser fallback
        if (type === "microphone") {
          // Prefer the non-intrusive Permissions API; fall back to getUserMedia
          if (navigator.permissions) {
            try {
              const status = await navigator.permissions.query({
                name: "microphone",
              });
              if (status.state === "granted") return true;
              if (status.state === "denied") return false;
            } catch (_) {
              /* some browsers throw on unsupported permission names */
            }
          }
          // Only open the real mic if the Permissions API returned 'prompt' or is unavailable
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
          stream.getTracks().forEach((t) => t.stop());
          return true;
        }
        if (type === "storage") return true; // browsers always allow storage
        return false;
      }
    } catch {
      return false;
    }
  },

  // Native Image Processing
  compressAndConvertImage: async (base64, targetWidth = 1200, quality = 85) => {
    if (Capacitor.isNativePlatform()) {
      return await AppSettings.compressAndConvertImage({
        base64,
        targetWidth,
        quality,
      });
    }
    return null;
  },

  // Native Audio Recording Bridge
  startNativeAudioRecording: async (language = "tr-TR") => {
    if (Capacitor.isNativePlatform()) {
      return await AppSettings.startNativeAudioRecording({ language });
    }
  },

  pauseNativeAudioRecording: async () => {
    if (Capacitor.isNativePlatform()) {
      return await AppSettings.pauseNativeAudioRecording();
    }
  },

  resumeNativeAudioRecording: async () => {
    if (Capacitor.isNativePlatform()) {
      return await AppSettings.resumeNativeAudioRecording();
    }
  },

  stopNativeAudioRecording: async () => {
    if (Capacitor.isNativePlatform()) {
      return await AppSettings.stopNativeAudioRecording();
    }
    return null;
  },

  cancelNativeAudioRecording: async () => {
    if (Capacitor.isNativePlatform()) {
      return await AppSettings.cancelNativeAudioRecording();
    }
  },

  // Native Speech Recognition Bridge
  startSpeechRecognition: async (language = "tr-TR") => {
    if (Capacitor.isNativePlatform()) {
      return await AppSettings.startSpeechRecognition({ language });
    }
  },

  stopSpeechRecognition: async () => {
    if (Capacitor.isNativePlatform()) {
      return await AppSettings.stopSpeechRecognition();
    }
  },

  addSpeechListener: async (callback) => {
    if (Capacitor.isNativePlatform()) {
      return await AppSettings.addListener("speechResult", callback);
    }
    return null;
  },
};

export default NativeBridge;

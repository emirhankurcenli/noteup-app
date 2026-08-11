import { Capacitor, registerPlugin } from "@capacitor/core";

// Register the custom AppSettings plugin (Android only)
export const AppSettings = registerPlugin("AppSettings");

/**
 * Native Bridge Service
 * Encapsulates all native platform calls, permissions, and native hardware interactions.
 */
export const isNativePlatform = () => Capacitor.isNativePlatform();
export const getPlatform = () => Capacitor.getPlatform();

export const NativeBridge = {
  isNative: () => Capacitor.isNativePlatform(),
  getPlatform: () => Capacitor.getPlatform(),

  // Settings & Navigation
  openSettings: async () => {
    if (Capacitor.getPlatform() === 'android') {
      return await AppSettings.openSettings();
    }
  },

  getLaunchNoteId: async () => {
    if (Capacitor.getPlatform() === 'android') {
      const res = await AppSettings.getLaunchNoteId();
      return res?.noteId || null;
    }
    return null;
  },

  openFile: async (base64, fileName) => {
    if (Capacitor.getPlatform() === 'android') {
      return await AppSettings.openFile({ base64, fileName });
    }
  },

  // Permissions
  getPermissionStatus: async () => {
    if (Capacitor.getPlatform() === 'android') {
      return await AppSettings.getPermissionStatus();
    }
    return {
      microphone: "granted",
      storage: "granted",
      audio: "granted",
      location: "granted",
    };
  },

  requestMicrophonePermission: async () => {
    if (Capacitor.getPlatform() === 'android') {
      return await AppSettings.requestMicrophonePermission();
    }
    // iOS and Web: trigger native iOS WKWebView Microphone prompt via getUserMedia
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      return { microphone: "granted" };
    } catch {
      return { microphone: "denied" };
    }
  },

  requestStoragePermission: async () => {
    if (Capacitor.getPlatform() === 'android') {
      return await AppSettings.requestStoragePermission();
    }
    return { storage: "granted" };
  },

  checkPermission: async (type) => {
    try {
      if (Capacitor.getPlatform() === 'android') {
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
        // iOS or Web: trigger native browser/WKWebView permission prompt
        if (type === "microphone") {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach((t) => t.stop());
          return true;
        }
        if (type === "storage") return true;
        return false;
      }
    } catch {
      return false;
    }
  },

  // Native Image Processing
  compressAndConvertImage: async (base64, targetWidth = 1200, quality = 85) => {
    if (Capacitor.getPlatform() === 'android') {
      return await AppSettings.compressAndConvertImage({
        base64,
        targetWidth,
        quality,
      });
    }
    return null;
  },

  // Native Audio Recording Bridge (Android uses AppSettings, iOS uses Web MediaRecorder)
  startNativeAudioRecording: async (language = "tr-TR") => {
    if (Capacitor.getPlatform() === 'android') {
      return await AppSettings.startNativeAudioRecording({ language });
    }
  },

  pauseNativeAudioRecording: async () => {
    if (Capacitor.getPlatform() === 'android') {
      return await AppSettings.pauseNativeAudioRecording();
    }
  },

  resumeNativeAudioRecording: async () => {
    if (Capacitor.getPlatform() === 'android') {
      return await AppSettings.resumeNativeAudioRecording();
    }
  },

  stopNativeAudioRecording: async () => {
    if (Capacitor.getPlatform() === 'android') {
      return await AppSettings.stopNativeAudioRecording();
    }
    return null;
  },

  cancelNativeAudioRecording: async () => {
    if (Capacitor.getPlatform() === 'android') {
      return await AppSettings.cancelNativeAudioRecording();
    }
  },

  // Native Speech Recognition Bridge
  startSpeechRecognition: async (language = "tr-TR") => {
    if (Capacitor.getPlatform() === 'android') {
      return await AppSettings.startSpeechRecognition({ language });
    }
  },

  stopSpeechRecognition: async () => {
    if (Capacitor.getPlatform() === 'android') {
      return await AppSettings.stopSpeechRecognition();
    }
  },

  addSpeechListener: async (callback) => {
    if (Capacitor.getPlatform() === 'android') {
      return await AppSettings.addListener("speechResult", callback);
    }
    return null;
  },
};

export default NativeBridge;

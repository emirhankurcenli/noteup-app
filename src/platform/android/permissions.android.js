import { AppSettings } from '../../services/nativeBridge';

export const openSettings = async () => {
  try {
    await AppSettings.openSettings();
  } catch (e) {
    console.warn("Android openSettings error:", e);
  }
};

export const getPermissionStatus = async () => {
  try {
    return await AppSettings.getPermissionStatus();
  } catch (e) {
    return { microphone: 'unknown', storage: 'unknown', audio: 'unknown', location: 'unknown' };
  }
};

export const requestMicrophonePermission = async () => {
  try {
    return await AppSettings.requestMicrophonePermission();
  } catch (e) {
    return { microphone: 'denied' };
  }
};

export const requestStoragePermission = async () => {
  try {
    return await AppSettings.requestStoragePermission();
  } catch (e) {
    return { storage: 'denied' };
  }
};

export const requestAudioPermission = async () => {
  try {
    return await AppSettings.requestAudioPermission();
  } catch (e) {
    return { audio: 'denied' };
  }
};

export const requestLocationPermission = async () => {
  try {
    return await AppSettings.requestLocationPermission();
  } catch (e) {
    return { location: 'denied' };
  }
};

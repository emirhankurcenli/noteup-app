import { App } from '@capacitor/app';

export const openSettings = async () => {
  try {
    await App.openUrl({ url: 'app-settings:' });
  } catch (e) {
    try {
      window.location.href = 'app-settings:';
    } catch (_) {}
  }
};

export const getPermissionStatus = async () => {
  const micGranted = localStorage.getItem('noteup_ios_mic_granted') === 'true';
  const locGranted = localStorage.getItem('noteup_ios_location_granted') === 'true';
  return {
    microphone: micGranted ? 'granted' : 'prompt',
    storage: 'granted',
    audio: 'granted',
    location: locGranted ? 'granted' : 'prompt'
  };
};

export const requestMicrophonePermission = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => track.stop());
    localStorage.setItem('noteup_ios_mic_granted', 'true');
    return { microphone: 'granted' };
  } catch (e) {
    return { microphone: 'denied' };
  }
};

export const requestStoragePermission = async () => {
  return { storage: 'granted' };
};

export const requestAudioPermission = async () => {
  return { audio: 'granted' };
};

export const requestLocationPermission = async () => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ location: 'denied' });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      () => {
        localStorage.setItem('noteup_ios_location_granted', 'true');
        resolve({ location: 'granted' });
      },
      () => resolve({ location: 'denied' }),
      { timeout: 8000, enableHighAccuracy: true }
    );
  });
};

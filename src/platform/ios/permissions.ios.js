export const openSettings = async () => {
  try {
    window.location.href = 'app-settings:';
  } catch (e) {}
};

export const getPermissionStatus = async () => {
  return { microphone: 'prompt', storage: 'granted', audio: 'granted', location: 'prompt' };
};

export const requestMicrophonePermission = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => track.stop());
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
      () => resolve({ location: 'granted' }),
      () => resolve({ location: 'denied' }),
      { timeout: 5000 }
    );
  });
};

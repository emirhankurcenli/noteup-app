import { NativeBridge } from '../../services/nativeBridge';

export const startAudioRecording = async (language = 'tr') => {
  const langCode = language === 'tr' ? 'tr-TR' : 'en-US';
  return await NativeBridge.startNativeAudioRecording(langCode);
};

export const pauseAudioRecording = () => {
  return NativeBridge.pauseNativeAudioRecording();
};

export const resumeAudioRecording = () => {
  return NativeBridge.resumeNativeAudioRecording();
};

export const stopAudioRecording = async () => {
  return await NativeBridge.stopNativeAudioRecording();
};

export const cancelAudioRecording = () => {
  return NativeBridge.cancelNativeAudioRecording();
};

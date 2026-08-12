// iOS WebRTC / MediaRecorder implementation
export const startAudioRecording = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  let options = { audioBitsPerSecond: 64000 };
  if (MediaRecorder.isTypeSupported('audio/mp4')) {
    options.mimeType = 'audio/mp4';
  } else if (MediaRecorder.isTypeSupported('audio/webm')) {
    options.mimeType = 'audio/webm';
  }
  const recorder = new MediaRecorder(stream, options);
  return { recorder, stream };
};

export const stopAudioStream = (stream) => {
  if (stream) {
    try {
      stream.getTracks().forEach((track) => track.stop());
    } catch (e) {}
  }
};

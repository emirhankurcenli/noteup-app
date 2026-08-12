import { useState, useRef, useCallback } from "react";
import { Capacitor } from "@capacitor/core";
import { NativeBridge } from "../services/nativeBridge";
import { triggerHaptic } from "../services/haptics";

export function useAudioRecorder({
  lang = "tr",
  checkAndRequestPermission,
  setToast,
  uploadToR2,
  handleInsertWidget,
  handleUpdateNote,
  setEditingNote,
  formatBytes,
  base64ToBlob,
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isRecordingPaused, setIsRecordingPaused] = useState(false);
  const [liveTranscription, setLiveTranscription] = useState("");
  const [recordingManualNotes, setRecordingManualNotes] = useState("");
  const [showRecordingScratchpad, setShowRecordingScratchpad] = useState(false);

  const mediaRecorderRef = useRef(null);
  const recordingManualNotesRef = useRef("");
  const audioChunksRef = useRef([]);
  const recordingIntervalRef = useRef(null);

  const cleanupRecordingTimer = useCallback(() => {
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
  }, []);

  const startRecording = useCallback(async () => {
    const micGranted = await checkAndRequestPermission("microphone");
    if (!micGranted) return;

    triggerHaptic("heavy");
    cleanupRecordingTimer();

    setLiveTranscription("");
    setRecordingManualNotes("");
    recordingManualNotesRef.current = "";
    setIsRecordingPaused(false);
    setShowRecordingScratchpad(true);

    const isAndroid = Capacitor.getPlatform() === "android";

    if (!isAndroid) {
      audioChunksRef.current = [];
    }

    try {
      if (isAndroid) {
        await NativeBridge.startNativeAudioRecording(
          lang === "tr" ? "tr-TR" : "en-US",
        );
      } else {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        let options = { audioBitsPerSecond: 64000 };
        if (MediaRecorder.isTypeSupported("audio/webm"))
          options.mimeType = "audio/webm";
        else if (MediaRecorder.isTypeSupported("audio/ogg"))
          options.mimeType = "audio/ogg";
        else if (MediaRecorder.isTypeSupported("audio/mp4"))
          options.mimeType = "audio/mp4";

        const recorder = new MediaRecorder(stream, options);
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0)
            audioChunksRef.current.push(event.data);
        };
        recorder.start(1000);
      }

      setRecordingSeconds(0);
      setIsRecording(true);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          const next = prev + 1;
          if (next >= 90) {
            stopRecording();
            setToast({
              title: "⏱️ Kayıt Süresi Sınırı",
              msg: "Veri büyüklüğünü korumak amacıyla ses kaydı 1.5 dakika (90 sn) ile sınırlandırılmıştır.",
            });
            return 90;
          }
          return next;
        });
      }, 1000);

      setToast({ title: "🎤 Kaydediliyor", msg: "Ses kaydı başlatıldı." });
    } catch (err) {
      console.error("Mic access failed:", err);
      setToast({
        title: "❌ Kayıt Başlatılamadı",
        msg:
          lang === "tr"
            ? `Hata: ${err?.message || err}`
            : `Failed to start: ${err?.message || err}`,
      });
    }
  };

  const pauseRecording = () => {
    if (!isRecording || isRecordingPaused) return;

    if (Capacitor.getPlatform() === 'android') {
      try {
        NativeBridge.pauseNativeAudioRecording();
      } catch (err) {}
    } else {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state === "recording"
      ) {
        try {
          mediaRecorderRef.current.pause();
        } catch (err) {}
      }
    }

    cleanupRecordingTimer();
    setIsRecordingPaused(true);
    setToast({
      title: "⏸️ Ses Kaydı Duraklatıldı",
      msg: "Kayıt geçici olarak durduruldu.",
    });
  };

  const resumeRecording = () => {
    if (!isRecording || !isRecordingPaused) return;

    if (Capacitor.getPlatform() === 'android') {
      try {
        NativeBridge.resumeNativeAudioRecording();
      } catch (err) {}
    } else {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state === "paused"
      ) {
        try {
          mediaRecorderRef.current.resume();
        } catch (err) {}
      }
    }

    setIsRecordingPaused(false);

    recordingIntervalRef.current = setInterval(() => {
      setRecordingSeconds((prev) => {
        const next = prev + 1;
        if (next >= 90) {
          stopRecording();
          setToast({
            title: "⏱️ Kayıt Süresi Sınırı",
            msg: "Veri büyüklüğünü korumak amacıyla ses kaydı 1.5 dakika (90 sn) ile sınırlandırılmıştır.",
          });
          return 90;
        }
        return next;
      });
    }, 1000);

    setToast({
      title: "🎤 Ses Kaydı Devam Ediyor",
      msg: "Kayıt devam ettiriliyor.",
    });
  };

  const stopRecording = async () => {
    cleanupRecordingTimer();

    const manualNotes = (recordingManualNotesRef.current || "").trim();

    setIsRecording(false);
    setIsRecordingPaused(false);
    setLiveTranscription("");
    setRecordingManualNotes("");
    recordingManualNotesRef.current = "";
    setShowRecordingScratchpad(false);

    let blob = null;
    let extension = "m4a";

    if (Capacitor.getPlatform() === 'android') {
      try {
        const res = await NativeBridge.stopNativeAudioRecording();
        if (res && res.base64) {
          blob = base64ToBlob(res.base64, res.mimeType || "audio/mp4");
          extension = res.extension || "m4a";
        }
      } catch (e) {
        console.error("Native stop recording failed:", e);
      }
    } else {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        try {
          mediaRecorderRef.current.stop();
        } catch (e) {}
        // Mikrofon stream'ini serbest bırak (ışık sönmesi için)
        try {
          const stream = mediaRecorderRef.current.stream;
          if (stream) stream.getTracks().forEach((track) => track.stop());
        } catch (e) {}
      }
      const mimeType = mediaRecorderRef.current?.mimeType || "audio/webm";
      blob = new Blob(audioChunksRef.current, { type: mimeType });
      extension = mimeType.includes("mp4") ? "m4a" : mimeType.includes("ogg") ? "ogg" : "webm";
    }

    if (!blob || blob.size === 0) return;

    const timestamp =
      new Date().toLocaleDateString().replace(/\//g, "-") +
      "_" +
      new Date().toLocaleTimeString().replace(/:/g, "-");
    const fileName = `Ses_Kaydi_${timestamp}.${extension}`;
    const readableSize = formatBytes
      ? formatBytes(blob.size)
      : `${Math.round(blob.size / 1024)} KB`;

    setToast({
      title: "🔄 Ses Kaydı Yükleniyor...",
      msg: "Ses kaydı buluta yükleniyor, lütfen bekleyin.",
    });

    try {
      const publicUrl = await uploadToR2(blob, fileName);

      let blockContent = "";
      if (manualNotes) {
        blockContent = `📝 Alınan Notlar:\n"${manualNotes}"`;
      }

      const extraBlocks = [];
      if (blockContent) {
        extraBlocks.push({
          id: "b-" + (Date.now() + 1),
          type: "text",
          content: blockContent,
        });
      }

      if (handleInsertWidget) {
        handleInsertWidget("audio", {
          url: publicUrl,
          name: `Ses Kaydı (${new Date().toLocaleDateString()}).${extension}`,
          size: readableSize,
          transcription: null,
        }, extraBlocks);
      }

      setToast({
        title: "✅ Ses Kaydı Eklendi",
        msg: "Ses kaydınız nota başarıyla eklendi.",
      });
    } catch (uploadErr) {
      console.error("Audio upload failed:", uploadErr);
      setToast({
        title: "❌ Hata",
        msg: "Ses kaydı buluta yüklenirken hata oluştu.",
      });
    }
  };

  const cancelRecording = () => {
    cleanupRecordingTimer();
    setIsRecording(false);
    setIsRecordingPaused(false);
    setLiveTranscription("");
    setRecordingManualNotes("");
    recordingManualNotesRef.current = "";
    setShowRecordingScratchpad(false);

    if (NativeBridge.isNative()) {
      try {
        NativeBridge.cancelNativeAudioRecording();
      } catch (e) {}
    } else {
      if (mediaRecorderRef.current) {
        try {
          mediaRecorderRef.current.onstop = null;
          if (mediaRecorderRef.current.state !== "inactive")
            mediaRecorderRef.current.stop();
          const stream = mediaRecorderRef.current.stream;
          if (stream) stream.getTracks().forEach((track) => track.stop());
        } catch (e) {}
        mediaRecorderRef.current = null;
      }
    }
  };

  return {
    isRecording,
    recordingSeconds,
    isRecordingPaused,
    liveTranscription,
    recordingManualNotes,
    setRecordingManualNotes,
    recordingManualNotesRef,
    showRecordingScratchpad,
    setShowRecordingScratchpad,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    cancelRecording,
  };
}

export default useAudioRecorder;

import { useRef, useState } from 'react';
import { formatBytes } from '../utils/mediaUtils';

const useAudioRecorderHandler = ({
  editingNote,
  focusedBlockRef,
  userPlan,
  handleInsertWidget,
  handleUpdateNote,
  checkAndRequestPermission,
  setToast,
  setConfirmDialog,
  uploadToR2,
  getStorageUsageBytes,
  PLAN_STORAGE_LIMITS,
  setShowPaywall,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [activeAudioPlayingId, setActiveAudioPlayingId] = useState(null);
  const [activeAudioProgress, setActiveAudioProgress] = useState({});

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingIntervalRef = useRef(null);
  const currentAudioRef = useRef(null);
  const splitInfoRef = useRef(null);

  const cleanupRecordingTimer = () => {
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
  };

  const preSplitForRecording = () => {
    if (!editingNote || !focusedBlockRef?.current) return;
    const blocks = editingNote.blocks || [];
    const { id: focusedId, pos: cursorPos } = focusedBlockRef.current;
    if (!focusedId) return;

    const focusedIdx = blocks.findIndex(b => b.id === focusedId);
    if (focusedIdx < 0) return;

    const focusedBlock = blocks[focusedIdx];
    if (!focusedBlock || focusedBlock.type !== 'text') return;

    const text = focusedBlock.content || '';
    if (!text.trim()) return;

    const pos = Math.min(cursorPos || 0, text.length);
    let textBefore = text.substring(0, pos);
    let textAfter = text.substring(pos);

    if (textBefore.endsWith('\n')) textBefore = textBefore.substring(0, textBefore.length - 1);
    if (textAfter.startsWith('\n')) textAfter = textAfter.substring(1);

    if (textBefore.trim() === '' || textAfter.trim() === '') return;

    const splitTopBlock = { ...focusedBlock, content: textBefore };
    const splitBottomBlock = { id: 'b-' + Date.now(), type: 'text', content: textAfter };

    const updated = [...blocks];
    updated.splice(focusedIdx, 1, splitTopBlock, splitBottomBlock);

    splitInfoRef.current = {
      topId: splitTopBlock.id,
      bottomId: splitBottomBlock.id
    };

    focusedBlockRef.current.id = splitTopBlock.id;
    handleUpdateNote('blocks', updated, true);
  };

  const startRecording = async () => {
    // Check storage limit before recording
    const currentUsed = typeof getStorageUsageBytes === 'function' ? getStorageUsageBytes() : 0;
    const limits = PLAN_STORAGE_LIMITS || { lite: 50 * 1024 * 1024, pro: 1 * 1024 * 1024 * 1024, ultra: 5 * 1024 * 1024 * 1024 };
    const storageLimit = limits[userPlan] || limits.lite;

    if (currentUsed >= storageLimit) {
      setToast({
        title: "⚠️ Depolama Sınırı Aşıldı",
        msg: `Bulut depolama alanınız (${formatBytes(currentUsed)} / ${formatBytes(storageLimit)}) doldu. Yeni ses kaydı eklemek için planınızı Pro veya Ultra'ya yükseltin!`
      });
      if (typeof setShowPaywall === 'function') setShowPaywall(true);
      return;
    }

    const micGranted = await checkAndRequestPermission('microphone');
    if (!micGranted) return;

    cleanupRecordingTimer();
    preSplitForRecording();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      let options = { audioBitsPerSecond: 64000 };
      if (MediaRecorder.isTypeSupported('audio/webm')) {
        options.mimeType = 'audio/webm';
      } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
        options.mimeType = 'audio/ogg';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        options.mimeType = 'audio/mp4';
      }

      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        cleanupRecordingTimer();
        setIsRecording(false);

        const mimeType = options.mimeType || 'audio/webm';
        const extension = mimeType.includes('ogg') ? 'ogg' : mimeType.includes('mp4') ? 'mp4' : 'webm';
        const blob = new Blob(audioChunksRef.current, { type: mimeType });

        if (blob.size === 0) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        const timestamp = new Date().toLocaleDateString().replace(/\//g, '-') + '_' + new Date().toLocaleTimeString().replace(/:/g, '-');
        const fileName = `Ses_Kaydi_${timestamp}.${extension}`;
        const readableSize = formatBytes(blob.size);

        const doAudioUpload = async () => {
          setToast({
            title: "🔄 Ses Kaydı Yükleniyor...",
            msg: "Ses kaydı buluta yükleniyor, lütfen bekleyin."
          });

          try {
            const publicUrl = await uploadToR2(blob, fileName);

            handleInsertWidget('audio', {
              url: publicUrl,
              name: `Ses Kaydı (${new Date().toLocaleDateString()}).${extension}`,
              size: readableSize,
              transcription: null
            }, []);

            setToast({
              title: "🎙️ Ses Kaydı Eklendi",
              msg: "Ses kaydı buluta yüklendi."
            });
          } catch (uploadErr) {
            console.error("Audio upload to R2 failed:", uploadErr);
            setToast({ title: "❌ Hata", msg: "Ses kaydı buluta yüklenirken hata oluştu." });
          } finally {
            stream.getTracks().forEach(track => track.stop());
          }
        };

        const AUDIO_LARGE_THRESHOLD = 5 * 1024 * 1024;
        if (blob.size > AUDIO_LARGE_THRESHOLD) {
          setConfirmDialog({
            title: "⚠️ Yüksek Ses Kaydı Boyutu",
            message: "Önerilmez: dosya boyutu çok yüksek yinede yüklemek istedigine eminmisin",
            cancelText: "İptal Et",
            confirmText: "Evet",
            onConfirm: doAudioUpload,
            onCancel: () => {
              setToast({ title: "🗑️ İptal Edildi", msg: "Ses kaydı yüklemesi iptal edildi." });
              stream.getTracks().forEach(track => track.stop());
            }
          });
        } else {
          await doAudioUpload();
        }
      };

      recorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      const startTime = Date.now();

      recordingIntervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);

        if (elapsed >= 90) {
          cleanupRecordingTimer();
          if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            try { mediaRecorderRef.current.stop(); } catch (e) {}
          }
          setIsRecording(false);
          setToast({
            title: "⏱️ Kayıt Süresi Sınırı",
            msg: "Veri büyüklüğünü korumak amacıyla ses kaydı 1.5 dakika (90 sn) ile sınırlandırılmıştır. Kaydınız otomatik olarak eklendi."
          });
        } else {
          setRecordingSeconds(elapsed);
        }
      }, 1000);

      setToast({ title: "🎙️ Kaydediliyor", msg: "Ses kaydı başlatıldı." });
    } catch (err) {
      console.error("Mic access failed:", err);
      setToast({
        title: "❌ Mikrofon İzni Gerekli",
        msg: "Ses kaydı yapmak için mikrofon iznini onaylamalısınız."
      });
    }
  };

  const stopRecording = () => {
    cleanupRecordingTimer();
    setIsRecording(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.error("Error stopping recorder:", e);
      }
    }
  };

  const cancelRecording = () => {
    cleanupRecordingTimer();
    setIsRecording(false);

    if (splitInfoRef.current && editingNote) {
      const { topId, bottomId } = splitInfoRef.current;
      const blocks = editingNote.blocks || [];
      const topBlock = blocks.find(b => b.id === topId);
      const bottomBlock = blocks.find(b => b.id === bottomId);
      if (topBlock && bottomBlock) {
        let mergedContent = topBlock.content || '';
        if (bottomBlock.content) {
          if (mergedContent && !mergedContent.endsWith('\n') && !bottomBlock.content.startsWith('\n')) {
            mergedContent += '\n' + bottomBlock.content;
          } else {
            mergedContent += bottomBlock.content;
          }
        }
        const updated = blocks.filter(b => b.id !== bottomId).map(b => b.id === topId ? { ...topBlock, content: mergedContent } : b);
        handleUpdateNote('blocks', updated, true);
      }
      splitInfoRef.current = null;
    }

    if (mediaRecorderRef.current) {
      try {
        mediaRecorderRef.current.onstop = null;
        if (mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
        }
        const stream = mediaRecorderRef.current.stream;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
      } catch (e) {
        console.error("Error cancelling recorder:", e);
      }
    }
    setToast({ title: "🗑️ İptal Edildi", msg: "Ses kaydı iptal edildi." });
  };

  const handlePlayPauseAudio = (block) => {
    if (activeAudioPlayingId === block.id) {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
      }
      setActiveAudioPlayingId(null);
    } else {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current.src = '';
        currentAudioRef.current.load();
        currentAudioRef.current = null;
      }
      const audioUrl = block.url || block.localUrl;
      const audio = new Audio(audioUrl);
      currentAudioRef.current = audio;
      setActiveAudioPlayingId(block.id);

      audio.ontimeupdate = () => {
        const pct = (audio.currentTime / audio.duration) * 100 || 0;
        setActiveAudioProgress(prev => ({ ...prev, [block.id]: pct }));
      };

      audio.onended = () => {
        setActiveAudioPlayingId(null);
        setActiveAudioProgress(prev => ({ ...prev, [block.id]: 0 }));
        audio.src = '';
        audio.load();
        currentAudioRef.current = null;
      };

      audio.play().catch(err => {
        console.error("Audio playback failed:", err);
        setActiveAudioPlayingId(null);
      });
    }
  };

  return {
    currentAudioRef,
    isRecording,
    recordingSeconds,
    activeAudioPlayingId,
    setActiveAudioPlayingId,
    activeAudioProgress,
    setActiveAudioProgress,
    startRecording,
    stopRecording,
    cancelRecording,
    handlePlayPauseAudio,
  };
};

export default useAudioRecorderHandler;

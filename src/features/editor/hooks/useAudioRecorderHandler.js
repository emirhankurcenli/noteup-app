import { useRef, useState, useEffect } from 'react';
import { formatBytes } from '@shared/utils/mediaUtils';
import { MAX_STORAGE_BYTES } from '@features/notes/hooks/useAppLocalState';
import audioPlayerService from '@shared/services/audioPlayerService';
import { CryptoService } from '@shared/services/cryptoService';

const useAudioRecorderHandler = ({
  editingNote,
  focusedBlockRef,
  handleInsertWidget,
  handleUpdateNote,
  checkAndRequestPermission,
  setToast,
  setConfirmDialog,
  uploadToR2,
  getStorageUsageBytes,
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

  useEffect(() => {
    return () => {
      cleanupRecordingTimer();

      if (mediaRecorderRef.current) {
        try {
          if (mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
          }
          if (mediaRecorderRef.current.stream) {
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
          }
        } catch (_) {}
        mediaRecorderRef.current = null;
      }

      if (currentAudioRef.current) {
        try {
          currentAudioRef.current.pause();
          currentAudioRef.current.src = '';
          currentAudioRef.current.load();
        } catch (_) {}
        currentAudioRef.current = null;
      }
    };
  }, []);

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
    const storageLimit = MAX_STORAGE_BYTES;

    if (currentUsed >= storageLimit) {
      setToast({
        title: "⚠️ Depolama Sınırı Aşıldı",
        msg: `Bulut depolama alanınız (${formatBytes(currentUsed)} / ${formatBytes(storageLimit)}) doldu.`
      });
      return;
    }

    const micGranted = await checkAndRequestPermission('microphone');
    if (!micGranted) return;

    audioPlayerService.stopCurrent();
    cleanupRecordingTimer();
    preSplitForRecording();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      let options = { audioBitsPerSecond: 64000 };
      if (typeof MediaRecorder !== 'undefined' && typeof MediaRecorder.isTypeSupported === 'function') {
        if (MediaRecorder.isTypeSupported('audio/mp4')) {
          options.mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          options.mimeType = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
          options.mimeType = 'audio/webm';
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          options.mimeType = 'audio/ogg';
        }
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

        const rawMime = recorder.mimeType || options.mimeType || 'audio/mp4';
        const cleanMime = rawMime.split(';')[0].trim();
        const extension = cleanMime.includes('mp4') || cleanMime.includes('m4a')
          ? 'm4a'
          : cleanMime.includes('aac')
            ? 'aac'
            : cleanMime.includes('ogg')
              ? 'ogg'
              : 'webm';
        const blob = new Blob(audioChunksRef.current, { type: cleanMime });

        if (blob.size === 0) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        const timestamp = new Date().toLocaleDateString().replace(/\//g, '-') + '_' + new Date().toLocaleTimeString().replace(/:/g, '-');
        const fileName = `Ses_Kaydi_${timestamp}.${extension}`;
        const readableSize = formatBytes(blob.size);

        const doAudioUpload = async () => {
          setToast({
            id: 'media-upload',
            status: 'loading',
            title: "Ses Kaydı Yükleniyor...",
            msg: "Ses kaydı güvenle şifreleniyor ve yükleniyor..."
          });

          try {
            // E2EE: Şifreleme anahtarını üret ve ses dosyasını AES-256-GCM ile şifrele
            const encKey = CryptoService.generateMediaKey();
            const encryptedBlob = await CryptoService.encryptMediaBlob(blob, encKey);
            const encFileName = `${fileName}.enc`;

            const publicUrl = await uploadToR2(encryptedBlob, encFileName);

            // Yerel blob URL'sini önbelleğe al (anında çalınabilmesi için)
            try {
              const localAudioUrl = URL.createObjectURL(blob);
              CryptoService.cacheDecryptedMedia(publicUrl, localAudioUrl);
            } catch (_) {}

            handleInsertWidget('audio', {
              url: publicUrl,
              name: `Ses Kaydı (${new Date().toLocaleDateString()}).${extension}`,
              size: readableSize,
              mimeType: cleanMime,
              isEncrypted: true,
              encKey: encKey,
              transcription: null
            }, []);

            setToast({
              id: 'media-upload',
              status: 'success',
              title: "Ses Kaydı Eklendi!",
              msg: "Ses kaydı şifrelenerek buluta yüklendi.",
              duration: 2500
            });
          } catch (uploadErr) {
            console.error("Audio upload to R2 failed:", uploadErr);
            setToast({
              id: 'media-upload',
              status: 'error',
              title: "❌ Hata",
              msg: "Ses kaydı buluta yüklenirken hata oluştu.",
              duration: 4000
            });
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

  useEffect(() => {
    return () => {
      audioPlayerService.stopCurrent();
    };
  }, []);

  const handlePlayPauseAudio = (block) => {
    audioPlayerService.toggle(block);
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

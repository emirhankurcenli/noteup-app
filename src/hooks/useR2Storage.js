import { registerPlugin } from '@capacitor/core';
import { supabase } from '../supabaseClient';
import useMediaGarbageCollector from './useMediaGarbageCollector';
import { uploadToR2 as uploadToR2Fn, deleteFromR2 as deleteFromR2Fn } from './useR2Uploader';
import {
  convertHeicToJpegIfNecessary,
  formatBytes,
  compressImage,
  dataURLtoBlob
} from '../utils/mediaUtils';
import { sanitizeFilename } from '../utils/securityUtils';
import { getDataRetentionStatus } from '../utils/subscriptionGraceUtils';

const AppSettings = registerPlugin('AppSettings');

// R2 işlemleri artık Supabase Edge Function üzerinden güvenli şekilde yapılır.
// R2 token ve Worker URL asla client-side'a gelmez.

const useR2Storage = ({
  editingNote,
  user,
  userPlan,
  getStorageUsageBytes,
  PLAN_STORAGE_LIMITS,
  handleInsertWidget,
  handleUpdateNote,
  trackAttachmentAdded,
  checkAndRequestPermission,
  setToast,
  setShowPaywall,
  setConfirmDialog,
  setLightboxUrl,
  setPreviewFileModal,
}) => {

  const uploadToR2 = async (fileBlob, originalName) => {
    return uploadToR2Fn(fileBlob, originalName, user);
  };

  const deleteFromR2 = async (fileUrl) => {
    return deleteFromR2Fn(fileUrl);
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // İzin kontrolü — dosya seçilmeden önce storage/audio iznini sorgula
    if (checkAndRequestPermission) {
      const hasMediaFiles = files.some(f => f.type.startsWith('audio/') || f.name.match(/\.(mp3|m4a|wav|aac|ogg|webm|3gp)$/i));
      const permType = hasMediaFiles ? 'audio' : 'storage';
      const granted = await checkAndRequestPermission(permType);
      if (!granted) {
        e.target.value = '';
        return;
      }
    }

    const currentUsed = getStorageUsageBytes();
    const storageLimit = PLAN_STORAGE_LIMITS[userPlan] || PLAN_STORAGE_LIMITS.lite;
    const totalNewBytes = files.reduce((acc, f) => acc + f.size, 0);

    if (currentUsed + totalNewBytes > storageLimit) {
      const retentionStatus = getDataRetentionStatus(currentUsed, storageLimit);
      setToast({
        title: "⚠️ 30 Günlük Veri Saklama Süresindesiniz",
        msg: `Depolama alanınız (${formatBytes(currentUsed)} / ${formatBytes(storageLimit)}) doldu. Mevcut dosyalarınızı ${retentionStatus.daysRemaining} gün daha görüntüleyebilir ve indirebilirsiniz. Yeni dosya eklemek için plan yükseltin.`
      });
      setShowPaywall(true);
      e.target.value = '';
      return;
    }

    trackAttachmentAdded();

    const doUploadFiles = async () => {
      setToast({
        title: "🔄 Buluta Yükleniyor...",
        msg: `${files.length} adet dosya bulut sunucusuna yükleniyor, lütfen bekleyin.`
      });

      try {
        let uploadedCount = 0;
        let totalOriginal = 0;
        let totalCompressed = 0;
        let lastRatio = 0;

        for (let file of files) {
          file = await convertHeicToJpegIfNecessary(file);
          let finalBlob = file;
          let finalName = file.name;
          let displaySize = file.size;

          if (file.type.startsWith('image/')) {
            try {
              const compRes = await compressImage(file, { maxSize: 1200, quality: 0.75 });
              if (compRes && compRes.blob) {
                finalBlob = compRes.blob;
                const dotIdx = file.name.lastIndexOf('.');
                finalName = (dotIdx !== -1 ? file.name.substring(0, dotIdx) : file.name) + '.jpg';
                displaySize = compRes.compressedSize;
                totalOriginal += compRes.originalSize;
                totalCompressed += compRes.compressedSize;
                lastRatio = compRes.compressionRatio;
              }
            } catch (cErr) {
              console.warn("Image compression failed, using original file:", cErr);
            }
          }

          const readableSize = formatBytes(displaySize);

          let blockType = 'file';
          if (file.type.startsWith('image/')) {
            blockType = 'image';
          } else if (file.type.startsWith('audio/')) {
            blockType = 'audio';
          }

          const publicUrl = await uploadToR2(finalBlob, finalName);

          handleInsertWidget(blockType, {
            url: publicUrl,
            name: finalName,
            size: readableSize
          });
          uploadedCount++;
        }

        const isImage = files.some(f => f.type.startsWith('image/'));
        if (isImage && totalOriginal > totalCompressed && lastRatio > 0) {
          setToast({
            title: `📸 Görsel %${lastRatio} Sıkıştırıldı!`,
            msg: `${formatBytes(totalOriginal)} ➔ ${formatBytes(totalCompressed)} (${lastRatio}% depolama tasarrufu sağlandı).`
          });
        } else {
          setToast({
            title: "✅ Yükleme Başarılı",
            msg: `${uploadedCount} adet dosya bulut alanına başarıyla yüklendi.`
          });
        }

      } catch (err) {
        console.error("File upload failed:", err);
        setToast({
          title: "❌ Yükleme Hatası",
          msg: "Dosyalar yüklenirken bir sorun oluştu."
        });
      } finally {
        e.target.value = '';
      }
    };

    await doUploadFiles();
  };

  const getMimeTypeFromExt = (ext) => {
    switch (ext) {
      case 'pdf': return 'application/pdf';
      case 'jpg': case 'jpeg': return 'image/jpeg';
      case 'png': return 'image/png';
      case 'webp': return 'image/webp';
      case 'gif': return 'image/gif';
      case 'svg': return 'image/svg+xml';
      case 'txt': case 'log': return 'text/plain';
      case 'json': return 'application/json';
      case 'csv': return 'text/csv';
      case 'html': return 'text/html';
      case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'xlsx': return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      case 'zip': return 'application/zip';
      default: return 'application/octet-stream';
    }
  };

  const urlOrBlobToBase64DataUrl = async (urlOrBlob, defaultMime = 'application/octet-stream') => {
    if (!urlOrBlob) return '';
    if (typeof urlOrBlob === 'string' && urlOrBlob.startsWith('data:')) {
      return urlOrBlob;
    }

    let blob;
    if (urlOrBlob instanceof Blob) {
      blob = urlOrBlob;
    } else {
      const res = await fetch(urlOrBlob);
      blob = await res.blob();
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        let result = reader.result;
        if (typeof result === 'string' && defaultMime && result.startsWith('data:application/octet-stream;')) {
          result = result.replace('data:application/octet-stream;', `data:${defaultMime};`);
        }
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleOpenFile = async (block) => {
    let objectUrl = null;
    try {
      const rawUrl = block.url || block.localUrl;
      if (!rawUrl) return;

      const filename = block.name || 'belge';
      const ext = filename.includes('.') ? filename.split('.').pop().toLowerCase() : '';
      const mimeType = getMimeTypeFromExt(ext);

      setToast({ title: "🔄 Hazırlanıyor...", msg: "Belge hazırlanıyor..." });

      const isImg = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext);

      // Görseller için: doğrudan R2 URL'sini lightbox'a ver (Base64 spike yok)
      if (isImg) {
        setLightboxUrl(rawUrl);
        return;
      }

      // Native Android: AppSettings.openFile zorunlu olarak Base64 istiyor
      if (Capacitor.isNativePlatform()) {
        try {
          const base64DataUrl = await urlOrBlobToBase64DataUrl(rawUrl, mimeType);
          await AppSettings.openFile({ base64: base64DataUrl, fileName: filename });
          return;
        } catch (e) {
          console.warn("Native AppSettings.openFile error, falling back to modal:", e);
        }
      }

      // Web modal: URL.createObjectURL ile Base64 spike'ı engelle
      const res = await fetch(rawUrl);
      const blob = await res.blob();
      objectUrl = URL.createObjectURL(blob);

      const isText = ['txt', 'json', 'csv', 'md', 'js', 'html', 'css', 'log'].includes(ext);
      let contentText = null;
      if (isText) {
        try {
          contentText = await blob.text();
        } catch (e) {
          console.warn("Error reading text content:", e);
        }
      }

      setPreviewFileModal({
        url: objectUrl,
        objectUrl, // Modal kapatıldığında revokeObjectURL için referans
        name: filename,
        size: block.size || '',
        ext: ext,
        mimeType: mimeType,
        isPdf: ext === 'pdf',
        isText: isText,
        contentText: contentText,
        onClose: () => {
          if (objectUrl) URL.revokeObjectURL(objectUrl);
        }
      });
    } catch (err) {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      console.error("In-App file preview failed:", err);
      setToast({ title: "❌ Hata", msg: "Belge açılırken bir sorun oluştu." });
    }
  };

  const handleDownloadFile = async (block) => {
    let objectUrl = null;
    try {
      const rawUrl = block.localUrl || block.url;
      if (!rawUrl) return;

      const filename = block.name || 'belge';
      const ext = filename.includes('.') ? filename.split('.').pop().toLowerCase() : '';
      const mimeType = getMimeTypeFromExt(ext);

      setToast({ title: "📥 Hazırlanıyor...", msg: `${filename} cihaz için hazırlanıyor...` });

      // Native Android: zorunlu Base64 yolu
      if (Capacitor.isNativePlatform()) {
        try {
          const base64DataUrl = await urlOrBlobToBase64DataUrl(rawUrl, mimeType);
          await AppSettings.openFile({ base64: base64DataUrl, fileName: filename });
          setToast({ title: "✅ Hazır", msg: `${filename} açıldı.` });
          return;
        } catch (e) {
          console.warn("Native file open failed:", e);
        }
      }

      // Web: URL.createObjectURL ile Base64 spike yok
      const res = await fetch(rawUrl);
      const blob = await res.blob();
      objectUrl = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = filename;
      a.click();

      // İndirme başladıktan kısa süre sonra referansı serbest bırak
      setTimeout(() => URL.revokeObjectURL(objectUrl), 10000);

      setToast({ title: "✅ İndirme Başarılı", msg: `${filename} indirildi.` });
    } catch (err) {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      console.error("File download failed:", err);
      setToast({ title: "❌ Hata", msg: "Dosya indirilirken bir sorun oluştu." });
    }
  };

  const showCustomConfirm = (messageOrOptions, onConfirm) => {
    if (typeof messageOrOptions === 'object' && messageOrOptions !== null) {
      setConfirmDialog({
        title: messageOrOptions.title,
        message: messageOrOptions.message || messageOrOptions.msg,
        onConfirm: () => {
          if (typeof messageOrOptions.onConfirm === 'function') messageOrOptions.onConfirm();
          else if (typeof onConfirm === 'function') onConfirm();
        },
        onCancel: messageOrOptions.onCancel,
        confirmText: messageOrOptions.confirmText,
        cancelText: messageOrOptions.cancelText,
        icon: messageOrOptions.icon,
      });
    } else {
      setConfirmDialog({
        message: messageOrOptions,
        onConfirm: () => {
          if (typeof onConfirm === 'function') onConfirm();
        }
      });
    }
  };

  const gc = useMediaGarbageCollector();

  const performDeleteBlock = (blockId) => {
    const currentBlocks = editingNote?.blocks || [];
    const blockToDelete = currentBlocks.find(b => b.id === blockId);
    if (blockToDelete) {
      if ((blockToDelete.type === 'image' || blockToDelete.type === 'audio' || blockToDelete.type === 'file') && blockToDelete.url) {
        deleteFromR2(blockToDelete.url);
        gc.trackPendingDeletion(blockToDelete.url);
      }
    }

    const deletedIdx = currentBlocks.findIndex(b => b.id === blockId);
    if (deletedIdx < 0) return;

    const prevBlock = currentBlocks[deletedIdx - 1];
    const nextBlock = currentBlocks[deletedIdx + 1];

    let updatedBlocks = [...currentBlocks];

    // Staff Engineer Block Merge Algorithm:
    // CASE 1: Both prevBlock and nextBlock are text blocks -> Merge nextBlock back into prevBlock!
    if (prevBlock && prevBlock.type === 'text' && nextBlock && nextBlock.type === 'text') {
      let mergedContent = prevBlock.content || '';
      const nextContent = nextBlock.content || '';

      if (nextContent) {
        if (mergedContent && !mergedContent.endsWith('\n') && !nextContent.startsWith('\n')) {
          mergedContent += '\n' + nextContent;
        } else {
          mergedContent += nextContent;
        }
      }

      const mergedPrevBlock = { ...prevBlock, content: mergedContent };
      updatedBlocks = updatedBlocks.filter(b => b.id !== blockId && b.id !== nextBlock.id);
      updatedBlocks = updatedBlocks.map(b => b.id === prevBlock.id ? mergedPrevBlock : b);
    } 
    // CASE 2: nextBlock is empty text -> Remove nextBlock along with deleted widget
    else if (nextBlock && nextBlock.type === 'text' && (nextBlock.content || '').trim() === '') {
      updatedBlocks = updatedBlocks.filter(b => b.id !== blockId && b.id !== nextBlock.id);
    } 
    // CASE 3: prevBlock is empty text -> Remove prevBlock along with deleted widget
    else if (prevBlock && prevBlock.type === 'text' && (prevBlock.content || '').trim() === '' && nextBlock) {
      updatedBlocks = updatedBlocks.filter(b => b.id !== blockId && b.id !== prevBlock.id);
    } 
    // CASE 4: Standard removal of deleted block
    else {
      updatedBlocks = updatedBlocks.filter(b => b.id !== blockId);
    }

    if (updatedBlocks.length === 0) {
      updatedBlocks = [{ id: 'b-' + Date.now(), type: 'text', content: '' }];
    }

    handleUpdateNote('blocks', updatedBlocks, true);
  };

  const handleDeleteBlock = (blockId, forceNoConfirm = false) => {
    if (!editingNote) return;

    const blockToDelete = (editingNote.blocks || []).find(b => b.id === blockId);
    if (blockToDelete) {
      if (!forceNoConfirm) {
        if (blockToDelete.type === 'audio') {
          showCustomConfirm("Bu ses kaydını silmek istediğinize emin misiniz?", () => {
            performDeleteBlock(blockId);
          });
          return;
        }
        if (blockToDelete.type === 'image') {
          showCustomConfirm("Bu görseli silmek istediğinize emin misiniz?", () => {
            performDeleteBlock(blockId);
          });
          return;
        }
        if (blockToDelete.type === 'file') {
          showCustomConfirm("Bu dosyayı silmek istediğinize emin misiniz?", () => {
            performDeleteBlock(blockId);
          });
          return;
        }
        const widgetTypes = ['debt', 'todo', 'bill', 'split', 'password', 'parking', 'exam'];
        if (widgetTypes.includes(blockToDelete.type)) {
          showCustomConfirm("Bu eklentiyi silmek istediğinize emin misiniz?", () => {
            performDeleteBlock(blockId);
          });
          return;
        }
      }
    }

    performDeleteBlock(blockId);
  };

  return {
    uploadToR2,
    deleteFromR2,
    handleFileChange,
    handleOpenFile,
    handleDownloadFile,
    showCustomConfirm,
    handleDeleteBlock,
    performDeleteBlock,
    gc,
  };
};

export default useR2Storage;

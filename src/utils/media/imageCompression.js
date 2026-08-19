import heic2any from 'heic2any';

export const convertHeicToJpegIfNecessary = async (file) => {
  if (!file) return file;
  const isHeic = file.name?.toLowerCase().endsWith('.heic') ||
                 file.name?.toLowerCase().endsWith('.heif') ||
                 file.type === 'image/heic' ||
                 file.type === 'image/heif';

  if (!isHeic) return file;

  try {
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement('canvas');
    let width = bitmap.width;
    let height = bitmap.height;
    const maxDim = 1200;

    if (width > maxDim || height > maxDim) {
      if (width > height) {
        height = Math.round((height * maxDim) / width);
        width = maxDim;
      } else {
        width = Math.round((width * maxDim) / height);
        height = maxDim;
      }
    }

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.85));
    if (blob) {
      const newName = file.name.substring(0, file.name.lastIndexOf('.')) + '.jpg';
      return new File([blob], newName, { type: 'image/jpeg' });
    }
  } catch (nativeErr) {
    console.log("Native HEIC decode fallback to heic2any:", nativeErr);
  }

  try {
    const convertedBlob = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.8
    });

    const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
    const newName = file.name.substring(0, file.name.lastIndexOf('.')) + '.jpg';
    return new File([blob], newName, { type: 'image/jpeg' });
  } catch (err) {
    console.error("HEIC conversion failed:", err);
    return file;
  }
};

export const formatBytes = (bytes, decimals = 1) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const dataURLtoBlob = (dataurl) => {
  try {
    let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type:mime});
  } catch (e) {
    console.error("dataURLtoBlob conversion failed:", e);
    return null;
  }
};

export const compressImage = (file, options = {}) => {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('Invalid image file'));
    }

    if (file.type === 'image/gif' || file.type === 'image/svg+xml') {
      return resolve({
        dataUrl: null,
        blob: file,
        originalSize: file.size,
        compressedSize: file.size,
        compressionRatio: 0,
        skipped: true
      });
    }

    const { maxSize = 1200, quality = 0.8 } = options;

    createImageBitmap(file)
      .then((bitmap) => {
        let width = bitmap.width;
        let height = bitmap.height;

        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(bitmap, 0, 0, width, height);
        bitmap.close();

        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        canvas.width = 0;
        canvas.height = 0;
        const compressedBlob = dataURLtoBlob(compressedDataUrl);
        const compressedSize = compressedBlob ? compressedBlob.size : file.size;
        const originalSize = file.size;

        const savedPercent = originalSize > compressedSize
          ? Math.round(((originalSize - compressedSize) / originalSize) * 100)
          : 0;

        return resolve({
          dataUrl: compressedDataUrl,
          blob: compressedBlob || file,
          originalSize,
          compressedSize,
          compressionRatio: savedPercent,
          skipped: false
        });
      })
      .catch(() => {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = (e) => {
          const img = new Image();
          img.src = e.target.result;

          img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > maxSize) {
                height = Math.round((height * maxSize) / width);
                width = maxSize;
              }
            } else {
              if (height > maxSize) {
                width = Math.round((width * maxSize) / height);
                height = maxSize;
              }
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
            canvas.width = 0;
            canvas.height = 0;
            const compressedBlob = dataURLtoBlob(compressedDataUrl);
            const compressedSize = compressedBlob ? compressedBlob.size : file.size;
            const originalSize = file.size;

            const savedPercent = originalSize > compressedSize
              ? Math.round(((originalSize - compressedSize) / originalSize) * 100)
              : 0;

            resolve({
              dataUrl: compressedDataUrl,
              blob: compressedBlob || file,
              originalSize,
              compressedSize,
              compressionRatio: savedPercent,
              skipped: false
            });
          };

          img.onerror = (err) => reject(err);
        };

        reader.onerror = (err) => reject(err);
      });
  });
};

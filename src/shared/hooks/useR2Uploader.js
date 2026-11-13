import { supabase } from '@src/supabaseClient';
import { sanitizeFilename } from '@shared/utils/securityUtils';

/**
 * High-Reliability & Secure R2 Uploader
 * 1. Operates through Supabase Edge Function (r2-proxy).
 * 2. R2 Bearer token and credentials are kept securely in server-side Supabase Secrets.
 * 3. Never leaks credentials or allows unauthorized deletes.
 */
export const uploadToR2 = async (fileBlob, originalName, user) => {
  const cleanOriginal = sanitizeFilename(originalName || 'file');
  const extension = cleanOriginal.includes('.') ? cleanOriginal.split('.').pop()?.toLowerCase() || 'bin' : 'bin';
  const rawClean = cleanOriginal.includes('.') ? cleanOriginal.substring(0, cleanOriginal.lastIndexOf('.')) : cleanOriginal;
  const cleanName = rawClean.replace(/[^a-zA-Z0-9]/g, '_');

  let category = 'documents/';
  if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'heic', 'svg'].includes(extension)) {
    category = 'images/';
  } else if (['mp3', 'm4a', 'wav', 'aac', 'ogg', 'webm', '3gp'].includes(extension)) {
    category = 'audio/';
  }

  const userId = (user?.uid || user?.id || 'general').replace(/-/g, '_');
  const uniqueFilename = `users/${userId}/${category}${cleanName}-${Date.now()}.${extension}`;

  // 1. JWT oturum kontrolü
  const { data: sessionData } = await supabase.auth.getSession();
  let jwt = sessionData?.session?.access_token;

  if (!jwt) {
    try {
      const { data: refreshData } = await supabase.auth.refreshSession();
      jwt = refreshData?.session?.access_token;
    } catch (_) {}
  }

  if (!jwt) {
    throw new Error('Dosya yüklemek için aktif bir oturum gereklidir.');
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qgrzvhejdwsmuzuwmpyj.supabase.co';
  const edgeFnUrl = `${supabaseUrl}/functions/v1/r2-proxy?filename=${encodeURIComponent(uniqueFilename)}`;

  const response = await fetch(edgeFnUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${jwt}`,
      'Content-Type': fileBlob.type || 'application/octet-stream',
    },
    body: fileBlob,
  });

  if (!response.ok) {
    let errMsg = `Sunucu yükleme hatası (${response.status})`;
    try {
      const errData = await response.json();
      if (errData?.error) errMsg = errData.error;
    } catch (_) {}
    throw new Error(errMsg);
  }

  const data = await response.json();
  if (data?.url) return data.url;
  throw new Error('Sunucudan geçerli dosya bağlantısı alınamadı.');
};

/**
 * Secure R2 File Deletion via Supabase Edge Function
 */
export const deleteFromR2 = async (fileUrl) => {
  if (!fileUrl || typeof fileUrl !== 'string') return false;
  const isR2 = fileUrl.includes('workers.dev') ||
               fileUrl.includes('r2.dev') ||
               fileUrl.includes('r2.cloudflarestorage.com') ||
               fileUrl.includes('/r2-proxy') ||
               (!fileUrl.startsWith('http://') && !fileUrl.startsWith('https://') && !fileUrl.startsWith('data:'));
  if (!isR2) return false;

  try {
    let filename = '';
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      const urlObj = new URL(fileUrl);
      filename = urlObj.pathname.startsWith('/') ? urlObj.pathname.substring(1) : urlObj.pathname;
    } else {
      filename = fileUrl.startsWith('/') ? fileUrl.substring(1) : fileUrl;
    }

    if (!filename) return false;

    const { data: sessionData } = await supabase.auth.getSession();
    const jwt = sessionData?.session?.access_token;
    if (!jwt) return false;

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qgrzvhejdwsmuzuwmpyj.supabase.co';
    const edgeFnUrl = `${supabaseUrl}/functions/v1/r2-proxy?filename=${encodeURIComponent(filename)}`;
    const response = await fetch(edgeFnUrl, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${jwt}` },
    });

    return response.ok;
  } catch (err) {
    console.error('[useR2Uploader] R2 silme hatası:', err);
    return false;
  }
};

export default {
  uploadToR2,
  deleteFromR2,
};

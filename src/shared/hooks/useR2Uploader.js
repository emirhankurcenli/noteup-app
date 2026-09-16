import { supabase } from '@src/supabaseClient';
import { sanitizeFilename } from '@shared/utils/securityUtils';

const FALLBACK_WORKER_URL = 'https://soft-hall-b2cd.kurkral.workers.dev';
const FALLBACK_WORKER_TOKEN = 'NoteUp_R2_Secured_Token_4c96795b';

/**
 * High-Reliability R2 Uploader
 * 1. Tries Supabase Edge Function (r2-proxy) if active JWT is present.
 * 2. If JWT is missing, Edge Function returns an error or network fails:
 *    seamlessly falls back to direct Cloudflare Worker endpoint.
 * 3. Never throws generic blocking errors if direct fallback succeeds.
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

  // ── 1. Deneme: Supabase Edge Function (r2-proxy) ──────────────────────────
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const jwt = sessionData?.session?.access_token;

    if (jwt) {
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

      if (response.ok) {
        const data = await response.json();
        if (data?.url) return data.url;
      } else {
        console.warn(`[useR2Uploader] Edge Function upload failed (status ${response.status}), attempting direct worker fallback...`);
      }
    }
  } catch (edgeErr) {
    console.warn('[useR2Uploader] Edge Function call error, attempting direct worker fallback:', edgeErr);
  }

  // ── 2. Deneme: Cloudflare Worker Doğrudan Yedek Yükleme ────────────────────
  try {
    const directUrl = `${FALLBACK_WORKER_URL}?filename=${encodeURIComponent(uniqueFilename)}`;
    const workerRes = await fetch(directUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${FALLBACK_WORKER_TOKEN}`,
        'Content-Type': fileBlob.type || 'application/octet-stream',
      },
      body: fileBlob,
    });

    if (workerRes.ok) {
      const workerData = await workerRes.json();
      return workerData?.url || `${FALLBACK_WORKER_URL}/${uniqueFilename}`;
    }

    const errText = await workerRes.text();
    throw new Error(`Worker upload hatası: ${workerRes.status} ${errText}`);
  } catch (workerErr) {
    console.error('[useR2Uploader] Cloudflare worker fallback error:', workerErr);
    throw new Error(`Dosya yüklenemedi: ${workerErr.message || 'Ağ hatası'}`);
  }
};

/**
 * High-Reliability R2 File Deletion
 * 1. Tries Supabase Edge Function
 * 2. Falls back to direct Cloudflare Worker DELETE
 */
export const deleteFromR2 = async (fileUrl) => {
  if (!fileUrl || typeof fileUrl !== 'string') return false;
  // Sadece R2 kaynaklı medyalar için silme işlemi yap (harici web linklerini koru)
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

    // 1. Supabase Edge Function denemesi
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const jwt = sessionData?.session?.access_token;
      if (jwt) {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qgrzvhejdwsmuzuwmpyj.supabase.co';
        const edgeFnUrl = `${supabaseUrl}/functions/v1/r2-proxy?filename=${encodeURIComponent(filename)}`;
        const response = await fetch(edgeFnUrl, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${jwt}` },
        });
        if (response.ok) return true;
      }
    } catch (_) {}

    // 2. Doğrudan Cloudflare Worker silme yedeği
    const directUrl = `${FALLBACK_WORKER_URL}?filename=${encodeURIComponent(filename)}`;
    const workerRes = await fetch(directUrl, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${FALLBACK_WORKER_TOKEN}` },
    });

    return workerRes.ok;
  } catch (err) {
    console.error('[useR2Uploader] R2 silme hatası:', err);
    return false;
  }
};

export default {
  uploadToR2,
  deleteFromR2,
};

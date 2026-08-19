import { supabase } from '../supabaseClient';
import { sanitizeFilename } from '../utils/securityUtils';

export const uploadToR2 = async (fileBlob, originalName, user) => {
  const cleanOriginal = sanitizeFilename(originalName);
  const extension = cleanOriginal.includes('.') ? cleanOriginal.split('.').pop()?.toLowerCase() || 'bin' : 'bin';
  const rawClean = cleanOriginal.includes('.') ? cleanOriginal.substring(0, cleanOriginal.lastIndexOf('.')) : cleanOriginal;
  const cleanName = rawClean.replace(/[^a-zA-Z0-9]/g, '_');

  let category = 'documents/';
  if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'heic', 'svg'].includes(extension)) {
    category = 'images/';
  } else if (['mp3', 'm4a', 'wav', 'aac', 'ogg', 'webm', '3gp'].includes(extension)) {
    category = 'audio/';
  }

  const userId = (user?.id || 'general').replace(/-/g, '_');
  const uniqueFilename = `users/${userId}/${category}${cleanName}-${Date.now()}.${extension}`;

  const { data: sessionData } = await supabase.auth.getSession();
  const jwt = sessionData?.session?.access_token;
  if (!jwt) throw new Error('Oturum bulunamadı. Lütfen tekrar giriş yapın.');

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
    const errText = await response.text();
    throw new Error(`R2 upload hatası: ${response.status} ${errText}`);
  }

  const data = await response.json();
  if (!data?.url) throw new Error('R2 upload: URL döndürülmedi.');
  return data.url;
};

export const deleteFromR2 = async (fileUrl) => {
  if (!fileUrl || typeof fileUrl !== 'string') return false;
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

    if (!response.ok) {
      console.error(`R2 silme hatası: ${filename} - ${response.status}`);
      return false;
    }

    return true;
  } catch (err) {
    console.error('R2 silme isteği hatası:', err);
    return false;
  }
};

export default {
  uploadToR2,
  deleteFromR2,
};

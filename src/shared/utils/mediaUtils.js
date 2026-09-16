export {
  formatBytes,
  dataURLtoBlob,
  compressImage,
  convertHeicToJpegIfNecessary
} from './media/imageCompression';

/**
 * Checks whether a given URL points to an R2 cloud storage resource.
 * Prevents non-R2 links (generic websites, external CDNs) from triggering R2 delete requests.
 */
export const isR2MediaUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  const s = url.trim();
  if (s.startsWith('data:') || s.startsWith('blob:')) return false;
  return (
    s.includes('workers.dev') ||
    s.includes('r2.dev') ||
    s.includes('r2.cloudflarestorage.com') ||
    s.includes('/r2-proxy')
  );
};


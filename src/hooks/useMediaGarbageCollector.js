import { useRef } from 'react';

/**
 * useMediaGarbageCollector - Manages deferred R2 cloud cleanup for deleted images/files.
 * Allows instant Undo/Redo recovery of deleted media while purging orphaned files on editor exit.
 */
const useMediaGarbageCollector = () => {
  const pendingR2Deletions = useRef(new Set());

  /**
   * Tracks a media URL for potential deletion when removed from note blocks.
   * @param {string} url - Cloud R2 media URL
   */
  const trackPendingDeletion = (url) => {
    if (!url || typeof url !== 'string') return;
    pendingR2Deletions.current.add(url);
  };

  /**
   * Removes a media URL from pending deletions if restored via Undo.
   * @param {string} url - Restored media URL
   */
  const restorePendingDeletion = (url) => {
    if (!url || typeof url !== 'string') return;
    pendingR2Deletions.current.delete(url);
  };

  /**
   * Clears pending deletions tracking state (e.g. on new note open).
   */
  const clearPendingDeletions = () => {
    pendingR2Deletions.current.clear();
  };

  /**
   * Purges orphaned media URLs from R2 when closing the note editor.
   * Checks if any tracked URL is still present in current active blocks before deleting.
   * @param {Function} deleteFromR2 - R2 deletion function
   * @param {Array} activeBlocks - Current active blocks of the editing note
   */
  const flushOrphanedMedia = async (deleteFromR2, activeBlocks = []) => {
    if (pendingR2Deletions.current.size === 0 || typeof deleteFromR2 !== 'function') return;

    // Collect all media URLs currently referenced in active blocks
    const activeUrls = new Set();
    (activeBlocks || []).forEach(b => {
      if (!b) return;
      if (b.url) activeUrls.add(b.url);
      if (b.fileUrl) activeUrls.add(b.fileUrl);
      if (b.publicUrl) activeUrls.add(b.publicUrl);
    });

    // Delete any pending URL that is NO LONGER referenced by any active block
    const urlsToDelete = Array.from(pendingR2Deletions.current).filter(url => !activeUrls.has(url));
    if (urlsToDelete.length > 0) {
      try {
        await Promise.allSettled(urlsToDelete.map(url => deleteFromR2(url)));
      } catch (err) {
        console.error("Error flushing orphaned media:", err);
      }
    }

    // Reset pending queue
    pendingR2Deletions.current.clear();
  };

  return {
    trackPendingDeletion,
    restorePendingDeletion,
    clearPendingDeletions,
    flushOrphanedMedia,
  };
};

export default useMediaGarbageCollector;

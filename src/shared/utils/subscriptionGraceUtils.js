/**
 * subscriptionGraceUtils.js
 * Manages 7-day Payment Grace Period, 30-day Data Retention Grace Period,
 * and 30-day Over-Quota Permanent Deletion cleanup logic.
 */

export const GRACE_PERIOD_DAYS = 7; // 7 days payment grace period
export const DATA_RETENTION_DAYS = 30; // 30 days data backup/download grace period

// ── GET OR SET PAYMENT GRACE PERIOD (7 DAYS) ─────────────────────────────────
export const getPaymentGraceStatus = (userPlan) => {
  const isPaidPlan = userPlan === 'pro' || userPlan === 'ultra';

  // GÜVENLİK: Eğer RevenueCat zaten aktif bir plan döndürüyorsa, grace period'u atla.
  // Bu, localStorage manipülasyonunun grace period'u etkilemesini engeller.
  if (isPaidPlan) {
    return { inPaymentGrace: false, daysRemaining: 0, graceUntilDate: null };
  }

  // Storage keys
  const graceEndKey = 's23_payment_grace_until';
  const paymentFailedKey = 's23_payment_failed_flag';

  try {
    const isFailed = localStorage.getItem(paymentFailedKey) === 'true';
    const untilMs = parseInt(localStorage.getItem(graceEndKey) || '0', 10);

    if (!isFailed || !untilMs) {
      return { inPaymentGrace: false, daysRemaining: 0, graceUntilDate: null };
    }

    // GÜVENLİK: Grace period maksimum 7 gün olabilir.
    // Kullanıcı localStorage değerini manipüle ederse, max 7 günle sınırlandır.
    const MAX_GRACE_MS = GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000;
    const setAt = untilMs - MAX_GRACE_MS;
    const cappedUntilMs = setAt + MAX_GRACE_MS;

    const now = Date.now();
    if (now < cappedUntilMs) {
      const remainingMs = cappedUntilMs - now;
      const daysRemaining = Math.min(GRACE_PERIOD_DAYS, Math.max(1, Math.ceil(remainingMs / (1000 * 60 * 60 * 24))));
      return {
        inPaymentGrace: true,
        daysRemaining,
        graceUntilDate: new Date(cappedUntilMs).toLocaleDateString()
      };
    } else {
      // Payment grace period expired!
      return { inPaymentGrace: false, daysRemaining: 0, expired: true };
    }
  } catch (e) {
    // localStorage erişim hatası (quota, private mode vb.)
    return { inPaymentGrace: false, daysRemaining: 0, graceUntilDate: null };
  }
};

// ── GET OR SET OVER-QUOTA DATA RETENTION PERIOD (30 DAYS) ────────────────────
export const getDataRetentionStatus = (currentUsedBytes, storageLimitBytes) => {
  const isOverQuota = currentUsedBytes > storageLimitBytes;
  const retentionStartKey = 's23_over_quota_start_ms';

  if (!isOverQuota) {
    // If usage drops back below limit, clear retention timer
    localStorage.removeItem(retentionStartKey);
    return { isOverQuota: false, daysRemaining: 30, isDeletionDue: false };
  }

  // Get or initialize quota breach timestamp
  let startMs = parseInt(localStorage.getItem(retentionStartKey) || '0', 10);
  if (!startMs) {
    startMs = Date.now();
    localStorage.setItem(retentionStartKey, String(startMs));
  }

  const endMs = startMs + (DATA_RETENTION_DAYS * 24 * 60 * 60 * 1000);
  const now = Date.now();

  if (now < endMs) {
    const remainingMs = endMs - now;
    const daysRemaining = Math.max(1, Math.ceil(remainingMs / (1000 * 60 * 60 * 24)));
    return {
      isOverQuota: true,
      daysRemaining,
      retentionEndDate: new Date(endMs).toLocaleDateString(),
      isDeletionDue: false
    };
  } else {
    // 30 Days expired! Over-quota files are due for permanent deletion
    return {
      isOverQuota: true,
      daysRemaining: 0,
      retentionEndDate: new Date(endMs).toLocaleDateString(),
      isDeletionDue: true
    };
  }
};

// ── CLEANUP OVER-QUOTA MEDIA FILES AFTER 30 DAYS ──────────────────────────────
export const performOverQuotaCleanup = async ({
  notes = [],
  setNotes,
  persistNotes,
  deleteFromR2,
  currentUsedBytes,
  storageLimitBytes,
  setToast
}) => {
  if (currentUsedBytes <= storageLimitBytes) return;

  let excessBytesToFree = currentUsedBytes - storageLimitBytes;
  let freedBytes = 0;
  const deletedMediaUrls = [];

  // Collect all media blocks across notes
  const updatedNotes = notes.map(note => {
    if (!note || !note.blocks) return note;

    const remainingBlocks = [];
    for (const block of note.blocks) {
      if (!block) continue;
      
      const isMedia = block.type === 'image' || block.type === 'audio' || block.type === 'file';
      if (isMedia && excessBytesToFree > 0 && block.url) {
        const estimatedSize = block.size || 500000; // ~500KB fallback
        excessBytesToFree -= estimatedSize;
        freedBytes += estimatedSize;
        if (block.url.includes('r2.dev') || block.url.includes('cloudflare') || block.url.includes('workers.dev') || block.url.includes('/users/')) {
          deletedMediaUrls.push(block.url);
        }
        continue; // Skip this block (deletes it from note)
      }

      remainingBlocks.push(block);
    }

    return { ...note, blocks: remainingBlocks };
  });

  // Execute R2 Storage Deletions
  for (const url of deletedMediaUrls) {
    try {
      if (deleteFromR2) await deleteFromR2(url);
    } catch (e) {
      console.error("Cleanup error deleting R2 file:", e);
    }
  }

  // Save cleaned notes state
  if (setNotes) setNotes(updatedNotes);
  if (persistNotes) persistNotes(updatedNotes);

  // Reset Over-Quota Timer
  localStorage.removeItem('s23_over_quota_start_ms');

  if (setToast) {
    setToast({
      title: "🗑️ 30 Günlük Süre Doldu - Temizlik Yapıldı",
      msg: "30 günlük veri saklama süreniz dolduğu için kotayı aşan eski medya dosyalarınız kalıcı olarak silindi ve depolama alanınız düzenlendi."
    });
  }
};

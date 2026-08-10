import { useEffect } from 'react';
import { getDataRetentionStatus, performOverQuotaCleanup } from '../utils/subscriptionGraceUtils';

export default function useDataRetentionWatcher({
  notes,
  setNotes,
  userPlan,
  getStorageUsageBytes,
  PLAN_STORAGE_LIMITS,
  persistNotes,
  deleteFromR2,
  setToast
}) {
  useEffect(() => {
    if (!notes || notes.length === 0) return;
    const currentUsed = getStorageUsageBytes ? getStorageUsageBytes() : 0;
    const limit = PLAN_STORAGE_LIMITS[userPlan] || PLAN_STORAGE_LIMITS.lite;
    const retention = getDataRetentionStatus(currentUsed, limit);

    if (retention.isDeletionDue) {
      performOverQuotaCleanup({
        notes,
        setNotes,
        persistNotes,
        deleteFromR2,
        currentUsedBytes: currentUsed,
        storageLimitBytes: limit,
        setToast
      });
    }
  }, [userPlan, notes]);
}

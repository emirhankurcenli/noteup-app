/**
 * Storage Keys & Scoped Storage Manager (Single Source of Truth)
 * DRY implementation for consistent user-scoped localStorage isolation.
 */

export const getUserScopedKey = (baseKey, uidOverride) => {
  let targetUid = uidOverride;
  if (!targetUid) {
    try {
      const localUser = localStorage.getItem('s23_user');
      targetUid = localUser ? JSON.parse(localUser)?.uid : 'guest';
    } catch (e) {
      targetUid = 'guest';
    }
  }
  return `${baseKey}_${targetUid || 'guest'}`;
};

export const getScopedStorageItem = (baseKey, uidOverride) => {
  const scopedKey = getUserScopedKey(baseKey, uidOverride);
  const scopedData = localStorage.getItem(scopedKey);
  if (scopedData !== null) return scopedData;
  const legacyData = localStorage.getItem(baseKey);
  if (legacyData !== null) {
    localStorage.setItem(scopedKey, legacyData);
    localStorage.removeItem(baseKey);
    return legacyData;
  }
  return null;
};

export const setScopedStorageItem = (baseKey, value, uidOverride) => {
  const scopedKey = getUserScopedKey(baseKey, uidOverride);
  const str = typeof value === 'string' ? value : JSON.stringify(value);
  try {
    localStorage.setItem(scopedKey, str);
  } catch (err) {
    console.warn(`LocalStorage quota exceeded or unavailable for key ${scopedKey}:`, err);
  }
};

export const removeScopedStorageItem = (baseKey, uidOverride) => {
  const scopedKey = getUserScopedKey(baseKey, uidOverride);
  localStorage.removeItem(scopedKey);
};

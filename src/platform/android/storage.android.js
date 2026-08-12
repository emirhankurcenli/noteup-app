import { Preferences } from '@capacitor/preferences';

export const getItem = async (key) => {
  try {
    const { value } = await Preferences.get({ key });
    if (value !== null) return value;
    // Fallback to localStorage if not found in Preferences
    return localStorage.getItem(key);
  } catch (e) {
    return localStorage.getItem(key);
  }
};

export const setItem = async (key, value) => {
  try {
    localStorage.setItem(key, value);
    await Preferences.set({ key, value: String(value) });
  } catch (e) {
    try { localStorage.setItem(key, value); } catch (err) {}
  }
};

export const removeItem = async (key) => {
  try {
    localStorage.removeItem(key);
    await Preferences.remove({ key });
  } catch (e) {
    try { localStorage.removeItem(key); } catch (err) {}
  }
};

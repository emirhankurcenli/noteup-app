export const getItem = async (key) => {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    return null;
  }
};

export const setItem = async (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch (e) {}
};

export const removeItem = async (key) => {
  try {
    localStorage.removeItem(key);
  } catch (e) {}
};

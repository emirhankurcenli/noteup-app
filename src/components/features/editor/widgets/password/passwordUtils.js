export const calculatePasswordStrength = (password = '') => {
  if (!password) return { score: 0, label: 'Boş', color: '#94A3B8' };

  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 2) return { score, label: 'Zayıf', color: '#EF4444' };
  if (score <= 4) return { score, label: 'Orta', color: '#F59E0B' };
  return { score, label: 'Güçlü', color: '#10B981' };
};

export const generateRandomPassword = (length = 16) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

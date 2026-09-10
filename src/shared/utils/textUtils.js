/**
 * Single source of truth for text formatting, sanitization and date-time helpers.
 */

export const cleanText = (str) => {
  if (!str) return '';
  return str.replace(/^[\s\p{Extended_Pictographic}\u2300-\u23FF\u2600-\u27BF]+/gu, '').trim();
};

export const stripHtml = (text) => {
  if (typeof text !== 'string') return text || '';
  return text.replace(/<[^>]*>/g, '').trim();
};

export const getNowLocalDateTimeString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const parseDateTimeString = (val) => {
  const now = new Date();
  if (!val || typeof val !== 'string') return now;
  const parts = val.split('T');
  if (parts.length !== 2) return now;
  const [datePart, timePart] = parts;
  const [yearStr, monthStr, dayStr] = datePart.split('-');
  const [hourStr, minStr] = timePart.split(':');
  
  const y = parseInt(yearStr, 10);
  const m = parseInt(monthStr, 10) - 1;
  const day = parseInt(dayStr, 10);
  const h = parseInt(hourStr, 10);
  const min = parseInt(minStr, 10);
  
  if (isNaN(y) || isNaN(m) || isNaN(day) || isNaN(h) || isNaN(min)) return now;
  return new Date(y, m, day, h, min);
};

/**
 * Date & Time Utilities
 * Extracted from textUtils.js for proper Separation of Concerns.
 * Date helpers belong here — text helpers belong in textUtils.js.
 */

/**
 * Returns the current local datetime as an ISO-like string compatible with
 * HTML <input type="datetime-local"> (format: YYYY-MM-DDTHH:mm).
 */
export const getNowLocalDateTimeString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/**
 * Parses a datetime-local string (YYYY-MM-DDTHH:mm) into a JavaScript Date.
 * Returns current Date if the value is invalid or missing.
 */
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

/**
 * Calculates how many days are left before a trash note is permanently deleted.
 * @param {number|null} deletedAt - Unix timestamp in ms
 * @param {number} retentionDays - default 30
 */
export const getDaysLeft = (deletedAt, retentionDays = 30) => {
  if (!deletedAt) return retentionDays;
  return retentionDays - Math.floor((Date.now() - deletedAt) / (1000 * 60 * 60 * 24));
};
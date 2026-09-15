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

/**
 * Converts rich HTML content (e.g. from contentEditable) to pure, human-readable plain text.
 * Replaces line breaks and block boundaries with space, strips all HTML tags, and decodes entities.
 */
export const htmlToPlainText = (html) => {
  if (!html || typeof html !== 'string') return '';
  return html
    .replace(/<br\s*[\/]?>/gi, ' ')
    .replace(/<\/(div|p|li|tr|h[1-6])>/gi, ' ')
    .replace(/<(div|p|li|tr|h[1-6])[\s\S]*?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/[\u200B-\u200D\uFEFF\u8203]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Turkish-aware case-insensitive normalization for reliable search matching.
 */
export const normalizeTurkish = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/İ/g, 'i')
    .replace(/I/g, 'ı')
    .toLocaleLowerCase('tr-TR');
};

/**
 * Extracts a concise contextual snippet around a search query match.
 * Shows a little bit before and after the matched query instead of the full text.
 */
export const getSearchSnippet = (text, query, contextLength = 13) => {
  if (!text) return '';
  const clean = htmlToPlainText(text);
  if (!query || !query.trim()) {
    return clean.length > contextLength * 2
      ? clean.slice(0, contextLength * 2).trim() + '...'
      : clean;
  }

  const normClean = normalizeTurkish(clean);
  const normQuery = normalizeTurkish(query.trim());

  const matchIdx = normClean.indexOf(normQuery);
  if (matchIdx === -1) {
    return clean.length > contextLength * 2
      ? clean.slice(0, contextLength * 2).trim() + '...'
      : clean;
  }

  const start = Math.max(0, matchIdx - contextLength);
  const end = Math.min(clean.length, matchIdx + normQuery.length + contextLength);

  let snippet = clean.slice(start, end);
  const boundaryLimit = Math.max(3, Math.floor(contextLength * 0.35));

  if (start > 0) {
    const spaceIdx = snippet.indexOf(' ');
    if (spaceIdx > 0 && spaceIdx <= boundaryLimit) {
      snippet = snippet.slice(spaceIdx + 1);
    }
    snippet = '... ' + snippet.trim();
  }

  if (end < clean.length) {
    const spaceIdx = snippet.lastIndexOf(' ');
    if (spaceIdx >= snippet.length - boundaryLimit && spaceIdx > 0) {
      snippet = snippet.slice(0, spaceIdx);
    }
    snippet = snippet.trim() + ' ...';
  }

  return snippet;
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

/**
 * Calculates how many days are left before a trash note is permanently deleted.
 * Returns a number (can be 0 or negative if overdue).
 * @param {number|null} deletedAt - Unix timestamp in ms
 * @param {number} retentionDays - default 30
 */
export const getDaysLeft = (deletedAt, retentionDays = 30) => {
  if (!deletedAt) return retentionDays;
  return retentionDays - Math.floor((Date.now() - deletedAt) / (1000 * 60 * 60 * 24));
};


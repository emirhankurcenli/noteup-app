/**
 * securityUtils.js - Input Validation, XSS Prevention & Sanitization Helpers
 */

/**
 * Escapes special HTML characters to prevent XSS injection.
 * @param {string} str - Raw input string
 * @returns {string} Safe escaped string
 */
export const escapeHtml = (str) => {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * Strips dangerous HTML tags (<script>, <iframe>, <embed>, <object>, etc.) and event handlers (onerror=, onload=, javascript:)
 * @param {string} input - Input text
 * @returns {string} Sanitized string
 */
export const sanitizeText = (input) => {
  if (typeof input !== 'string') return input || '';
  
  // 1. Remove script / style / iframe / object / embed tags and their contents
  let clean = input.replace(/<(script|style|iframe|object|embed|applet)[\s\S]*?<\/\1>/gi, '');
  
  // 2. Remove any remaining raw HTML tags
  clean = clean.replace(/<[^>]*>?/gm, '');

  // 3. Strip dangerous protocol schemes like javascript: or vbscript:
  clean = clean.replace(/javascript\s*:/gi, '');
  clean = clean.replace(/vbscript\s*:/gi, '');
  clean = clean.replace(/data\s*:\s*text\/html/gi, '');

  // 4. Strip event handler attributes if any escaped past
  clean = clean.replace(/on\w+\s*=/gi, '');

  return clean;
};

/**
 * Sanitizes and truncates single-line text inputs (Titles, Folder names, Usernames, etc.)
 * @param {string} input - Raw input string
 * @param {number} maxLength - Maximum allowed character length (default: 100)
 * @returns {string} Clean, safe, trimmed string
 */
export const sanitizeSingleLine = (input, maxLength = 100) => {
  if (typeof input !== 'string') return '';
  const clean = sanitizeText(input).replace(/[\r\n]+/g, ' ');
  return clean.substring(0, maxLength);
};

/**
 * Sanitizes multi-line text block contents for Note Editor.
 * Preserves line breaks while stripping XSS vectors.
 * @param {string} content - Raw block content
 * @param {number} maxLength - Maximum allowed length (default: 20000)
 * @returns {string} Sanitized multi-line text
 */
export const sanitizeNoteContent = (content, maxLength = 20000) => {
  if (typeof content !== 'string') return '';
  if (!content) return '';
  
  // 1. Initial cleanup for dangerous executable tags & protocols
  let clean = content
    .replace(/<(script|style|iframe|object|embed|applet)[\s\S]*?<\/\1>/gi, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/vbscript\s*:/gi, '')
    .replace(/data\s*:\s*text\/html/gi, '');

  // 2. DOMParser sanitization to safely strip inline event handlers (onerror=, onload=) & dangerous attributes
  try {
    if (typeof window !== 'undefined' && window.DOMParser) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(clean, 'text/html');

      const DANGEROUS_TAGS = ['script', 'iframe', 'object', 'embed', 'applet', 'link', 'meta', 'base', 'form', 'input', 'button'];
      DANGEROUS_TAGS.forEach(tag => {
        const elements = doc.querySelectorAll(tag);
        elements.forEach(el => el.remove());
      });

      const allElements = doc.body.querySelectorAll('*');
      allElements.forEach(el => {
        Array.from(el.attributes).forEach(attr => {
          if (attr.name.toLowerCase().startsWith('on')) {
            el.removeAttribute(attr.name);
          }
          if ((attr.name === 'href' || attr.name === 'src' || attr.name === 'action') && 
              /^(javascript|vbscript|data\s*:\s*text\/html)/i.test(attr.value)) {
            el.removeAttribute(attr.name);
          }
        });
      });

      clean = doc.body.innerHTML;
    }
  } catch (e) {
    clean = clean.replace(/on\w+\s*=/gi, '');
  }

  return clean.substring(0, maxLength);
};

/**
 * Validates and formats Friend Code (Format: HUB-XXXX-XXXX)
 * @param {string} code - Input friend code
 * @returns {string} Clean uppercase friend code
 */
export const sanitizeFriendCode = (code) => {
  if (typeof code !== 'string') return 'HUB-';
  const clean = code.toUpperCase().replace(/[^A-Z0-9-]/g, '');
  return clean.substring(0, 15);
};

/**
 * Sanitizes filenames to prevent path traversal attacks (../ or ..\ or null bytes)
 * @param {string} filename - Raw filename
 * @returns {string} Safe filename
 */
export const sanitizeFilename = (filename) => {
  if (typeof filename !== 'string') return 'file';
  return filename
    .replace(/[\/\x00-\x1f\x7f]/g, '') // remove null bytes & slashes
    .replace(/\.\.+/g, '.') // prevent ../
    .trim();
};

/**
 * Validates money/amount inputs (allows digits, dots, commas, minus sign)
 * @param {string} amountStr - Raw amount string
 * @returns {string} Sanitized amount string
 */
export const sanitizeMoneyInput = (amountStr) => {
  if (typeof amountStr !== 'string') return '';
  return amountStr.replace(/[^0-9.,-]/g, '').substring(0, 20);
};

/**
 * securityUtils.js - Input Validation, XSS Prevention, Output Escaping & Sanitization Helpers
 * Ensures all user-supplied and remote data is safely rendered as plain text or safe formatted content without script execution.
 */

/**
 * Escapes special HTML characters to prevent XSS injection.
 * @param {string} str - Raw input string
 * @returns {string} Safe escaped string
 */
export const escapeHtml = (str) => {
  if (typeof str !== 'string') return str == null ? '' : String(str);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/`/g, '&#x60;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Strips dangerous HTML tags and event handlers, leaving pure plain text.
 * @param {string} input - Input text
 * @returns {string} Clean, plain text string
 */
export const sanitizeText = (input) => {
  if (typeof input !== 'string') return input == null ? '' : String(input);
  
  // 1. Remove script / style / iframe / object / embed / svg / math tags and their contents
  let clean = input.replace(/<(script|style|iframe|object|embed|applet|svg|math|template|noscript|canvas)[\s\S]*?<\/\1>/gi, '');
  
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
 * @param {number} maxLength - Maximum allowed character length (default: 150)
 * @returns {string} Clean, safe, trimmed single-line string
 */
export const sanitizeSingleLine = (input, maxLength = 150) => {
  if (typeof input !== 'string') return '';
  const clean = sanitizeText(input).replace(/[\r\n\t]+/g, ' ').trim();
  return clean.substring(0, maxLength);
};

/**
 * Sanitizes multi-line rich text block contents for Note Editor.
 * Preserves safe formatting tags (<b>, <i>, <u>, <s>, <ul>, <ol>, <li>, <p>, <div>, <br>, <span>, <font>)
 * while strictly stripping all executable tags, event handlers, and malicious URIs.
 * @param {string} content - Raw block content
 * @param {number} maxLength - Maximum allowed length (default: 50000)
 * @returns {string} Sanitized safe multi-line text
 */
export const sanitizeNoteContent = (content, maxLength = 50000) => {
  if (typeof content !== 'string') return '';
  if (!content) return '';
  
  // 1. Pre-filter dangerous executable tags and schemes
  let clean = content
    .replace(/<(script|style|iframe|object|embed|applet|meta|link|base|form|svg|math|template|portal|canvas|noscript)[\s\S]*?<\/\1>/gi, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/vbscript\s*:/gi, '')
    .replace(/data\s*:\s*text\/html/gi, '');

  // 2. Comprehensive DOMParser sanitization to strip inline handlers, malicious attributes, and disallowed tags
  try {
    if (typeof window !== 'undefined' && window.DOMParser) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(clean, 'text/html');

      // Disallowed dangerous elements
      const DANGEROUS_TAGS = [
        'script', 'style', 'iframe', 'object', 'embed', 'applet', 'link',
        'meta', 'base', 'form', 'input', 'button', 'svg', 'math', 'frame',
        'frameset', 'template', 'marquee', 'video', 'audio', 'source',
        'canvas', 'portal', 'keygen', 'textarea', 'select', 'option'
      ];
      
      DANGEROUS_TAGS.forEach((tag) => {
        const elements = doc.querySelectorAll(tag);
        elements.forEach((el) => el.remove());
      });

      // Disallowed attributes & event handlers
      const allElements = doc.body.querySelectorAll('*');
      allElements.forEach((el) => {
        Array.from(el.attributes).forEach((attr) => {
          const attrName = attr.name.toLowerCase();
          const attrVal = (attr.value || '').toLowerCase();

          // Strip any event handler (onerror, onload, onclick, onfocus, etc.)
          if (attrName.startsWith('on')) {
            el.removeAttribute(attr.name);
          }

          // Strip dangerous protocols in links or sources
          if (
            (attrName === 'href' || attrName === 'src' || attrName === 'action' || attrName === 'formaction' || attrName === 'xlink:href') &&
            /^(javascript|vbscript|data\s*:|blob\s*:)/i.test(attrVal)
          ) {
            el.removeAttribute(attr.name);
          }

          // Strip nested contenteditable to prevent hijacking
          if (attrName === 'contenteditable' || attrName === 'autofocus') {
            el.removeAttribute(attr.name);
          }

          // Strip dangerous style properties (expression, -moz-binding, behavior)
          if (attrName === 'style' && /(expression|behavior|-moz-binding)/i.test(attrVal)) {
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

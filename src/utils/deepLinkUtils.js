/**
 * Deep Link & Share URL Utilities
 */

export const parseDeepLinkUrl = (urlStr) => {
  if (!urlStr) return null;
  try {
    const url = new URL(urlStr);
    const params = new URLSearchParams(url.search);
    return {
      path: url.pathname,
      noteId: params.get('noteId') || params.get('n'),
      friendCode: params.get('friendCode') || params.get('fc'),
      action: params.get('action') || params.get('a'),
    };
  } catch (e) {
    return null;
  }
};

export const createShareNoteDeepLink = (noteId) => {
  return `${window.location.origin}/?noteId=${encodeURIComponent(noteId)}`;
};

export const createFriendCodeDeepLink = (friendCode) => {
  return `${window.location.origin}/?friendCode=${encodeURIComponent(friendCode)}`;
};

export default {
  parseDeepLinkUrl,
  createShareNoteDeepLink,
  createFriendCodeDeepLink,
};

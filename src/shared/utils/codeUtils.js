export const formatFriendCode = (value) => {
  if (!value) return 'HUB-';
  const upper = value.toUpperCase().trim();

  // If the user deleted down to partial prefix ('H', 'HU', 'HUB', 'HUB-'), return 'HUB-'
  if (['H', 'HU', 'HUB', 'HUB-'].includes(upper)) {
    return 'HUB-';
  }

  // Cleanly strip any leading HUB / HUB- prefixes (handles pasting HUB- into HUB-)
  let raw = upper.replace(/^(HUB-?)+/g, '').replace(/[^A-Z0-9]/g, '');
  const truncated = raw.substring(0, 8);

  let formatted = 'HUB-';
  if (truncated.length > 0) {
    formatted += truncated.substring(0, 4);
  }
  if (truncated.length > 4) {
    formatted += '-' + truncated.substring(4, 8);
  }
  return formatted;
};

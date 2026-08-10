export const formatFriendCode = (value) => {
  if (!value) return 'HUB-';
  let inputVal = value.toUpperCase();
  if (!inputVal.startsWith('HUB-')) {
    if (inputVal.startsWith('HUB')) {
      inputVal = 'HUB-' + inputVal.substring(3);
    } else {
      inputVal = 'HUB-' + inputVal;
    }
  }
  const clean = inputVal.substring(4).replace(/[^A-Z0-9-]/g, '');
  const parts = clean.split('-');
  const rawPart = parts.join('');
  const truncated = rawPart.substring(0, 8);

  let formatted = 'HUB-';
  if (truncated.length > 0) {
    formatted += truncated.substring(0, 4);
  }
  if (clean.endsWith('-') && truncated.length === 4) {
    formatted += '-';
  } else if (truncated.length > 4) {
    formatted += '-' + truncated.substring(4, 8);
  }
  return formatted;
};

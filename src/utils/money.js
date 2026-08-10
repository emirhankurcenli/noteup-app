export const formatTurkishMoneyInput = (rawStr) => {
  if (rawStr === undefined || rawStr === null) return '';
  let str = rawStr.toString();
  let parts = str.split(',');
  let integerPart = parts[0];
  let decimalPart = parts.slice(1).join('');
  integerPart = integerPart.replace(/\D/g, '');
  if (integerPart) {
    integerPart = parseInt(integerPart, 10).toLocaleString('tr-TR');
  } else {
    integerPart = str.startsWith(',') ? '0' : '';
  }
  if (str.includes(',')) {
    decimalPart = decimalPart.replace(/\D/g, '').substring(0, 2);
    return `${integerPart},${decimalPart}`;
  }
  return integerPart;
};

export const parseTurkishMoneyToFloat = (formattedStr) => {
  if (!formattedStr) return 0;
  let clean = formattedStr.toString().replace(/\./g, '').replace(/,/g, '.');
  let val = parseFloat(clean);
  return isNaN(val) ? 0 : val;
};

export const formatTurkishMoneyDisplay = (val) => {
  if (val === undefined || val === null || isNaN(val)) return '0';
  return Number(val).toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
};

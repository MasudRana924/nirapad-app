const BD_MOBILE = /^01[3-9]\d{8}$/;

/**
 * Normalize a Bangladeshi mobile to 01XXXXXXXXX.
 * Accepts 01712345678, +8801712345678, 8801712345678, or the local
 * part typed after a +880 prefix (1712345678).
 */
export const normalizeBdPhone = input => {
  let value = String(input ?? '').replace(/[\s-]/g, '');
  if (!value) {
    return '';
  }
  if (/^1[3-9]\d{8}$/.test(value)) {
    value = `+880${value}`;
  }
  if (value.startsWith('+88')) {
    value = value.slice(3);
  } else if (value.startsWith('88')) {
    value = value.slice(2);
  }
  return value;
};

export const isValidBdPhone = input => BD_MOBILE.test(normalizeBdPhone(input));

export const maskContact = (channel, value) => {
  if (channel === 'phone') {
    const phone = normalizeBdPhone(value);
    if (phone.length < 7) {
      return phone;
    }
    return `${phone.slice(0, 3)}****${phone.slice(-3)}`;
  }
  const email = String(value || '').trim();
  const at = email.indexOf('@');
  if (at <= 0) {
    return email;
  }
  return `${email.slice(0, 1)}***${email.slice(at)}`;
};

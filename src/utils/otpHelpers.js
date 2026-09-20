/**
 * OTP helpers for auth screens.
 * Production never shows or autofills a hardcoded OTP — users enter the email code.
 */

export const isEmailSent = payload => {
  const data =
    payload?.data && typeof payload.data === 'object' ? payload.data : payload;
  if (!data || typeof data !== 'object') {
    return true;
  }
  if (data.email_sent === false || data.emailSent === false) {
    return false;
  }
  return true;
};

/**
 * Dev-only hint when the API still echoes `otp` in the response.
 * Never hardcode values (e.g. 5852); never surface in production builds.
 */
export const getDevOtpHint = payload => {
  if (typeof __DEV__ === 'undefined' || !__DEV__) {
    return null;
  }
  const data =
    payload?.data && typeof payload.data === 'object' ? payload.data : payload;
  const otp = data?.otp ?? data?.otp_code ?? null;
  if (otp == null) {
    return null;
  }
  const value = String(otp).trim();
  return value || null;
};

export const EMAIL_NOT_SENT_MESSAGE =
  'We could not send the verification email. Please try again in a moment.';

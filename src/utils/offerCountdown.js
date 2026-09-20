/**
 * Informational countdown for caregiver offer acceptance.
 * Returns mm:ss or null when expired / invalid.
 */
export const getOfferRemainingMs = expiresAt => {
  if (!expiresAt) {
    return null;
  }
  const end = new Date(expiresAt).getTime();
  if (Number.isNaN(end)) {
    return null;
  }
  return end - Date.now();
};

export const formatOfferCountdown = expiresAt => {
  const remaining = getOfferRemainingMs(expiresAt);
  if (remaining == null || remaining <= 0) {
    return null;
  }
  const totalSec = Math.ceil(remaining / 1000);
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
};

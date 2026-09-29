/**
 * In-app booking alerts driven by push / notification data:
 * suggest-next-caregiver, emergency, not-started reason and book-again.
 * BookingAlertHost subscribes; the first event is kept until it mounts.
 */
export const BOOKING_ALERT = {
  SUGGEST_NEXT: 'SUGGEST_NEXT',
  EMERGENCY: 'EMERGENCY',
  NOT_STARTED_REASON: 'NOT_STARTED_REASON',
  BOOK_AGAIN: 'BOOK_AGAIN',
};

const listeners = new Set();
let pendingAlert = null;

export const onBookingAlert = listener => {
  listeners.add(listener);
  if (pendingAlert) {
    const alert = pendingAlert;
    pendingAlert = null;
    listener(alert);
  }
  return () => {
    listeners.delete(listener);
  };
};

export const emitBookingAlert = alert => {
  if (!alert) {
    return;
  }
  if (listeners.size === 0) {
    pendingAlert = alert;
    return;
  }
  listeners.forEach(listener => {
    try {
      listener(alert);
    } catch (error) {
      console.error('Booking alert listener failed:', error);
    }
  });
};

const isTrue = value => value === true || value === 'true';

const toNumber = value => {
  if (value == null || value === '') {
    return null;
  }
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const getBookingId = data =>
  data?.booking_id || data?.bookingId || data?.reference_id || null;

export const isSuggestNextCaregiverData = data =>
  data?.type === 'SUGGEST_NEXT_CAREGIVER' ||
  data?.action === 'CONFIRM_NEXT_CAREGIVER' ||
  data?.screen === 'suggest_next_caregiver';

export const isEmergencyData = data =>
  data?.type === 'SERVICE_NOT_STARTED_EMERGENCY' || isTrue(data?.is_emergency);

export const isBookAgainData = data =>
  data?.action === 'BOOK_AGAIN' ||
  (data?.type === 'BOOKING_CANCELLED' && data?.action === 'BOOK_AGAIN');

export const isNotStartedReasonData = data =>
  data?.type === 'SERVICE_NOT_STARTED_REASON';

/** Normalizes a caregiver from either push data or GET /bookings/:id. */
export const normalizeSuggestedCaregiver = source => {
  if (!source) {
    return null;
  }
  const caregiver = {
    id: source.id ?? source.suggested_caregiver_id ?? null,
    name: source.name ?? source.suggested_caregiver_name ?? '',
    photo:
      source.profile_photo ??
      source.photo ??
      source.suggested_caregiver_photo ??
      null,
    rating: toNumber(source.rating ?? source.suggested_caregiver_rating),
    hourlyRate: toNumber(
      source.hourly_rate ?? source.suggested_caregiver_hourly_rate,
    ),
    experienceYears: toNumber(source.experience_years),
    district: source.district ?? source.suggested_caregiver_district ?? '',
    thana: source.thana ?? source.suggested_caregiver_thana ?? '',
  };
  return caregiver.id || caregiver.name ? caregiver : null;
};

export const suggestAlertFromBooking = booking => {
  const caregiver = normalizeSuggestedCaregiver(booking?.suggested_caregiver);
  if (!booking?.id) {
    return null;
  }
  return {
    kind: BOOKING_ALERT.SUGGEST_NEXT,
    bookingId: booking.id,
    caregiver,
    expiresAt: booking.suggestion_expires_at || null,
  };
};

/**
 * Converts push / notification data into an alert, or null if the
 * notification should just follow the normal navigation.
 */
export const bookingAlertFromData = (data, {title, body} = {}) => {
  if (!data || typeof data !== 'object') {
    return null;
  }
  const bookingId = getBookingId(data);
  const message = body || data.body || data.message || '';

  if (isSuggestNextCaregiverData(data)) {
    return {
      kind: BOOKING_ALERT.SUGGEST_NEXT,
      bookingId,
      caregiver: normalizeSuggestedCaregiver(data),
      expiresAt: data.suggestion_expires_at || null,
      message,
    };
  }
  if (isEmergencyData(data)) {
    return {
      kind: BOOKING_ALERT.EMERGENCY,
      bookingId,
      title: title || data.title || '',
      reason: data.reason || message,
    };
  }
  if (isNotStartedReasonData(data)) {
    return {
      kind: BOOKING_ALERT.NOT_STARTED_REASON,
      bookingId,
      title: title || data.title || '',
      reason: data.reason || message,
    };
  }
  if (isBookAgainData(data)) {
    return {
      kind: BOOKING_ALERT.BOOK_AGAIN,
      bookingId,
      message,
    };
  }
  return null;
};

/**
 * For taps (push, banner, inbox): open the booking and show the alert on top.
 * Returns true when the data was handled as a booking alert.
 */
export const routeBookingAlertTap = (data, navigation, content = {}) => {
  const alert = bookingAlertFromData(data, content);
  if (!alert) {
    return false;
  }
  if (navigation && alert.bookingId) {
    navigation.navigate('BookingDetails', {
      bookingId: alert.bookingId,
      notificationOpenedAt: Date.now(),
    });
  }
  emitBookingAlert(alert);
  return true;
};

/** Foreground push: show the alert without leaving the current screen. */
export const showBookingAlertFromPush = (data, content = {}) => {
  const alert = bookingAlertFromData(data, content);
  if (!alert) {
    return false;
  }
  emitBookingAlert(alert);
  return true;
};

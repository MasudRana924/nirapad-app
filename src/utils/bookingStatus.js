export const BOOKING_STATUS = {
  SEARCHING_PROVIDER: 'SEARCHING_PROVIDER',
  PROVIDER_ASSIGNED: 'PROVIDER_ASSIGNED',
  PROVIDER_ACCEPTED: 'PROVIDER_ACCEPTED',
  PAYMENT_PAID: 'PAYMENT_PAID',
  SERVICE_IN_PROGRESS: 'SERVICE_IN_PROGRESS',
  SERVICE_COMPLETED: 'SERVICE_COMPLETED',
  CANCELLED_BY_USER: 'CANCELLED_BY_USER',
  CANCELLED_BY_ADMIN: 'CANCELLED_BY_ADMIN',
};

const COMPLETED = [
  BOOKING_STATUS.SERVICE_COMPLETED,
  'COMPLETED',
];

const CANCELLED = [
  BOOKING_STATUS.CANCELLED_BY_USER,
  BOOKING_STATUS.CANCELLED_BY_ADMIN,
  'CANCELLED',
];

export const isCompletedStatus = status => COMPLETED.includes(status);

export const isCancelledStatus = status => CANCELLED.includes(status);

export const isSearchingStatus = status =>
  status === BOOKING_STATUS.SEARCHING_PROVIDER;

export const isWaitingForAcceptStatus = status =>
  status === BOOKING_STATUS.PROVIDER_ASSIGNED;

/** Poll while offer is pending or backend is finding another caregiver. */
export const shouldPollBookingStatus = status =>
  isSearchingStatus(status) || isWaitingForAcceptStatus(status);

export const isClosedStatus = status =>
  isCompletedStatus(status) || isCancelledStatus(status);

export const isActiveStatus = status => !isClosedStatus(status);

export const isPaidStatus = (booking = {}) =>
  booking.status === BOOKING_STATUS.PAYMENT_PAID ||
  booking.payment_status === 'PAID' ||
  booking.payment_status === BOOKING_STATUS.PAYMENT_PAID;

export const normalizeBooking = payload => {
  if (!payload) {
    return null;
  }
  const raw = payload.data !== undefined ? payload.data : payload;
  const base = raw?.booking || raw;
  if (!base || typeof base !== 'object') {
    return null;
  }

  return {
    ...base,
    can_pay: raw.can_pay ?? base.can_pay,
    pay_amount: raw.pay_amount ?? base.pay_amount,
    can_review: raw.can_review ?? base.can_review,
    can_cancel: raw.can_cancel ?? base.can_cancel,
    can_dispute: raw.can_dispute ?? base.can_dispute,
    cancellation_policy:
      raw.cancellation_policy ?? base.cancellation_policy ?? null,
    review: raw.review !== undefined ? raw.review : base.review,
    status: raw.status ?? base.status,
    refund: raw.refund ?? base.refund,
  };
};

export const getStatusMeta = status => {
  switch (status) {
    case BOOKING_STATUS.SEARCHING_PROVIDER:
      return {
        label: 'Finding another caregiver…',
        icon: 'search',
        color: '#D97706',
        bg: '#FEF3C7',
      };
    case BOOKING_STATUS.PROVIDER_ASSIGNED:
      return {
        label: 'Waiting for caregiver',
        icon: 'time',
        color: '#7C3AED',
        bg: '#EEE8FB',
      };
    case BOOKING_STATUS.PROVIDER_ACCEPTED:
      return {
        label: 'Accepted',
        icon: 'checkmark-done',
        color: '#008178',
        bg: '#E6F4F3',
      };
    case BOOKING_STATUS.PAYMENT_PAID:
    case 'CONFIRMED':
      return {
        label: 'Paid',
        icon: 'card',
        color: '#008178',
        bg: '#E6F4F3',
      };
    case BOOKING_STATUS.SERVICE_IN_PROGRESS:
    case 'IN_PROGRESS':
      return {
        label: 'In Progress',
        icon: 'play-circle',
        color: '#2563EB',
        bg: '#E8F1FB',
      };
    case BOOKING_STATUS.SERVICE_COMPLETED:
    case 'COMPLETED':
      return {
        label: 'Completed',
        icon: 'checkmark-circle',
        color: '#0F8A7A',
        bg: '#E7F6F1',
      };
    case BOOKING_STATUS.CANCELLED_BY_USER:
    case BOOKING_STATUS.CANCELLED_BY_ADMIN:
    case 'CANCELLED':
      return {
        label: 'Cancelled',
        icon: 'close-circle',
        color: '#DC2626',
        bg: '#FEECEC',
      };
    default:
      return {
        label: (status || 'Pending').replace(/_/g, ' '),
        icon: 'time',
        color: '#D97706',
        bg: '#FEF3C7',
      };
  }
};

export const formatRefund = refund => {
  if (refund == null) {
    return null;
  }
  if (typeof refund === 'number' || typeof refund === 'string') {
    return `৳${refund}`;
  }
  const amount =
    refund.amount ?? refund.refundAmount ?? refund.refund_amount ?? null;
  const percent =
    refund.percent ?? refund.refundPercent ?? refund.refund_percent ?? null;
  if (amount != null && percent != null) {
    return `৳${amount} (${percent}%)`;
  }
  if (amount != null) {
    return `৳${amount}`;
  }
  if (percent != null) {
    return `${percent}%`;
  }
  return null;
};

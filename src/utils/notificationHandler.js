import notificationService from '../services/notificationService';

const getBookingId = data =>
  data?.booking_id || data?.bookingId || data?.reference_id || null;

const getInboxId = data => data?.inbox_id || data?.inboxId || data?.id || null;

const getType = data => data?.type || data?.action;

/**
 * Handle notification click and navigate to appropriate screen
 * @param {Object} data - Notification data
 * @param {Object} navigation - Navigation object
 */
export const handleNotificationClick = (data, navigation) => {
  console.log('Notification data:', data);

  const bookingId = getBookingId(data);
  const inboxId = getInboxId(data);
  const type = getType(data);

  if (data?.showPaymentButton === 'true') {
    navigation.navigate('PaymentScreen', {
      bookingId,
      amount: data.amount,
      bookingNumber: data.booking_number || data.bookingNumber,
    });
    return;
  }

  if (data?.showReviewButton === 'true') {
    navigation.navigate('ReviewScreen', {bookingId});
    return;
  }

  switch (type) {
    case 'BOOKING_CREATED':
    case 'BOOKING_ACCEPTED':
    case 'BOOKING_REJECTED':
    case 'BOOKING_CANCELLED':
    case 'SERVICE_STARTED':
    case 'SERVICE_COMPLETED':
      if (bookingId) {
        navigation.navigate('BookingDetails', {bookingId, inboxId});
      } else {
        navigation.navigate('Inbox', {inboxId});
      }
      break;

    case 'PAYMENT_SUCCESS':
      navigation.navigate('PaymentHistory');
      break;

    case 'FAMILY_MEMBER_ADDED':
    case 'FAMILY_MEMBER_UPDATED':
      navigation.navigate('FamilyMembers');
      break;

    default:
      if (bookingId) {
        navigation.navigate('BookingDetails', {bookingId, inboxId});
      } else {
        navigation.navigate('Inbox', {inboxId});
      }
  }
};

/**
 * Handle foreground notification
 * @param {Object} remoteMessage - Remote message from FCM
 * @param {Object} navigation - Navigation object
 */
export const handleForegroundNotification = (remoteMessage, navigation) => {
  const notification = remoteMessage.notification || {};
  const data = parseNotificationData(
    remoteMessage.data || notification.data,
  );

  notificationService.handleNotification(
    {
      notification,
      data,
    },
    navigation,
  );
};

/**
 * Parse notification data from string or object
 * @param {string|Object} data - Notification data
 * @returns {Object} Parsed data
 */
export const parseNotificationData = data => {
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch (error) {
      console.error('Error parsing notification data:', error);
      return {};
    }
  }
  return data || {};
};

export const resolveInboxBookingId = item => {
  const nested = parseNotificationData(item?.data);
  return (
    nested.booking_id ||
    nested.bookingId ||
    item?.reference_id ||
    item?.booking_id ||
    null
  );
};

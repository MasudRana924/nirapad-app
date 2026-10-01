import {useBookings} from '../../api/queries';
import {useBookingChatSocket} from '../../services/bookingChat';
import {BOOKING_STATUS} from '../../utils/bookingStatus';

const isTrue = value => value === true || value === 'true';

/**
 * Keeps the shared socket connected in the foreground while any of the
 * user's bookings has an active caregiver chat, so chat:message events
 * update badges even outside Booking Details. Reads the cached list only.
 */
const BookingChatHost = () => {
  const {data} = useBookings({page: 1, limit: 20}, {enabled: false});
  const bookings = Array.isArray(data?.data) ? data.data : [];
  const hasActiveChat = bookings.some(
    item =>
      isTrue(item?.can_chat) &&
      item?.status === BOOKING_STATUS.SERVICE_IN_PROGRESS,
  );

  useBookingChatSocket(hasActiveChat);
  return null;
};

export default BookingChatHost;

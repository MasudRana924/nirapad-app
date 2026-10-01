/**
 * Booking chat pushes (user <-> caregiver during service).
 * Not stored in the inbox and separate from SUPPORT_MESSAGE.
 */
export const isBookingChatPush = data => {
  if (!data || typeof data !== 'object') {
    return false;
  }
  return (
    data.type === 'BOOKING_CHAT_MESSAGE' ||
    data.action === 'OPEN_BOOKING_CHAT' ||
    data.screen === 'booking_chat'
  );
};

export const openBookingChatFromPush = (data, navigation) => {
  const bookingId = data?.booking_id || data?.bookingId;
  if (!navigation || !bookingId) {
    return false;
  }
  navigation.navigate('BookingDetails', {
    bookingId,
    openChat: true,
    notificationOpenedAt: Date.now(),
  });
  return true;
};

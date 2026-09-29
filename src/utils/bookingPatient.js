export const SELF_MEMBER_ID = '__self__';

export const isSelfMember = member =>
  !!member && (member.isSelf === true || member.id === SELF_MEMBER_ID);

export const isSelfBooking = booking =>
  booking?.book_for === 'SELF' || booking?.patient?.source === 'SELF';

export const isMissingProfileNameError = error => {
  const message = String(error?.message || error?.data?.message || '');
  return /name/i.test(message) && /profile/i.test(message);
};

export const getBookingPatient = booking => {
  if (!booking) {
    return null;
  }
  const patient = booking.patient || {};
  const isSelf = isSelfBooking(booking);

  return {
    isSelf,
    name:
      patient.name ||
      booking.family_member_name ||
      booking.family_member?.name ||
      '',
    relationship:
      patient.relationship ||
      booking.family_member_relationship ||
      booking.family_member?.relationship ||
      '',
    photo: isSelf ? null : booking.family_member?.photo || null,
    bloodGroup: isSelf ? '' : booking.family_member?.blood_group || '',
    house: patient.house || booking.family_member_house || '',
    thana: patient.thana || booking.family_member_thana || '',
    district: patient.district || booking.family_member_district || '',
  };
};

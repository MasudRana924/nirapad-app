import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {useBookingDetails} from '../api/queries';
import {useCancelBooking, useSubmitBookingReview} from '../api/mutations';
import {paymentService} from '../api/services';
import Header from '../components/common/Header';
import BookingDetailsSkeleton from '../components/home/BookingDetailsSkeleton';
import Loader from '../components/common/Loader';
import ErrorModal from '../components/common/ErrorModal';
import StarReviewModal from '../components/common/StarReviewModal';
import SuccessModal from '../components/common/SuccessModal';

const COMPLETED_STATUSES = ['SERVICE_COMPLETED', 'COMPLETED'];
const CLOSED_STATUSES = ['CANCELLED', ...COMPLETED_STATUSES];

const shouldShowStarModal = booking => {
  if (!booking) {
    return false;
  }
  const canReview =
    booking.can_review === true || booking.can_review === 'true';
  return (
    booking.status === 'SERVICE_COMPLETED' &&
    canReview &&
    booking.review == null
  );
};

const STATUS_STYLES = {
  PENDING_PAYMENT: {bg: '#FFF4E5', text: '#D97706'},
  PROVIDER_ASSIGNED: {bg: '#E6F4F3', text: '#008178'},
  CONFIRMED: {bg: '#E6F4F3', text: '#008178'},
  IN_PROGRESS: {bg: '#E6F4F3', text: '#008178'},
  SERVICE_IN_PROGRESS: {bg: '#E6F4F3', text: '#008178'},
  COMPLETED: {bg: '#E6F4F3', text: '#008178'},
  SERVICE_COMPLETED: {bg: '#E6F4F3', text: '#008178'},
  CANCELLED: {bg: '#FEECEC', text: '#DC2626'},
};

const BookingDetailsScreen = ({navigation, route}) => {
  const {bookingId, notificationOpenedAt} = route.params || {};
  const {data: bookingData, isLoading, refetch} = useBookingDetails(bookingId, {
    refetchOnMount: 'always',
  });
  const cancelBooking = useCancelBooking();
  const submitReview = useSubmitBookingReview();
  const rawData = bookingData?.data;
  const bookingBase = rawData?.booking || rawData;
  const booking = bookingBase
    ? {
        ...bookingBase,
        can_review: rawData?.can_review ?? bookingBase.can_review,
        review:
          rawData?.review !== undefined ? rawData.review : bookingBase.review,
        status: rawData?.status ?? bookingBase.status,
      }
    : bookingBase;
  const [payLoading, setPayLoading] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [starModalVisible, setStarModalVisible] = useState(false);
  const [reviewDismissed, setReviewDismissed] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  console.log('BookingDetails payment_status:', booking?.payment_status, 'status:', booking?.status);

  useEffect(() => {
    setReviewDismissed(false);
    setStarModalVisible(false);
    if (bookingId) {
      refetch();
    }
  }, [bookingId, notificationOpenedAt, refetch]);

  useEffect(() => {
    if (reviewDismissed || isLoading || !booking) {
      return;
    }
    if (shouldShowStarModal(booking)) {
      setStarModalVisible(true);
    } else {
      setStarModalVisible(false);
    }
  }, [
    booking?.id,
    booking?.status,
    booking?.can_review,
    booking?.review,
    isLoading,
    reviewDismissed,
  ]);

  const closeStarModal = () => {
    setStarModalVisible(false);
    setReviewDismissed(true);
  };

  const handleSubmitReview = async rating => {
    if (!bookingId || rating < 1 || rating > 5) {
      return;
    }
    try {
      await submitReview.mutateAsync({id: bookingId, rating});
      closeStarModal();
      setSuccessModalVisible(true);
    } catch (error) {
      setErrorMessage(error?.message || 'Failed to submit review. Please try again.');
      setErrorModalVisible(true);
    }
  };

  const handlePayNow = async () => {
    if (!bookingId || payLoading) return;
    setPayLoading(true);
    try {
      const response = await paymentService.createBkashPayment(bookingId);
      const data = response?.data || response || {};
      const createdPaymentID = data.paymentID || data.paymentId;
      const amount = String(data.amount ?? '');
      if (createdPaymentID) {
        navigation.navigate('BkashCheckout', {
          bookingId,
          paymentID: createdPaymentID,
          amount,
        });
      } else {
        setErrorMessage(response?.message || 'Payment creation failed. Please try again.');
        setErrorModalVisible(true);
      }
    } catch (error) {
      setErrorMessage(error?.message || 'Payment failed. Please try again.');
      setErrorModalVisible(true);
    } finally {
      setPayLoading(false);
    }
  };

  const formatDate = dateString => {
    if (!dateString) return '--';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '--';
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch (error) {
      return '--';
    }
  };

  const formatTime = timeString => {
    if (!timeString) return '--';
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    } catch (error) {
      return '--';
    }
  };

  const statusStyle =
    STATUS_STYLES[booking?.status] || {bg: '#F0F2F5', text: '#8190A7'};
  const statusLabel = (booking?.status || '').replace(/_/g, ' ');
  const showPayButton = booking?.payment_status === 'PENDING';
  const isPaid = booking?.payment_status === 'PAID';
  const canCancel =
    booking?.status &&
    !CLOSED_STATUSES.includes(booking.status) &&
    !isPaid;
  const canLeaveReview = shouldShowStarModal(booking);

  const familyName =
    booking?.family_member_name || booking?.family_member?.name;
  const familyMeta = [
    booking?.family_member?.relationship,
    booking?.family_member?.blood_group,
  ]
    .filter(Boolean)
    .join(' · ');
  const familyAddress = [
    booking?.family_member_house,
    booking?.family_member_thana,
    booking?.family_member_district,
  ]
    .filter(Boolean)
    .join(', ');
  const caregiverName =
    booking?.caregiver_name || booking?.caregiver?.name;
  const hospitalName =
    booking?.hospital_name || booking?.hospital?.name;

  const handleCancel = () => {
    Alert.alert('Cancel booking', 'Do you want to cancel this booking?', [
      {text: 'Keep', style: 'cancel'},
      {
        text: 'Cancel booking',
        style: 'destructive',
        onPress: async () => {
          try {
            await cancelBooking.mutateAsync({
              id: bookingId,
              reason: 'Plans changed',
            });
            Alert.alert('Cancelled', 'Booking cancelled successfully');
          } catch (error) {
            Alert.alert(
              'Error',
              error?.message || 'Failed to cancel booking',
            );
          }
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
        <Header title="Booking details" onBack={() => navigation.navigate('Main', {screen: 'Bookings'})} />
        <BookingDetailsSkeleton />
      </SafeAreaView>
    );
  }

  if (!booking) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
        <Header title="Booking details" onBack={() => navigation.navigate('Main', {screen: 'Bookings'})} />
        <View style={styles.errorContainer}>
          <View style={styles.errorIcon}>
            <Icon name="alert-circle-outline" size={32} color="#008178" />
          </View>
          <Text style={styles.errorTitle}>Booking not found</Text>
          <Text style={styles.errorText}>
            This booking may have been removed or is unavailable
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const infoRows = [
    {label: 'Booking number', value: booking.booking_number},
    {label: 'Date', value: formatDate(booking.booking_date)},
    {
      label: 'Time',
      value: `${formatTime(booking.start_time)} – ${formatTime(booking.end_time)}`,
    },
    {label: 'Duration', value: `${booking.duration_hours} hours`},
    {
      label: 'Service',
      value: (booking.service_type || '').replace(/_/g, ' '),
    },
    {
      label: 'Payment',
      value: (booking.payment_status || '').replace(/_/g, ' '),
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <Loader visible={cancelBooking.isPending || payLoading} />
      <ErrorModal
        visible={errorModalVisible}
        message={errorMessage}
        onOk={() => setErrorModalVisible(false)}
      />
      <StarReviewModal
        visible={starModalVisible}
        bookingNumber={booking.booking_number}
        caregiverName={caregiverName}
        submitting={submitReview.isPending}
        onSubmit={handleSubmitReview}
        onClose={closeStarModal}
      />
      <SuccessModal
        visible={successModalVisible}
        title="Thank You!"
        message="Your rating has been submitted successfully. We appreciate your feedback!"
        onClose={() => setSuccessModalVisible(false)}
      />
      <Header title="Booking details" onBack={() => navigation.navigate('Main', {screen: 'Bookings'})} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* ── Card 1: Amount & Booking Details ── */}
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={styles.heroLeft}>
              <Text style={styles.heroLabel}>Total amount</Text>
              <Text style={styles.heroAmount}>৳{booking.total_amount}</Text>
            </View>
          </View>

          <View style={styles.heroDivider} />

          {infoRows.map((row, index) => (
            <View
              key={row.label}
              style={[
                styles.infoRow,
                index === infoRows.length - 1 && styles.infoRowLast,
              ]}>
              <Text style={styles.infoLabel}>{row.label}</Text>
              <Text style={styles.infoValue} numberOfLines={1}>
                {row.value || '--'}
              </Text>
            </View>
          ))}
        </View>

        {/* ── Card 2: Patient, Caregiver, Hospital, Patient Details, Notes ── */}
        {(!!familyName || !!caregiverName || !!hospitalName || !!booking.patient_requirements || !!booking.notes) && (
          <View style={styles.card}>
            {!!familyName && (
              <>
                <Text style={styles.sectionTitle}>Patient</Text>
                <View style={styles.personRow}>
                  {booking.family_member?.photo ? (
                    <Image
                      source={{uri: booking.family_member.photo}}
                      style={styles.avatar}
                    />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Icon name="person" size={18} color="#008178" />
                    </View>
                  )}
                  <View style={styles.personInfo}>
                    <Text style={styles.personName}>{familyName}</Text>
                    {!!familyMeta && (
                      <Text style={styles.personMeta}>{familyMeta}</Text>
                    )}
                    {!!familyAddress && (
                      <Text style={styles.personMeta}>{familyAddress}</Text>
                    )}
                  </View>
                </View>
              </>
            )}

            {!!caregiverName && (
              <>
                {!!familyName && <View style={styles.sectionDivider} />}
                <Text style={styles.sectionTitle}>Caregiver</Text>
                <View style={styles.personRow}>
                  {booking.caregiver?.profile_photo ? (
                    <Image
                      source={{uri: booking.caregiver.profile_photo}}
                      style={styles.avatar}
                    />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Icon name="medkit" size={18} color="#008178" />
                    </View>
                  )}
                  <View style={styles.personInfo}>
                    <Text style={styles.personName}>{caregiverName}</Text>
                    <View style={styles.metaRow}>
                      {!!booking.caregiver?.rating && (
                        <View style={styles.metaChip}>
                          <Icon name="star" size={11} color="#F6A900" />
                          <Text style={styles.metaChipText}>
                            {booking.caregiver.rating}
                          </Text>
                        </View>
                      )}
                      {!!booking.caregiver?.experience_years && (
                        <Text style={styles.personMeta}>
                          {booking.caregiver.experience_years} yrs exp
                        </Text>
                      )}
                    </View>
                    {!!booking.caregiver?.education && (
                      <Text style={styles.personMeta} numberOfLines={1}>
                        {booking.caregiver.education}
                      </Text>
                    )}
                  </View>
                </View>
                {!!booking.caregiver?.bio && (
                  <Text style={styles.bodyText}>{booking.caregiver.bio}</Text>
                )}
              </>
            )}

            {!!hospitalName && (
              <>
                {(!!familyName || !!caregiverName) && <View style={styles.sectionDivider} />}
                <Text style={styles.sectionTitle}>Hospital</Text>
                <View style={styles.personRow}>
                  {booking.hospital?.photo ? (
                    <Image
                      source={{uri: booking.hospital.photo}}
                      style={styles.avatar}
                    />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Icon name="business" size={18} color="#008178" />
                    </View>
                  )}
                  <View style={styles.personInfo}>
                    <Text style={styles.personName}>{hospitalName}</Text>
                    {!!booking.hospital?.address && (
                      <Text style={styles.personMeta} numberOfLines={2}>
                        {booking.hospital.address}
                      </Text>
                    )}
                    {!!booking.hospital?.phone && (
                      <Text style={styles.personMeta}>{booking.hospital.phone}</Text>
                    )}
                  </View>
                </View>
              </>
            )}

            {!!booking.patient_requirements && (
              <>
                {(!!familyName || !!caregiverName || !!hospitalName) && <View style={styles.sectionDivider} />}
                <Text style={styles.sectionTitle}>Patient details</Text>
                <Text style={styles.bodyText}>{booking.patient_requirements}</Text>
              </>
            )}

            {!!booking.notes && (
              <>
                {(!!familyName || !!caregiverName || !!hospitalName || !!booking.patient_requirements) && <View style={styles.sectionDivider} />}
                <Text style={styles.sectionTitle}>Notes</Text>
                <Text style={styles.bodyText}>{booking.notes}</Text>
              </>
            )}
          </View>
        )}

        {Array.isArray(booking.history) && booking.history.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>History</Text>
            {booking.history.map((item, index) => (
              <Text key={`${item.new_status}-${index}`} style={styles.bodyText}>
                {(item.old_status || '—').replace(/_/g, ' ')} →{' '}
                {(item.new_status || '—').replace(/_/g, ' ')}
                {item.note ? ` · ${item.note}` : ''}
              </Text>
            ))}
          </View>
        )}
      </ScrollView>

      {isPaid && booking?.status && !CLOSED_STATUSES.includes(booking.status) && (
        <View style={styles.supportNote}>
          <Icon name="information-circle-outline" size={18} color="#008178" />
          <Text style={styles.supportNoteText}>
            If you want to cancel this booking, please contact our support team.
          </Text>
        </View>
      )}

      {(showPayButton || canCancel || canLeaveReview) && (
        <View style={styles.bottomContainer}>
          {canCancel && (
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.actionButton, styles.cancelButton]}
              onPress={handleCancel}>
              <Text style={[styles.payButtonText, styles.cancelButtonText]}>
                Cancel
              </Text>
            </TouchableOpacity>
          )}
          {showPayButton && (
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.actionButton, styles.payButton]}
              onPress={handlePayNow}>
              <Text style={styles.payButtonText}>Pay now</Text>
            </TouchableOpacity>
          )}
          {canLeaveReview && (
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.actionButton, styles.payButton]}
              onPress={() => {
                setReviewDismissed(false);
                setStarModalVisible(true);
              }}>
              <Text style={styles.payButtonText}>Rate service</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

export default BookingDetailsScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  errorIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E6F4F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111820',
    marginBottom: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#8190A7',
    textAlign: 'center',
    lineHeight: 18,
  },
  heroCard: {
    backgroundColor: '#F6F6F6',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  heroLeft: {
    flex: 1,
    paddingRight: 12,
  },
  heroLabel: {
    fontSize: 11,
    color: '#8190A7',
    marginBottom: 2,
  },
  heroAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111820',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  heroDivider: {
    height: 1,
    backgroundColor: '#EAEAEA',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
    gap: 10,
  },
  infoRowLast: {
    paddingBottom: 0,
  },
  infoLabel: {
    fontSize: 12,
    color: '#8190A7',
  },
  infoValue: {
    flex: 1,
    textAlign: 'right',
    fontSize: 12,
    fontWeight: '600',
    color: '#111820',
    textTransform: 'capitalize',
  },
  card: {
    backgroundColor: '#F6F6F6',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111820',
    marginBottom: 8,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
  },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 10,
  },
  avatarPlaceholder: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E6F4F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  personInfo: {
    flex: 1,
    minWidth: 0,
  },
  personName: {
    fontSize: 13,
    fontWeight: '400',
    color: '#111820',
    marginBottom: 2,
  },
  personMeta: {
    fontSize: 11,
    color: '#8190A7',
    lineHeight: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 1,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#111820',
  },
  bodyText: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 18,
    color: '#4A5568',
  },
  bottomContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
   
    backgroundColor: '#FFFFFF',
  },
  actionButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payButton: {
    backgroundColor: '#008178',
  },
  payButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DC2626',
  },
  cancelButtonText: {
    color: '#DC2626',
  },
  supportNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F4F3',
    marginHorizontal: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
    marginBottom: 10,
  },
  supportNoteText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    color: '#008178',
    fontWeight: '500',
  },
});


import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {useBookingDetails, useBookingDisputes} from '../api/queries';
import {
  useCancelBooking,
  useSubmitBookingReview,
  useCreateDispute,
} from '../api/mutations';
import {paymentService} from '../api/services';
import {API_CODES, createUuid, getApiErrorMessage} from '../api/client';
import Header from '../components/common/Header';
import BookingDetailsSkeleton from '../components/home/BookingDetailsSkeleton';
import CustomLoader from '../components/common/CustomLoader';
import StarReviewModal from '../components/common/StarReviewModal';
import CancelBookingSheet from '../components/common/CancelBookingSheet';
import DisputeSheet from '../components/common/DisputeSheet';
import LiveTrackingMapSection from '../components/booking/LiveTrackingMapSection';
import BookingHeroIllustration from '../components/booking/BookingHeroIllustration';
import {useAppModal} from '../contexts/ModalContext';
import {useTranslation} from 'react-i18next';
import {
  getStatusMeta,
  isSearchingStatus,
  isWaitingForAcceptStatus,
  shouldPollBookingStatus,
  normalizeBooking,
  formatRefund,
  canShowLiveTracking,
} from '../utils/bookingStatus';
import {formatOfferCountdown} from '../utils/offerCountdown';
import {getBookingPatient} from '../utils/bookingPatient';

const isTrue = value => value === true || value === 'true';

const shouldShowStarModal = booking => {
  if (!booking) {
    return false;
  }
  return isTrue(booking.can_review) && booking.review == null;
};

const BookingDetailsScreen = ({navigation, route}) => {
  const {t} = useTranslation();
  const {bookingId, notificationOpenedAt} = route.params || {};
  const [countdownTick, setCountdownTick] = useState(0);
  const cancelBooking = useCancelBooking();
  const submitReview = useSubmitBookingReview();
  const createDispute = useCreateDispute();
  const [payLoading, setPayLoading] = useState(false);
  const {showModal} = useAppModal();
  const [starModalVisible, setStarModalVisible] = useState(false);
  const [reviewDismissed, setReviewDismissed] = useState(false);
  const [cancelVisible, setCancelVisible] = useState(false);
  const [disputeVisible, setDisputeVisible] = useState(false);
  const paymentKeyRef = useRef(createUuid());
  const statusForPollRef = useRef(null);

  const {data: bookingData, isLoading, refetch} = useBookingDetails(bookingId, {
    refetchOnMount: 'always',
    refetchInterval: () =>
      shouldPollBookingStatus(statusForPollRef.current) ? 15000 : false,
  });
  const booking = normalizeBooking(bookingData);
  statusForPollRef.current = booking?.status;

  const {data: disputesData, refetch: refetchDisputes} = useBookingDisputes(
    bookingId,
    {enabled: !!bookingId, retry: false},
  );
  const disputes = Array.isArray(disputesData?.data) ? disputesData.data : [];

  useEffect(() => {
    setReviewDismissed(false);
    setStarModalVisible(false);
    if (bookingId) {
      refetch();
    }
  }, [bookingId, notificationOpenedAt, refetch]);

  useEffect(() => {
    if (!isWaitingForAcceptStatus(booking?.status) || !booking?.offer_expires_at) {
      return undefined;
    }
    const timer = setInterval(() => {
      setCountdownTick(tick => tick + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [booking?.status, booking?.offer_expires_at]);

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

  const handleSubmitReview = async (rating, comment) => {
    if (!bookingId || rating < 1 || rating > 5) {
      return;
    }
    try {
      await submitReview.mutateAsync({id: bookingId, rating, comment});
      closeStarModal();
      showModal({type: 'success', title: 'Thank You!', message: 'Your rating has been submitted successfully. We appreciate your feedback!'});
    } catch (error) {
      showModal({type: 'error', title: 'Error', message: getApiErrorMessage(error, 'Failed to submit review. Please try again.')});
    }
  };

  const handlePayNow = async () => {
    if (!bookingId || payLoading) return;
    setPayLoading(true);
    try {
      const response = await paymentService.createBkashPayment(bookingId, {
        idempotencyKey: paymentKeyRef.current,
      });
      const data = response?.data || {};
      const createdPaymentID = data.paymentID || data.paymentId;
      const amount = String(data.amount ?? booking?.pay_amount ?? '');
      if (createdPaymentID) {
        navigation.navigate('BkashCheckout', {
          bookingId,
          paymentID: createdPaymentID,
          amount,
        });
      } else {
        showModal({type: 'error', title: 'Error', message: response?.message || 'Payment creation failed. Please try again.'});
      }
    } catch (error) {
      const message =
        error?.code === API_CODES.PAYMENT_FAILED
          ? getApiErrorMessage(error, 'Payment failed. Please try again.')
          : getApiErrorMessage(error, 'Payment failed. Please try again.');
      showModal({type: 'error', title: 'Error', message});
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

  const statusMeta = getStatusMeta(booking?.status);
  const showPayButton =
    isTrue(booking?.can_pay) ||
    (booking?.can_pay == null && booking?.payment_status === 'PENDING');
  const canCancel =
    isTrue(booking?.can_cancel) ||
    (booking?.can_cancel == null &&
      booking?.status &&
      booking.status !== 'SERVICE_COMPLETED' &&
      booking.status !== 'SERVICE_IN_PROGRESS' &&
      booking.status !== 'CANCELLED_BY_USER' &&
      booking.status !== 'CANCELLED_BY_ADMIN' &&
      booking.status !== 'CANCELLED');
  const canLeaveReview = shouldShowStarModal(booking);
  const canDispute = isTrue(booking?.can_dispute);
  const showLiveTracking = canShowLiveTracking(booking);
  const searching = isSearchingStatus(booking?.status);
  const waitingForAccept = isWaitingForAcceptStatus(booking?.status);
  // countdownTick forces a re-render every second so the label stays live
  const offerCountdownLabel =
    waitingForAccept && booking?.offer_expires_at && countdownTick >= 0
      ? formatOfferCountdown(booking.offer_expires_at)
      : null;

  const patient = getBookingPatient(booking);
  const patientIsSelf = !!patient?.isSelf;
  const familyName = patientIsSelf ? t('myself', 'Myself') : patient?.name;
  const familyMeta = patientIsSelf
    ? patient?.name || ''
    : [patient?.relationship, patient?.bloodGroup].filter(Boolean).join(' · ');
  const familyAddress = [patient?.house, patient?.thana, patient?.district]
    .filter(Boolean)
    .join(', ');
  const caregiverName =
    booking?.caregiver_name || booking?.caregiver?.name;
  const hospitalName =
    booking?.hospital_name || booking?.hospital?.name;

  const handleCancel = async () => {
    try {
      const response = await cancelBooking.mutateAsync({
        id: bookingId,
        reason: 'Plans changed',
      });
      setCancelVisible(false);
      const refundText = formatRefund(response?.data?.refund);
      showModal({
        type: 'success',
        title: 'Cancelled',
        message: refundText
          ? `Booking cancelled. Refund: ${refundText}`
          : 'Booking cancelled successfully',
      });
    } catch (error) {
      showModal({
        type: 'error',
        title: 'Error',
        message: getApiErrorMessage(error, 'Failed to cancel booking'),
      });
    }
  };

  const handleDispute = async ({reason, details}) => {
    try {
      await createDispute.mutateAsync({id: bookingId, reason, details});
      setDisputeVisible(false);
      refetchDisputes();
      showModal({
        type: 'success',
        title: 'Dispute submitted',
        message: 'We received your dispute and will update you soon.',
      });
    } catch (error) {
      showModal({
        type: 'error',
        title: 'Error',
        message: getApiErrorMessage(error, 'Failed to submit dispute'),
      });
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
        <Header title={t('bookingDetails', 'Booking details')} onBack={() => navigation.navigate('Main', {screen: 'Bookings'})} />
        <BookingDetailsSkeleton />
      </SafeAreaView>
    );
  }

  if (!booking) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
        <Header title={t('bookingDetails', 'Booking details')} onBack={() => navigation.navigate('Main', {screen: 'Bookings'})} />
        <View style={styles.errorContainer}>
          <View style={styles.errorIcon}>
            <Icon name="alert-circle-outline" size={32} color="#008178" />
          </View>
          <Text style={styles.errorTitle}>{t('bookingNotFound', 'Booking not found')}</Text>
          <Text style={styles.errorText}>
            {t('bookingNotFoundDesc', 'This booking may have been removed or is unavailable')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const infoRows = [
    {
      label: t('bookingNumber', 'Booking number'),
      value: booking.booking_number,
      icon: 'pricetag-outline',
    },
    {
      label: t('date', 'Date'),
      value: formatDate(booking.booking_date),
      icon: 'calendar-outline',
    },
    {
      label: t('time', 'Time'),
      value: `${formatTime(booking.start_time)} – ${formatTime(booking.end_time)}`,
      icon: 'time-outline',
    },
    {
      label: t('duration', 'Duration'),
      value: `${booking.duration_hours} ${t('hours', 'hours')}`,
      icon: 'hourglass-outline',
    },
    {
      label: t('service', 'Service'),
      value: (booking.service_type || '').replace(/_/g, ' '),
      icon: 'medkit-outline',
    },
    {
      label: t('payment', 'Payment'),
      value: (booking.payment_status || '').replace(/_/g, ' '),
      icon: 'card-outline',
      pill: true,
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <CustomLoader
        overlay
        visible={cancelBooking.isPending || payLoading || createDispute.isPending}
      />
      <StarReviewModal
        visible={starModalVisible}
        bookingNumber={booking.booking_number}
        caregiverName={caregiverName}
        submitting={submitReview.isPending}
        onSubmit={handleSubmitReview}
        onClose={closeStarModal}
      />
      <CancelBookingSheet
        visible={cancelVisible}
        policy={booking.cancellation_policy}
        submitting={cancelBooking.isPending}
        onConfirm={handleCancel}
        onClose={() => setCancelVisible(false)}
      />
      <DisputeSheet
        visible={disputeVisible}
        submitting={createDispute.isPending}
        onSubmit={handleDispute}
        onClose={() => setDisputeVisible(false)}
      />
      <Header title="Booking details" onBack={() => navigation.navigate('Main', {screen: 'Bookings'})} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {showLiveTracking && (
          <LiveTrackingMapSection
            bookingId={bookingId}
            enabled={showLiveTracking}
          />
        )}
        {searching && (
          <View style={styles.searchingBanner}>
            <Icon name="search-outline" size={18} color="#D97706" />
            <Text style={styles.searchingText}>
              {t('findingCaregiver', 'Finding another caregiver…')}
            </Text>
          </View>
        )}
        {waitingForAccept && (
          <View style={styles.waitingBanner}>
            <Icon name="time-outline" size={18} color="#7C3AED" />
            <View style={styles.waitingCopy}>
              <Text style={styles.waitingText}>
                {t('waitingForAccept', 'Waiting for caregiver to accept')}
              </Text>
              {offerCountdownLabel ? (
                <Text style={styles.waitingSubtext}>
                  {t('offerExpiresIn', 'Offer expires in')} {offerCountdownLabel}
                </Text>
              ) : booking?.accept_timeout_minutes ? (
                <Text style={styles.waitingSubtext}>
                  {t('caregiverRespondsWithin', 'Caregiver usually responds within')}{' '}
                  {booking.accept_timeout_minutes} {t('minutes', 'minutes')}
                </Text>
              ) : null}
            </View>
          </View>
        )}
        {/* ── Card 1: Amount & Booking Details ── */}
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={styles.heroLeft}>
              <View style={[styles.statusBadge, {backgroundColor: statusMeta.bg}]}>
                <Icon name="checkmark-circle" size={14} color={statusMeta.color} />
                <Text style={[styles.statusText, {color: statusMeta.color}]}>
                  {statusMeta.label}
                </Text>
              </View>
              <Text style={styles.heroLabel}>{t('totalAmount', 'Total amount')}</Text>
              <Text style={styles.heroAmount}>
                ৳{booking.pay_amount ?? booking.total_amount}
              </Text>
            </View>
            <BookingHeroIllustration />
          </View>

          <View style={styles.heroBody}>
            {infoRows.map((row, index) => (
              <View
                key={row.label}
                style={[
                  styles.infoRow,
                  index === infoRows.length - 1 && styles.infoRowLast,
                ]}>
                <View style={styles.infoLabelWrap}>
                  <Icon name={row.icon} size={15} color="#6B7F7C" />
                  <Text style={styles.infoLabel}>{row.label}</Text>
                </View>
                {row.pill && row.value ? (
                  <View style={styles.infoValueWrap}>
                    <View style={styles.infoPill}>
                      <Text style={styles.infoPillText}>{row.value}</Text>
                    </View>
                  </View>
                ) : (
                  <Text style={styles.infoValue} numberOfLines={1}>
                    {row.value || '--'}
                  </Text>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* ── Card 2: Patient, Caregiver, Hospital, Patient Details, Notes ── */}
        {(!!familyName || !!caregiverName || !!hospitalName || !!booking.patient_requirements || !!booking.notes) && (
          <View style={styles.card}>
            {!!familyName && (
              <>
                <Text style={styles.sectionTitle}>{t('patient', 'Patient')}</Text>
                <View style={styles.personRow}>
                  {patient?.photo ? (
                    <Image
                      source={{uri: patient.photo}}
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
                <Text style={styles.sectionTitle}>{t('caregiverDetails', 'Caregiver')}</Text>
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
                          {booking.caregiver.experience_years} {t('yrsExp', 'yrs exp')}
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
                <Text style={styles.sectionTitle}>{t('hospital', 'Hospital')}</Text>
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
                <Text style={styles.sectionTitle}>{t('serviceDetails', 'Service details')}</Text>
                <Text style={styles.bodyText}>{booking.patient_requirements}</Text>
              </>
            )}

            {!!booking.notes && (
              <>
                {(!!familyName || !!caregiverName || !!hospitalName || !!booking.patient_requirements) && <View style={styles.sectionDivider} />}
                <Text style={styles.sectionTitle}>{t('notes', 'Notes')}</Text>
                <Text style={styles.bodyText}>{booking.notes}</Text>
              </>
            )}
          </View>
        )}

        {Array.isArray(booking.history) && booking.history.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t('history', 'History')}</Text>
            {booking.history.map((item, index) => (
              <Text key={`${item.new_status}-${index}`} style={styles.bodyText}>
                {(item.old_status || '—').replace(/_/g, ' ')} →{' '}
                {(item.new_status || '—').replace(/_/g, ' ')}
                {item.note ? ` · ${item.note}` : ''}
              </Text>
            ))}
          </View>
        )}

        {disputes.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t('disputes', 'Disputes')}</Text>
            {disputes.map((item, index) => (
              <Text key={item.id || index} style={styles.bodyText}>
                {(item.status || item.reason || 'Dispute').replace(/_/g, ' ')}
                {item.details ? ` · ${item.details}` : ''}
              </Text>
            ))}
          </View>
        )}
      </ScrollView>

      {(showPayButton || canCancel || canLeaveReview || canDispute) && (
        <View style={styles.bottomContainer}>
          {canCancel && (
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => setCancelVisible(true)}>
              <Text style={[styles.payButtonText, styles.cancelButtonText]}>
                {t('cancelBooking', 'Cancel')}
              </Text>
            </TouchableOpacity>
          )}
          {showPayButton && (
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.actionButton, styles.payButton]}
              onPress={handlePayNow}>
              <Text style={styles.payButtonText}>{t('payNow', 'Pay now')}</Text>
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
              <Text style={styles.payButtonText}>{t('leaveReview', 'Rate service')}</Text>
            </TouchableOpacity>
          )}
          {canDispute && (
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.actionButton, styles.disputeButton]}
              onPress={() => setDisputeVisible(true)}>
              <Text style={styles.payButtonText}>{t('dispute', 'Dispute')}</Text>
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
    marginBottom: 4,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
    paddingBottom: 14,
    // borderBottomWidth: StyleSheet.hairlineWidth,
    // borderBottomColor: '#DCE7E4',
  },
  heroLeft: {
    flex: 1,
    paddingRight: 12,
  },
  heroLabel: {
    fontSize: 11,
    color: '#6B7F7C',
    marginTop: 10,
    marginBottom: 2,
  },
  heroAmount: {
    fontSize: 25,
    fontWeight: '700',
    color: '#10302D',
  },
  heroBody: {
    paddingTop: 8,
    paddingBottom: 10,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 10,
  },
  infoRowLast: {
    paddingBottom: 0,
  },
  infoLabelWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7F7C',
  },
  infoValue: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#10302D',
    textTransform: 'capitalize',
  },
  infoValueWrap: {
    flex: 1,
    alignItems: 'flex-start',
  },
  infoPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: '#E3F4EF',
  },
  infoPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#008178',
    textTransform: 'uppercase',
  },
  card: {
    paddingVertical: 14,
    // borderTopWidth: StyleSheet.hairlineWidth,
    // borderTopColor: '#DCE7E4',
  },
  sectionTitle: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#6B7F7C',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  sectionDivider: {
    height: StyleSheet.hairlineWidth,
    // backgroundColor: '#E6EEEC',
    marginVertical: 14,
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
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E6F4F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  personInfo: {
    flex: 1,
    minWidth: 0,
  },
  personName: {
    fontSize: 11,
    fontWeight: '500',
    color: '#10302D',
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
    flexDirection: 'row',
    gap: 6,
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
    backgroundColor: '#FDEEEE',
    borderWidth: 1,
    borderColor: '#F7D4D4',
  },
  cancelButtonText: {
    color: '#E5484D',
  },
  disputeButton: {
    backgroundColor: '#111820',
  },
  searchingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
    marginBottom: 12,
  },
  searchingText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: '#92400E',
    fontWeight: '600',
  },
  waitingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEE8FB',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
    marginBottom: 12,
  },
  waitingCopy: {
    flex: 1,
  },
  waitingText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#5B21B6',
    fontWeight: '600',
  },
  waitingSubtext: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 16,
    color: '#7C3AED',
    fontWeight: '500',
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


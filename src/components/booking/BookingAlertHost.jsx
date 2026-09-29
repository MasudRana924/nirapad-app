import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';
import {useQueryClient} from '@tanstack/react-query';
import {
  useAcceptNextCaregiver,
  useDeclineNextCaregiver,
} from '../../api/mutations';
import {bookingService} from '../../api/services';
import {queryKeys} from '../../api/queryKeys';
import {getApiErrorMessage} from '../../api/client';
import {
  BOOKING_ALERT,
  onBookingAlert,
  normalizeSuggestedCaregiver,
} from '../../utils/bookingAlerts';
import {
  normalizeBooking,
  isAwaitingNextCaregiver,
  isCancelledStatus,
} from '../../utils/bookingStatus';
import {formatOfferCountdown} from '../../utils/offerCountdown';

const TEAL = '#008178';
const INK = '#111820';
const MUTED = '#6B7A90';

const suggestionKey = (bookingId, caregiver) =>
  `${bookingId || ''}:${caregiver?.id || caregiver?.name || ''}`;

const CaregiverCard = ({caregiver, t}) => {
  if (!caregiver) {
    return null;
  }
  const area = [caregiver.thana, caregiver.district].filter(Boolean).join(', ');
  return (
    <View style={styles.cgCard}>
      {caregiver.photo ? (
        <Image source={{uri: caregiver.photo}} style={styles.cgPhoto} />
      ) : (
        <View style={[styles.cgPhoto, styles.cgPhotoFallback]}>
          <Icon name="person" size={24} color={TEAL} />
        </View>
      )}
      <View style={styles.cgInfo}>
        <Text style={styles.cgName} numberOfLines={1}>
          {caregiver.name || t('caregiver', 'Caregiver')}
        </Text>
        <View style={styles.cgMetaRow}>
          {caregiver.rating != null ? (
            <View style={styles.cgMetaItem}>
              <Icon name="star" size={12} color="#F5A524" />
              <Text style={styles.cgMetaText}>
                {caregiver.rating.toFixed(1)}
              </Text>
            </View>
          ) : null}
          {caregiver.experienceYears != null ? (
            <Text style={styles.cgMetaText}>
              {caregiver.experienceYears} {t('yearsShort', 'yrs')}
            </Text>
          ) : null}
        </View>
        {area ? (
          <View style={styles.cgMetaItem}>
            <Icon name="location-outline" size={12} color={MUTED} />
            <Text style={styles.cgMetaText} numberOfLines={1}>
              {area}
            </Text>
          </View>
        ) : null}
      </View>
      {caregiver.hourlyRate != null ? (
        <View style={styles.cgRate}>
          <Text style={styles.cgRateValue}>৳{caregiver.hourlyRate}</Text>
          <Text style={styles.cgRateUnit}>{t('perHour', '/hr')}</Text>
        </View>
      ) : null}
    </View>
  );
};

const BookingAlertHost = ({navigationRef}) => {
  const {t} = useTranslation();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const acceptNext = useAcceptNextCaregiver();
  const declineNext = useDeclineNextCaregiver();

  const [alert, setAlert] = useState(null);
  const [error, setError] = useState('');
  const [, setTick] = useState(0);
  const resolvedRef = useRef(new Set());

  const navigate = useCallback(
    (name, params) => {
      const nav = navigationRef?.current;
      if (nav?.navigate) {
        nav.navigate(name, params);
      }
    },
    [navigationRef],
  );

  const openBooking = useCallback(
    bookingId => {
      if (bookingId) {
        navigate('BookingDetails', {
          bookingId,
          notificationOpenedAt: Date.now(),
        });
      }
    },
    [navigate],
  );

  const refreshBooking = useCallback(
    bookingId => {
      queryClient.invalidateQueries({queryKey: queryKeys.bookings.all});
      queryClient.invalidateQueries({queryKey: queryKeys.inbox.all});
      if (bookingId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.bookings.detail(bookingId),
        });
      }
    },
    [queryClient],
  );

  const close = useCallback(() => {
    setAlert(null);
    setError('');
  }, []);

  /** Confirms a suggestion against GET /bookings/:id and fills missing data. */
  const verifySuggestion = useCallback(
    async incoming => {
      if (!incoming.bookingId) {
        return;
      }
      try {
        const response = await bookingService.getBookingDetails(
          incoming.bookingId,
        );
        const booking = normalizeBooking(response);
        if (!booking) {
          return;
        }
        if (isAwaitingNextCaregiver(booking)) {
          const caregiver =
            normalizeSuggestedCaregiver(booking.suggested_caregiver) ||
            incoming.caregiver;
          setAlert(current =>
            current?.kind === BOOKING_ALERT.SUGGEST_NEXT &&
            current.bookingId === incoming.bookingId
              ? {
                  ...current,
                  caregiver,
                  expiresAt: booking.suggestion_expires_at || current.expiresAt,
                }
              : current,
          );
          return;
        }
        setAlert(current => {
          if (
            current?.kind !== BOOKING_ALERT.SUGGEST_NEXT ||
            current.bookingId !== incoming.bookingId
          ) {
            return current;
          }
          if (isCancelledStatus(booking.status)) {
            return {kind: BOOKING_ALERT.BOOK_AGAIN, bookingId: booking.id};
          }
          return null;
        });
      } catch (fetchError) {
        console.log('Suggestion verify failed:', fetchError?.message);
      }
    },
    [],
  );

  useEffect(
    () =>
      onBookingAlert(incoming => {
        if (!incoming) {
          return;
        }
        if (incoming.kind === BOOKING_ALERT.SUGGEST_NEXT) {
          const key = suggestionKey(incoming.bookingId, incoming.caregiver);
          if (incoming.caregiver && resolvedRef.current.has(key)) {
            return;
          }
          setError('');
          setAlert(incoming);
          refreshBooking(incoming.bookingId);
          verifySuggestion(incoming);
          return;
        }
        if (
          incoming.kind === BOOKING_ALERT.EMERGENCY ||
          incoming.kind === BOOKING_ALERT.BOOK_AGAIN
        ) {
          refreshBooking(incoming.bookingId);
        }
        setError('');
        setAlert(incoming);
      }),
    [refreshBooking, verifySuggestion],
  );

  const isSuggest = alert?.kind === BOOKING_ALERT.SUGGEST_NEXT;
  const expiresLabel =
    isSuggest && alert?.expiresAt ? formatOfferCountdown(alert.expiresAt) : null;

  useEffect(() => {
    if (!isSuggest || !alert?.expiresAt) {
      return undefined;
    }
    const timer = setInterval(() => setTick(v => v + 1), 1000);
    return () => clearInterval(timer);
  }, [isSuggest, alert?.expiresAt]);

  const busy = acceptNext.isPending || declineNext.isPending;

  const handleYes = async () => {
    if (!alert?.bookingId || busy) {
      return;
    }
    const {bookingId, caregiver} = alert;
    setError('');
    try {
      const response = await acceptNext.mutateAsync(bookingId);
      resolvedRef.current.add(suggestionKey(bookingId, caregiver));
      const booking = normalizeBooking(response);
      if (booking && isAwaitingNextCaregiver(booking)) {
        setAlert({
          kind: BOOKING_ALERT.SUGGEST_NEXT,
          bookingId,
          caregiver: normalizeSuggestedCaregiver(booking.suggested_caregiver),
          expiresAt: booking.suggestion_expires_at || null,
          message:
            response?.message ||
            t(
              'nextCaregiverAlsoBusy',
              'That caregiver is no longer available. Do you want to select the next caregiver?',
            ),
        });
        return;
      }
      close();
      openBooking(bookingId);
    } catch (acceptError) {
      setError(
        getApiErrorMessage(
          acceptError,
          t('somethingWentWrong', 'Something went wrong. Please try again.'),
        ),
      );
      refreshBooking(bookingId);
    }
  };

  const handleNo = async () => {
    if (!alert?.bookingId || busy) {
      return;
    }
    const {bookingId, caregiver} = alert;
    setError('');
    try {
      await declineNext.mutateAsync(bookingId);
      resolvedRef.current.add(suggestionKey(bookingId, caregiver));
      setAlert({kind: BOOKING_ALERT.BOOK_AGAIN, bookingId, declined: true});
    } catch (declineError) {
      setError(
        getApiErrorMessage(
          declineError,
          t('somethingWentWrong', 'Something went wrong. Please try again.'),
        ),
      );
      refreshBooking(bookingId);
    }
  };

  const handleBookAgain = () => {
    close();
    navigate('Main', {screen: 'Home'});
  };

  const handleViewBooking = () => {
    const bookingId = alert?.bookingId;
    close();
    openBooking(bookingId);
  };

  if (!alert) {
    return null;
  }

  const renderSuggest = () => (
    <>
      <View style={[styles.iconCircle, styles.iconWarn]}>
        <Icon name="person-remove-outline" size={26} color="#D97706" />
      </View>
      <Text style={styles.title}>
        {t('caregiverIsBusy', 'Caregiver is busy')}
      </Text>
      <Text style={styles.message}>
        {alert.message ||
          t(
            'suggestNextCaregiverMsg',
            'This caregiver is busy. Do you want to select the next caregiver?',
          )}
      </Text>

      {alert.caregiver ? (
        <>
          <Text style={styles.sectionLabel}>
            {t('suggestedCaregiver', 'Suggested caregiver')}
          </Text>
          <CaregiverCard caregiver={alert.caregiver} t={t} />
        </>
      ) : (
        <ActivityIndicator color={TEAL} style={styles.loader} />
      )}

      {expiresLabel ? (
        <View style={styles.expiryRow}>
          <Icon name="time-outline" size={13} color={MUTED} />
          <Text style={styles.expiryText}>
            {t('respondWithin', 'Respond within')} {expiresLabel}
          </Text>
        </View>
      ) : null}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.outlineButton]}
          onPress={handleNo}
          disabled={busy}
          activeOpacity={0.75}>
          {declineNext.isPending ? (
            <ActivityIndicator color="#DC2626" />
          ) : (
            <Text style={[styles.buttonText, styles.noText]}>
              {t('no', 'No')}
            </Text>
          )}
        </TouchableOpacity>
        <View style={styles.buttonGap} />
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleYes}
          disabled={busy || !alert.bookingId}
          activeOpacity={0.75}>
          {acceptNext.isPending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>{t('yes', 'Yes')}</Text>
          )}
        </TouchableOpacity>
      </View>
    </>
  );

  const renderBookAgain = () => (
    <>
      <View style={[styles.iconCircle, styles.iconDanger]}>
        <Icon name="close-circle-outline" size={28} color="#DC2626" />
      </View>
      <Text style={styles.title}>
        {t('bookingCancelledTitle', 'Booking cancelled')}
      </Text>
      <Text style={styles.message}>
        {alert.message ||
          (alert.declined
            ? t(
                'bookingCancelledDeclinedMsg',
                'Your booking has been cancelled. You can create a new booking anytime.',
              )
            : t(
                'bookingCancelledBookAgainMsg',
                'No caregiver was confirmed in time, so this booking was cancelled. Please book again.',
              ))}
      </Text>
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.outlineButton]}
          onPress={alert.bookingId ? handleViewBooking : close}
          activeOpacity={0.75}>
          <Text style={[styles.buttonText, styles.outlineText]}>
            {alert.bookingId
              ? t('viewDetails', 'View details')
              : t('close', 'Close')}
          </Text>
        </TouchableOpacity>
        <View style={styles.buttonGap} />
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleBookAgain}
          activeOpacity={0.75}>
          <Text style={styles.buttonText}>{t('bookAgain', 'Book again')}</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderReason = emergency => (
    <>
      {emergency ? (
        <View style={styles.emergencyBadge}>
          <Icon name="warning" size={13} color="#FFFFFF" />
          <Text style={styles.emergencyBadgeText}>
            {t('emergency', 'EMERGENCY')}
          </Text>
        </View>
      ) : null}
      <View
        style={[
          styles.iconCircle,
          emergency ? styles.iconDanger : styles.iconWarn,
        ]}>
        <Icon
          name={emergency ? 'alert-circle' : 'information-circle-outline'}
          size={28}
          color={emergency ? '#DC2626' : '#D97706'}
        />
      </View>
      <Text style={styles.title}>
        {alert.title ||
          (emergency
            ? t('serviceNotStartedEmergency', 'Service not started — emergency')
            : t('serviceNotStarted', 'Service not started'))}
      </Text>
      <Text style={styles.reasonLabel}>
        {t('caregiverReason', "Caregiver's reason")}
      </Text>
      <View style={[styles.reasonBox, emergency && styles.reasonBoxDanger]}>
        <Text style={[styles.reasonText, emergency && styles.reasonTextDanger]}>
          {alert.reason || t('noReasonProvided', 'No reason provided')}
        </Text>
      </View>
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.outlineButton]}
          onPress={close}
          activeOpacity={0.75}>
          <Text style={[styles.buttonText, styles.outlineText]}>
            {t('close', 'Close')}
          </Text>
        </TouchableOpacity>
        {alert.bookingId ? (
          <>
            <View style={styles.buttonGap} />
            <TouchableOpacity
              style={[
                styles.button,
                emergency ? styles.dangerButton : styles.primaryButton,
              ]}
              onPress={handleViewBooking}
              activeOpacity={0.75}>
              <Text style={styles.buttonText}>
                {t('viewBooking', 'View booking')}
              </Text>
            </TouchableOpacity>
          </>
        ) : null}
      </View>
    </>
  );

  const renderBody = () => {
    switch (alert.kind) {
      case BOOKING_ALERT.SUGGEST_NEXT:
        return renderSuggest();
      case BOOKING_ALERT.BOOK_AGAIN:
        return renderBookAgain();
      case BOOKING_ALERT.EMERGENCY:
        return renderReason(true);
      case BOOKING_ALERT.NOT_STARTED_REASON:
        return renderReason(false);
      default:
        return null;
    }
  };

  const dismissible = !isSuggest || !busy;

  return (
    <Modal
      transparent
      visible
      animationType="fade"
      statusBarTranslucent
      onRequestClose={dismissible ? close : undefined}>
      <View style={styles.root}>
        <TouchableWithoutFeedback onPress={dismissible ? close : undefined}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>
        <View
          style={[
            styles.sheetWrap,
            {marginBottom: Math.max(15, insets.bottom + 12)},
          ]}>
          <View style={styles.card}>
            <View style={styles.handle} />
            {renderBody()}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default BookingAlertHost;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheetWrap: {
    marginHorizontal: 15,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 18,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    marginBottom: 14,
  },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  iconWarn: {
    backgroundColor: '#FEF3C7',
  },
  iconDanger: {
    backgroundColor: '#FEE2E2',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: INK,
    textAlign: 'center',
  },
  message: {
    marginTop: 6,
    fontSize: 13.5,
    lineHeight: 19,
    color: MUTED,
    textAlign: 'center',
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  sectionLabel: {
    alignSelf: 'flex-start',
    fontSize: 11,
    fontWeight: '700',
    color: MUTED,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  loader: {
    marginVertical: 18,
  },
  cgCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2FAF8',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D9ECE8',
    padding: 12,
  },
  cgPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  cgPhotoFallback: {
    backgroundColor: '#DDF0EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cgInfo: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  cgName: {
    fontSize: 15,
    fontWeight: '700',
    color: INK,
  },
  cgMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cgMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    flexShrink: 1,
  },
  cgMetaText: {
    fontSize: 12,
    color: MUTED,
    flexShrink: 1,
  },
  cgRate: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  cgRateValue: {
    fontSize: 15,
    fontWeight: '700',
    color: TEAL,
  },
  cgRateUnit: {
    fontSize: 11,
    color: MUTED,
  },
  expiryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 10,
  },
  expiryText: {
    fontSize: 12,
    color: MUTED,
  },
  errorText: {
    marginTop: 10,
    fontSize: 12.5,
    color: '#DC2626',
    textAlign: 'center',
  },
  emergencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#DC2626',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 10,
  },
  emergencyBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.6,
  },
  reasonLabel: {
    alignSelf: 'flex-start',
    marginTop: 12,
    marginBottom: 6,
    fontSize: 11,
    fontWeight: '700',
    color: MUTED,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  reasonBox: {
    width: '100%',
    backgroundColor: '#FFF8E6',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FBE3A6',
    padding: 12,
  },
  reasonBoxDanger: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  reasonText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#7A5A00',
  },
  reasonTextDanger: {
    color: '#991B1B',
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 16,
  },
  buttonGap: {
    width: 10,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: TEAL,
  },
  dangerButton: {
    backgroundColor: '#DC2626',
  },
  outlineButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  noText: {
    color: '#DC2626',
  },
  outlineText: {
    color: '#4B5563',
  },
});

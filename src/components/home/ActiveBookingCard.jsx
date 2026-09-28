import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  BOOKING_STATUS,
  canShowLiveTracking,
  isSearchingStatus,
} from '../../utils/bookingStatus';
import {useTranslation} from 'react-i18next';
import ActiveCardBackground from './ActiveCardBackground';

const TEAL = '#0B7A6E';
const INK = '#0F3D38';
const MUTED = '#7E8F8C';
const getServiceLabel = (booking, t) => {
  const type = String(booking?.service_type || '').toUpperCase();
  if (type.includes('HOSPITAL')) {
    return t('hospitalAssistance');
  }
  if (type.includes('NURSE')) {
    return t('nurseCare');
  }
  if (type.includes('ELDER')) {
    return t('elderlySupport');
  }
  if (type) {
    return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }
  return t('caregiverService');
};

const getCurrentStep = (status, finding) => {
  if (finding) {
    return 1;
  }
  if (status === BOOKING_STATUS.PROVIDER_ASSIGNED) {
    return 2;
  }
  return 3;
};

const ProgressStep = ({label, state, isLast}) => {
  const done = state === 'done';
  const active = state === 'active';

  return (
    <View style={styles.stepRow}>
      <View style={styles.stepRail}>
        {done ? (
          <View style={styles.stepDone}>
            <Icon name="checkmark" size={9} color="#FFFFFF" />
          </View>
        ) : active ? (
          <View style={styles.stepActive}>
            <View style={styles.stepActiveDot} />
          </View>
        ) : (
          <View style={styles.stepPending} />
        )}
        {!isLast ? (
          <View style={[styles.stepLine, done && styles.stepLineDone]} />
        ) : null}
      </View>
      <Text
        style={[
          styles.stepLabel,
          active && styles.stepLabelActive,
          done && styles.stepLabelDone,
        ]}
        numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
};

const ActiveBookingCard = ({navigation, booking, searching}) => {
  const {t} = useTranslation();

  if (!booking) {
    return null;
  }

  const finding = searching || isSearchingStatus(booking.status);
  const liveTracking = !finding && canShowLiveTracking(booking);
  const caregiverName = booking.caregiver_name || booking.caregiver?.name;
  const hasCaregiver = Boolean(caregiverName);
  const hospitalName =
    booking.hospital_name || booking.hospital?.name || booking.booking_number;

  const currentStep = getCurrentStep(booking.status, finding);
  const steps = [
    t('requestReceived'),
    t('findingCaregiverStep'),
    t('caregiverAssignedStep'),
  ];

  const handlePress = () => {
    if (!booking.id) {
      return;
    }
    navigation?.navigate('BookingDetails', {bookingId: booking.id});
  };

  return (
    <View style={styles.card}>
      <ActiveCardBackground />

      <Text style={styles.title} numberOfLines={1}>
        {getServiceLabel(booking, t)}
      </Text>
      <View style={styles.metaRow}>
        <Icon name="location-outline" size={12} color={MUTED} />
        <Text style={styles.metaText} numberOfLines={1}>
          {finding || !hasCaregiver
            ? hospitalName || '—'
            : `${caregiverName} · ${hospitalName || '—'}`}
        </Text>
      </View>

      <View style={styles.steps}>
        {steps.map((label, index) => (
          <ProgressStep
            key={label}
            label={label}
            isLast={index === steps.length - 1}
            state={
              index < currentStep
                ? 'done'
                : index === currentStep
                  ? 'active'
                  : 'pending'
            }
          />
        ))}
      </View>

      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.trackBtn}
        onPress={handlePress}>
        <Text style={styles.trackBtnText}>
          {finding ? t('viewStatus') : liveTracking ? t('trackLive') : t('viewDetails')}
        </Text>
        <Icon name="chevron-forward-sharp" size={13} color={TEAL} />
      </TouchableOpacity>
    </View>
  );
};

export default ActiveBookingCard;

const styles = StyleSheet.create({
  card: {
    marginTop: 10,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#F2FAF8',
    borderWidth: 1,
    borderColor: '#D9ECE8',
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 12,
  },
  title: {
    fontSize: 17,
    lineHeight: 21,
    fontWeight: '700',
    color: INK,
    maxWidth: '68%',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    maxWidth: '68%',
    gap: 4,
  },
  metaText: {
    flexShrink: 1,
    fontSize: 11.5,
    lineHeight: 15,
    color: '#5A6D6A',
  },
  steps: {
    marginTop: 10,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepRail: {
    width: 14,
    alignItems: 'center',
    marginRight: 10,
  },
  stepDone: {
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: '#14A37F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepActive: {
    width: 13,
    height: 13,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: TEAL,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepActiveDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: TEAL,
  },
  stepPending: {
    width: 13,
    height: 13,
    borderRadius: 7,
    borderWidth: 1.2,
    borderColor: '#C9D6D3',
    backgroundColor: '#FFFFFF',
  },
  stepLine: {
    width: 1.2,
    height: 5,
    backgroundColor: '#D3E0DD',
  },
  stepLineDone: {
    backgroundColor: '#14A37F',
  },
  stepLabel: {
    flex: 1,
    fontSize: 11,
    lineHeight: 13,
    color: MUTED,
  },
  stepLabelActive: {
    color: INK,
    fontWeight: '700',
  },
  stepLabelDone: {
    color: '#5F716E',
  },
  trackBtn: {
    marginTop: 12,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DDF0EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  trackBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: TEAL,
  },
});


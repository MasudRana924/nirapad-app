import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  BOOKING_STATUS,
  canShowLiveTracking,
  getStatusMeta,
  isSearchingStatus,
} from '../../utils/bookingStatus';
import {useTranslation} from 'react-i18next';

const TEAL = '#0B7A6E';
const INK = '#0F3D38';
const MUTED = '#7E8F8C';
const cardBg = require('../../assets/home-active-card-bg.png');

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
            <Icon name="checkmark" size={12} color="#FFFFFF" />
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
  const status = getStatusMeta(booking.status);
  const caregiverName =
    booking.caregiver_name || booking.caregiver?.name || t('caregiver');
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
      <Image source={cardBg} style={styles.bgImage} resizeMode="cover" />

      <View style={styles.badge}>
        <View style={styles.badgeDot} />
        <Text style={styles.badgeText}>{t('activeBadge').toUpperCase()}</Text>
      </View>

      <Text style={styles.title} numberOfLines={1}>
        {getServiceLabel(booking, t)}
      </Text>
      <Text style={styles.subtitle} numberOfLines={1}>
        {finding ? t('findingAnotherCaregiver') : status.label}
      </Text>

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

      <View style={styles.divider} />

      <View style={styles.infoRow}>
        <Icon name="person-outline" size={17} color={TEAL} />
        <Text style={styles.infoText} numberOfLines={1}>
          {finding ? t('assigningCaregiver') : caregiverName}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Icon name="location-outline" size={17} color={TEAL} />
        <Text style={styles.infoText} numberOfLines={1}>
          {hospitalName || '—'}
        </Text>
      </View>

      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.trackBtn}
        onPress={handlePress}>
        <Text style={styles.trackBtnText}>
          {finding ? t('viewStatus') : liveTracking ? t('trackLive') : t('viewDetails')}
        </Text>
        <Icon name="arrow-forward" size={15} color={TEAL} />
      </TouchableOpacity>
    </View>
  );
};

export default ActiveBookingCard;

const styles = StyleSheet.create({
  card: {
    marginTop: 12,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#F2FAF8',
    borderWidth: 1,
    borderColor: '#D9ECE8',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
  },
  bgImage: {
    position: 'absolute',
    top: -36,
    left: 0,
    width: '100%',
    aspectRatio: 16 / 9,
  },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DDF1EC',
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 3,
    gap: 5,
  },
  badgeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#14A37F',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: TEAL,
    letterSpacing: 0.4,
  },
  title: {
    marginTop: 6,
    fontSize: 21,
    fontWeight: '700',
    color: INK,
    maxWidth: '72%',
  },
  subtitle: {
    marginTop: 2,
    fontSize: 13,
    color: '#4F6360',
    maxWidth: '72%',
  },
  steps: {
    marginTop: 8,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepRail: {
    width: 18,
    alignItems: 'center',
    marginRight: 12,
  },
  stepDone: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#14A37F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepActive: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: TEAL,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepActiveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: TEAL,
  },
  stepPending: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#C9D6D3',
    backgroundColor: '#FFFFFF',
  },
  stepLine: {
    width: 1.5,
    height: 7,
    backgroundColor: '#D3E0DD',
  },
  stepLineDone: {
    backgroundColor: '#14A37F',
  },
  stepLabel: {
    flex: 1,
    fontSize: 12.5,
    lineHeight: 16,
    color: MUTED,
  },
  stepLabelActive: {
    color: INK,
    fontWeight: '700',
  },
  stepLabelDone: {
    color: '#5F716E',
  },
  divider: {
    height: 1,
    backgroundColor: '#DCEAE7',
    marginTop: 8,
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  infoText: {
    marginLeft: 10,
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: '#1F3431',
  },
  trackBtn: {
    marginTop: 10,
    height: 38,
    borderRadius: 20,
    backgroundColor: '#DDF0EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  trackBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: TEAL,
  },
});

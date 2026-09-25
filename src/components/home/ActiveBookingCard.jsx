import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  canShowLiveTracking,
  getStatusMeta,
  isSearchingStatus,
} from '../../utils/bookingStatus';
import {useTranslation} from 'react-i18next';

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

  const handlePress = () => {
    if (!booking.id) {
      return;
    }
    navigation?.navigate('BookingDetails', {bookingId: booking.id});
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.iconTile}>
          <Icon
            name={
              finding
                ? 'search-outline'
                : liveTracking
                  ? 'navigate-outline'
                  : 'medkit-outline'
            }
            size={20}
            color="#008178"
          />
        </View>

        <View style={styles.headerText}>
          <Text style={styles.title} numberOfLines={1}>
            {getServiceLabel(booking, t)}
          </Text>
          <View style={styles.statusRow}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>
              {finding ? t('findingAnotherCaregiver') : status.label}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.infoRow}>
        <Icon name="person-outline" size={15} color="#303944" />
        <Text style={styles.infoText} numberOfLines={1}>
          {finding ? t('assigningCaregiver') : caregiverName}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Icon name="location-outline" size={15} color="#303944" />
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
        <Icon name="chevron-forward" size={16} color="#008178" />
      </TouchableOpacity>
    </View>
  );
};

export default ActiveBookingCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#008178',
    borderRadius: 18,
    padding: 16,
    marginTop: 16,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconTile: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#E6F4F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  headerText: {
    flex: 1,
    minWidth: 0,
  },

  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#13C875',
  },

  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E6F4F3',
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 8,
  },

  infoText: {
    marginLeft: 8,
    flex: 1,
    fontSize: 12,
    color: '#fff',
  },

  trackBtn: {
    marginTop: 8,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#E6F4F3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },

  trackBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#008178',
  },
});

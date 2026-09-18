import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {getStatusMeta, isSearchingStatus} from '../../utils/bookingStatus';

const getServiceLabel = booking => {
  const type = String(booking?.service_type || '').toUpperCase();
  if (type.includes('HOSPITAL')) {
    return 'Hospital Assistance';
  }
  if (type.includes('NURSE')) {
    return 'Nurse Care';
  }
  if (type.includes('ELDER')) {
    return 'Elderly Support';
  }
  if (type) {
    return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }
  return 'Caregiver Service';
};

const ActiveBookingCard = ({navigation, booking, searching}) => {
  if (!booking) {
    return null;
  }

  const finding = searching || isSearchingStatus(booking.status);
  const status = getStatusMeta(booking.status);
  const caregiverName =
    booking.caregiver_name || booking.caregiver?.name || 'Caregiver';
  const hospitalName =
    booking.hospital_name || booking.hospital?.name || booking.booking_number;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.iconTile}>
          <Icon
            name={finding ? 'search-outline' : 'medkit-outline'}
            size={20}
            color="#008178"
          />
        </View>

        <View style={styles.headerText}>
          <Text style={styles.title} numberOfLines={1}>
            {getServiceLabel(booking)}
          </Text>
          <View style={styles.statusRow}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>
              {finding ? 'Finding another caregiver' : status.label}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.infoRow}>
        <Icon name="person-outline" size={15} color="#303944" />
        <Text style={styles.infoText} numberOfLines={1}>
          {finding ? 'Assigning a caregiver' : caregiverName}
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
        onPress={() =>
          navigation?.navigate('BookingDetails', {bookingId: booking.id})
        }>
        <Text style={styles.trackBtnText}>
          {finding ? 'View status' : 'Track live'}
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

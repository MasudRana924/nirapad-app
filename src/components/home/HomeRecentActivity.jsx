import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTranslation} from 'react-i18next';
import {getStatusMeta} from '../../utils/bookingStatus';

const TEAL = '#0B7A6E';
const INK = '#0F1A19';

const formatTime = timeString => {
  if (!timeString) {
    return '';
  }
  const [hours, minutes] = String(timeString).split(':');
  const hour = parseInt(hours, 10);
  if (Number.isNaN(hour)) {
    return '';
  }
  const ampm = hour >= 12 ? 'PM' : 'AM';
  return `${hour % 12 || 12}:${minutes || '00'} ${ampm}`;
};

const formatWhen = (booking, t) => {
  const date = new Date(booking?.booking_date || booking?.created_at);
  let day = '';
  if (!Number.isNaN(date.getTime())) {
    const today = new Date();
    day =
      date.toDateString() === today.toDateString()
        ? t('today')
        : date.toLocaleDateString('en-US', {month: 'short', day: 'numeric'});
  }
  const time = formatTime(booking?.start_time);
  return [day, time].filter(Boolean).join(' · ');
};

const getTitle = (booking, t) => {
  const type = String(booking?.service_type || '').toUpperCase();
  if (type.includes('NURSE')) {
    return t('nurseBooking');
  }
  if (type.includes('HOSPITAL')) {
    return t('hospitalAssistance');
  }
  return t('caregiverBooking');
};

const HomeRecentActivity = ({navigation, booking}) => {
  const {t} = useTranslation();

  if (!booking) {
    return null;
  }

  const status = getStatusMeta(booking.status);

  return (
    <View style={styles.section}>
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.header}
        onPress={() => navigation?.navigate('Main', {screen: 'Bookings'})}>
        <Text style={styles.title}>{t('recentActivity')}</Text>
        
        <Icon name="chevron-forward" size={15} color="#0B7A6E" />
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.row}
        onPress={() =>
          booking.id &&
          navigation?.navigate('BookingDetails', {bookingId: booking.id})
        }>
        <View style={styles.iconCircle}>
          <Icon name="person-outline" size={13} color={TEAL} />
        </View>
        <View style={styles.copy}>
          <Text style={styles.rowTitle} numberOfLines={1}>
            {getTitle(booking, t)}
          </Text>
          <Text style={styles.rowMeta} numberOfLines={1}>
            {formatWhen(booking, t)}
          </Text>
        </View>
        <View style={[styles.pill, {backgroundColor: status.bg}]}>
          <Text style={[styles.pillText, {color: status.color}]}>
            {status.label}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default HomeRecentActivity;

const styles = StyleSheet.create({
  section: {
    marginTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: INK,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  iconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E6F4F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },
  rowTitle: {
    fontSize: 11.5,
    lineHeight: 14,
    fontWeight: '600',
    color: INK,
  },
  rowMeta: {
    fontSize: 10,
    lineHeight: 13,
    color: '#7A8886',
  },
  pill: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  pillText: {
    fontSize: 10,
    fontWeight: '600',
  },
});


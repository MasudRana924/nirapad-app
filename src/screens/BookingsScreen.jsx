import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {useBookings} from '../api/queries';
import BookingSkeleton from '../components/home/BookingSkeleton';

const INK = '#163532';
const MUTED = '#7B9390';
const TEAL = '#008178';

const CARD_THEMES = [
  {iconBg: '#E7F6F1', icon: '#0F8A7A', bar: '#EAF7F3', service: '#0F8A7A'},
  {iconBg: '#FDECEC', icon: '#E11D48', bar: '#FDECEC', service: '#E11D48'},
  {iconBg: '#EEE8FB', icon: '#7C3AED', bar: '#F3EDFC', service: '#7C3AED'},
  {iconBg: '#E8F1FB', icon: '#2563EB', bar: '#EAF3FB', service: '#2563EB'},
];

const formatDate = dateString => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return '--';
  }
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const isCompleted = booking => booking?.status === 'COMPLETED';
const isPending = booking =>
  booking?.status !== 'COMPLETED' && booking?.status !== 'CANCELLED';

const getStatusMeta = booking => {
  if (booking?.status === 'COMPLETED') {
    return {
      label: 'Completed',
      icon: 'checkmark-circle',
      color: '#0F8A7A',
      bg: '#E7F6F1',
    };
  }
  if (booking?.status === 'CANCELLED') {
    return {
      label: 'Cancelled',
      icon: 'close-circle',
      color: '#DC2626',
      bg: '#FEECEC',
    };
  }
  return {
    label: 'Pending',
    icon: 'time',
    color: '#D97706',
    bg: '#FEF3C7',
  };
};

const getServiceLabel = booking => {
  const requirements = String(booking?.patient_requirements || '');
  const known = [
    'Hospital Companion',
    'Nurse Care',
    'Elderly Support',
    'Caregiver Service',
  ];
  const matched = known.find(name => requirements.includes(name));
  if (matched) {
    return matched;
  }

  const type = String(booking?.service_type || '').toUpperCase();
  if (type.includes('HOSPITAL')) {
    return 'Hospital Companion';
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

const BookingsScreen = ({navigation}) => {
  const [filter, setFilter] = useState('all');
  const {data: bookingsData, isLoading} = useBookings({page: 1, limit: 20});
  const bookings = Array.isArray(bookingsData?.data) ? bookingsData.data : [];

  const counts = {
    all: bookings.length,
    pending: bookings.filter(isPending).length,
    completed: bookings.filter(isCompleted).length,
  };

  const visibleBookings =
    filter === 'pending'
      ? bookings.filter(isPending)
      : filter === 'completed'
        ? bookings.filter(isCompleted)
        : bookings;

  const tabs = [
    {id: 'all', label: 'All', count: counts.all},
    {id: 'pending', label: 'Pending', count: counts.pending},
    {id: 'completed', label: 'Completed', count: counts.completed},
  ];

  return (
    <View style={styles.page}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView style={styles.flex} edges={['top', 'left', 'right']}>
        <View style={styles.topBar}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.backButton}
            onPress={() =>
              navigation?.canGoBack()
                ? navigation.goBack()
                : navigation?.navigate('Home')
            }>
            <Icon name="arrow-back" size={22} color={INK} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>My Bookings</Text>
          
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.tabsRow}>
          {tabs.map(tab => {
            const active = filter === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                activeOpacity={0.85}
                onPress={() => setFilter(tab.id)}
                style={[styles.tab, active && styles.tabActive]}>
                <Text style={[styles.tabText, active && styles.tabTextActive]}>
                  {tab.label}
                </Text>
                <View
                  style={[styles.countPill, active && styles.countPillActive]}>
                  <Text
                    style={[
                      styles.countText,
                      active && styles.countTextActive,
                    ]}>
                    {tab.count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {isLoading ? (
            <BookingSkeleton />
          ) : visibleBookings.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="calendar-outline" size={64} color="#E3E8F0" />
              <Text style={styles.emptyTitle}>No Bookings</Text>
              <Text style={styles.emptyText}>
                You don't have any bookings yet
              </Text>
            </View>
          ) : (
            visibleBookings.map((booking, index) => {
              const theme = CARD_THEMES[index % CARD_THEMES.length];
              const status = getStatusMeta(booking);
              const serviceLabel = getServiceLabel(booking);

              return (
                <TouchableOpacity
                  key={booking.id}
                  activeOpacity={0.85}
                  style={styles.bookingCard}
                  onPress={() =>
                    navigation?.navigate('BookingDetails', {
                      bookingId: booking.id,
                    })
                  }>
                  <View style={styles.cardTop}>
                    <View
                      style={[
                        styles.calendarWrap,
                        {backgroundColor: theme.iconBg},
                      ]}>
                      <Icon name="calendar" size={20} color={theme.icon} />
                    </View>

                    <View style={styles.bookingInfo}>
                      <Text style={styles.serviceTitle} numberOfLines={1}>
                        {serviceLabel}
                      </Text>
                      <Text style={styles.bookingId} numberOfLines={1}>
                        {booking.booking_number}
                      </Text>
                      <View style={styles.dateInfo}>
                        <Icon name="calendar-outline" size={14} color={MUTED} />
                        <Text style={styles.dateText}>
                          {formatDate(booking.booking_date)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.cardRight}>
                      <View
                        style={[
                          styles.statusBadge,
                          {backgroundColor: status.bg},
                        ]}>
                        <Icon name={status.icon} size={13} color={status.color} />
                        <Text style={[styles.statusText, {color: status.color}]}>
                          {status.label}
                        </Text>
                      </View>
                      <Icon name="chevron-forward" size={18} color="#C5D0CE" />
                    </View>
                  </View>


                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flex: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 4,
    minHeight: 56,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: INK,
  },
  headerSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: MUTED,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 36,
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCEEE9',
    gap: 6,
  },
  tabActive: {
    backgroundColor: TEAL,
    borderColor: TEAL,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: MUTED,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  countPill: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    backgroundColor: '#F3FAF7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countPillActive: {
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
    color: MUTED,
  },
  countTextActive: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: INK,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: MUTED,
    marginTop: 8,
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E8EEEC',
    marginBottom: 12,
    overflow: 'hidden',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
  },
  calendarWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  bookingInfo: {
    flex: 1,
    minWidth: 0,
  },
  serviceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: INK,
    marginBottom: 2,
  },
  bookingId: {
    fontSize: 12,
    fontWeight: '400',
    color: MUTED,
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  dateText: {
    fontSize: 13,
    color: MUTED,
    marginLeft: 6,
  },
  cardRight: {
    alignItems: 'flex-end',
    gap: 10,
    marginLeft: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 8,
    fontWeight: '700',
  },
});

export default BookingsScreen;

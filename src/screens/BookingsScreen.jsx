import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {useBookings} from '../api/queries';
import Header from '../components/common/Header';
import BookingSkeleton from '../components/home/BookingSkeleton';

const BookingsScreen = ({navigation}) => {
  const {data: bookingsData, isLoading} = useBookings({page: 1, limit: 20});
  const bookings = Array.isArray(bookingsData?.data) ? bookingsData.data : [];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '--';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PROVIDER_ASSIGNED':
        return '#008178';
      case 'PENDING_PAYMENT':
        return '#F59E0B';
      case 'CONFIRMED':
        return '#10B981';
      case 'IN_PROGRESS':
        return '#3B82F6';
      case 'COMPLETED':
        return '#10B981';
      case 'CANCELLED':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'PAID':
        return '#10B981';
      case 'PENDING':
        return '#F59E0B';
      case 'FAILED':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <Header title="My Bookings" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <BookingSkeleton />
        ) : bookings.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="calendar-outline" size={64} color="#E3E8F0" />
            <Text style={styles.emptyTitle}>No Bookings</Text>
            <Text style={styles.emptyText}>
              You don't have any bookings yet
            </Text>
          </View>
        ) : (
          bookings.map(booking => (
            <TouchableOpacity
              key={booking.id}
              activeOpacity={0.85}
              style={styles.bookingCard}
              onPress={() =>
                navigation?.navigate('BookingDetails', {bookingId: booking.id})
              }>
              <View style={styles.cardContent}>
                <View style={styles.cardLeft}>
                  <View style={styles.bookingInfo}>
                    <Text style={styles.bookingIdLabel}>Booking ID</Text>
                    <Text style={styles.bookingId}>{booking.booking_number}</Text>
                  </View>
                  <View style={styles.dateInfo}>
                    <Icon name="calendar-outline" size={18} color="#8190A7" />
                    <Text style={styles.dateText}>{formatDate(booking.booking_date)}</Text>
                  </View>
                </View>
                <View style={styles.rightArrow}>
                  <Icon name="chevron-forward" size={20} color="#8190A7" />
                </View>
              </View>
              <View style={styles.paymentBadgeContainer}>
                <View
                  style={[
                    styles.paymentBadge,
                    {backgroundColor: getPaymentStatusColor(booking.payment_status)},
                  ]}>
                  <Text style={styles.paymentText}>{booking.payment_status}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  loadingText: {
    fontSize: 16,
    color: '#8190A7',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#172333',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#8190A7',
    marginTop: 8,
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#E3E8F0',
    marginBottom: 12,
  },

  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  cardLeft: {
    flexDirection: 'column',
    flex: 1,
  },

  bookingInfo: {
    marginBottom: 6,
  },

  bookingIdLabel: {
    fontSize: 11,
    color: '#8190A7',
    marginBottom: 2,
  },

  bookingId: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111820',
  },

  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  dateText: {
    fontSize: 13,
    color: '#8190A7',
    marginLeft: 6,
  },

  rightArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F6F6F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  paymentBadgeContainer: {
    marginTop: 8,
  },

  paymentBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },

  paymentText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default BookingsScreen;

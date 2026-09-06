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
  const bookings = bookingsData?.data || [];

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
            <View key={booking.id} style={styles.bookingCard}>
              <View style={styles.cardHeader}>
                <View style={styles.bookingNumberContainer}>
                  <Text style={styles.bookingNumberLabel}>Booking ID</Text>
                  <Text style={styles.bookingNumber}>{booking.booking_number}</Text>
                </View>
                <TouchableOpacity
                  style={styles.seeDetailsButton}
                  onPress={() =>
                    navigation?.navigate('BookingDetails', {bookingId: booking.id})
                  }>
                  <Text style={styles.seeDetailsText}>See Details</Text>
                  <Icon name="chevron-forward" size={20} color="#008178" />
                </TouchableOpacity>
              </View>

              <View style={styles.divider} />

              <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                  <Icon name="calendar-outline" size={18} color="#7D8BA5" />
                  <Text style={styles.infoLabel}>Date</Text>
                  <Text style={styles.infoValue}>{formatDate(booking.booking_date)}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Icon name="time-outline" size={18} color="#7D8BA5" />
                  <Text style={styles.infoLabel}>Time</Text>
                  <Text style={styles.infoValue}>
                    {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Icon name="hourglass-outline" size={18} color="#7D8BA5" />
                  <Text style={styles.infoLabel}>Duration</Text>
                  <Text style={styles.infoValue}>{booking.duration_hours} hours</Text>
                </View>

                <View style={styles.infoRow}>
                  <Icon name="card-outline" size={18} color="#7D8BA5" />
                  <Text style={styles.infoLabel}>Payment</Text>
                  <View
                    style={[
                      styles.paymentBadge,
                      {backgroundColor: getPaymentStatusColor(booking.payment_status)},
                    ]}>
                    <Text style={styles.paymentText}>{booking.payment_status}</Text>
                  </View>
                </View>
              </View>
            </View>
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
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F5F5F5',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  bookingNumberContainer: {
    flex: 1,
  },
  seeDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookingNumberLabel: {
    fontSize: 10,
    color: '#8190A7',
    marginBottom: 4,
  },
  bookingNumber: {
    fontSize: 12,
    fontWeight: '500',
    color: '#172333',
  },
  statusContainer: {},
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  cardBody: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#8190A7',
    marginLeft: 8,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#172333',
  },
  paymentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  paymentText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  seeDetailsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#008178',
    marginRight: 4,
  },
});

export default BookingsScreen;

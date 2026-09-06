import React from 'react';
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
import {useBookingDetails} from '../api/queries';
import Header from '../components/common/Header';
import BookingDetailsSkeleton from '../components/home/BookingDetailsSkeleton';

const BookingDetailsScreen = ({navigation, route}) => {
  const {bookingId} = route.params || {};
  const {data: bookingData, isLoading} = useBookingDetails(bookingId);
  const booking = bookingData?.data;

  const formatDate = (dateString) => {
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

  const formatTime = (timeString) => {
    if (!timeString) return '--';
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    } catch (error) {
      return '--';
    }
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

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
        <Header title="Booking Details" onBack={() => navigation?.goBack()} />
        <BookingDetailsSkeleton />
      </SafeAreaView>
    );
  }

  if (!booking) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
        <Header title="Booking Details" onBack={() => navigation?.goBack()} />
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={64} color="#E3E8F0" />
          <Text style={styles.errorTitle}>Booking not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <Header title="Booking Details" onBack={() => navigation?.goBack()} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Booking Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Booking Information</Text>
            <View
              style={[styles.statusBadge, {backgroundColor: getStatusColor(booking.status)}]}>
              <Text style={styles.statusText}>{booking.status}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Booking Number</Text>
            <Text style={styles.infoValue}>{booking.booking_number}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date</Text>
            <Text style={styles.infoValue}>{formatDate(booking.booking_date)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Time</Text>
            <Text style={styles.infoValue}>
              {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Duration</Text>
            <Text style={styles.infoValue}>{booking.duration_hours} hours</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Service Type</Text>
            <Text style={styles.infoValue}>{booking.service_type}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Payment Status</Text>
            <Text style={styles.infoValue}>{booking.payment_status}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total Amount</Text>
            <Text style={styles.infoValue}>৳{booking.total_amount}</Text>
          </View>
        </View>

        {/* Family Member Card */}
        {booking.family_member && (
          <View style={styles.card}>
            <Text style={styles.subcardTitle}>Family Member</Text>
            <View style={styles.divider} />
            <View style={styles.memberCard}>
              <View style={styles.avatarContainer}>
                {booking.family_member.photo ? (
                  <Image
                    source={{uri: booking.family_member.photo}}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={styles.placeholderAvatar}>
                    <Icon name="person" size={32} color="#8190A7" />
                  </View>
                )}
                {booking.family_member.blood_group && (
                  <View style={styles.bloodBadge}>
                    <Text style={styles.bloodText}>{booking.family_member.blood_group}</Text>
                  </View>
                )}
              </View>
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{booking.family_member.name}</Text>
                <View style={styles.memberDetail}>
                  <Icon name="person-outline" size={16} color="#7D8BA5" />
                  <Text style={styles.memberDetailText}>{booking.family_member.relationship}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Caregiver Card */}
        {booking.caregiver && (
          <View style={styles.card}>
            <Text style={styles.subcardTitle}>Caregiver</Text>
            <View style={styles.divider} />
            <View style={styles.memberCard}>
              <View style={styles.avatarContainer}>
                {booking.caregiver.profile_photo ? (
                  <Image
                    source={{uri: booking.caregiver.profile_photo}}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={styles.placeholderAvatar}>
                    <Icon name="medkit" size={32} color="#8190A7" />
                  </View>
                )}
              </View>
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{booking.caregiver.name}</Text>
                {booking.caregiver.rating && (
                  <View style={styles.ratingContainer}>
                    <Icon name="star" size={16} color="#F6A900" />
                    <Text style={styles.ratingText}>{booking.caregiver.rating}</Text>
                  </View>
                )}
                {booking.caregiver.experience_years && (
                  <View style={styles.memberDetail}>
                    <Icon name="briefcase-outline" size={16} color="#7D8BA5" />
                    <Text style={styles.memberDetailText}>
                      {booking.caregiver.experience_years} years experience
                    </Text>
                  </View>
                )}
                {booking.caregiver.education && (
                  <View style={styles.memberDetail}>
                    <Icon name="school-outline" size={16} color="#7D8BA5" />
                    <Text style={styles.memberDetailText}>{booking.caregiver.education}</Text>
                  </View>
                )}
              </View>
            </View>
            {booking.caregiver.bio && (
              <View style={styles.bioSection}>
                <Text style={styles.bioText}>{booking.caregiver.bio}</Text>
              </View>
            )}
          </View>
        )}

        {/* Hospital Card */}
        {booking.hospital && (
          <View style={styles.card}>
            <Text style={styles.subcardTitle}>Hospital</Text>
            <View style={styles.divider} />
            <View style={styles.memberCard}>
              <View style={styles.avatarContainer}>
                {booking.hospital.photo ? (
                  <Image source={{uri: booking.hospital.photo}} style={styles.avatar} />
                ) : (
                  <View style={styles.placeholderAvatar}>
                    <Icon name="business" size={32} color="#8190A7" />
                  </View>
                )}
              </View>
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{booking.hospital.name}</Text>
                <View style={styles.memberDetail}>
                  <Icon name="location-outline" size={16} color="#7D8BA5" />
                  <Text style={styles.memberDetailText}>{booking.hospital.address}</Text>
                </View>
                {booking.hospital.phone && (
                  <View style={styles.memberDetail}>
                    <Icon name="call-outline" size={16} color="#7D8BA5" />
                    <Text style={styles.memberDetailText}>{booking.hospital.phone}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Patient Requirements */}
        {booking.patient_requirements && (
          <View style={styles.card}>
            <Text style={styles.subcardTitle}>Patient Requirements</Text>
            <View style={styles.divider} />
            <Text style={styles.requirementsText}>{booking.patient_requirements}</Text>
          </View>
        )}

        {/* Notes */}
        {booking.notes && (
          <View style={styles.card}>
            <Text style={styles.subcardTitle}>Additional Notes</Text>
            <View style={styles.divider} />
            <Text style={styles.notesText}>{booking.notes}</Text>
          </View>
        )}
      </ScrollView>

      {/* Pay Now Button */}
      {booking.payment_status === 'PENDING' && (
        <View style={styles.payButtonContainer}>
          <TouchableOpacity style={styles.payButton}>
            <Text style={styles.payButtonText}>Pay Now</Text>
          </TouchableOpacity>
        </View>
      )}
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
    paddingBottom: 32,
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
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#172333',
    marginTop: 16,
  },
  card: {
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
  cardTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#172333',
    // padding: 16,
    paddingBottom: 8,
  },
  subcardTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#172333',
    padding: 16,
    paddingBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 8,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  infoLabel: {
    fontSize: 12,
    color: '#8190A7',
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#172333',
  },
  memberCard: {
    flexDirection: 'row',
    padding: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  placeholderAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F5F7FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bloodBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  bloodText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#172333',
    marginBottom: 4,
  },
  memberDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  memberDetailText: {
    fontSize: 13,
    color: '#8190A7',
    marginLeft: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#172333',
    marginLeft: 4,
  },
  bioSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  bioText: {
    fontSize: 14,
    color: '#8190A7',
    lineHeight: 20,
  },
  requirementsText: {
    fontSize: 14,
    color: '#172333',
    lineHeight: 20,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  notesText: {
    fontSize: 14,
    color: '#8190A7',
    lineHeight: 20,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  payButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    // padding: 16,

  },
  payButton: {
    backgroundColor: '#008178',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default BookingDetailsScreen;

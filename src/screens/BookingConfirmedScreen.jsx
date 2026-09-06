import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

const COLORS = {
  background: '#fff',
  white: '#FFFFFF',
  text: '#17212D',
  muted: '#7D8BA3',
  border: '#DEE5EF',
  blue: '#1976D2',
  blueLight: '#E8F2FF',
  green: '#11B58B',
};

const BookingConfirmedScreen = ({navigation, route}) => {
  const {message, status, bookingNumber} = route.params || {};

  const handleTrackBooking = () => {
    console.log('Track Booking');
  };

  const handleBackHome = () => {
    navigation?.reset({
      index: 0,
      routes: [{name: 'HomeScreen'}],
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <View style={styles.container}>
        {/* SUCCESS ICON */}
        <View style={styles.successWrapper}>
          <View style={styles.successCircle}>
            <Ionicons name="checkmark" size={51} color="#FFFFFF" strokeWidth={1} />
          </View>
        </View>

        {/* TITLE */}
        <Text style={styles.title}>Booking Confirmed!</Text>

        {/* SUBTITLE */}
        <Text style={styles.subtitle}>{message || 'Your booking has been placed successfully.'}</Text>

        {/* BOOKING CARD */}
        <View style={styles.bookingCard}>
          {/* BOOKING NUMBER */}
          {bookingNumber && (
            <View style={styles.bookingIdSection}>
              <Text style={styles.bookingIdLabel}>Booking Number</Text>
              <Text style={styles.bookingId}>{bookingNumber}</Text>
            </View>
          )}

          {bookingNumber && <View style={styles.divider} />}

          {/* STATUS */}
          <View style={styles.statusSection}>
            <Text style={styles.statusLabel}>Status</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{status || 'PENDING_PAYMENT'}</Text>
            </View>
          </View>
        </View>

        {/* NOTIFICATION */}
        <View style={styles.notificationBox}>
          <View style={styles.notificationIcon}>
            <Ionicons name="notifications-outline" size={21} color={COLORS.blue} />
          </View>

          <Text style={styles.notificationText}>
            You will receive a notification when your caregiver is accepted.
          </Text>
        </View>

        {/* BUTTONS */}
        <View style={styles.buttonsContainer}>
          {/* TRACK */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.trackButton}
            onPress={handleTrackBooking}>
            <Ionicons name="location-outline" size={21} color="#FFFFFF" />

            <Text style={styles.trackButtonText}>Track Booking</Text>
          </TouchableOpacity>

          {/* BACK HOME */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.homeButton}
            onPress={handleBackHome}>
            <Text style={styles.homeButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

/* ----------------------------------------
   INFORMATION ROW
----------------------------------------- */

const InfoRow = ({icon, label, value, last = false}) => {
  return (
    <View style={[styles.infoRow, last && styles.infoRowLast]}>
      <View style={styles.infoLeft}>
        <Ionicons name={icon} size={18} color={COLORS.muted} style={styles.infoIcon} />

        <Text style={styles.infoLabel}>{label}</Text>
      </View>

      <Text style={styles.infoValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
};

/* ----------------------------------------
   STYLES
----------------------------------------- */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 25,
    alignItems: 'stretch',
  },

  /* SUCCESS */

  successWrapper: {
    alignItems: 'center',
    marginTop: 33,
    marginBottom: 28,
  },

  successCircle: {
    width: 107,
    height: 107,
    borderRadius: 54,
    backgroundColor: COLORS.green,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* TITLE */

  title: {
    textAlign: 'center',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
    marginBottom: 13,
  },

  subtitle: {
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    color: COLORS.muted,
    marginBottom: 28,
  },

  /* BOOKING CARD */

  bookingCard: {
    width: '100%',
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: "#F5F5F5",
    borderRadius: 16,
    paddingHorizontal: 22,
    paddingTop: 23,
    paddingBottom: 18,
  },

  bookingIdSection: {
    alignItems: 'center',
  },

  bookingIdLabel: {
    fontSize: 13,
    lineHeight: 17,
    color: COLORS.muted,
    marginBottom: 4,
  },

  bookingId: {
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: 0.1,
  },

  statusSection: {
    alignItems: 'center',
    paddingVertical: 8,
  },

  statusLabel: {
    fontSize: 13,
    lineHeight: 17,
    color: COLORS.muted,
    marginBottom: 8,
  },

  statusBadge: {
    backgroundColor: COLORS.green,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },

  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginTop: 16,
    marginBottom: 9,
  },

  /* INFO ROW */

  infoRow: {
    minHeight: 35,
    flexDirection: 'row',
    alignItems: 'center',
  },

  infoRowLast: {
    marginBottom: 0,
  },

  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 125,
  },

  infoIcon: {
    width: 25,
    textAlign: 'center',
    marginRight: 1,
  },

  infoLabel: {
    fontSize: 14,
    color: COLORS.muted,
    fontWeight: '400',
  },

  infoValue: {
    flex: 1,
    textAlign: 'right',
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '700',
  },

  /* NOTIFICATION */

  notificationBox: {
    width: '100%',
    minHeight: 81,
    backgroundColor: '#E7F1FF',
    borderRadius: 28,
    marginTop: 27,
    paddingHorizontal: 17,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  notificationIcon: {
    width: 30,
    alignItems: 'center',
    paddingTop: 1,
    marginRight: 5,
  },

  notificationText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 24,
    color: COLORS.blue,
    fontWeight: '400',
  },

  /* BUTTONS */

  buttonsContainer: {
    marginTop: 27,
  },

  trackButton: {
    height: 52,
    width: '100%',
    backgroundColor: COLORS.blue,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  trackButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },

  homeButton: {
    height: 53,
    width: '100%',
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.blue,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 13,
  },

  homeButtonText: {
    color: COLORS.blue,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default BookingConfirmedScreen;
